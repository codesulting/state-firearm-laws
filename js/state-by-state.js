var usStates = $.getJSON("js/states-list.json", function (obj) {

  usStates = obj['states'];
  var stateData;


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
        stateData = $.getJSON('js/history/' + stateSelected.text() + ".json", function (obj) {
          stateData = obj["data"];
          createDataTable(stateData);
        });
      })
  );


// rates displayed change based on year input to slider
  $("#year").on("slideStop", function (slideEvt) {
    var sr = stateData[slideEvt.value][2]["suicide_rate"];
    var hr = stateData[slideEvt.value][3]["homicide_rate"];
    if ($.isNumeric(sr)) {
      $("#firearm_suicides").text(sr + "%");
    } else {
      $("#firearm_suicides").text(sr);
    }

    if ($.isNumeric(hr)) {
      $("#firearm_homicides").text(hr + "%");
    } else {
      $("#firearm_homicides").text(hr);
    }

    $("#num_gun_laws").text(stateData[slideEvt.value][1]["num_laws"]);
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
  function createDataTable(stateData) {
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

    tableContent +=  "</tbody> </table>";
    // create table and hide
    $('#history_table').append(tableContent);
    $('#history_table').css('display', 'none');

    // create new List using list.js for manipulating the table
    var tableOptions = {
      valueNames: ["provision", "definition", "status"]
    };
    var historyList = new List('history_table', tableOptions);

    historyList.sort("provision", {order: "asc"});

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
