// slider for years on state-by-state page

var slider = new Slider('#year', {
  formatter: function (value) {
    return value;
  }
});

$.getJSON("js/states-list.json", function (data) {
  var states_arr = data['states'];
  var stateDropdown = $("#stateDropdown");
  for (var i = 0; i < states_arr.length; i++) {
    var state = states_arr[i];
    $(stateDropdown).append("<button class='dropdown-item' type='button'>" + state + "</button>");
  }
});

// var firearm_suicides = {
//   2012: 4.1,
//   2013: 3.3,
//   2014: 5.2,
//   2015: 5.3,
//   2016: 5.1
// };
//
// slider.on("slide", function(slideEvt) {
//   $("#firearm-suicides").text(firearm_suicides[slideEvt.value]);
// });
