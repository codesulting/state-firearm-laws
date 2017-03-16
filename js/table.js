var rawData = $.getJSON("js/raw-data.json", function (obj) {
  // data for table
  var rawDataColumns = obj["columns"];
  var rawDataRows = obj["rows"];

  // data for dropdowns
  var statesObj = obj["states"];
  var states = [];
  // get state names
  for (var i = 0; i < statesObj.length; i++) {
    states[i] = statesObj[i]["name"];
  }
  // for loading year dropdown
  var years = [];
  var min_year = Number(obj["yearbounds"][0]);
  var max_year = Number(obj["yearbounds"][1]);
  for (var i = 0; i < max_year - min_year + 1; i++) {
    years[i] = min_year + i;
  }


  var categories = obj["categories"];
  var subcategories = obj["subcategories"];
  var provisions = obj["provisions"];

  // set up menus and table
  // returns reference to list objects that control menu display
  generateInitialMenu(states, "State", "state_menu");
  generateInitialMenu(years, "Year", "year_menu");
  generateInitialMenu(categories, "Category", "category_menu");
  generateInitialMenu(subcategories, "Subcategory", "subcategory_menu");
  generateInitialMenu(provisions, "Provision", "provision_menu");
  generateInitialTable(rawDataColumns, rawDataRows);

  // generate buttons for downloading complete dataset (ie complete table)
  $('#csv_complete_button').click(function () {
    var data = generateArray(rawDataColumns, rawDataRows);
    CSVOutput(data);
  });

  $('#txt_complete_button').click(function () {
    var data = generateArray(rawDataColumns, rawDataRows);
    TXTOutput(data);
  });

  $('#xls_complete_button').click(function () {
    var data = generateArray(rawDataColumns, rawDataRows);
    XLSOutput(data);
  });

  // update category and subcategory menus on dropdown
  $('#provision_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {

      // get current list of provisions
      var provisionsSelected = $('#provision_menu').val();
      console.log($('#provision_menu').val());

      if (provisionsSelected !== null) {
        var updatedCategories = [];
        var updatedSubcategories = [];

        // collect all categories and subcategories that are included with the provisions
        // based on mappings from raw-data.json

        for (var i = 0; i < provisionsSelected.length; i++) {
          updatedCategories.push(obj["maps"]["provmap"][provisionsSelected[i]]["category"]);
          updatedSubcategories.push(obj["maps"]["provmap"][provisionsSelected[i]]["subcategory"]);
        }

        // deduplicate lists
        updatedCategories = _.uniq(updatedCategories);
        updatedSubcategories = _.uniq(updatedSubcategories);

        // then update menus
        updateMenu(updatedCategories, "#category_menu");
        updateMenu(updatedSubcategories, "#subcategory_menu");
      } else {
        updateMenu([], "#category_menu");
        updateMenu([], "#subcategory_menu");
      }
    });

  $('#category_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // update subcategory and provision menus
      triggerMenusChanges("#category_menu", ["subcategory", "provision", "subcategories", "provisions"], obj["maps"]["categorymap"]);

    });

  $('#subcategory_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // update category and provision menus
      triggerMenusChanges("#subcategory_menu", ["category", "provision", "categories", "provisions"], obj["maps"]["subcategorymap"]);
    });


});

function generateInitialTable(columns, rows) {
  //Generate table header section
  var header = []

  //tableContent += "<table class='table table-bordered table-responsive table-hover' id='raw_table'><thead><tr>";
  header.push("<div class='clusterize-headers'><table class='table' id='headersArea'><thead><tr>");

  for (var i = 0; i < columns.length; i++) {
    header.push("<th>" + columns[i] + "</th>");
  }
  header.push("</tr></thead></table></div>");

  $('#raw_data_table_placeholder').append(header.join(""));

  var loadingString = '<div id="scrollArea" class="clusterize-scroll"> <table class="table table-bordered"> <tbody id="contentArea" class="clusterize-content"> <tr class="clusterize-no-data"> <td>Loading data…</td> </tr> </tbody> </table> </div>';
  $('#raw_data_table_placeholder').append(loadingString);

  var tableContent = [];

//Generate all table rows

  for (var i = 0; i < rows.length; i++) {
    var rowData = rows[i];
    var row = ""
    row += "<tr>";
    for (var j = 0; j < columns.length; j++) {
      row += "<td>" + rowData[columns[j]] + "</td>";
    }
    row += "</tr>";
    tableContent.push(row);
  }


  var $scroll = $('#scrollArea');
  var $content = $('#contentArea');
  var $headers = $('#headersArea');


  /**
   * Makes header columns equal width to content columns
   */
  var fitHeaderColumns = (function () {
    var prevWidth = [];
    return function () {
      var $firstRow = $content.find('tr:not(.clusterize-extra-row):first');
      var columnsWidth = [];
      $firstRow.children().each(function () {
        columnsWidth.push($(this).width());
      });
      if (columnsWidth.toString() == prevWidth.toString()) return;
      $headers.find('tr').children().each(function (i) {
        $(this).width(columnsWidth[i]);
      });
      prevWidth = columnsWidth;
    }
  })();

  /**
   * Keep header equal width to tbody
   */
  var setHeaderWidth = function () {
    $headers.width($content.width());
  }

  /**
   * Set left offset to header to keep equal horizontal scroll position
   */
  var setHeaderLeftMargin = function (scrollLeft) {
    $headers.css('margin-left', -scrollLeft);
  }

  /*
   * Init clusterize.js
   */
  var clusterize = new Clusterize({
    rows: tableContent,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });


  /**
   * Update header columns width on window resize
   */
  $(window).resize(fitHeaderColumns);

  /**
   * Update header left offset on scroll
   */
  $scroll.on('scroll', (function () {
    var prevScrollLeft = 0;
    return function () {
      var scrollLeft = $(this).scrollLeft();
      if (scrollLeft == prevScrollLeft) return;
      prevScrollLeft = scrollLeft;

      setHeaderLeftMargin(scrollLeft);
    }
  }()));

  // event for updating table

  $('#update_button').click(function () {
    var statesChosen = $('#state_menu').val();
    var yearsChosen = $('#year_menu').val();
    var provisionsChosen = $('#provision_menu').val();
    var categoriesChosen = $('#category_menu').val();
    var subcategoriesChosen = $('#subcategory_menu').val();

    // Remove rows based on states and year
  });
}


