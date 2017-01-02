var usStates = $.getJSON("js/states-list.json", function (obj) {

  usStates = obj['states'];
  var stateHistory;

  // sample rates
  var firearmSuicides = {
    "2001": 3.3,
    "2002": 3.4,
    "2003": 4.3,
    "2004": 4.5,
    "2005": 4.3,
    "2006": 4.4,
    "2007": 4.1,
    "2008": 3.3,
    "2009": 5.1,
    "2010": 2.9,
    "2011": 3.4,
    "2012": 4.1,
    "2013": 3.3,
    "2014": 4.2,
    "2015": 4.3
  };

  var firearmHomicides = {
    "2001": 3.3,
    "2002": 3.4,
    "2003": 4.3,
    "2004": 4.5,
    "2005": 4.3,
    "2006": 4.4,
    "2007": 4.1,
    "2008": 3.3,
    "2009": 3.3,
    "2010": 3.3,
    "2011": 2.9,
    "2012": 3.1,
    "2013": 3.3,
    "2014": 3.5,
    "2015": 3.2
  };

  var numGunLaws = {
    "2009": 65,
    "2010": 80,
    "2011": 81,
    "2012": 82,
    "2013": 79,
    "2014": 84,
    "2015": 83
  }

  // create list of states dropdown
  var stateDropdownContent = "<select class='selectpicker' data-live-search='true' id='state_dropdown' title='Choose a state...'>";

  for (var i = 0; i < usStates.length; i++) {
    stateDropdownContent += "<option id='" + usStates[i]['abbreviation'] + "'>" + usStates[i]['name'] + "</option>";
  }

  stateDropdownContent += "</select>";

  $('#state_dropdown_div').append(stateDropdownContent);

  // slider for years on state-by-state page

  $('#year').slider({
    formatter: function (value) {
      return value;
    }
  });


  // changes page based on chosen state
  $(document).ready(
    $('#state_dropdown').on('changed.bs.select',
      function (event, clickedIndex, newValue, oldValue) {
      // top half of state page (percentages and icon)
        var stateSelected = $('#state_dropdown option:selected');
        displayState(stateSelected);

        // update gun law history table
        stateHistory = $.getJSON('js/history/' + stateSelected.text() + ".json", function (obj) {
          stateHistory = obj["history"];
          createHistoryTable(stateHistory);
        });
      })
  );


// rates displayed change based on year input to slider
  $("#year").on("slide", function (slideEvt) {
    $("#firearm_suicides").text(firearmSuicides[slideEvt.value] + "%");
    $("#firearm_homicides").text(firearmHomicides[slideEvt.value] + "%");
    $("#num_gun_laws").text(numGunLaws[slideEvt.value]);
    $("#year_label").text(slideEvt.value);
    updateHistoryTable(slideEvt.value);
  });

  // resets page based on state selected
  // updates icons, titles, and labels
  function displayState(stateSelected) {
    for (var i = 0; i < usStates.length; i++) {
      if (stateSelected.text().toLowerCase() === usStates[i]["name"].toLowerCase()) {
        // update state title shown
        $('#state_title').html(usStates[i]["name"]);

        // update associated percentages
        $("#firearm_suicides").text("N/A");
        $("#firearm_homicides").text("N/A");
        $("#num_gun_laws").text("N/A");
        $("#year_label").text("N/A");
        $('#state_info').show();

        // update state icon
        $('#state_icon').empty();
        $('#state_icon').append("<i class='mg map-us-" + usStates[i]["abbreviation"].toLowerCase() + " map-large'></i>");

        $('#history_table').empty();
      }
    }
  }

  // takes info from <state>.json and creates a full table of all statutes for that state
  // table is hidden on initialization
  function createHistoryTable(stateHistory) {

    var tableContent = "<table class='table table-responsive table-hover'>" +
      "<thead> <tr class='header'> <th>Gun Law History</th> <th></th> <th>Status</th> </tr> </thead><tbody class='text-xs-left'>";
    for (var year in stateHistory) {
      if (stateHistory.hasOwnProperty(year)) {
        for (var entry in stateHistory[year]) {
          tableContent += "<tr class='" + year + "'>";
          tableContent += "<td>" + stateHistory[year][entry]["law"] + "</td>";
          tableContent += "<td>" + stateHistory[year][entry]["definition"] + "</td>";
          tableContent += "<td>" + stateHistory[year][entry]["status"];
          if (stateHistory[year][entry]["status"] === "Current") {
            tableContent += "; " + "<a href='" + stateHistory[year][entry]["link"] + "'> Read the statute here </a></td>";
          } else {
            tableContent += "</td>"
          }
          tableContent += "</tr>";
        }
      }
    }

    tableContent +=  "</tbody> </table>";
    // create table and hide
    $('#history_table').append(tableContent);
    $('#history_table').css('display', 'none');
  }

  // on change of year via range input, will update gun law history table
  function updateHistoryTable(year) {
    $("#history_table").find("tr").each(function (index) {
      if ($(this).hasClass(year) || $(this).hasClass("header")) {
        $(this).css("display", "");
      } else {
        $(this).css("display", "none");
      }
      $('#history_table').css('display', '');
    });
  }

});
