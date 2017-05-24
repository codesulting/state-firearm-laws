var rawData = $.getJSON("js/raw-data.json", function (obj) {
  // Data for table - columns and rows.
  var rawDataColumns = obj["columns"];
  var rawDataRows = obj["rows"];


  // Data for dropdown menus.
  var statesObj = obj["states"];
  var states = [];
  // Get state names for initializing dropdown menu.
  for (var i = 0; i < statesObj.length; i++) {
    states[i] = statesObj[i]["name"];
  }
  // Get years for loading year dropdown (bounds specified by raw-data.json).
  var years = [];
  var min_year = Number(obj["yearbounds"][0]);
  var max_year = Number(obj["yearbounds"][1]);
  for (var i = 0; i < max_year - min_year + 1; i++) {
    years[i] = min_year + i;
  }

  var categories = obj["categories"];
  var subcategories = obj["subcategories"];
  var provisions = obj["provisions"];

  // State variable that prevents infinite looping of menu updates during menu reset.
  var isInReset = false;


  // Set up dropdown menus and table.

  $('#no_data_warning').css("display", "none");
  initializeMenu(states, "State", "state_menu");
  initializeMenu(years, "Year", "year_menu");
  initializeMenu(categories, "Category", "category_menu");
  initializeMenu(subcategories, "Subcategory", "subcategory_menu");
  initializeMenu(provisions, "Provision", "provision_menu");

  var initialColumns = provisions.slice();
  initialColumns.sort();
  initialColumns.unshift("state", "year"); // Always comes first in column headers.
  initialColumns.push("lawtotal");

  // Will be changed based on updates to menus.
  var statesDisplayed = states;
  var yearsDisplayed = years;
  var provisionsDisplayed = provisions;
  initializeTable(initialColumns, rawDataRows);

  // Change table and menus to show info for default year only selected.
  $('#year_menu').selectpicker('val', [2017]).selectpicker('refresh');
  $('#state_menu').selectpicker('selectAll').selectpicker('refresh');
  $('#provision_menu').selectpicker('selectAll').selectpicker('refresh');

  statesDisplayed = $('#state_menu').val();
  yearsDisplayed = $('#year_menu').val();
  provisionsDisplayed = $('#provision_menu').val();

  updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);

  // Button actions for downloading complete database (ie complete table).
  $('#csv_complete_button').click(function () {
    var data = generateArray(initialColumns, rawDataRows);
    CSVOutput(data);
  });

  $('#txt_complete_button').click(function () {
    var data = generateArray(initialColumns, rawDataRows);
    TXTOutput(data);
  });

  $('#xls_complete_button').click(function () {
    var data = generateArray(initialColumns, rawDataRows);
    XLSOutput(data);
  });


  // Button actions for downloading partial database.
  $('#csv_button').click(function () {
    // Obtain list of columns to be included in file.
    var oldColumns = ["state", "year"];
    var newColumns = oldColumns.concat(provisionsDisplayed);

    // Show lawtotal if complete table is being shown.
    if (newColumns.length === initialColumns.length - 1) {
      newColumns = newColumns.concat(["lawtotal"]);
    } else {
      newColumns = newColumns.concat(["lawsubtotal"]);
    }
    // Based on states, years, and provisions, creates array object.
    var newRows = filterRows(rawDataRows, statesDisplayed, yearsDisplayed);
    var data = generateArray(newColumns, newRows);

    CSVOutput(data);

  });

  $('#txt_button').click(function () {
    // Obtain list of columns to be included in file.
    var oldColumns = ["state", "year"];
    var newColumns = oldColumns.concat(provisionsDisplayed);

    // Show lawtotal if complete table is being shown.
    if (newColumns.length === initialColumns.length - 1) {
      newColumns = newColumns.concat(["lawtotal"]);
    } else {
      newColumns = newColumns.concat(["lawsubtotal"]);
    }
    // Based on states, years, and provisions, creates array object.
    var newRows = filterRows(rawDataRows, statesDisplayed, yearsDisplayed);
    var data = generateArray(newColumns, newRows);

    TXTOutput(data);
  });

  $('#xls_button').click(function () {
    // Obtain list of columns to be included in file.
    var oldColumns = ["state", "year"];
    var newColumns = oldColumns.concat(provisionsDisplayed);

    // Show lawtotal if complete table is being shown.
    if (newColumns.length === initialColumns.length - 1) {
      newColumns = newColumns.concat(["lawtotal"]);
    } else {
      newColumns = newColumns.concat(["lawsubtotal"]);
    }

    // Based on states, years, and provisions, creates array object.
    var newRows = filterRows(rawDataRows, statesDisplayed, yearsDisplayed);
    var data = generateArray(newColumns, newRows);

    XLSOutput(data);

  });


  /*
   * Change events for the menus.
   * Any changes to the categories menu changes both the provisions and subcategories
   * and any changes to the subcategories menu changes the provisions menu.
   *
   */

  $('#state_menu').on('change', function (event, clickedIndex, newValue, oldValue) {
    statesDisplayed = $('#state_menu').val();
    yearsDisplayed = $('#year_menu').val();
    provisionsDisplayed = $('#provision_menu').val();

    updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);
  });

  $('#year_menu').on('change', function (event, clickedIndex, newValue, oldValue) {

    statesDisplayed = $('#state_menu').val();
    yearsDisplayed = $('#year_menu').val();
    provisionsDisplayed = $('#provision_menu').val();

    updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);

  });

  $('#provision_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      statesDisplayed = $('#state_menu').val();
      yearsDisplayed = $('#year_menu').val();
      provisionsDisplayed = $('#provision_menu').val();

      if (!isInReset) {
        updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);
      }

    });

  $('#category_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {

      // Update subcategory and provisions dropdowns.
      updateMenus("#category_menu", "subcategory", "provision", obj["maps"]["categorymap"]);

      statesDisplayed = $('#state_menu').val();
      yearsDisplayed = $('#year_menu').val();
      provisionsDisplayed = $('#provision_menu').val();

      // Prevents table from autoupdating during reset.
      if (!isInReset) {
        updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);
      }


    });

  $('#subcategory_menu').on('change',
    function (event, clickedIndex, newValue, oldValue) {
      // Update provision menu.

      updateMenus("#subcategory_menu", null, "provision", obj["maps"]["subcategorymap"]);

      statesDisplayed = $('#state_menu').val();
      yearsDisplayed = $('#year_menu').val();
      provisionsDisplayed = $('#provision_menu').val();

      if (!isInReset) {
        updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);
      }

    });

  // Event for updating table.

  $('#update_button').click(function () {
    // Based on state, year and provision, create updated table.
    statesDisplayed = $('#state_menu').val();
    yearsDisplayed = $('#year_menu').val();
    provisionsDisplayed = $('#provision_menu').val();

    updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);

  });

  // Resets menus.
  $('#reset_button').on('click', function () {
    // Indicates that reset is occurring, so menus should not trigger updates on other menus.
    isInReset = true;
    updateMenu(categories, "#category_menu");
    updateMenu(subcategories, "#subcategory_menu");
    updateMenu(provisions, "#provision_menu");
    $("#state_menu").selectpicker('selectAll');
    $("#year_menu").selectpicker('selectAll');

    // After reset, can get values of menus and show full table.

    statesDisplayed = $('#state_menu').val();
    yearsDisplayed = $('#year_menu').val();
    provisionsDisplayed = $('#provision_menu').val();
    updateTable(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);
    isInReset = false;

  });


});


