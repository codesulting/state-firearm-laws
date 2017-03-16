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
  initializeMenu(states, "State", "state_menu");
  initializeMenu(years, "Year", "year_menu");
  initializeMenu(categories, "Category", "category_menu");
  initializeMenu(subcategories, "Subcategory", "subcategory_menu");
  initializeMenu(provisions, "Provision", "provision_menu");

  // will be changed based on updated button
  var statesDisplayed = states;
  var yearsDisplayed = years;
  var provisionsDisplayed = provisions;
  initializeTable(rawDataColumns, rawDataRows);


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


  // generate buttons for downloading partial dataset
  // events for download buttons

  $('#csv_button').click(function () {
    //CSVOutput();
  });

  $('#txt_button').click(function () {
    //TXTOutput();
  });

  $('#xls_button').click(function () {
    // XLSOutput();
  });


  /*
   * 3 change events for the menus
   * Follows the behavior of Tableau-implemented version of the table
   * where any changes to the provision menu only change the subcategories menu;
   * any changes to the categories menu  changes both the provisions and subcategories
   * and any changes to the subcategories menu changes the provisions menu
   * */
  $('#provision_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // update subcategory menu on dropdown

      // prevents provision menu event from being triggered immediately by another menu event
      if ($('#provision_menu').val().length !== $('#provision_menu > option').length) {
        triggerMenuChangesAlt(obj["maps"]["provmap"]);
      }

    });

  $('#category_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // update subcategory and provision menus
      if ($('#category_menu').val().length !== $('#category_menu > option').length) {
        triggerMenusChanges("#category_menu", ["subcategory", "provision", "subcategories", "provisions"], obj["maps"]["categorymap"]);
      }

    });

  $('#subcategory_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // update provision menu
      if ($('#subcategory_menu').val().length !== $('#subcategory_menu > option').length) {
        triggerMenusChanges("#subcategory_menu", ["", "provision", "", "provisions"], obj["maps"]["subcategorymap"]);
      }
    });

  // event for updating table

  $('#update_button').click(function () {
    // based on state, year and provision, create updated table
    statesDisplayed = $('#state_menu').val();
    yearsDisplayed = $('#year_menu').val();
    provisionsDisplayed = $('#provision_menu').val();
    provisionsDisplayed.sort();

    updateTable(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);


  });

  // resets menus
  $('#reset_button').on('click', function () {
    updateMenu(categories, "#category_menu");
    updateMenu(subcategories, "#subcategory_menu");
    updateMenu(provisions, "#provision_menu");
    $("#state_menu").selectpicker('selectAll');
    $("#year_menu").selectpicker('selectAll');

  });


});


/*
 * table-related functions
 */

// sets up table using clusterize js, which helps optimize loading

function createTableContent(columns, rows) {
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
  return tableContent;
}

function initializeTable(columns, rows) {
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

  var tableContent = createTableContent(columns, rows);

  var clusterize = new Clusterize({
    rows: tableContent,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });

  initializeHeaderScrolling();


}

function filterRows(rows, stateValues, yearValues) {
  var newRows = [];
  for (var i = 0; i < rows.length; i++) {
    var rowData = rows[i];
    if (stateValues.indexOf(rowData["state"]) !== -1 && yearValues.indexOf(rowData["year"]) !== -1) {
      newRows.push(rowData);
    }
  }
  return newRows;
}

function updateTable(rawDataRows, statesChosen, yearsChosen, provisionsChosen) {
  // update header area
  var header = ["<thead><tr>"];
  var oldColumns = ["state", "year"];
  var newColumns = oldColumns.concat(provisionsChosen);
  newColumns = newColumns.concat(["intimatetotal", "lawtotal"]);
  for (var i = 0; i < newColumns.length; i++) {
    header.push("<th>" + newColumns[i] + "</th>");
  }
  header.push("</tr></thead>");

  $('#headersArea').empty();
  $('#headersArea').append(header);

  // Remove rows based on states and year
  var newRows = filterRows(rawDataRows, statesChosen, yearsChosen);
  // Remove columns based on provisions chosen
  var tableContent = createTableContent(newColumns, newRows);

  var clusterize = new Clusterize({
    rows: tableContent,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });
}

// from clusterize js, intended to synchronize table head and body scrolling
function initializeHeaderScrolling() {
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
}


/*
 * helper functions for menus
 */

// generates dropdown menus for state, year, etc. using dropdown-select
function initializeMenu(listItems, titleName, idName) {
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
  var entriesSelected = $(initialMenuID).val();
  console.log($(initialMenuID).val());
  var updatedMenuOne = [];
  var updatedMenuTwo = [];
  if (entriesSelected !== null) {

    // collect relevant values for other menus
    // (e.g. given an initial category menu,
    // collect relevant provisions and subcategories)
    // based on mappings from raw-data.json

    for (var i = 0; i < entriesSelected.length; i++) {
      if (otherMenus[0] !== "") {
        updatedMenuOne = _.union(updatedMenuOne, map[entriesSelected[i]][otherMenus[2]]);
      }
      updatedMenuTwo = _.union(updatedMenuTwo, map[entriesSelected[i]][otherMenus[3]]);
    }

  }

  if (otherMenus[0] === "") {
    // then update menus
    updateMenu(updatedMenuTwo, "#" + otherMenus[1] + "_menu");
  } else {
    // then update menus
    updateMenu(updatedMenuOne, "#" + otherMenus[0] + "_menu");
    updateMenu(updatedMenuTwo, "#" + otherMenus[1] + "_menu");
  }

}

// based on provisions selected, updates subcategory menu
function triggerMenuChangesAlt(map) {
  // get current list of provisions
  var provisionsSelected = $('#provision_menu').val();

  if (provisionsSelected !== null) {
    var updatedSubcategories = [];

    // collect all subcategories that are included with the provisions
    // based on mappings from raw-data.json

    for (var i = 0; i < provisionsSelected.length; i++) {
      updatedSubcategories.push(map[provisionsSelected[i]]["subcategory"]);
    }

    // deduplicate list
    updatedSubcategories = _.uniq(updatedSubcategories);

    // then update menu
    updateMenu(updatedSubcategories, "#subcategory_menu");
  } else {
    updateMenu([], "#subcategory_menu");
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
  $(dropdownID).selectpicker('selectAll');

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
  var ws = sheetFromArrayOfArrays(data);
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

function dateNum(v/*:Date*/, date1904/*:?boolean*/)/*:number*/ {
  var epoch = v.getTime();
  if (date1904) epoch += 1462 * 24 * 60 * 60 * 1000;
  return (epoch + 2209161600000) / (24 * 60 * 60 * 1000);
}

// from xlsx-js package's demo
function sheetFromArrayOfArrays(data, opts) {
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
        cell.v = dateNum(cell.v);
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
