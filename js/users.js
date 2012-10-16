$(function() {

    //source array
    var usersList = [
        {"user_name": "John Paul", "user_login": "bob", "user_id": "1", "email": "bob@gmail.com", "homepage": "bob.org.ua", "status": "user", "country": "Russia"},
        {"user_name": "Steven Jerald", "user_login": "steve", "user_id": "2", "email": "steve@example.com", "homepage": "steve.com", "status": "guest", "country": "Ukraine"},
        {"user_name": "Paul Houl", "user_login": "pter", "user_id": "3", "email": "peter@gmail.com", "homepage": "ii.ua", "status": "moderator", "country": "China"},
        {"user_name": "Eric Carr", "user_login": "iinn", "user_id": "4", "email": "ivan@gmail.com", "homepage": "hello.ua", "status": "guest", "country": "Russia"},
        {"user_name": "Tommy Tayer", "user_login": "jd", "user_id": "5", "email": "jira@gmail.com", "homepage": "ss.com", "status": "user", "country": "Russia"},
        {"user_name": "Jimmy Hit", "user_login": "mixer", "user_id": "6", "email": "kerry@gmail.com", "homepage": "storm.org", "status": "guest", "country": "Russia"},
        {"user_name": "Edward Greed", "user_login": "johny", "user_id": "7", "email": "john@example.com", "homepage": "bbbeee.net", "status": "user", "country": "Italia"},
        {"user_name": "Fred Johns", "user_login": "sem", "user_id": "8", "email": "nikki@gmail.com", "homepage": "fboook.com", "status": "user", "country": "Russia"},
        {"user_name": "Din Thomas", "user_login": "roll", "user_id": "9", "email": "rokky@gmail.com", "homepage": "meta.ua", "status": "guest", "country": "Italia"},
        {"user_name": "John Doe", "user_login": "vin", "user_id": "10", "email": "vinney@gmail.com", "homepage": "chalenge.org", "status": "admin", "country": "USA"},
        {"user_name": "Fill Richards", "user_login": "dime", "user_id": "11", "email": "dime@gmail.com", "homepage": "", "status": "user", "country": "Russia"},
        {"user_name": "Mikel Felps", "user_login": "melv", "user_id": "12", "email": "melvin@gmail.com", "homepage": "helll.org", "status": "user", "country": "Russia"},
        {"user_name": "Jimm Wals", "user_login": "harry", "user_id": "13", "email": "harry@gmail.com", "homepage": "worst.com", "status": "moderator", "country": "USA"}
    ];

    /**
     * Src may be array: (srcArray: usersList) or url with array index (url: "/users/list", srcName: "users")
     */
    var viewModel = $("#userGrid").grid({
//        url: "/users/list",
//        srcName: "users",
        srcArray: usersList,
        elementsCount: 5,
        ko: ko,
        paginator: true,
        columns: [
            {title: "#", key: "number", width: "3%"},
            {title: "User name", key: "user_name", data_bind: "text: user_name, click: $root.editUser", width: "20%", isRef:true, href: "#userDialog", sortable: true},
            {title: "User login", key: "user_login", data_bind: "text: user_login", width: "15%", sortable: true},
            {title: "Email", key: "email", data_bind: "text: email", width: "20%", sortable: true},
            {title: "Homepage", key: "homepage", data_bind: "text: homepage", width: "20%", sortable: true},
            {title: "Country", key: "country", data_bind: "text: country", width: "10%", sortable: true},
            {title: "Status", key: "status", data_bind: "text: status", width: "10%", sortable: true},
            {title: "Actions", key: "action", content: "<i class=\"icon-remove\"></i>",
             data_bind: "attr: { userId: user_id }, click: $root.removeRow", width: "7%", sortable: false}
        ]
    });

    //add filters
    $.grid.filters({
        "user_name": {cssStyle: "input-xlarge", type: "text", placeholder: "Name"},
        "user_login": {cssStyle: "input-medium", type: "text", placeholder: "Login"},
        "email": {cssStyle: "input-medium", type: "text", placeholder: "Email"},
        "homepage": {cssStyle: "input-medium", type: "text", placeholder: "Homepage"},
        "country": {cssStyle: "input-medium", type: "select", data: ["All", "Russia", "USA", "Italia", "China", "Ukraine"]},
        "status": {cssStyle: "input-medium", type: "select", data: ["All", "guest", "user", "moderator", "admin"]}
    });

    viewModel.message = ko.observable()
    viewModel.showMessage = ko.observable(false)

    /**
     * Remove rows from datagrid (extend viewModel)
     */
    viewModel.removeRow = function() {
        viewModel.message(this.user_name() + " was removed from DataGrid!")
        viewModel.currentElements.remove(this)
        viewModel.allElements.remove(this)
        viewModel.showMessage(true)
        setTimeout(function() {viewModel.showMessage(false)},1500);
    };

    /**
     * Edit rows in datagrid (extend viewModel)
     */
    viewModel.editUser = function() {
        //now put all data from this to dialog
        var currentUser = this;
        var userIndex = $.inArray(currentUser, viewModel.currentElements())

        $("#dialog-name").val(currentUser.user_name());
        $("#dialog-login").val(currentUser.user_login());
        $("#dialog-email").val(currentUser.email());
        $("#dialog-homepage").val(currentUser.homepage());
        $("#country-list option:contains(" + currentUser.country() + ")").attr('selected', 'selected');
        $("#status-list option:contains(" + currentUser.status() + ")").attr('selected', 'selected');
        $("#saveBtn").unbind()
        //save data
        $("#saveBtn").click(function() {
            currentUser.user_name($("#dialog-name").val());
            currentUser.user_login($("#dialog-login").val());
            currentUser.email($("#dialog-email").val());
            currentUser.homepage($("#dialog-homepage").val());
            currentUser.country($("#country-list option:selected").text());
            currentUser.status($("#status-list option:selected").text());

            viewModel.currentElements()[userIndex] = currentUser;
            $("#userDialog").modal('hide')

            viewModel.message("User " + currentUser.user_name() + " was edited!")
            viewModel.showMessage(true)
            setTimeout(function() {viewModel.showMessage(false)},1500);
        });
    };

    /**
     * Add row to grid
     */
    $("#addUser").click(function() {
        var userData = {};
        $("input").val('');
        $("select").val('');
        $("#saveBtn").unbind()
        $("#saveBtn").click(function() {
            userData.user_name = $("#dialog-name").val();
            userData.user_login = $("#dialog-login").val();
            userData.email = $("#dialog-email").val();
            userData.homepage = $("#dialog-homepage").val();
            userData.country = $("#country-list option:selected").text();
            userData.status = $("#status-list option:selected").text();
            userData.user_id = "0";

            viewModel.currentElements.push(new $.grid.Item(ko, userData));
            $("#userDialog").modal('hide')
        });
    });

    ko.bindingHandlers.fadeFade = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.utils.unwrapObservable(value));
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    };

    ko.applyBindings(viewModel, document.getElementById("usersGrid"));

});