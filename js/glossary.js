var data = $.getJSON("js/glossary.json", function (obj) {

  data = obj['rows'];
  var categories = obj['categories'];
  var subcategories = obj['subcategories'];

  var headers = ["Code", "Definition", "Category"];

//Generate Table Header Section
  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover'><thead><tr>";

  for (var i = 0; i < headers.length; i++) {
    tableContent += "<th>" + headers[i] + "</th>";
  }
  tableContent += "</tr></thead><tbody>";

//Generate all table rows from the glossary codebook
  var categorySet = new Set();

  for (var i = 0; i < data.length; i++) {
    var glossaryData = data[i]
    tableContent += "<tr>";
    tableContent += "<td><i>" + glossaryData['variable'] + "</i></td>";
    tableContent += "<td>" + glossaryData['description'] + "</td>";
    tableContent += "<td>" + glossaryData['category'] + "<br>" + glossaryData['subcategory'] + "</td>";
    tableContent += "</tr>";
  }

  tableContent += "</tbody></table>"

//js-generated table is appended to div
  $('#glossary_table').append(tableContent)

  // create category dropdown menu

  var categoryContent = '<ul class="dropdown-menu filters" aria-labelledby="categoryMenu">';

  for (var i = 0; i < categories.length; i++) {
    categoryContent += "<li class='category' id='categories_" + categories[i] + "'><a href='#'>" + categories[i] + "</a></li>";
  }
  categoryContent += "</ul>";
  $('#categoryMenu').append(categoryContent);


  // create subcategory dropdown menu

  var subcategoryContent = '<ul class="dropdown-menu filters" aria-labelledby="subcategoryMenu">';

  for (var i = 0; i < subcategories.length; i++) {
    subcategoryContent += "<li class='subcategory' id='subcategories_" + subcategories[i] + "'><a href='#'>" + subcategories[i] + "</a></li>";
  }
  subcategoryContent += "</ul>";
  $('#subcategoryMenu').append(subcategoryContent);


  // when user types into search bar, matches against glossary to show matches
  $('#glossary_search').keyup(function () {
    // user input
    var search = $('#glossary_search').val().toUpperCase();

    // looks at each row for match
    $("#glossary_table").find("tr").each(function (index) {
      // all text in a row
      var rowText = $(this).find("td");
      var matchFound = false;

      // hides or shows row based on match
      for (var i = 0; i < rowText.length; i++) {
        if (rowText.eq(i).html().toUpperCase().indexOf(search) !== -1) {
          $(this).css("display", "");
          matchFound = true;
          break;
        }
      }
      if (!matchFound) {
        $(this).css("display", "none");
      }
    });


  });

  // changes table based on category filter
  $('.category').click(function () {

    // get category selected
    var category = $(this).attr("id");
    category = category.toString();
    var categorystr = category.slice(category.indexOf("_") + 1);

    // update category button label
    $('#category_button').text(categorystr);

    // looks at each row of table for match
    $("#glossary_table").find("tr").each(function (index) {
      // all text in a row
      var rowText = $(this).find("td");

      // hides or shows row based on match

      if (rowText.length !== 0) {
        var tableCategory = rowText.eq(2).html().toString();
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));
        if (tableCategory.toUpperCase().indexOf(categorystr.toUpperCase()) !== -1) {
          $(this).css("display", "");
        } else {
          $(this).css("display", "none");
        }
      }

    });

  });

  // changes table based on category filter
  $('.subcategory').click(function () {

    // get subcategory selected
    var subcategory = $(this).attr("id");
    subcategory = subcategory.toString();
    var subcategorystr = subcategory.slice(subcategory.indexOf("_") + 1);


    // update subcategory button label
    $('#subcategory_button').text(subcategorystr);

    // looks at each row of table for match
    $("#glossary_table").find("tr").each(function (index) {
      // all text in a row
      var rowText = $(this).find("td");

      // hides or shows row based on match

      if (rowText.length !== 0) {
        var tableCategory = rowText.eq(2).html().toString();
        tableCategory = tableCategory.slice(tableCategory.indexOf("<br>") + 4);
        if (tableCategory.toUpperCase().indexOf(subcategorystr.toUpperCase()) !== -1) {
          $(this).css("display", "");
        } else {
          $(this).css("display", "none");
        }
      }

    });

  });

});