// events for download buttons

$('#csv_button').click(function () {
  CSVOutput(getTableData());
});

$('#txt_button').click(function () {
  TXTOutput(getTableData());
});

$('#xls_button').click(function () {
  XLSOutput(getTableData());
});


///// helper functions

// generates dropdown menus for state, year, etc. using dropdown-select
function generateInitialMenu(listItems, titleName, idName) {
  listItems.sort();
  // create dropdown menu
  var content = "<select class='selectpicker' multiple data-width='75%' data-actions-box='true' title=" + titleName + " id=" + idName + ">";

  for (var i = 0; i < listItems.length; i++) {
    content += "<option>" + listItems[i] + "</option>";
  }

  content += "</select>"

  $("#" + idName + "_placeholder").append(content);
  $("#" + idName).selectpicker('selectAll');
  $("#" + idName).selectpicker('refresh');

}

// function that changes other menus based on input to initial menu
// uses a mapping provided in raw-data.json

function triggerMenusChanges(initialMenuID, otherMenus, map) {
  // selected values on the initial menu
  var entriesSelected =  $(initialMenuID).val();
  console.log($(initialMenuID).val());
  if (entriesSelected !== null) {
    var updatedMenuOne = [];
    var updatedMenuTwo = [];

    // collect relevant values for other menus
    // (e.g. given an initial category menu,
    // collect relevant provisions and subcategories)
    // based on mappings from raw-data.json

    for (var i = 0; i < entriesSelected.length; i++) {
      updatedMenuOne = _.union(updatedMenuOne, map[entriesSelected[i]][otherMenus[2]]);
      updatedMenuTwo = _.union(updatedMenuTwo, map[entriesSelected[i]][otherMenus[3]]);
    }

    // then update menus
    updateMenu(updatedMenuOne, "#" + otherMenus[0] +"_menu");
    updateMenu(updatedMenuTwo, "#" + otherMenus[1] +"_menu");

  } else {
  // empty menus
    updateMenu([], "#" + otherMenus[0] +"_menu");
    updateMenu([], "#" + otherMenus[1] +"_menu");
  }
}

// function that updates a dropdown menu with new list of entries
function updateMenu(updatedList, dropdownID) {
  updatedList.sort();
  var categoryContent = "";
  // remove all options from current menu
  $(dropdownID).empty();

  for (var i = 0; i < updatedList.length; i++) {
    categoryContent += "<option>" + updatedList[i] + "</option>";
  }
  // update dropdown
  $(dropdownID).append(categoryContent);
  $(dropdownID).selectpicker('refresh');

}

function filterRows() {

}

/*
 * download associated functions
 *
 */

// uses Filesaver to write out csv
function CSVOutput(data) {
  var csvData = arrToCSV(data);
  saveAs(new Blob([csvData], {type: "data:text/csv;charset=utf-8"}), "raw_data.csv");
}

// uses Filesaver to write out txt
function TXTOutput(data) {
  var txtData = arrToTXT(data);
  saveAs(new Blob([txtData], {type: "text/plain;charset=utf-8"}), "data.txt");
}

// uses XLSX-js and FileSaver to write out xls
function XLSOutput(data) {
  var ws = sheet_from_array_of_arrays(data);
  var wb = new Workbook();
  var ws_name = "data"
  wb.SheetNames.push(ws_name);
  wb.Sheets[ws_name] = ws;
  var wbout = XLSX.write(wb, {bookType: 'biff2', bookSST: false, type: 'binary'});
  var fname = "data.xls";
  saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), fname);
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

// convert html <table> to array
function getTableData() {
  var data = [];
  var headers = [];
  // include table headers
  $("#headersArea").find("th").each(function (index, value) {
    headers.push(value.innerText);
  });

  data.push(headers);
  // add rows
  $("#contentArea").find("tr").each(function (index) {
    var rowData = getRowData($(this).find("td"));
    if (rowData.length > 0) {
      data.push(rowData);
    }
  });
  return data
}

// helper function to convert html <table> rows to array
// from the amicus-net project
function getRowData(data) {
  //This function takes in the data object array containing data: <td><data><td>
  var finalList = [];
  for (var c = 0; c < data.length; c++) {
    finalList.push(data.eq(c).text());
  }
  return finalList;
}

// helper function to generate array based on rows/columns json input of complete dataset
function generateArray(columns, rows) {
  var arr = [];
  arr.push(columns);
  for (var i = 0; i < rows.length; i++) {
    var arrRow = [];
    for (var j = 0; j < columns.length; j++) {
      arrRow.push(rows[i][columns[j]]);
    }
    arr.push(arrRow);
  }
  return arr;
}

/* functions from xlsx-js package help to convert js arrays to compatible Workbook format
 for output as csv/xls files
 */
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
