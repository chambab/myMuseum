
CREATE TABLE CHANBAB.CDCTCINFO
(
	INFO_ID               CHAR(18)  NOT NULL ,
	INFO_NM               CHAR(18)  NULL
);



ALTER TABLE CHANBAB.CDCTCINFO
	ADD CONSTRAINT  CDCTCINFO_PK PRIMARY KEY (INFO_ID);



CREATE TABLE CHANBAB.CDCTCREGN
(
	REGN_ID               VARCHAR2(15)  NOT NULL ,
	REGN_NM               VARCHAR2(30)  NULL
);



ALTER TABLE CHANBAB.CDCTCREGN
	ADD CONSTRAINT  CDCTCREGN_PK PRIMARY KEY (REGN_ID);



CREATE TABLE CHANBAB.CDCTCREGNINFO
(
	REGN_INF_ID           VARCHAR2(15)  NOT NULL ,
	LATITUDE              VARCHAR2(30)  NULL ,
	LONGITUDE             VARCHAR2(30)  NULL ,
	COMPASS               VARCHAR2(10)  NULL
);

CREATE SEQUENCE CHANBAB.CDCTCREGNINFO_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;

ALTER TABLE CHANBAB.CDCTCREGNINFO
	ADD CONSTRAINT  CDCTCREGNINFO_PK PRIMARY KEY (REGN_INF_ID);



CREATE TABLE CHANBAB.CDCTCTAG
(
	TAG_ID                VARCHAR2(15)  NOT NULL ,
	MSG_ID                VARCHAR2(15)  NOT NULL,
	TAG_NM                VARCHAR2(30)  NULL
);

ALTER TABLE CHANBAB.CDCTCTAG
	ADD CONSTRAINT  CDCTCTAG_PK PRIMARY KEY (TAG_ID);

CREATE SEQUENCE CHANBAB.CDCTCTAG_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;
								
CREATE INDEX CDCTCTAG_IX01 ON CDCTCTAG(MSG_ID);								
CREATE INDEX CDCTCTAG_IX02 ON CDCTCTAG(TAG_NM);

CREATE TABLE CHANBAB.UWFDTB0101
(
	MST_USER_ID           VARCHAR2(50)  NOT NULL ,
	SUB_USER_ID           VARCHAR2(50)  NOT NULL ,
	REG_DT                VARCHAR2(14)  NULL
);



ALTER TABLE CHANBAB.UWFDTB0101
	ADD CONSTRAINT  UWFDTB0101_PK PRIMARY KEY (MST_USER_ID,SUB_USER_ID);
	
CREATE INDEX UWFDTB0101_IX01 ON CHANBAB.UWFDTB0101(SUB_USER_ID);



CREATE TABLE CHANBAB.UWFDTB0201
(
	USER_ID               VARCHAR2(50)  NOT NULL ,
	USER_PW               VARCHAR2(200)  NOT NULL ,
	USER_NM               VARCHAR2(100)  NULL ,
	USER_SR_CODE          VARCHAR2(3)  NULL ,
	CN                    VARCHAR2(1000)  NULL ,
	WEB_URL               VARCHAR2(500)  NULL ,
	OPEN_YN               VARCHAR2(1)  NULL ,
	REG_DT                VARCHAR2(14)  NULL ,
	REG_INFO              VARCHAR2(30)  NULL,
	USER_IMG              VARCHAR2(200)  NULL,
	REGN_INF_ID           VARCHAR2(15)  NULL
);



ALTER TABLE CHANBAB.UWFDTB0201
	ADD CONSTRAINT  UWFDTB0201_PK PRIMARY KEY (USER_ID);

CREATE INDEX UWFDTB0201_IX01 ON UWFDTB0201 (USER_SR_CODE, OPEN_YN);


CREATE TABLE CHANBAB.UWFDTB0301
(
	MSG_ID                VARCHAR2(15)  NOT NULL ,
	USER_ID               VARCHAR2(15)  NOT NULL ,
	REGN_INF_ID           VARCHAR2(15)  NOT NULL ,
	MSG_CN                VARCHAR2(4000)  NULL ,
	REG_DT                VARCHAR2(14)  NULL ,
	INFO_ID               VARCHAR2(15)  NULL,
	WRITER_ID             VARCHAR2(15) NULL,
	VIEW_CNT              VARCHAR2(5)
);



ALTER TABLE CHANBAB.UWFDTB0301
	ADD CONSTRAINT  UWFDTB0301_PK PRIMARY KEY (MSG_ID,USER_ID);
	