// Update table and disable buttons.
function updateTableAndButtons(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed) {

  if (statesDisplayed === null || yearsDisplayed === null || provisionsDisplayed === null) {
    updateTable(rawDataRows, [], [], [], false);
  }

  if (provisionsDisplayed !== null) {
    provisionsDisplayed.sort();
  }

  updateTable(rawDataRows, statesDisplayed, yearsDisplayed, provisionsDisplayed);

  if ($('#csv_button').prop('disabled')) {
    $('#csv_button').prop('disabled', false);
    $('#txt_button').prop('disabled', false);
    $('#xls_button').prop('disabled', false);
  }
}

/*
 * Table-related functions.
 */

// Sets up table using clusterize js, which helps optimize loading.
function createTableContent(columns, rows) {
  var tableContent = [];

// Generate all table rows.

  for (var i = 0; i < rows.length; i++) {

    var rowData = rows[i];
    var row = ""
    row += "<tr>";
    var lawSubtotal = 0;
    for (var j = 0; j < columns.length; j++) {
      if (columns[j] === "lawsubtotal" || columns[j] === "lawtotal") {
        row += "<td>" + lawSubtotal + "</td>";
      } else {
        row += "<td>" + rowData[columns[j]] + "</td>";
      }

      if (Number(rowData[columns[j]]) === 1) {
        lawSubtotal += 1;
      }
    }
    row += "</tr>";
    tableContent.push(row);
  }
  return tableContent;
}

