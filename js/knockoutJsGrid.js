/**
 * Datagrid with KnockoutJS
 *
 * <code>
 *     HTML:
 *     <div id="users"></div>
 *
 *     JS:
 *     var viewModel = $("#users").grid({
 *         url: "/users/list",
 *         srcName: "users",
 *         elementsCount: 10,
 *         columns: [
 *               {title: "#", key: "number", width: "3%"},
 *               {title: "Name", key: "user_name", data_bind: "text: user_name", width: "20%", sortable: true, isRef:true, href: "#userDialog"},
 *               {title: "Login", key: "user_login", data_bind: "text: user_login", width: "5%", sortable: true},
 *               {title: "Actions", key: "action", data_bind: "attr: { taskId: user_id }, click: $root.removeRow", width: "5%", sortable: true}
 *          ],
 *          ko: ko,
 *          paginator: true
 *     })
 *
 *     ko.applyBindings(viewModel, document.getElementById("users"));
 *
 *     //add filter
 *     $.grid.filters({
 *         "user_name": {cssStyle: "input-xlarge", type: "text", placeholder: "Имя пользователя"},
 *         "user_login": {cssStyle: "input-medium", type: "select", data: ["Все", "1", "2", "3", "4", "5"]}
 *     });
 *
 *     //custom action for grid (remove elements from array) -- extend viewModel
 *     viewModel.removeRow = function() {
 *         gridViewModel.currentElements.remove(this)
 *         gridViewModel.allElements.remove(this)
 *     };
 * </code>
 *
 * @author   Igor Svergunenko
 */