CREATE INDEX UWFDTB0301_IX01 ON UWFDTB0301 (USER_ID ASC);
CREATE INDEX UWFDTB0301_IX02 ON UWFDTB0301 (MSG_ID DESC);
CREATE INDEX UWFDTB0301_IX03 ON UWFDTB0301 (WRITER_ID);



CREATE SEQUENCE CHANBAB.UWFDTB0301_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;

-- 
-- 메시지의 리플								
CREATE TABLE CHANBAB.UWFDTB0311
(
	RPL_ID          VARCHAR2(15) NOT NULL,
	MSG_ID          VARCHAR2(15) NOT NULL,
	USER_ID         VARCHAR2(50) NOT NULL,
	RPL_MSG_CN      VARCHAR2(1000) NULL,
	REG_DT          VARCHAR2(14) NULL	
)	
;
			
ALTER TABLE CHANBAB.UWFDTB0311
	ADD CONSTRAINT  UWFDTB0311_PK PRIMARY KEY (RPL_ID);
					
CREATE INDEX UWFDTB0311_IX01 ON UWFDTB0311 (MSG_ID ASC);

CREATE SEQUENCE CHANBAB.UWFDTB0311_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;
								
					

CREATE TABLE CHANBAB.UWFDTB0401
(
	IMG_ID                VARCHAR2(15)  NOT NULL ,
	USER_ID               VARCHAR2(50)  NULL ,
	MSG_ID                VARCHAR2(15)  NULL,
	IMG_NM                VARCHAR2(100)  NULL ,
	IMG_CN                VARCHAR2(1000)  NULL ,
	IMG_URL               VARCHAR2(1000)  NULL ,
	REG_DT                VARCHAR2(14)  NULL
);



ALTER TABLE CHANBAB.UWFDTB0401
	ADD CONSTRAINT  UWFDTB0401_PK PRIMARY KEY (IMG_ID);

CREATE SEQUENCE CHANBAB.UWFDTB0401_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;


CREATE INDEX UWFDTB0401_IX01 ON UWFDTB0401(MSG_ID);


CREATE TABLE CHANBAB.UWFDTB0405
(
	IMG_ID                VARCHAR2(15)  NOT NULL ,
	USER_ID               VARCHAR2(50)  NOT NULL ,
	MSG_ID                VARCHAR2(15)  NOT NULL ,
	REGN_INF_ID           VARCHAR2(15)  NOT NULL ,
	RESOLUTION            VARCHAR2(10)  NULL ,
	BRIGHTNESS            VARCHAR2(10)  NULL ,
	DARKNESS              VARCHAR2(10)  NULL
);



ALTER TABLE CHANBAB.UWFDTB0405
	ADD CONSTRAINT  UWFDTB0405_PK PRIMARY KEY (IMG_ID,USER_ID,MSG_ID);



CREATE TABLE CHANBAB.UWFDTB0501
(
  TAG_ID                VARCHAR2(15)  NOT NULL,  
	MSG_ID                VARCHAR2(15)  NOT NULL ,
-- 	USER_ID               VARCHAR2(15)  NOT NULL ,
	TAG_NM                VARCHAR2(50)  NOT NULL ,
	REG_DT                VARCHAR2(14)  NULL
);



-- ALTER TABLE CHANBAB.UWFDTB0501
	-- ADD CONSTRAINT  UWFDTB0501_PK PRIMARY KEY (MSG_ID,USER_ID,TAG_ID);

 ALTER TABLE CHANBAB.UWFDTB0501
	 ADD CONSTRAINT  UWFDTB0501_PK PRIMARY KEY (TAG_ID);
	 
CREATE SEQUENCE CHANBAB.UWFDTB0501_SEQ_01
								INCREMENT BY 1
								START WITH 1
								MAXVALUE 9999999
								NOCYCLE
								NOCACHE;	 
CREATE INDEX UWFDTB0501_IX01 ON UWFDTB0501(TAG_NM);							

CREATE TABLE CHANBAB.UWFDTB0601
(
	MSG_ID                VARCHAR2(15)  NOT NULL ,
	USER_ID               VARCHAR2(50)  NOT NULL ,
	REGN_ID               VARCHAR2(15)  NOT NULL ,
	REG_DT                VARCHAR2(14)  NULL
);



ALTER TABLE CHANBAB.UWFDTB0601
	ADD CONSTRAINT  UWFDTB0601_PK PRIMARY KEY (MSG_ID,USER_ID,REGN_ID);

