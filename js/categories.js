var data = $.getJSON("js/glossary.json", function (obj) {

  // retrieve data
  data = obj['rows'];

  // list of categories
  var categories = obj['categories'];

  // alphabetize
  categories.sort();

  // create dropdown for categories
  var categoriesContent = "<select class='selectpicker' id='category_menu'>";

  for (var i = 0; i < categories.length; i++) {
    categoriesContent += "<option>" + categories[i] + "</option>";
  }

  categoriesContent += "</select>";

  $('#category_menu_div').append(categoriesContent);


  // set default category explanation/div to show
  $('#category_menu').selectpicker('val', 'Ammunition regulation');
  updateDiv();

  // show appropriate div based on chosen dropdown
  // requires that div heading exactly matches categories as stored in glossary.json (not case-sensitive)

  $('#category_menu').on('changed.bs.select', function () {
    updateDiv();
  });


});

function updateDiv() {
  $('#category_text_div').children().css("display", "none");
  var categoryChosen = $('#category_menu').val();
  $('#category_text_div').find("div").each(function(index) {
    if ($(this).children("h3:first").text().toLowerCase() === categoryChosen.toLowerCase()) {
      $(this).show();
    } else {
      $(this).hide();
    }
  })
}

