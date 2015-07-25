/*
 * Copyright 2002-2008 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package anyframe.common;

import java.io.Serializable;
import java.util.Collection;
import java.util.Collections;

import anyframe.common.exception.NestedRuntimeException;

/**
 * @author SoYon Lim
 * @author JongHoon Kim
 */
public class Page implements Serializable {

    public static final Page EMPTY_PAGE =
        new Page(Collections.EMPTY_LIST, 1, 0, "", "");

    private Collection objects;

    private int currentPage;

    private int totalCount;

    private int pageunit = 10;

    private int pagesize = 10;

    private int maxPage;

    private int beginUnitPage;

    private int endUnitPage;

    private String search = "";

    private String condition = "";

    public Page() {

    }

    public Page(Collection objects, int currentPage, int totalCount) {
        this.objects = objects;
        this.totalCount = totalCount;
        this.maxPage =
            pagesize == 0 ? this.totalCount : (totalCount - 1) / pagesize + 1;
        this.currentPage = currentPage > maxPage ? maxPage : currentPage;
        this.beginUnitPage = ((currentPage - 1) / pageunit) * pageunit + 1;
        this.endUnitPage = beginUnitPage + (pageunit - 1);
    }

    public Page(Collection objects, int currentPage, int totalCount,
            String condition, String search) {
        this(objects, currentPage, totalCount);
        this.condition = condition;
        this.search = search;
    }

    public Page(Collection objects, int currentPage, int totalCount,
            int pageunit, int pagesize) {
        if (pageunit <= 0 || pagesize <= 0) {
            throw new NestedRuntimeException("Page unit or page size should be over 0.");
        }
        this.pageunit = pageunit;
        this.pagesize = pagesize;
        this.objects = objects;
        this.totalCount = totalCount;
        this.maxPage =
            pagesize == 0 ? this.totalCount : (totalCount - 1) / pagesize + 1;
        this.currentPage = currentPage > maxPage ? maxPage : currentPage;
        this.beginUnitPage = ((currentPage - 1) / pageunit) * pageunit + 1;
        this.endUnitPage = beginUnitPage + (pageunit - 1);
    }

    public Collection getList() {
        return objects;
    }

    public void setList(Collection val) {
        // not called.
    }

    public boolean hasNextPage() {
        return currentPage < maxPage;
    }

    public boolean hasPreviousPage() {

        return currentPage > 1;

    }

    public int getNextPage() {

        return currentPage + 1;

    }

    public void setNextPage(int val) {

        // not called
    }

    public int getPreviousPage() {
        return currentPage - 1;
    }

    public void setPreviousPage(int val) {

        // not called
    }

    public boolean hasNextPageUnit() {
        return endUnitPage < maxPage;
    }

    public boolean hasPreviousPageUnit() {
        return currentPage >= pageunit + 1;
    }

    public int getStartOfNextPageUnit() {
        return endUnitPage + 1;
    }

    public int getStartOfPreviousPageUnit() {
        return beginUnitPage - 1;
    }

    public int getPageOfNextPageUnit() {
        return (currentPage + pageunit < maxPage)
            ? currentPage + pageunit : maxPage;
    }

    public int getPageOfPreviousPageUnit() {
        return (currentPage - pageunit > 1) ? currentPage - pageunit : 1;
    }

    public int getCurrentPage() {
        return this.currentPage;
    }

    public int getBeginUnitPage() {
        return this.beginUnitPage;
    }

    public int getEndListPage() {
        return (endUnitPage > maxPage) ? this.maxPage : this.endUnitPage;
    }

    public void setEndListPage(int val) {
        // not called.
    }

    public int getSize() {
        return objects.size();
    }

    public boolean isEmptyPage() {
        return (this.objects == null || this.getSize() == 0) ? true : false;
    }

    public void setEmptyPage(boolean val) {
        // not called.
    }

    public int getTotal() {
        return this.totalCount;
    }

    public void setTotal(int val) {
        // not called.
    }

    public String getCurrentPageStr() {
        return (new Integer(this.currentPage)).toString();
    }

    public void setCurrentPageStr(String str) {
        // not called.
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public int getPagesize() {
        return pagesize;
    }

    public void setPagesize(int pagesize) {
        this.pagesize = pagesize;
    }

    public Collection getObjects() {
        return objects;
    }

    public void setObjects(Collection objects) {
        this.objects = objects;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getPageunit() {
        return pageunit;
    }

    public void setPageunit(int pageunit) {
        this.pageunit = pageunit;
    }

    public int getMaxPage() {
        return maxPage;
    }

    public void setMaxPage(int maxPage) {
        this.maxPage = maxPage;
    }

    public int getEndUnitPage() {
        return endUnitPage;
    }

    public void setEndUnitPage(int endUnitPage) {
        this.endUnitPage = endUnitPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public void setBeginUnitPage(int beginUnitPage) {
        this.beginUnitPage = beginUnitPage;
    }
}
