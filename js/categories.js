var data = $.getJSON("js/glossary.json", function (obj) {

  // Retrieve data.
  data = obj['rows'];

  // Obtain and alphabetize list of categories.
  var categories = obj['categories'];
  categories.sort();

  // Create dropdown for categories.
  var categoriesContent = "<select class='selectpicker' id='category_menu'>";

  for (var i = 0; i < categories.length; i++) {
    categoriesContent += "<option>" + categories[i] + "</option>";
  }

  categoriesContent += "</select>";

  $('#category_menu_div').append(categoriesContent);


  // Set default category explanation/div to show.
  $('#category_menu').selectpicker('val', 'Ammunition regulations');
  updateDiv();

  // Show appropriate div based on chosen dropdown.
  // Requires that div heading exactly matches categories as stored in glossary.json (not case-sensitive).

  $('#category_menu').on('changed.bs.select', function () {
    updateDiv();
  });


});

// Shows div based on dropdown option chosen. Hides remaining divs.
function updateDiv() {
  $('#category_text_div').children().css("display", "none");
  var categoryChosen = $('#category_menu').val();
  $('#category_text_div').find("div").each(function(index) {
    // Matches header to dropdown selection.
    if ($(this).children("h3:first").text().toLowerCase() === categoryChosen.toLowerCase()) {
      $(this).show();
    } else {
      $(this).hide();
    }
  })
}
