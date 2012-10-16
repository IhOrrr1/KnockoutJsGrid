KnockoutJsGrid
==============

DataGrid with KnockoutJs

Creating a grid

```JavaScript
HTML:
<div id="users"></div>

JS:

//source array
var usersList = [
    {"user_name": "John Paul", "user_login": "bob", "status": "user", "country": "Russia"},
    {"user_name": "Steven Jerald", "user_login": "steve", "status": "guest", "country": "Ukraine"},
    {"user_name": "Paul Houl", "user_login": "pter", "status": "moderator", "country": "China"},
    {"user_name": "Eric Carr", "user_login": "iinn", "status": "guest", "country": "Russia"}
];

//get viewModel
var viewModel = $("#users").grid({
//        url: "/users/list",
//        srcName: "users",
    srcArray: usersList,
    elementsCount: 10,
    columns: [
        {title: "#", key: "number", width: "3%"},
        {title: "Name", key: "user_name", data_bind: "text: user_name", width: "200px", sortable: true, isRef:true, href: "#userDialog"},
        {title: "Login", key: "user_login", data_bind: "text: user_login", width: "5%", sortable: true},
        {title: "Actions", key: "action", data_bind: "attr: { taskId: user_id }, click: $root.removeRow", width: "5%", sortable: true}
    ],
    ko: ko,
    paginator: true
})

ko.applyBindings(viewModel, document.getElementById("users"));
```

Creating a filters

```JavaScript
$.grid.filters({
    "user_name": {cssStyle: "input-xlarge", type: "text", placeholder: "User name"},
    "status": {cssStyle: "input-medium", type: "select", data: ["All", "user", "guest", "moderator"]}
});
```

Actions for grid (remove row)

```JavaScript
viewModel.removeRow = function() {
    gridViewModel.currentElements.remove(this)
    gridViewModel.allElements.remove(this)
};
```