(function($){

    /**
     * @constructor
     */
    function Grid (element, options) {
        this.options = options
        this.element = element
        this.ko = options.ko
        this.model = ''
        this.init(element, options);
    }

    /**
     * @constructor
     * Make all fields observable
     */
    Grid.prototype.Item = function(ko, data) {
        for(var key in data) {
            this[key] = ko.observable(data[key]);
        }
    }

    /**
     * Create VieModel for grid
     *
     * @param ko        - knockout
     * @param url       - url for getting data
     * @param srcName   - name of response variable
     * @param srcArray  - array with data if no url
     * @param paginator - display paginator or not
     * @param columns   - all columns data
     * @param element   - current dom node with grid
     */
    Grid.prototype.ViewModel = function(ko, url, srcName, srcArray, paginator, elementsCount, element) {
        var self = this;
        elementsCount = (elementsCount == undefined) ? 10 : elementsCount;

        self.sortOrder = 'asc'; //start sort order
        self.allElements = ko.observableArray([]) // all elements
        self.allData = ko.observableArray([]) // all data from ajax request's response
        self.currentElements = ko.observableArray(self.allElements()) // displayed elements with using of filters
        self.customFilteredElements = ko.observableArray([]) // array with elements filtered by custom filters
        self.standartFilteredElements = ko.observableArray([]) // array with elements filtered by standart filters
        self.paginator = ko.observableArray([])// paginators elements (numbers of pages)
        self.elementsCount = ko.observable(elementsCount);// count of elements on page
        self.currentPaginatorPage = ko.observable("1");

        //calculate number of row by index and paginator's page
        self.itemNumber = function(index) {
            return index + (self.currentPaginatorPage()-1) * self.elementsCount() + 1;
        }

        //get data for grid
        self.getElements = function() {

            //source from array
            if (srcArray) {
                var elementsArr = []
                self.allData(srcArray)
                $.each(srcArray, function(key, value){
                    elementsArr.push(new $.grid.Item(ko, value));
                });
                self.allElements(elementsArr)
                self.customFilteredElements(self.allElements())
                self.standartFilteredElements(self.allElements())
                self.currentElements(self.allElements())

                //set count of elements in grid if paginator not needed
                if (paginator == undefined || !paginator || elementsCount == 0) {
                    self.elementsCount(self.allElements().length);
                }
                return
            }

            //source from url if srcArray not defined
            $.get(url,  { _json: 1 }, function(response) {
                self.allData(response[srcName])
                var elementsArr = []
                $.each(response[srcName], function(key, value){
                    elementsArr.push(new $.grid.Item(ko, value));
                });

                self.allElements(elementsArr)
                self.customFilteredElements(self.allElements())
                self.standartFilteredElements(self.allElements())
                self.currentElements(self.allElements())

                //set count of elements in grid if paginator not needed
                if (paginator == undefined || !paginator || elementsCount == 0) {
                    self.elementsCount(self.allElements().length);
                }
            })
        }

        //elements that showing with pagination
        self.elementsShow = ko.computed(function() {
            var elementsShow = []
            for (var elementNumber = (self.currentPaginatorPage()-1)*self.elementsCount();
                    elementNumber < self.currentPaginatorPage()*self.elementsCount(); elementNumber++) {
                if (self.currentElements()[elementNumber] != undefined)
                    elementsShow.push(self.currentElements()[elementNumber]);
            }
            return elementsShow;
        });

        //elements of paginator
        self.paginator = ko.computed(function() {
            var paginator = []
            var pageCount = parseInt((self.currentElements().length / self.elementsCount()))
            if (self.currentElements().length % self.elementsCount() > 0) {
                pageCount++;
            }

            //if count of pages in paginator more than 15 - display not full paginator
            if (pageCount > 15) {
                if (self.currentPaginatorPage() > pageCount) {
                    self.currentPaginatorPage("1")
                }
                //selected first 5 pages
                if (self.currentPaginatorPage() == 1 || self.currentPaginatorPage() <= 5) {
                    for (var pageNumber = 1; pageNumber < 7; pageNumber++) {
                        paginator.push({name: pageNumber});
                    }
                    paginator.push({name: "..."});
                    paginator.push({name: pageCount});
                }
                //selected middle position
                if (self.currentPaginatorPage() > 5 && self.currentPaginatorPage() <= pageCount-5) {
                    paginator.push({name: "1"});
                    paginator.push({name: "..."});
                    paginator.push({name: self.currentPaginatorPage()-2});
                    paginator.push({name: self.currentPaginatorPage()-1});
                    paginator.push({name: self.currentPaginatorPage()});
                    paginator.push({name: self.currentPaginatorPage()+1});
                    paginator.push({name: self.currentPaginatorPage()+2});
                    paginator.push({name: "..."});
                    paginator.push({name: pageCount});
                }
                //selected last 5 pages
                if (self.currentPaginatorPage() == pageCount || self.currentPaginatorPage() > pageCount-5) {
                    paginator.push({name: "1"});
                    paginator.push({name: "..."});
                    for (var pageNumber = pageCount-5; pageNumber <= pageCount; pageNumber++) {
                        paginator.push({name: pageNumber});
                    }
                }
            } else {
                //if count of pages in paginator less then 15 - display full paginator
                if (self.currentPaginatorPage() > pageCount) {
                    self.currentPaginatorPage("1")
                }
                for (var pageNumber = 1; pageNumber < pageCount+1; pageNumber++) {
                    paginator.push({name: pageNumber});
                }
            }

            return paginator;
        });

        //set paginator page
        self.setPage = function(pageNumber) {
            self.currentPaginatorPage(pageNumber.name)
        };

        //set count of elements on page in paginator on right side of page
        $(element.selector+" .pagination.pagination-right a").live("click", function(e) {
            e.preventDefault()
            self.elementsCount($(this).attr('href'))
        });

        /**
         * sorting of elements in grid
         *
         * @param sortParam - column id (name of key in src array)
         */
        self.sortData = function(sortParam) {

            var sortedElements = self.allElements()
            var elementsNotNull = []
            var elementsNull = []

            //sort all rows by null and not null sortParam
            $.each(self.currentElements(), function(key, value) {
                var param = "";
                //check is element observable
                param = $.isFunction(value[sortParam]) ? value[sortParam]() : value[sortParam];

                //divide null and not null params
                param != null ? elementsNotNull.push(value) : elementsNull.push(value);
            });

            //sort only not null elements
            var sortedElements = elementsNotNull
            sortedElements.sort(function(x, y) {
                //check is field observable
                if ($.isFunction(x[sortParam])) {
                    return x[sortParam]() < y[sortParam]() ? 1 : (x[sortParam]() > y[sortParam]() ? -1 : 0);
                } else {
                    return x[sortParam] < y[sortParam] ? 1 : (x[sortParam] > y[sortParam] ? -1 : 0);
                }
            })

            //check desc or asc sorting
            var result = []
            if (this.sortOrder == 'desc') {
                sortedElements.reverse()
                result = $.merge(sortedElements, elementsNull)
                this.sortOrder = 'asc'
            } else {
                result = $.merge(elementsNull, sortedElements)
                this.sortOrder = 'desc'
            }

            //now add all rows to grid
            self.currentElements(result);
        };

        //sorting in table head bind
        $(element.selector+" .table tr.sort th a").live("click", function(e) {
            e.preventDefault()
            self.sortData($(this).attr('href'))
        });

        //Filter stuff bind
        $(element.selector + ' select').live("change", filterElements);
        $(element.selector + ' input[type="text"]').live("keyup", filterElements);

        /**
         * Filtering of elements list
         */
        function filterElements() {

            //get all standart select and text filters
            var selectArr = $(element.selector + " thead tr:first select");
            var inputArr = $(element.selector + " thead tr:first input[type='text']")

            var filteredElements = []; //all filtered elements

            //filter by all elements of list
            $.each(self.allElements(), function(key, element) {
                var addToFiltered = true;

                //filter by all text fields
                $.each(inputArr, function(key, input) {
                    //ignore custom filters
                    if (!$(input).hasClass('customFilter')) {
                        var elementName = element[$(input).attr("id")]()

                        if (elementName.indexOf($(input).val()) == '-1' && $(input).val() != '') {
                            addToFiltered = false
                        }
                    }
                });

                //filter by all select fields
                $.each(selectArr, function(key, select) {
                    //ignore custom filters
                    if (!$(select).hasClass('customFilter') && $.isFunction(element[$(select).attr("id")])) {
                        var elementName = element[$(select).attr("id")]()
                        if (elementName != $(select).val()
                            && ($(select).val() != 'Все' && $(select).val() != 'All')
                            && $(select).val() != null) {
                                addToFiltered = false;
                        }
                    }
                });

                if (addToFiltered) {
                    filteredElements.push(element);
                }
            });

            var filteredCustom = [];
            /*synchronize custom and standart filters*/
            //put all element filtered with standart filter
            self.standartFilteredElements(filteredElements);

            //check is custom filters using now
            if (self.customFilteredElements() != self.allElements()) {
                //check what custom filtered elements exists in array filtered with standart filters
                $.each(filteredElements, function(key, value) {
                    if ($.inArray(value, self.customFilteredElements()) != '-1') {
                        filteredCustom.push(value)
                    }
                });
                self.currentElements(filteredCustom);
            } else {
                self.currentElements(filteredElements);
            }
        }

        //display all data on page
        self.getElements()
    }

    /**
     * Init
     * @param element - dom node
     * @param options - all columns and other properties
     */
    Grid.prototype.init = function(element, options) {

        //check is need paginator
        if (options.paginator == undefined || options.paginator) {
            var paginatorHtml = this.paginator()
            $(paginatorHtml).appendTo(element);
        }

        //get table with data
        this.table(element, options.columns);
    }

    /**
     * Create paginator for grid.
     * Paginator with numbers of pages and paginator on right side with count of tasks on page
     */
    Grid.prototype.paginator = function() {
        var paginatorHtml =
            '<div class="pagination" data-bind="visible: paginator().length > 1">'+
                '<ul data-bind="foreach: paginator">'+
                    '<li data-bind="css: { active:  name == $root.currentPaginatorPage() }">'+
                        '<!-- ko if: name != \'...\' -->'+
                            '<a data-bind="text: name, attr: { href: name }, click: $root.setPage" ></a><!-- /ko -->'+
                        '<!-- ko if: name == \'...\' --><span>...</span><!-- /ko -->'+
                    '</li></ul></div>'+
            '<div class="pagination pagination-right">'+
                '<ul>'+
                    '<li data-bind="css: { active:  $root.elementsCount() == 5 }"><a href="5">5</a></li>'+
                    '<li data-bind="css: { active:  $root.elementsCount() == 10 }"><a href="10">10</a></li>'+
                    '<li data-bind="css: { active:  $root.elementsCount() == 20 }"><a href="20">20</a></li>'+
                '</ul>'+
            '</div>';

        return paginatorHtml;
    }

    /**
     * Create filters for grid
     * @param properties - all data about column
     */
    Grid.prototype.filters = function(properties) {

        //get all columns from grid
        var columns = $.grid.options.columns

        //generate filters html
        var filterHtml = '';

        //standart filters to grid - text or select fields
        filterHtml += '<tr>';
        $.each(columns, function(key, value) {
            if (properties[value.key]) {
                //check type of filter for current column
                switch (properties[value.key]['type']) {
                    case "text" :
                        filterHtml += '<th width="'+value.width+'">'+
                            '<input type="text" class="'+properties[value.key]['cssStyle']+'" value="" id="'+value.key+
                            '" placeholder="'+properties[value.key]['placeholder']+'"></th>';
                        break;
                    case "select" :
                        filterHtml += '<th width="'+value.width+'"><select class="'+
                            properties[value.key]['cssStyle']+'" id="'+value.key+'" >';
                        $.each(properties[value.key]['data'], function(key, value) {
                            filterHtml += '<option>'+value;
                            filterHtml += '</option>';
                        })
                        filterHtml +=  '</select></th>';
                        break;
                    default:
                        filterHtml += '<th width="'+value.width+'"></th>';
                        break;
                }
            } else {
                filterHtml += '<th width="'+value.width+'"></th>';
            }
        });
        filterHtml += '</tr>';

        $(filterHtml).prependTo($.grid.element.selector + " table thead")
    }

    /**
     * Create table with data
     *
     * @param element  - dom node (always id)
     * @param columns  - necessary params: key (row in array), title, data_bind
     */
    Grid.prototype.table = function(element, columns) {
        var tableHtml = '';
        tableHtml +=
            '<table class="table" >'+
                '<thead>';

        tableHtml += '<tr class="sort">';

        //add head columns to table
        $.each(columns, function(key, value) {
            if (value.sortable) {
                tableHtml += '<th width="'+value.width+'"><a href="'+value.key+'">'+value.title+'</a></th>';
            } else {
                tableHtml += '<th width="'+value.width+'">'+value.title+'</th>';
            }
        });

        tableHtml += '</tr></thead>';

        //add tbody part to table
        tableHtml += '<tbody data-bind="foreach: elementsShow, visible: currentElements().length > 0"><tr>';

        $.each(columns, function(key, value) {
            //show row number
            if (value.key == "number") {
                tableHtml += '<td data-bind="text: $root.itemNumber($index())"></td>';
                return true;
            }
            //show some content
            if (value.content) {
                tableHtml += '<td width="'+value.width+'" data-bind="'+value.data_bind+'">'+value.content+'</td>';
                return true;
            }
            //show some reference
            if (value.isRef) {
                tableHtml += '<td><a data-toggle="modal" class="'+value.key+'" data-bind="'+
                    value.data_bind+'" href="'+value.href+'"></a></td>';
                return true;
            }
            //ordinary cell
            tableHtml += '<td width="'+value.width+'" data-bind="'+value.data_bind+'"></td>';
        });

        tableHtml += '</tr></tbody></table>';

        $(tableHtml).appendTo(element);
    }

    /**
     * Plugin body
     *
     * @param options
     * @param options.ko        - knockout
     * @param options.url       - url for getting data
     * @param options.srcName   - name of response variable
     * @param options.srcArray  - array of source data
     * @param options.paginator - display paginator or not
     * @param options.columns   - all columns data
     */
    $.fn.grid = function(options) {
        $.grid = new Grid($(this), options);

        //knockout's bindings
        $.grid.ViewModel = new $.grid.ViewModel(
            options.ko, options.url, options.srcName, options.srcArray, options.paginator, options.elementsCount, this
        );

        return $.grid.ViewModel;
    };
})($);