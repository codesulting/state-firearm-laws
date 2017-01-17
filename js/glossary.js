var data = $.getJSON("js/glossary.json", function (obj) {

  // retrieve data
  data = obj['rows'];
  var categories = obj['categories'];
  var subcategories = obj['subcategories'];

  var headers = ["Code", "Definition", "Category"];

//Generate table header section
  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover'><thead><tr>";

  for (var i = 0; i < headers.length; i++) {
    tableContent += "<th>" + headers[i] + "</th>";
  }
  tableContent += "</tr></thead><tbody class='list'>";

//Generate all table rows from the glossary codebook

  for (var i = 0; i < data.length; i++) {
    var glossaryData = data[i]
    tableContent += "<tr>";
    tableContent += "<td class='variable'><i>" + glossaryData['variable'] + "</i></td>";
    tableContent += "<td class='description'>" + glossaryData['description'] + "</td>";
    tableContent += "<td class='category'>" + glossaryData['category'] + "<br>" + glossaryData['subcategory'] + "</td>";
    tableContent += "</tr>";
  }

  tableContent += "</tbody></table>"

//js-generated table is appended to div
  $('#glossary_table').append(tableContent);


  // create new List using list.js for manipulating the glossary table
  var options = {
    valueNames: ["variable", "description", "category"]
  };

  var glossaryList = new List('glossary_table', options);

  // create category dropdown menu

  var categoryContent = "<select class='selectpicker' title='Category' id='categoryMenu'>";

  for (var i = 0; i < categories.length; i++) {
    categoryContent += "<option class='categoryOption' id='categories_" + categories[i] + "'>" + categories[i] + "</option>";
  }

  categoryContent += "</select>"

  $('#categoryMenuPlaceholder').append(categoryContent);


  // create subcategory dropdown menu

  var subcategoryContent = "<select class='selectpicker' title='Subcategory' id='subcategoryMenu'>";

  for (var i = 0; i < subcategories.length; i++) {
    subcategoryContent += "<option class='subcategoryOption' id='subcategories_" + subcategories[i] + "'>" + subcategories[i] + "</option>";
  }

  subcategoryContent += "</select>";

  $('#subcategoryMenuPlaceholder').append(subcategoryContent);


  // changes table based on category filter
  $('#categoryMenu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      // option from category menu
      var categoryOption = $('#categoryMenu option:selected').text();

      glossaryList.filter(function (item) {
        // from table, includes category and subcategory
        var tableCategory = item.values().category;
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));

        return (tableCategory === categoryOption && item.visible());
      });

    });

  // changes table based on subcategory filter
  $('#subcategoryMenu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      // option from category menu
      var categoryOption = $('#subcategoryMenu option:selected').text();

      glossaryList.filter(function (item) {
        // from table, includes category and subcategory
        var tableCategory = item.values().category;
        tableCategory = tableCategory.slice(tableCategory.indexOf("<br>") + 4);

        return (tableCategory === categoryOption && item.visible()) ;
      });

    });

  // reset search settings to show complete glossary, empty search
  $('#reset_search').click(function () {
    glossaryList.search(); // resets table
    glossaryList.filter();
    $('#glossary_search').val(""); // resets searchbar
    $('#categoryMenu').selectpicker('deselectAll');
    $('#categoryMenu').selectpicker('render'); // resets dropdown

    // to do, reset category dropdowns
  });

});