function initializeTable(columns, rows) {
  // Generate table header section.
  var header = [];

  header.push("<div class='clusterize-headers'><table class='table' id='headersArea'><thead><tr>");

  for (var i = 0; i < columns.length; i++) {
    header.push("<th data-toggle='tooltip' title='" + columns[i] + "'>" + columns[i] + "</th>");
  }
  header.push("</tr></thead></table></div>");

  $('#raw_data_table_placeholder').append(header.join(""));

  // Create temporary version of clusterize table.

  var loadingString = '<div id="scrollArea" class="clusterize-scroll"> <table class="table table-bordered table-hover table-responsive"><thead id="hiddenScrollHeader">';
  for (var i = 0; i < columns.length; i++) {
    loadingString += "<th></th>";
  }
  loadingString += '</thead><tbody id="contentArea" class="clusterize-content"> <tr class="clusterize-no-data"> <td>Loading data…</td> </tr> </tbody> </table> </div>';
  $('#raw_data_table_placeholder').append(loadingString);

  // Create actual table and populate.

  var tableContent = createTableContent(columns, rows);

  var clusterize = new Clusterize({
    rows: tableContent,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });

  initializeHeaderScrolling();

}

// Adds rows to table only if state and year in the row match the input lists' values.
function filterRows(rows, stateValues, yearValues) {
  var newRows = [];
  if (stateValues != null && yearValues != null) {
    for (var i = 0; i < rows.length; i++) {
      var rowData = rows[i];
      if (stateValues.indexOf(rowData["state"]) !== -1 && yearValues.indexOf(rowData["year"]) !== -1) {
        newRows.push(rowData);
      }
    }
  }
  return newRows;
}

function updateTable(rawDataRows, statesChosen, yearsChosen, provisionsChosen) {
  // If user has not chosen states or years or provisions, table should be empty.
  // Also displays message to user.
  if ((statesChosen === null || yearsChosen === null || provisionsChosen === null ||
    statesChosen.length === 0 || yearsChosen.length === 0 || provisionsChosen.length === 0)) {
    $('#no_data_warning').css("display", "block");
    $('#raw_data_table_placeholder').css("display", "none");
    $('#csv_button').prop('disabled', true);
    $('#txt_button').prop('disabled', true);
    $('#xls_button').prop('disabled', true);

  } else {
    $('#no_data_warning').css("display", "none");
    $('#raw_data_table_placeholder').css("display", "block");
    $('#csv_button').prop('disabled', false);
    $('#txt_button').prop('disabled', false);
    $('#xls_button').prop('disabled', false);
  }
  // Update header area.
  var header = ["<thead><tr>"];
  var oldColumns = ["state", "year"];
  var newColumns = oldColumns.concat(provisionsChosen);
  newColumns = newColumns.concat(["lawsubtotal"]);
  for (var i = 0; i < newColumns.length; i++) {
    header.push("<th data-toggle='tooltip' title='" + newColumns[i] + "'>" + newColumns[i] + "</th>");
  }
  header.push("</tr></thead>");

  $('#headersArea').empty();
  $('#headersArea').append(header.join(""));

  // Update hidden header area for scrolling.
  $('#hiddenScrollHeader').empty();
  var hiddenHeader = "";
  for (var i = 0; i < newColumns.length; i++) {
    hiddenHeader += "<th></th>";
  }
  $('#hiddenScrollHeader').append(hiddenHeader);

  // Remove rows based on states and year.
  var newRows = filterRows(rawDataRows, statesChosen, yearsChosen);

  // Remove columns based on provisions chosen.
  var tableContent = createTableContent(newColumns, newRows);

  var clusterize = new Clusterize({
    rows: tableContent,
    scrollId: 'scrollArea',
    contentId: 'contentArea'
  });
}

