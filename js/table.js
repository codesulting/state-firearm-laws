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
  // load year dropdown
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


// generates DataTable on initial page load
function generateInitialTable(columns, rows) {
  //Generate table header section
  var tableContent = "";
  //tableContent += "<table class='table table-bordered table-responsive table-hover' id='raw_table'><thead><tr>";
  tableContent += "<table class='table table-bordered' id='raw_table'><thead><tr>";

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


  // generate column names for DataTable
  colNamesDT = []
  for (var i = 0; i < columns.length; i++) {
    colNamesDT.push({"name": columns[i]});
  }

//js-generated table is appended to div
  $('#raw_data_table_placeholder').append(tableContent);
  var rawTable = $('#raw_table').DataTable({
    'searching': false,
    'paging': false, // true,
    'scrollX': true,
    'scrollY': true,
    'order': [[0, 'asc']],
    'columns': colNamesDT
  });

  // event for updating table

  $('#update_button').click(function () {
    // collect values from dropdowns for states and years
    var statesSelected = $('#state_menu').val();
    // create regex and search datatable

    var stateSearchSeq = "";
    if (statesSelected !== null) {
      for (var i = 0; i < statesSelected.length; i++) {
        stateSearchSeq += statesSelected[i];
        if (i < statesSelected.length - 1) {
          stateSearchSeq += "\|";
        }
      }
    } else {
      stateSearchSeq = ".";
    }

    console.log(stateSearchSeq);

    var yearsSelected = $('#year_menu').val();
    var yearsSearchSeq = "";


    // update provisions based on dropdown selection

    // uses DataTable column selection and visibility

    var provisionsSelected = $('#provision_menu').val();

    if (provisionsSelected !== null) {
      for (var i = 0; i < columns.length; i++) {
        rawTable.column(i).visible(false, false);
      }

      rawTable.column("state:name").visible(true, false);
      rawTable.column("year:name").visible(true, false);
      // update columns based on provision/category/subcategory selected
      for (var i = 0; i < provisionsSelected.length; i++) {
        rawTable.column(provisionsSelected[i] + ':name').visible(true, false);
      }
    }

    // categories chosen
    var categoriesSelected = $('#category_menu').val();

    // subcategories chosen
    var subcategoriesSelected = $('#category_menu').val();

    // redraw columns afterwards

    // rawTable.column("state:name").search(stateSearchSeq, true, false);
    // rawTable.columns.adjust().draw();
    rawTable.columns.adjust().draw(false);


    // draw
  });
}


// events for download buttons

//$('#csv_button').click(function() {
//   var csvData = arrToCSV(getTableData());
//   saveAs(new Blob([csvData], {type: "text/plain;charset=utf-8"}), "raw_data.csv");
// );

$('#txt_button').click(function () {
  var txtData = arrToTXT(getTableData());
  saveAs(new Blob([txtData], {type: "text/plain;charset=utf-8"}), "data.txt");
});


///// helper functions


// generates dropdown menus for state, year, etc. using dropdown-select
function generateInitialMenu(listItems, titleName, idName) {
  // create dropdown menu
  var content = "<select class='selectpicker' multiple data-width='75%' data-actions-box='true' title=" + titleName + " id=" + idName + ">";

  for (var i = 0; i < listItems.length; i++) {
    content += "<option>" + listItems[i] + "</option>";
  }

  content += "</select>"

  $("#" + idName + "_placeholder").append(content);
  $("#" + idName).selectpicker('refresh');
}

// concatenates array in csv friendly format
function arrToCSV(arr) {
  var textArray = [];
  arr.forEach(function (row, index) {
    var line = row.join(",");
    textArray.push(line);
  });
  return textArray.join("\r\n");
}

// concatenates array in txt friendly format
function arrToTXT(arr) {
  var textArray = [];
  arr.forEach(function (row, index) {
    var line = row.join("\t");
    textArray.push(line);
  });
  return textArray.join("\r\n");
}

// convert <table> to array
function getTableData() {
  var data = [];
  var headers = [];
  // include table headers
  $("thead").find("th").each(function (index, value) {
    headers.push(value.innerText);
  });

  data.push(headers);
  // add rows
  $("table").find("tr").each(function (index) {
    var rowData = getRowData($(this).find("td"));
    data.push(rowData);
  });
  return data
}

// from the amicus-net project
function getRowData(data) {
  //This function takes in the data object array containing data: <td><data><td>
  var finalList = [];
  for (var c = 0; c < data.length; c++) {
    finalList.push(data.eq(c).text());
  }
  return finalList;
}
