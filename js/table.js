// import glossary info for filter data

// also import raw data

var rawData = $.getJSON("js/raw-data.json", function (obj) {
  var rawDataColumns = obj["columns"];
  var rawDataRows = obj["rows"];
  var statesObj = obj["states"];
  var states = [];
  // get state names
  for (var i = 0; i < statesObj.length; i++) {
    states[i] = statesObj[i]["name"];
  }
  var years = [];
  for (var i = 0; i < 26; i++) {
    years[i] = 1991 + i;
  }
  var categories = obj["categories"];
  var subcategories = obj["subcategories"];
  var provisionsObj = obj["provisions"];
  var provisions = [];
  // provision names only
  for (var i = 0; i < provisionsObj.length; i++) {
    provisions[i] = provisionsObj[i]["variable"];
  }

  generateInitialMenu(states, "State", "state_menu");
  generateInitialMenu(years, "Year", "year_menu");
  generateInitialMenu(categories, "Category", "category_menu");
  generateInitialMenu(subcategories, "Subcategory", "subcategory_menu");
  generateInitialMenu(provisions, "Provision", "provision_menu");
  generateInitialTable(rawDataColumns, rawDataRows);

});


function generateInitialTable(columns, rows) {
  //Generate table header section
  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover' id='raw_table'><thead><tr>";

  for (var i = 0; i < columns.length; i++) {
    tableContent += "<th>" + columns[i] + "</th>";
  }
  tableContent += "</tr></thead><tbody class='list'>";


//Generate all table rows

  for (var i = 0; i < rows.length; i++) {
    var rowData = rows[i];
    tableContent += "<tr>";
    for (var j = 0; j < columns.length; j++) {
      tableContent += "<td>" + rowData[columns[j]] + "</td>";
    }
    tableContent += "</tr>";
  }

  tableContent += "</tbody></table>";

//js-generated table is appended to div
  $('#raw_data_table_placeholder').append(tableContent);
  $('#raw_table').DataTable({
    'searching': false,
    'paging': true, //false,
    'scrollY': '50vh',
    'scrollX': true,
    'order': [[0, 'asc']]
  });
}

function generateInitialMenu(listItems, titleName, idName) {
  // create dropdown menu
  var content = "<select class='selectpicker' multiple data-width='75%' title=" + titleName + " id=" + idName + ">";

  for (var i = 0; i < listItems.length; i++) {
    content += "<option>" + listItems[i] + "</option>";
  }

  content += "</select>"

  $("#" + idName + "_placeholder").append(content);
  $("#" + idName).selectpicker('refresh');
}