// From clusterize js - synchronizes table head and body scrolling.
function initializeHeaderScrolling() {
  var $scroll = $('#scrollArea');
  var $content = $('#contentArea');
  var $headers = $('#headersArea');


  // Makes header columns equal width to content columns.
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

  // Keep header equal width to tbody.
  var setHeaderWidth = function () {
    $headers.width($content.width());
  }

  // Set left offset to header to keep equal horizontal scroll position.
  var setHeaderLeftMargin = function (scrollLeft) {
    $headers.css('margin-left', -scrollLeft);
  }

  // Update header columns width on window resize.
  $(window).resize(fitHeaderColumns);

  // Update header left offset on scroll.
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
 * Helper functions for menus.
 */

// Generates dropdown menu for state, year, etc. using dropdown-select.
function initializeMenu(listItems, titleName, idName) {
  listItems.sort();
  // Create dropdown menu.
  var content = "<select class='selectpicker' multiple data-width='75%' data-actions-box='true' title=" + titleName + " id=" + idName + ">";

  for (var i = 0; i < listItems.length; i++) {
    content += "<option>" + listItems[i] + "</option>";
  }

  content += "</select>"

  $("#" + idName + "_placeholder").append(content);
  $("#" + idName).selectpicker('selectAll');
  $("#" + idName).selectpicker('refresh');

}


// Function that changes other menus based on user's selection of options on initial menu.
// Uses a mapping provided in raw-data.json.
function updateMenus(initialMenuID, menuOneID, menuTwoID, map) {
  // Selected values on the initial menu.
  var entriesSelected = $(initialMenuID).val();
  var updatedMenuOne = [];
  var updatedMenuTwo = [];
  var key1 = null; // Key to map for menu 1. Null if only menu 2 needs to be updated.
  var key2 = "provisions"; // Key to map for menu 2.
  if (menuOneID === "subcategory") {
    key1 = "subcategories";
  }

  if (entriesSelected !== null) {

    // Collect relevant values for other menus
    // (e.g. given an initial category menu,
    // collect relevant provisions and subcategories)
    // based on mappings from raw-data.json.

    for (var i = 0; i < entriesSelected.length; i++) {
      if (key1 !== null) {
        updatedMenuOne = _.union(updatedMenuOne, map[entriesSelected[i]][key1]);
      }
      updatedMenuTwo = _.union(updatedMenuTwo, map[entriesSelected[i]][key2]);
    }

  }

  if (menuOneID === null) {
    updateMenu(updatedMenuTwo, "#" + menuTwoID + "_menu");
  } else {
    updateMenu(updatedMenuOne, "#" + menuOneID + "_menu");
    updateMenu(updatedMenuTwo, "#" + menuTwoID + "_menu");
  }

}


// Function that updates a dropdown menu with new list of entries.
function updateMenu(updatedList, dropdownID) {
  updatedList.sort();
  var menuContent = "";
  // Remove all options from current menu.
  $(dropdownID).empty();

  for (var i = 0; i < updatedList.length; i++) {
    menuContent += "<option>" + updatedList[i] + "</option>";
  }
  // Update dropdown.
  $(dropdownID).append(menuContent);
  $(dropdownID).selectpicker('refresh');
  $(dropdownID).selectpicker('selectAll');

}


/*
 * Download associated functions.
 *
 */

// Uses Filesaver to write out csv.
function CSVOutput(data) {
  var csvData = arrToCSV(data);
  saveAs(new Blob([csvData], {type: "data:text/csv;charset=utf-8"}), "raw_data.csv");
}

// Uses Filesaver to write out txt.
function TXTOutput(data) {
  var txtData = arrToTXT(data);
  saveAs(new Blob([txtData], {type: "text/plain;charset=utf-8"}), "data.txt");
}

// Uses XLSX-js and FileSaver to write out xls.
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

// Concatenates array in csv friendly format.
function arrToCSV(arr) {
  return arrTo(arr, ",");
}

// Concatenates array in txt friendly format.
function arrToTXT(arr) {
  return arrTo(arr, "\t");
}

// Helper method for concatenation.
function arrTo(arr, delimit) {
  var textArray = [];
  arr.forEach(function (row, index) {
    var line = row.join(delimit);
    textArray.push(line);
  });
  return textArray.join("\r\n");
}


// Helper function to generate array based on rows/columns json input of complete database.
function generateArray(columns, rows) {
  var arr = [];
  arr.push(columns);
  for (var i = 0; i < rows.length; i++) {
    var arrRow = [];
    var total = 0;
    for (var j = 0; j < columns.length; j++) {
      if (columns[j] === "lawtotal" || columns[j] === "lawsubtotal") {
        arrRow.push(total);
      } else {
        arrRow.push(rows[i][columns[j]]);
      }

      // To calculate total laws per row.
      if (Number(rows[i][columns[j]]) === 1) {
        total += 1;
      }

    }
    arr.push(arrRow);
  }
  return arr;
}

/* Functions from xlsx-js package help to convert js arrays to compatible Workbook format
 for output as csv/xls files
 */
// From xlsx-js package's demo.

function dateNum(v/*:Date*/, date1904/*:?boolean*/)/*:number*/ {
  var epoch = v.getTime();
  if (date1904) epoch += 1462 * 24 * 60 * 60 * 1000;
  return (epoch + 2209161600000) / (24 * 60 * 60 * 1000);
}

// From xlsx-js package's demo.
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

// From xlsx-js package's demo.
function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

// From xlsx-js package's demo.
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
