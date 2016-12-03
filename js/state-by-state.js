// slider for years on state-by-state page

$('#year').slider({
  formatter: function (value) {
    return value;
  }
});


// sample rates
var firearm_suicides = {
  "2009": 5.1,
  "2010": 2.9,
  "2011": 3.4,
  "2012": 4.1,
  "2013": 3.3,
  "2014": 4.2,
  "2015": 4.3
};

var firearm_homicides = {
  "2009": 3.3,
  "2010": 3.3,
  "2011": 2.9,
  "2012": 3.1,
  "2013": 3.3,
  "2014": 3.5,
  "2015": 3.2
};

var num_gun_laws = {
  "2009": 65,
  "2010": 80,
  "2011": 81,
  "2012": 82,
  "2013": 79,
  "2014": 84,
  "2015": 83
}


// rates displayed change based on year
$("#year").on("slide", function(slideEvt) {
  $("#firearm-suicides").text(firearm_suicides[slideEvt.value]);
  $("#firearm-homicides").text(firearm_homicides[slideEvt.value]);
  $("#num-gun-laws").text(num_gun_laws[slideEvt.value]);
  $("#year-label").text([slideEvt.value]);
});


// load dropdown menu of states
$.getJSON("js/states-list.json", function (data) {
  var states_arr = data['states'];
  var stateDropdown = $("#stateDropdown");
  for (var i = 0; i < states_arr.length; i++) {
    var state = states_arr[i];
    $(stateDropdown).append("<button class='dropdown-item' type='button'>" + state + "</button>");
  }
});
