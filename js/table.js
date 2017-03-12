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
  var colNamesDT = []
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
          stateSearchSeq += "|";
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

    rawTable.column(0).search(stateSearchSeq, true, false, true).draw();
    // rawTable.columns.adjust().draw();
    // rawTable.columns.adjust().draw(false);


    // draw
  });
}


// events for download buttons

$('#csv_button').click(function() {
  var csvData = arrToCSV(getTableData());
  saveAs(new Blob([csvData], {type: "data:text/csv;charset=utf-8"}), "raw_data.csv");
});

$('#txt_button').click(function () {
  var txtData = arrToTXT(getTableData());
  saveAs(new Blob([txtData], {type: "text/plain;charset=utf-8"}), "data.txt");
});

$('#xls_button').click(function () {
  var ws = sheet_from_array_of_arrays(getTableData());
  var wb = new Workbook();
  var ws_name = "data"
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = XLSX.write(wb, {bookType: 'biff2', bookSST: false, type: 'binary'});
  var fname = "data.xls";
  saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), fname);
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


// from xlsx-js package's demo

function datenum(v/*:Date*/, date1904/*:?boolean*/)/*:number*/ {
  var epoch = v.getTime();
  if (date1904) epoch += 1462 * 24 * 60 * 60 * 1000;
  return (epoch + 2209161600000) / (24 * 60 * 60 * 1000);
}

// from xlsx-js package's demo
function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {s: {c: 10000000, r: 10000000}, e: {c: 0, r: 0}};
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {v: data[R][C]};
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({c: C, r: R});

      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      }
      else cell.t = 's';

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
  return ws;
}

// from xlsx-js package's demo
function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

// from xlsx-js package's demo
function s2ab(s) {
  if (typeof ArrayBuffer !== 'undefined') {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  } else {
    var buf = new Array(s.length);
    for (var i = 0; i != s.length; ++i) buf[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}
