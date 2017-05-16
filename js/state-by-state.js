var usStates = $.getJSON("js/states-list.json", function (obj) {

  usStates = obj['states'];
  var stateData;
  var defaultYear = 2016;

  // Create list of states dropdown.
  var stateDropdownContent = "<select class='selectpicker' data-live-search='true' id='state_dropdown' title='Choose a state...'>";

  for (var i = 0; i < usStates.length; i++) {
    stateDropdownContent += "<option id='" + usStates[i]['abbreviation'] + "'>" + usStates[i]['name'] + "</option>";
  }

  stateDropdownContent += "</select>";

  $('#state_dropdown_div').append(stateDropdownContent);

  // Initialize slider for years on state-by-state page.
  $('#year').slider({
    formatter: function (value) {
      return value;
    }
  });

  // Start at Alabama in the default year.
  $('#state_dropdown').selectpicker('val', 'Alabama');
  stateData = $.getJSON('js/history/Alabama.json', function (obj) {
    stateData = obj["data"];
    displayState($('#state_dropdown option:selected'), stateData, defaultYear);
  });

  // changes page based on chosen state
  $(document).ready(
    $('#state_dropdown').on('changed.bs.select',
      function (event, clickedIndex, newValue, oldValue) {
        // top half of state page (percentages and icon)
        var stateSelected = $('#state_dropdown option:selected');

        // Update gun law history table, showing default year.
        stateData = $.getJSON('js/history/' + stateSelected.text() + ".json", function (obj) {
          stateData = obj["data"];
          displayState(stateSelected, stateData, defaultYear);
        });
      })
  );

// rates displayed change based on year input to slider
  $("#year").on("slideStop", function (slideEvt) {
    displayRates(stateData, slideEvt.value);
  });

});

// resets page based on state selected
// updates icons, titles, and labels
function displayState(stateSelected, stateData, defaultYear) {
  for (var i = 0; i < usStates.length; i++) {
    if (stateSelected.text().toLowerCase() === usStates[i]["name"].toLowerCase()) {
      // update state title shown
      $('#state_title').html(usStates[i]["name"]);

      // Set default year on slider.
      $('#year').slider('setValue', defaultYear);

      // Update the state fact sheet link.
      $('#fact-sheet-link').html('<a target="_blank" href="fact-sheet/' + usStates[i]["name"] + '.pdf">' + usStates[i]["name"] + '</a>');

      // Create table.
      createHistoryTable(stateData);
      updateHistoryTable(defaultYear);

      // Update associated rates.
      displayRates(stateData, defaultYear);

      // Update state icon.
      $('#state_icon').empty();
      $('#state_icon').append("<i class='mg map-us-" + usStates[i]["abbreviation"].toLowerCase() + " map-large'></i>");
    }
  }
}

// changes divs to show new suicide, homicide rates and gun law numbers
function displayRates(stateData, year) {
  var sr = (year in stateData && stateData[year].length >= 3) ? stateData[year][2]["suicide_rate"] : "N/A";
  var hr = (year in stateData && stateData[year].length >= 4) ? stateData[year][3]["homicide_rate"] : "N/A";

  if (sr === null) {
    $("#firearm_suicides").text("N/A");
  } else {
    $("#firearm_suicides").text(sr);
  }

  if (hr === null) {
    $("#firearm_homicides").text("N/A");
  } else {
    $("#firearm_homicides").text(hr);
  }

  var gl = stateData[year][1]["num_laws"];
  if (gl === null) {
    $("#num_gun_laws").text("N/A");
  } else {
    $("#num_gun_laws").text(gl);
  }

  $("#year_label").text(year);
  updateHistoryTable(year);
}

// Takes info from <state>.json and creates a full table of all statutes for that state;
// table is hidden during initialization.
function createHistoryTable(stateData) {
  $('#history_table').empty();

  var tableContent = "<table class='table table-responsive table-hover'>" +
    "<thead> <tr class='header'> <th>Gun Law Data</th> <th></th> <th>Status</th> </tr> </thead><tbody class='text-xs-left list'>";
  for (var year in stateData) {
    if (stateData.hasOwnProperty(year)) {
      for (var entry in stateData[year][0]["history"]) {
        tableContent += "<tr class='" + year + "'>";
        tableContent += "<td class='provision'><i>" + stateData[year][0]["history"][entry]["law"] + "</i></td>";
        tableContent += "<td class='definition'>" + stateData[year][0]["history"][entry]["definition"] + "</td>";
        tableContent += "<td class='status'>" + stateData[year][0]["history"][entry]["status"];
        if (stateData[year][0]["history"][entry]["status"] === "Current") {
          tableContent += "; " + "<a href='" + stateData[year][0]["history"][entry]["link"] + "'> Read the statute here </a></td>";
        } else {
          tableContent += "</td>"
        }
        tableContent += "</tr>";
      }
    }
  }

  tableContent += "</tbody> </table>";
  // create table and hide
  $('#history_table').append(tableContent);

  // create new List using list.js for manipulating the table
  var tableOptions = {
    valueNames: ["provision", "definition", "status"]
  };
  var historyList = new List('history_table', tableOptions);

  historyList.sort("provision", {order: "asc"});

}

// On change of year via range input, update gun law history table.
function updateHistoryTable(year) {
  $("#history_table").find("tr").each(function (index) {
    if ($(this).hasClass(year) || $(this).hasClass("header")) {
      $(this).css("display", "");
    } else {
      $(this).css("display", "none");
    }
  });
}
