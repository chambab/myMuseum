/*
 *	Utils class to provide some basic and shared JS utilities.
 *	This class requires jQuery library. Last tested with version 1.4.3
 *	Author: Moe Hosseini
*/

var Utils = {
	//Media extension maps
	EXT_MAP: {
		jpg: 'j', png: 'p',	bmp: 'b', tif: 't', gif: 'g', ico: 'i',
		swf: 's', pdf: 'd', flv: 'f', mp4: 'z',	gal: 'x'
	},
	//Constant time variables
	MS_PER_MINUTE: 60 * 1000,
	MS_PER_HOUR: 60 * 60 * 1000,
	MS_PER_DAY: 24 * 60 * 60 * 1000,
	//array to hold the loaded user avatars
	LOADED_AVATARS: [],
	YFROG_LINK_REGEX: /[http:\/\/]*[www\.]*yfrog\.(com|us){1}\/\w{3,}/g,
	YFROG_MEDIA_LP_REGEX: /[http:\/\/]*[www\.]*yfrog\.(com|us){1}\/\b\w*(j|p|g|z){1}\b/g, //add 'x' to support albums
	YFROG_VIDEO_REGEX: /[http:\/\/]*[www\.]*yfrog\.(com|us){1}\/\b\w*(z){1}\b/g,
	LINK_REGEX: /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/g,
    TWITTER_AVATAR_REGEX: /(\w+)\.twimg\.com\/profile_images\/(\d+)\/(\S+)/,
    //flag to disable overlay close on hitting X button or clicking outside of it
    forcedOverlayVisibility: false,

	/*
	 *	Shortens the text based on size
	 *	@param text The text to shorten
	 *	@param size	The length of the string to shorten to
	 *	Returns the shortened string, if the string length is less than size then returns the string intact
	*/
	shortenText: function(text, size) {
		text = $.trim(text);
		return (text.length <= size ? text : (text.substring(0, size) + '...'));
	},
    /*
     * Version 2
    */
	shortenTextv2: function(text, size) {
        return text;
	    var that = this;
        text = $.trim(text);
        if (text.length <= size) {
            return text;
        }
        text = text.substring(0, size);
        text = text.substring(0, text.lastIndexOf(' '));
        // Check if the last word is another link and strip it
        // so we don't get bad links that look like http://test.com...
        var _recursivelyCheckTrailingUrl = function(text) {
            if ($.trim(text.substr(text.lastIndexOf(' '))).search(that.LINK_REGEX) != -1) {
                return _recursivelyCheckTrailingUrl(text.substring(0, text.lastIndexOf(' ')));
            } else {
                return text;
            }
        };
        return _recursivelyCheckTrailingUrl(text) + '...';
	},
	/*
	 *	Convert a number from one base to another
	 *	@param n The number to covert its base
	 *	@param to The base converting to
	 *	@param from The base converting from
	 *	Returns the coverted number
	*/
	base: function(n, to, from) {
    	return parseInt(n, from || 10).toString(to);
	},
	/*
	 *	Get yfrog url (yfrog.com/XYZ)
	 *	@param host Image host
	 *	@param image Image filename
	*/
	yfrogURL: function(host, image) {
    	return '/' + this.yfrogId(host, image);
	},
	/*
	 *	Get short url yfrog id
	 *	@param host Image host
	 *	@param image Image filename
	*/ 
	yfrogId: function(host, image) {
        if(!host || !image)
            return;
	    var ehost = this.base(host , 36);
	    if(ehost.length==1)
	        ehost = "0" + ehost;
	    var ia = image.split('.');
	    var ext = ia[1].toLowerCase();
	    var sext = this.EXT_MAP[ext];
	    return ehost + ia[0] + sext;
	},
	/*
	 *	Return array with key <-> value flipped. Like php array_flip
	 *	@param arr The array to flip
	 *	Returns the new array
	*/
	flipArray: function(arr) {
    	var key, tmp_ar = [];
    	for(key in arr)
			tmp_ar[arr[key]] = key;
		return tmp_ar;
	},
	/*
	 *	Takes Yfrog URL path component and returns host and filename
	 *	@param The image path. For a url like 'yfrog.com/3uekse2j' then path is '3uekse2j'
	 *	Returns an array containing server and filename like [server, filename]
	*/
	decodeYfrogPath: function(path) {
		return [this.base(path.substring(0,2) , 10, 36), path.substring(2, path.length-1) + "." + this.flipArray(this.EXT_MAP)[path.substring(path.length-1)]];
	},
	/*
	 *	Get image thumbnail, 125x90
	 *	@param host Image host
	 *	@param filename Image filename
	 *	@param res Thumbnail resolution, default = crop
	*/
	getThumbnailURL: function(host, filename, res) {
		res = res || "crop";
		return "http://desmond.yfrog.com/Himg"+host+"/scaled.php?server="+host+"&filename="+filename+"&res=" + res;
	},
	/*
	 *	Wrapper for getThumbnailURL
	 *	Returns a 70x50
	 *	@param server Image host
	 *	@param filename Image filename
	*/
	getIconURL: function(server, filename) {
		return this.getThumbnailURL(server, filename, 'yficon');
	},
	/*
	 *	Get all yfrog media (photos, videos, etc) from a text or tweet.
	 *	@param text The tweet text
	 *	Returns an array of yfrog media, formatted like:
	 *	[
	 *		{
	 *			filename,
	 *			server,
	 *			isVideo,		//video flag
	 *			isImage,		//image flag
	 *			isYfrog,		//yfrog image flag
	 *			thumbnailURL,	//URL to thumbnail
	 *			normalURL,		//URL to the video src or normal size image 
	 *			url				//URL to the media like http://yfrog.com/37r564z
	 *		}
	 *	]
	*/
	extractYfrogMedia: function(text, res) {
		//image regex: /(http:\/\/(www.)?yfrog(.com|.us)\/(\b\w+(?<!z)\b))/
		//video regex: /(http:\/\/(www.)?yfrog(.com|.us)\/(\b\w+(?<=z)\b))/
		if(!text)
			return [];
		var matches = text.match(this.YFROG_MEDIA_LP_REGEX);
		if(!matches || !matches.length || matches.length == 0)
			return [];
		var result = [];
		var self = this;
		$.each(matches, function(index, match) {
			var m = match.replace(/[http:\/\/]*[www\.]*yfrog\.(com|us){1}\//g, '');
			var decoded = self.decodeYfrogPath(m);
			var isVideo = self.isVideo(match);
//			var isVideo = self.isVideo(m);
            var server = decoded[0];
            var filename = decoded[1];
			result.push({
				filename: 		filename,
				server:			server,
				isVideo:		isVideo,
				isImage:		!isVideo,
				isYfrog:		true,
				thumbnailURL:	self.getThumbnailURL(server, filename, res),
				normalURL:		self.getNormalSizeImage(server, filename),
				url:			match
			});
		});
		return result;
	},
	/*
	 *	Get all twitpic media (photos for now) from a text or tweet.
	 *	@param text The tweet text
	 *	Returns an array of twitpic media, formatted like:
	 *	[
	 *		{
	 *
	 *			isTwitpic,		//twitpic image flag
	 *			thumbnailURL,	//URL to thumbnail
	 *			url				//URL to the media like http://twitpic.com/30zbuz
	 *		}
	 *	]
	*/
	extractTwitpicMedia: function(text) {
		if(!text)
			return [];
		var matches = text.match(/[http:\/\/]*[www\.]*twitpic\.com\/\w{3,}/g);
		if(!matches || !matches.length || matches.length == 0)
			return [];
		var result = [];
		$.each(matches, function(index, match) {
			var m = match.replace(/[http:\/\/]*[www\.]*twitpic\.com\//g, '');
			result.push({
				isTwitpic:		true,
				thumbnailURL:	'http://twitpic.com/show/thumb/' + m,
                normalURL:	    'http://twitpic.com/show/large/' + m,
				url:			match
			});
		});
		return result;
	},
	/*
	 *	Get all Plixi media (photos for now) from a text or tweet.
	 *	@param text The tweet text
	 *	Returns an array of plixi media, formatted like:
	 *	[
	 *		{
	 *
	 *			isPlixi,		//twitpic image flag
	 *			thumbnailURL,	//URL to thumbnail
	 *			url				//URL to the media like http://plixi.com/p/52197323
	 *		}
	 *	]
	*/
	extractPlixiMedia: function(text) {
		if(!text)
			return [];
		var matches = text.match(/[http:\/\/]*[www\.]*lockerz\.com\/s\/\w{3,}/g);
//		var matches = text.match(/[http:\/\/]*[www\.]*plixi\.com\/p\/\w{3,}/g);
		if(!matches || !matches.length || matches.length == 0)
			return [];
		var result = [];
		$.each(matches, function(index, match) {
			result.push({
				isPlixi:		true,
				thumbnailURL:	'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=thumbnail&url=' + match,
                normalURL:      'http://api.plixi.com/api/tpapi.svc/imagefromurl?size=medium&url=' + match,
				url:			match
			});
		});
		return result;
	},
    extractInstagramMedia: function(text) {
		if(!text)
			return [];
		var matches = text.match(/[http:\/\/]*[www\.]*instagr\.am\/p\/\w+-*_*\//g);
		if(!matches || !matches.length || matches.length == 0)
			return [];
		var result = [];
		$.each(matches, function(index, match) {
			result.push({
				isInstagram:		true,
				thumbnailURL:	    match + 'media/?size=t',
                normalURL:          match + 'media/?size=l',
				url:			    match
			});
		});
		return result;
	},
	/*
	 *	Extract all media from a tweet or text. 
	 *	Supports yFrog, Twitpic and Plixi
	 *	@param tweet The tweet or text
	 *	@param args Data object, can have following properties
	 *		excludeYfrog	Flag to not return yFrog media
	 *		res				Resolution of the thumbnails, default = 'crop' can be 'yficon' too
	 *	Returns an array of images like so:
	 *	[
	 *		{
	 *			filename,		//ONLY yFrog medias
	 *			server,			//ONLY yFrog medias
	 *			isVideo,		//video flag - ONLY yFrog medias
	 *			isImage,		//image flag - ONLY yFrog medias
	 *			isYfrog,		//yFrog image flag
	 *			isTwitpic,		//Twitpic image flag
	 *			isPlixi,		//Plixi image flag
	 *			thumbnailURL,	//URL to thumbnail
	 *			normalURL,		//URL to the video src or normal size image - ONLY yFrog medias
	 *			url				//URL to the media like http://yfrog.com/37r564z
	 *		}
	 *	]
	*/
	extractAllMedia: function(text, args) {
		args = args || {};
		args.res = args.res || 'crop';
		return $.merge( $.merge( $.merge(args.excludeYfrog ? [] : this.extractYfrogMedia(text, args.res), this.extractTwitpicMedia(text)), this.extractPlixiMedia(text)), this.extractInstagramMedia(text));
	},
	/*
	 *	Get logged-in user's account name
	 *	Returns the logged username, empty string if user is not logged in
	*/
	getLoggedInUsername: function() {
		return $('#current_logged_user').length == 0 ? '' : $('#current_logged_user').val();
	},
	/*
	 *	Load all unloaded user avatars.
	 *	Any image that has class 'tweetauthor' will be checked, the image must have the author attribute. Where the value of the author is the username
	 *	Example: <img class="tweetauthor" author="moehosseini" src="..." />
	 *	If you are rendering the tag in JS then use Utils.getDefaultProfileImage() to get the default image source file otherwise use {$DEFAULT_PROFILE_IMAGE}
	 *	It also saves the loaded avatars to prevent making duplicate calls
	 *	@param callback Function to call after the image is processed
	*/
	loadAnyUserAvatars: function(callback) {
		callback = callback || function(){};
		var self = this;
		$('.tweetauthor').each(function(index) {
	        var img = $(this);
	        var author = img.attr('author');
	        if(!author)
	        	return;
	        if(self.LOADED_AVATARS[author]) {
	        	img.attr('src', self.LOADED_AVATARS[author]).removeClass('tweetauthor');
	        	return true;
	        }
	        $.ajax({
				url: 		'/user/' + author + '/avatar.json',
				type:		'GET',
				dataType: 	'json',
				success:	function(data) {
					img.attr('src', data).removeClass('tweetauthor');
					self.LOADED_AVATARS[author] = data;
					callback({image:img});
				}
			});
	    });
	},
    /**
     * Post a message to the site, this could go to any number of social networks based on the services array property
     * @param args Arguments object
     * @return jqXHR object
     */
    post: function(args) {
        return $.ajax({
            url:        '/message/post.json',
            type:       'POST',
            dataType:   'json',
            data:       {
                message:    encodeURIComponent($.trim(args.message)),
                services:   args.services,
                media:      args.media
            }
        });
    },
    /**
     * Reply to a message
     * @param args Arguments object
     * @return jqXHR object
     */
    reply: function(args) {
        return $.ajax({
            url:        '/message/reply.json',
            type:       'POST',
            dataType:   'json',
            data:       {
                message:    encodeURIComponent($.trim(args.message)),
                reply_service_message_id:   args.message_id,
                media:      args.media
            }
        });
    },
	/*
	 *	Gets the default placeholder for user avatars
	*/
	getDefaultProfileImage: function() {
		return '/images/default_profile.png';
	},
	/*
	 *	Gets the small default placeholder for user avatars
	*/
	getSmallDefaultProfileImage: function() {
		return '/images/default_profile_25x25.png';
	},
    /**
     *
     * @param username
     */
    getPhotoPlaceholder: function() {
        return '/images/ph-photo.png';
    },
	/*
	 *	Get froggy url for user
	 *	@param username The username
	*/
	getFroggyURL: function(username) {
		return '/user/' + username + '/profile';
	},
    /**
     * Get profile link html link
     * @param username
     */
    getProfileLink: function(username, args) {
        args = args || {};
        var className = args.className ? args.className : '',
            extra = args.noMouseOver ? '' : 'class="user-mouse-over ' + className + '" data-screen-name="' + username + '"';
        return '<a ' + extra + ' href="' + this.getFroggyURL(username) + '">';
    },
	/*
	 *	Open a new window popup to share content with myspace
	 *	@param title The title of the page
	 *	@param desc The description of the link
	 *	@param url The url to share
	*/
	shareWithMyspace: function(title, desc, url) {
	    window.open('http://www.myspace.com/index.cfm?fuseaction=postto&t=' + encodeURIComponent(title) + '&c=' + encodeURIComponent(desc) + '&u=' + encodeURIComponent(url), 'ptm', 'height=450,width=440').focus();
	},
	/*
	 *	Open a new window popup to share content with facebook
	 *	@param url The url to share
	 *	@param title The title of the page
	*/
	shareWithFacebook: function(url, title) {
		window.open("http://www.facebook.com/sharer.php?u="+encodeURIComponent(url)+"&t="+encodeURIComponent(title),"sharer","toolbar=0,status=0,width=626,height=436").focus();
	},
	/*
	 *	Open a new window popup to share content with twitter
	 *	@param m The tweet text to share
	*/
	shareWithTwitter: function(m, url, via) {
	    m = m ? $.trim(m) : location.href;
	    if(!url) {
	    	window.open('http://twitter.com/home?status='+encodeURIComponent(m),'sharer','toolbar=0,status=0,width=800,height=400,scrollbars=no,resizable=no').focus();
	    	return;
	    }
	    window.open('http://twitter.com/share?url='+encodeURIComponent(url)+'&via='+via+'&text='+encodeURIComponent(m)+'&related=yfrog','sharer','toolbar=0,status=0,width=550,height=450,scrollbars=no,resizable=no').focus();
	},
	/*
	 *	Scroll smoothly to an anchor
	 *	@param anchorName The name of the anchor to scroll to
	 *	@param time Duration of the animation/scroll
	 *	@param callback Function to call once the animation is over
	*/
	smoothScroll: function(anchorName, time, callback) {
		callback = callback || function(){};
		$('html,body').animate({scrollTop: $('[name='+anchorName+']').offset().top}, time, function() {
			callback();
		});
	},
	/*
	 *	Get the string representation of a given date, like '23 secs' or '12 days'
	 *	@param theDate The timestamp of the item in miliseconds or a date string like Tue, 07 Sep 2010 18:34:39 +0000
	*/
	getDateString: function(theDate) {
		theDate = isNaN(theDate) ? Date.parse(theDate) : theDate;
		var now = new Date().getTime();
	    var result = "";
	    var t;
	    if (theDate >= now - this.MS_PER_MINUTE) {
	        t = Math.floor((now - theDate) / 1000);
	        result = t + ((t == 1) ? " sec" : " secs");
	    } else if (theDate >= now - this.MS_PER_HOUR) {
	        t = Math.floor((now - theDate) / this.MS_PER_MINUTE);
	        result = t + ((t == 1) ? " min" : " mins");
	    } else if (theDate >= now - this.MS_PER_DAY) {
	        t = Math.floor((now - theDate) / this.MS_PER_HOUR);
	        result = t + ((t == 1) ? " hour" : " hours");
	    } else {
	        t = Math.floor((now - theDate) / this.MS_PER_DAY);
	        result = t + ((t == 1) ? " day" : " days");
	    }
	    return result;
	},
	/*
	 *	Get the url for normal size image
	 *	@param host Image host 
	 *	@param filename Image filename
	*/
	getNormalSizeImage: function(host, filename) {
		return "http://desmond.yfrog.com/Himg"+host+"/scaled.php?tn=0&server="+host+"&filename="+filename+"&xsize=640&ysize=640";
	},
	/*
	*	Open a lightbox style popup
	*	@param content The content of the popup, could be a raw html string or a jquery object like $('#someId')
	*	@param options Customizes the popup based on the object properties, available properties are:
	*		{
	*			top : number of pixels to shift the box down by, default = 50
	*			left : number of pixels to shift the box right by, default the box is centered horizantaly
	*			width : width of the popup box, REQUIRED
	*			height : height of the popup box, optional
	*			overlayBG : background color of the faded overlay, default is black #000000
	*			closeCallback : callback function to call after the box is closed, optional
	*		}
	*/
	showOverlayBox: function(content, options) {
		if(!options || !options.width) {
		    l('Overlay box needs a wdith');
			return;
		}
		//take care of default states
		options.top = options.top || 50;
		options.left = options.left || 0;
		options.height = options.height || null;
		options.overlayBG = options.overlayBG || '#000000';
		options.closeCallback = options.closeCallback || function(){};
		
        // Hide the close button if it's a force popup
        if (this.forcedOverlayVisibility) {
            $('#yfrog-popup-close').hide();
        }

        var useDupe = $('#yfrog-popup').is(':visible'),
            suffix = useDupe ? '-dupe' : '';

		//set the content of the popup
		$('#yfrog-popup-content' + suffix).html((typeof content != 'string') ? content.html() : content);
		
		//set the height of the overlay to the height of the page and set its background color
		$('#yfrog-popup-overlay' + suffix).css({ 'height' : $(document).height(), 'background-color' : options.overlayBG });
		
		//assign height to the box if exists
		if(options.height)
			$('#yfrog-popup-main' + suffix).css({ 'height' : options.height });
			
		//assign the width of the box, this MUST always be passed
		$('#yfrog-popup-main' + suffix).css({ 'width' : options.width });
		
		//position the box on the page
        $('#yfrog-popup-wrapper' + suffix).css({ 'left' : (($(window).width() - options.width) / 2) + (options.left - 10)});

        //position the box vertically (kinda) in the middle if height exists and asked for
        $('#yfrog-popup-wrapper' + suffix).css({ 'top' : (options.height && options.alignVertical) ? (Math.round(Math.max($(window).scrollTop() + options.top, $(window).scrollTop() + ($(window).height() - options.height) / 3))) : ($(window).scrollTop() + options.top) });

		//close button listener
		$('#yfrog-popup-close' + suffix).bind('click', {button:this}, function(e) {
			e.preventDefault();
            if(Utils.forcedOverlayVisibility)
                return;
			$('#yfrog-popup' + suffix).fadeOut(300, function() {
				options.closeCallback();
				$(e.target).unbind('click');
				$('.hideable-flash').removeClass('invisible');
                $('#yfrog-popup-main' + suffix).css({ height: 'auto' });
                $('#yfrog-popup-close' + suffix).show().removeClass('invisible');
			});
		});
		
		//hide flash elements on page if they exist
		$('.hideable-flash').addClass('invisible');
		$('#yfrog-popup-content .upflash').show().removeClass('invisible');
		
		//clicking on the overlay should also close the box
		$('#yfrog-popup-overlay' + suffix).bind('click', function(e) {
			e.preventDefault();
            if(Utils.forcedOverlayVisibility)
                return;
			$(e.target).unbind('click');
			Utils.closeOverlayBox({ useDupe: useDupe });
		});

        //bind escape key to close
        this.bindKeyListener(window, 27, function() {
            Utils.closeOverlayBox({ useDupe: useDupe });
        });

		//finally display the popup
		$('#yfrog-popup' + suffix).fadeIn(300);
	},
	/*
	*	Assigns listener to keyboard keys
	*	@param elem The elemnt listener is attached to, selector reference (jQuery style) like '.searchForm input'. REQUIRED
	*	@param key The keycode of the key to listen for, here are some key codes: REQUIRED
	*		13 = Enter , Escape = 27, Arrow left = 37, Arrow up = 38, Arrow right = 39, Arrow down = 40
	*	@param callback Callback function to call once the key is pressed. It will pass the jQuery Event ojbect and the data object passed to this function
	*	@param data Object to be passed to callback, it can hold the data needed after the key is pressed. OPTIONAL
	*	Sample call: Utils.bindKeyListener('form#searchForm .input', 13, doSearch);
	*/
	bindKeyListener: function(elem, key, callback, data) {
		$(elem).bind('keyup', function(e) {
			if(e.keyCode == key || e.which == key)
				callback(e, data || {});
		});
	},
	/*
	*	Unbind the bound keypress event
	*	@param elem The element to unbind the keypress event from, could be css selector reference or jQuery object
	*/ 
	unbindKeyListener: function(elem) {
		$(elem).unbind('keyup');
	},
	/*
	*	Watches the input length and shortens it if it becomes longer than the max length
	*	@param elem The input or textarea elem that text will be entered in. Can be a jQuery selector like 'form .input' or jQuery object. REQUIRED
	*	@param countElem Element that can display remaining number of characters allowed. jQuery selector string or jQuery object. OPTIONAL
	*	@param max The maximum length of the text allowed. Integer, default = 140. OPTIONAL
	*/
	watchInputLength: function(elem, countElem, max) {
		elem = (typeof elem == 'string') ? $(elem) : elem;
		countElem = countElem ? ((typeof countElem == 'string') ? $(countElem) : countElem) : null;
		max = max || 140;
		$(elem).live('keyup change', function(e) {
			var text = $(this).val();
			if(text.length >= max)
				$(this).val(text.substring(0, max));
			if(countElem)
				$(countElem).html(Math.max(0, max - text.length));
		});
    },
    /*
	*	Shows the input length of an element like textarea or input in a desired area
	*	@param elem The input or textarea elem that text will be entered in. Can be a jQuery selector like 'form .input' or jQuery object. REQUIRED
	*	@param countElem Element that can display number of characters entered. jQuery selector string or jQuery object. REQUIRED
	*/
	showInputLength: function(elem, countElem) {
		elem = (typeof elem == 'string') ? $(elem) : elem;
		countElem = countElem ? ((typeof countElem == 'string') ? $(countElem) : countElem) : null;
		$(elem).live('keyup change', function(e) {
            $(countElem).html($(this).val().length);
		});
    },
    /*
    *	Converts twitter usernames into clickable links
    *	@param status Twitter status text
    */ 
	convertTwitterUsernames: function(status) {
	    if (match = status.match(/[@]+[A-Za-z0-9-_]+/g)) {
	        $.each(match, function(index, elem) {
	            var username = elem.split('@')[1];
                var uIndex = status.indexOf(username);
                if(uIndex > status.indexOf('<a href') && uIndex < status.indexOf('</a>'))
                    return true;
	            status = status.replace(elem, '<a href="' + Utils.getFroggyURL(username) + '" class="link user-mouse-over at-mention" data-screen-name="' + username + '">@'+username+'</a>');
	        });
	        return status;
	    }
	    return status;
	},
    /**
     * Removes the leading @mention(s) from a text
     * @param text The text to clean
     * @return The cleaned message. so '@moehosseini,@hello Echo' becomes 'Echo' OR 'http://yfrog.com/asdf2r3s @hello,@yay test' becomes 'http://yfrog.com/asdf2r3s test'
     */
    removeLeadingMentions: function(text) {
        if(!text)
            return '';
        var regex = /^([http:\/\/]*[www\.]*yfrog\.(com|us){1}\/\w{3,}\s*)*(@\w+[,]*){1,}/;
        if(text.match(regex)) {
            var cleaned = '',
                flag = false;
            $.each(text.split(' '), function(k, phrase) {
                if(!flag && phrase.indexOf('@') == 0) {
                    flag = true;
                    return true;
                }
                cleaned += phrase + ' ';
            });
            return $.trim(cleaned);
        }
        return text;
    },
	/*
	*	Convert links into clickable links
	*	@param status Some text that could have links in it
	*/
	convertLinks: function(status, term) {
        var that = this;
        var cache = {};
		if (match = status.match(this.LINK_REGEX)) {
	        $.each(match, function(index, elem) {
                var yfrogLink = that.isYFrogLink(elem);
                if (term) {
                    var m = [];
                    if (m = elem.match(term)) {
                        m = m[0];
                        var s = elem.split(m);
                        status = status.replace(elem, '<a href="'+elem+'" class="link" ' + (yfrogLink ? '' : 'target="_blank" rel="nofollow"') + '>'+s[0]+'<span class="bold-no-bg">'+m+'</span>'+s[1]+'</a>');
                    } else {
                        status = status.replace(elem, '<a href="'+elem+'" class="link" ' + (yfrogLink ? '' : 'target="_blank" rel="nofollow"') + '>'+elem+'</a>');
                    }
                } else if(!cache[elem]) {
                    cache[elem] = true;
                    status = status.replace(elem, '<a href="'+elem+'" class="link" ' + (yfrogLink ? '' : 'target="_blank" rel="nofollow"') + '>' + that.shortenText(elem.replace(/(http|https):\/\/[www\.]*/, '').replace(/\/$/, ''), 25) + '</a>');
                }
	        });
	        return status;
	    }
	    return status;
	},
	/*
	*	Convert twitter hashtags into clickable links
	*	@param status Twitter status text
	*/
	convertHashtags: function(status) {
	    if (match = status.match(/(\s|^)(#\w+)/g)) {
	        $.each(match, function(index, elem) {
	            var hashtag = elem.split('#')[1];
	            status = status.replace(elem, '<a target="_blank" href="http://twitter.com/#!/search?q=%23' + hashtag + '" class="link">'+elem+'</a>');
	        });
	        return status;
	    }
	    return status;
	},
	/*
	*	Strip yfrog links from status
	*	@param status Twitter status text
	*/
	stripYFrogLinks: function(status) {
	    if (this.isYFrogLink(status)) {
	        status = status.replace(this.YFROG_LINK_REGEX, '');
	    }
	    return status;
	},
	/*
	*	Helper function to perform few operations on a twitter text to make the links, mentions and hashtags clickable
	*	@param status Twitter status text
	*/
	linkalizeTwitterStatus: function(status, term) {
		return this.convertHashtags( this.convertTwitterUsernames( this.convertLinks($.trim(status), term) ) );
	},
	/*
	*	Auto refresh dates on the page
	*	The date elements should look like this <elem class='auto-refresh-date' rel='TIME_STAMP_VALUE'><span>3 days</span> ago</elem>
	*	It will use getDateString function and populate the span inside the elem
	*	@param interval Number of seconds between each refresh, default = 10
	*/
	autoRefreshDates: function(interval) {
		setInterval(function() {
			$('.auto-refresh-date[rel]').each(function(index, elem) {
				$('span', $(this)).html(Utils.getDateString(parseInt($(this).attr('rel'))));
			});
		}, (interval || 10) * 1000);
	},
	/*
     * Load a twitter realname from a username.
     * @param username
     */
    loadTwitterRealname: function(username, callback) {
    	callback = callback || function(){};
		$.getJSON('http://api.twitter.com/1/users/show.json?callback=?&screen_name='+username, function(json) {
        	callback(json.name);
        });
    },
    /*
     *	Triggers the global informer box. Will show the box at the top of the window with a message.
     *	@param text The message to display in the box
     *	@param delay Number of seconds to fade out the informer after. Set to 0 for forever.
     *  @param args Extra arguments object
    */
    triggerGlobalInformer: function(text, delay, args) {
    	if (!text) {
    	    return;
    	}
        args = args || {};
        if (0 === delay) {
            dealy = null;
        } else {
            delay = delay || 5;
        }
    	$('#global-informer .text').html(text);
    	$('#global-informer').fadeIn(350);
    	//close button listener
		$('#global-informer a.close').bind('click', function(e) {
			e.preventDefault();
			$('#global-informer').fadeOut(350);
		});
		if (delay) {
			setTimeout(function() {
				$('#global-informer a.close').click();	
			}, delay * 1000);
		}
        if (args.isError) {
            _e.l({ section: _e.sections.errorPopDown, action: _e.section, label: text });
        }
    },
    
    /*
     *	Get the zoom page url
     *	@param args Data object, either set the 'hash' property or 'server' and 'filename'
    */
    getZoomURL: function(args) {
    	args.hash = args.hash || this.yfrogId(args.server, args.filename);
    	return '/z/' + args.hash;
    },
    
    /*
     *	Check to see if a yfrog url is a video
     *	@param url The yfrog url, can be hash too
     *	Returns true if the url is video
    */
    isVideo: function(url) {
        if (!url)
            return false;
        if (url.match(/http:\/\/[www\.]*/g))
    	    return url.match(this.YFROG_VIDEO_REGEX);
        else
            return url.match(/\b\w*(z){1}\b/);
    },

    /*
     *	Check to see if a yfrog url is an album
     *	@param url The yfrog url, can be hash too
     *	Returns true if the url is album
    */
    isAlbum: function(url) {
    	return url.substring(url.length-1).toLowerCase() == 'x';
    },

    /*
     *	Check to see if a link is yfrog's
     *	@param link
    */
    isYFrogLink: function(link) {
        return link.match(this.YFROG_LINK_REGEX);
    },

    /*
     *	Shorten a full name.
     *	@param name Someone's name like Moe Hosseini
     *	Returns FirstName + First leter of last name so Moe Hosseini becomes Moe H.
    */
    shortenFullName: function(name) {
    	name = name.split(' ');
    	return name.length == 1 ? name[0] : (name[0] + ' ' + name[1].charAt(0) + '.');
    },

    /**
     * Get the thread landing page link
     * @param threadId Id of the thread
     */
    getThreadPageLink: function(threadId) {
        return '/message/thread/id/' + threadId;
    },

    /**
     * Close the overlay box
     */
    closeOverlayBox: function(args) {
        args = args || {};
        $('#yfrog-popup-close' + (args.useDupe ? '-dupe' : '')).click();
    },

    /**
     * Get the youtube links from a message
     * @param message The text to search for the links
     * @return Array of youtube links
     */
    getYouTubeLinks: function(message) {
        message = $.trim(message);
        var results = [];
        if(!message)
            return results;
        $.each(message.split(' '), function(k, v) {
            var temp = new RegExp(/http:\/\/[www.]*youtube\.com\/watch\?v=[a-zA-Z0-9_-]*/).exec(v);
            if(!temp)
                temp = new RegExp(/http:\/\/youtu\.be\/[a-zA-Z0-9_-]*/).exec(v);
            if(temp && temp.length && temp.length > 0)
                results.push(temp[0]);
        });
        return results;
    },

    /**
     * Get like count
     * @param urls Array of urls to check for, could be image/video lp or thread lp or whatever else
     */
    getLikeCount: function(urls) {
        urls = (typeof urls == 'string') ? [urls] : urls;
        return $.ajax({
            url:            '/like/count_multi.json',
            dataType:       'json',
            type:           'POST',
            cache:          false,
            data:           { urls: urls }
        });
    },

    /**
     * Returns the generic like html based on the response obj
     * Stylize it as you please!
     * @param key The object's key, its usually the url passed to the server
     * @param obj The like object from server
     */
    getLikeHtml: function(key, obj) {
        var html = "";
        var count = parseInt(obj.count);
        if(count == 0)
            html += "<a href='" + key + "' class='yfrog-like-button like" + (!this.getLoggedInUsername() ? " login-button-anchor" : "") + "' " + (!this.getLoggedInUsername() ? "rel='" + window.location.pathname + "'" : "") +">Favorite</a>";
//            html += "<a href='" + key + "' class='yfrog-like-button like" + (!this.getLoggedInUsername() ? " login-button-anchor" : "") + "' " + (!this.getLoggedInUsername() ? "rel='" + window.location.pathname + "'" : "") +">Like</a>";
        else {
            //have I liked this before?
            if(obj.liked)
                html += "<a href='" + key + "' class='yfrog-unlike-button unlike'>Unfavorite</a><span class='liked-before-count'>-&nbsp;" + ( count == 1 ? "1 Person" : count + " People") + "</span>";
//                html += "<a href='" + key + "' class='yfrog-unlike-button unlike'>Unlike</a><span class='liked-before-count'>-&nbsp;" + ( count == 1 ? "1 Person" : count + " People") + "</span>";
            else
                html += "<a href='" + key + "' class='yfrog-like-button like" + (!this.getLoggedInUsername() ? " login-button-anchor" : "") + "' " + (!this.getLoggedInUsername() ? "rel='" + window.location.pathname + "'" : "") +" >Favorite</a><span class='liked-before-count'>-&nbsp;" + ( count == 1 ? "1 Person" : count + " People") + "</span>";
//                html += "<a href='" + key + "' class='yfrog-like-button like" + (!this.getLoggedInUsername() ? " login-button-anchor" : "") + "' " + (!this.getLoggedInUsername() ? "rel='" + window.location.pathname + "'" : "") +" >Like</a><span class='liked-before-count'>-&nbsp;" + ( count == 1 ? "1 Person" : count + " People") + "</span>";
        }
        return html;
    },

    /**
     * Like action
     * @param url Url to like, can be media lp or thread lp
     */
    like: function(url) {
        if(!url)
            return;
        return $.ajax({
            url:            '/like/like.json',
            dataType:       'json',
            type:           'GET',
            cache:          false,
            data:           { url: url }
        });
    },

    /**
     * UnLike action
     * @param url Url to unlike, can be media lp or thread lp
     */
    unlike: function(url) {
        if(!url)
            return;
        return $.ajax({
            url:            '/like/unlike.json',
            dataType:       'json',
            type:           'GET',
            cache:          false,
            data:           { url: url }
        });
    },
    
    /**
     * Similar to php's number_format().
     * e.g, 275500 returns 275,500.
     *
     * @param nStr number to format
     */
    numberFormat: function(nStr) {
    	nStr += '';
    	x = nStr.split('.');
    	x1 = x[0];
    	x2 = x.length > 1 ? '.' + x[1] : '';
    	var rgx = /(\d+)(\d{3})/;
    	while (rgx.test(x1)) {
    		x1 = x1.replace(rgx, '$1' + ',' + '$2');
    	}
    	return x1 + x2;
    },

    /**
     * Normalize result object from response
     * Puts the results in the feeds object and creates comments property if the message has them
     * Populates message's user properties (screen name, avatar url, etc) based on the users parameter
     * @param messages  This is response.data.result.messsages from controller
     * @param users Users' properties object
     * @return Normalized results object
     */
    normalizeResults: function(messages, users) {
        var results = {};
        var cache = {};
        $.each(messages, function(i, items) {
            var count = 0;
            var temp = '';
            $.each(items, function(index, message) {
                cache = {};
                if(!message.created_time || !message.user_id)
                    return true;
                //this is not a comment to another post and havent been pushed to the array
                if(!message.reply_message_id && !results[index])
                    results[index] = {};
                if(count == 0)
                    temp = index;
                //extract the media
                if(!message.images)
                    message.images = [];
                message.photo = message.photo || {};
                message.video = message.video || {};
                $.each(message.photo, function(k, v) {
                    if (!v.uri)
                        return true;
                    //check for dupes
                    //this is like the laziest way to check but WTH it is Saturday
                    var temp = (v.uri).replace('yfrog.us/', 'yfrog.com/');
                    if (cache[temp])
                        return true;
                    cache[temp] = true;
                    var match = Utils.extractAllMedia(v.uri);
                    if (match.length > 0 && v.bucket)
                        match[0].bucket = v.bucket;
                    $.merge(message.images, match);
                });
                //do the same for videos
                $.each(message.video, function(k, v) {
                    if (!v.uri)
                        return true;
                    //check for dupes
                    //this is like the laziest way to check but WTH it is Saturday
                    var temp = (v.uri).replace('yfrog.us/', 'yfrog.com/');
                    if (cache[temp])
                        return true;
                    cache[temp] = true;
                    var match = Utils.extractAllMedia(v.uri);
                    if (match.length > 0 && v.bucket)
                        match[0].bucket = v.bucket;
                    $.merge(message.images, match);
                });
//                last attempt to get the damn images, try the fuckin message itself
                if (message.images.length == 0)
                    message.images = Utils.extractAllMedia(message.message || '');
                //assign the user properties from the users array to the message
                var user = users[message.service_id][message.user_id];
                if (user) {
                    // We don't want user_created_time to overwite the message created time
                    // because it doesn't do anything
                    delete user['created_time'];
                }
                // overwrite the avatar with cached one if present
                if (user && user.cached_avatar_url) {
                    user.avatar_url = user.cached_avatar_url;
                }
                $.extend(message, user);
                //check if this is a comment for the message
                if (count > 0) {
                    (results[temp].comments ? results[temp].comments : results[temp].comments = []).push(message);
                } else {
                    results[index] = message;
                    results[index].comments = [];
                }
                count++;
            });
        });
        return results;
    },

    /**
     * Extract link info like title, images, etc
     * @param urls Array of urls if checking multiple urls else can just be a String if single url
     * @return An object where key is the url and the value has all the available properties
     */
    extractLinks: function(urls) {
        var results = {},
            that = this,
            count = 0,
            dfd = $.Deferred(),
            urls = (typeof urls == 'string') ? [urls] : urls;
        $.each(urls, function(k, url) {
            $.when(that.extract(url))
                .then(function(r) {
                    (function(data, candid) {
                        results[candid] = {
                            link:       data ? (data.link || data.result.link || candid) : candid,
                            title:      data ? $.trim( data.title || data.result.title || candid ) : candid
                        };
                        count++;
                        //check if last one then return all results
                        if(count == urls.length)
                            dfd.resolve(results);
                    })(r, url);
                }).fail(function(r) {
                    (function(data, candid) {
                        results[candid] = {
                            link:       candid,
                            title:      candid
                        };
                        count++;
                        //check if last one then return all results
                        if(count == urls.length)
                            dfd.resolve(results);
                    })(r, url);
                });
        });
        return dfd.promise();
    },

    /**
     * Extract link info
     * @param url The url to the page
     */
    extract: function(url) {
        return $.ajax({
            url:        '/url/retrieve.json',
            dataType:   'json',
            type:       'GET',
            data:       { url: url }
        });
    },

    /**
     * Render new video player
     * @param args Args object, should look like this:
     * {
            elemId:     id of the element to render video in without the #. REQUIRED
            server:     server of the video. REQUIRED
            bucket:     bucket of the video. REQUIRED
            filename:   filename of the video. REQUIRED
            width:      width of the video if known. OPTIONAL
            height:     height of the video if known. OPTIONAL
        }
     */
    renderNewVideoPlayer: function(args) {
        args.width = Math.min(args.width || 350, Site.maxVideoWidth);
        args.height = Math.min(args.height || 250, Site.maxVideoHeight);
        var url = Site.url + '/' + this.yfrogId(args.server, args.filename),
            options = {
                file: 'http://img' + args.server + '.imageshack.us/img' + args.server + '/' + args.bucket + '/' + args.filename,
                skin: '/flash/jwplayer/beelden/beelden.xml',
                height: args.height,
                width: args.width,
                autostart: true,
                bufferlength: 0.1,
                controlbar: 'bottom',
                plugins: { inplay: { playerID: "P-15I-58O", trackerIDs: "TR-IV6-NU8", publisherID: "yfrog2", videoID: url, displayName: url } },
                modes:  [
                    { type: 'html5' },
                    { type: 'flash', src: '/flash/jwplayer/player-licensed.swf' }
                ]
            };
        jwplayer(args.elemId).setup(options);
    },
    /**
     * Check if an argument is undefined
     * @param candid The variable to check
     */
    isUndefined: function(candid) {
        return candid == undefined || candid == 'undefined';
    },
    /**
     * Hide user from Timeline
     * @param serviceUserId Service user id of the user being hidden
     */
    hideUser: function(serviceUserId) {
        return $.ajax({
            url:        '/user/hide.json',
            type:       'GET',
            data:       { sid: serviceUserId }
        });
    },
    /**
     * Unhide user
     * @param users Array of service user ids or a single service user id
     */
    unhideUser: function(users) {
        users = typeof users == 'object' && users.length ? users : [users];
        return $.ajax({
            url:        '/user/unhide.json',
            type:       'GET',
            data:       { sids: users }
        });
    },
    /**
     * Get list of hidden users for current logged user
     */
    getHiddenList: function() {
        return $.ajax({
            url:        '/user/hidden_list.json',
            type:       'GET',
            cache:      false
        });
    },
    /**
     * Update the media count after user has uploaded something
     * @param medias Array of media
     */
    updateMediaCount: function(medias) {
        if (!medias || !medias.length || medias.length == 0) {
            return;
        }
        var photos = 0,
            videos = 0,
            pElem = $('#photos-count .count'),
            vElem = $('#videos-count .count'),
            oldCount = 0;
        $.each(medias, function(k, media) {
            ( Utils.isVideo(media.url) ? videos++ : photos++ );
        });
        if (photos > 0 && pElem.length > 0) {
            try {
                oldCount = parseInt(pElem.text());
                if (!isNaN(oldCount)) {
                    pElem.html( oldCount + photos );
                }
            } catch(err) {}
        }
        if (videos > 0 && vElem.length > 0) {
            try {
                oldCount = parseInt(vElem.text());
                if (!isNaN(oldCount)) {
                    vElem.html( oldCount + videos );
                }
            } catch(err) {}
        }
    },
    /**
     * Encode html characters
     * @param text Text to encode
     */
    htmlEncode: function(text) {
        return $('<div/>').text(text).html();
    },
    /**
     * Decode html characters
     * @param text Text to decode
     */
    htmlDecode: function(text) {
        return $('<div/>').html(text).text();
    },

    getNotifications: function(args) {
        args = args || {};
        args.limit = args.limit || 5;
        args.page = args.page || 1;
        return $.ajax({
            url:        '/notification/list.json',
            type:       'GET',
            dataType:   'json',
            cache:      false,
            data:       { limit: args.limit, page: args.page }
        });
    },

    clearNotifications: function() {
        return $.ajax({
            url:        '/notification/clear.json',
            type:       'GET',
            dataType:   'json',
            cache:      false
        });
    },
    /**
     * Get screen name by row id
     * @param rowId Row id
     */
    getScreenNameByRowId: function(rowId) {
        return $.ajax({
            url:    '/user/get_screen_name.json',
            type:   'GET',
            data:   { row_id: rowId }
        });
    },
    /**
     * Get search page url based on the term
     * @term Search term
     */
    getSearchURL: function(term) {
        return '/search/users/term/' + encodeURIComponent($.trim(term));
    },
    /**
     * Get the desmond url of twitter avatar
     * @param url
     */
    getTwitterDesmondUrl: function(url) {
        var matches = url.match(this.TWITTER_AVATAR_REGEX);
        if (!matches || !matches.length || matches.length < 4) { return url; }
        return 'http://desmond.yfrog.com/homepage/scaled.php?host=' + matches[1] + '&profile=' + matches[2] + '&filename=' + matches[3] + '&via=twitter';
    }
};
