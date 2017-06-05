var data = $.getJSON("js/glossary.json", function (obj) {

  // Retrieve data (categories, subcategories).
  data = obj['rows'];
  var categories = obj['categories'];
  var subcategories = obj['subcategories'];
  categories.sort();
  subcategories.sort();

// Generate table header section.
  var headers = ["Code", "Definition", "Category/Subcategory"];

  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover'><thead><tr>";

  for (var i = 0; i < headers.length; i++) {
    tableContent += "<th>" + headers[i] + "</th>";
  }
  tableContent += "</tr></thead><tbody class='list'>";


// Generate all table rows from the glossary codebook.

  for (var i = 0; i < data.length; i++) {
    var glossaryData = data[i]
    tableContent += "<tr>";
    tableContent += "<td class='variable'><i>" + glossaryData['variable'] + "</i></td>";
    tableContent += "<td class='description'>" + glossaryData['description'] + "</td>";
    tableContent += "<td class='category'>" + glossaryData['category'] + "<br>" + glossaryData['subcategory'] + "</td>";
    tableContent += "</tr>";
  }

  tableContent += "</tbody></table>";

// js-generated table is appended to div.
  $('#glossary_table').append(tableContent);

  // Create new List using list.js for manipulating the glossary table.
  var glossaryOptions = {
    valueNames: ["variable", "description", "category"]
  };
  var glossaryList = new List('glossary_table', glossaryOptions);

  glossaryList.sort("variable", {order: "asc"});

  // Create category dropdown menu.
  var categoryContent = "<select class='selectpicker' title='Category' id='category_menu'>";

  for (var i = 0; i < categories.length; i++) {
    categoryContent += "<option class='categoryOption'>" + categories[i] + "</option>";
  }

  categoryContent += "</select>"

  $('#category_menu_placeholder').html(categoryContent);
  $('#category_menu').selectpicker('refresh');


  // Create subcategory dropdown menu.
  var subcategoryContent = "<select class='selectpicker' title='Subcategory' id='subcategory_menu'>";

  for (var i = 0; i < subcategories.length; i++) {
    subcategoryContent += "<option class='categoryOption'>" + subcategories[i] + "</option>";
  }

  subcategoryContent += "</select>";

  $('#subcategory_menu_placeholder').html(subcategoryContent);
  $('#subcategory_menu').selectpicker('refresh');


  // Change both dropdown menus on search event.
  $('#glossary_search').keyup(function (event) {
    // Get current phrase in search input.
    var searchTerm = $('#glossary_search').val();


    // Reset list of glossary entries, and show entries matching with search term.
    glossaryList.search();
    glossaryList.filter();
    glossaryList.search(searchTerm);
    // Update dropdown menus based on new glossary.
    updateDropdown(categories, glossaryList, false);
    updateDropdown(subcategories, glossaryList, true);

  });

  // Changes table based on category dropdown.
  $('#category_menu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      var searchTerm = $('#glossary_search').val();

      glossaryList.search();
      glossaryList.filter();
      if (searchTerm !== null) {
        glossaryList.search(searchTerm);
      }

      // Option from category menu.
      var categoryOption = $('#category_menu option:selected').text();

      // Update glossary table.
      glossaryList.filter(function (item) {
        // From table, includes category and subcategory.
        var tableCategory = item.values().category;
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));

        return (tableCategory === categoryOption /*&& item.visible()*/);
      });

      // Update subcategory dropdown.
      updateDropdown(subcategories, glossaryList, true);

    });


  // Changes table based on subcategory dropdown.
  $('#subcategory_menu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      // Filter by search term first.
      var searchTerm = $('#glossary_search').val();
      glossaryList.search();
      glossaryList.filter();
      if (searchTerm !== null || searchTerm !== "") {
        glossaryList.search(searchTerm);
      }

      // Get input from category/subcategory menu.
      var subcategoryOption = $('#subcategory_menu option:selected').text();
      var categoryOption = $('#category_menu option:selected').text();

      glossaryList.filter(function (item) {
        // From table, parse out category and subcategory.
        var tableCatString = item.values().category;
        var tableCategory = tableCatString.slice(0, tableCatString.indexOf("<br>"));
        var tableSubcategory = tableCatString.slice(tableCatString.indexOf("<br>") + 4);

        // Filter based on input from dropdown menus.
        if (categoryOption === null || categoryOption === "Category") {
          return (tableSubcategory === subcategoryOption);
        } else {
          return (tableCategory === categoryOption && tableSubcategory === subcategoryOption);
        }

      });

      // Update category dropdown if needed.
      if ($('#category_menu option:selected').text() === null) {
        updateDropdown(categories, glossaryList, false);
      }

    });

  // Reset search settings to show complete glossary, empty search.
  $('#reset_search').click(function () {
    glossaryList.search(); // resets table
    glossaryList.filter();
    $('#glossary_search').val(""); // resets searchbar


    // Reset category dropdowns.
    resetDropdown(categories, false);
    resetDropdown(subcategories, true);
  });

});

// Given a menu type and list of categories, resets menu.
function resetDropdown(categories, isSubcategory) {
  // Create category dropdown menu.
  var categoryContent = "";
  var dropdownID = '#category_menu';
  if (isSubcategory) {
    dropdownID = '#subcategory_menu';
  }

  for (var i = 0; i < categories.length; i++) {
    categoryContent += "<option class='categoryOption'>" + categories[i] + "</option>";
  }

  $(dropdownID).empty();
  $(dropdownID).append(categoryContent);
  $(dropdownID).selectpicker('refresh');
}


// Updates category/subcategory dropdown.
function updateDropdown(categoryList, glossaryList, isSubcategory) {
  var categoryContent = "";
  var dropdownID;

  if (isSubcategory) {
    dropdownID = '#subcategory_menu';
  } else {
    dropdownID = '#category_menu';
  }


  // Assume all categories on category dropdown are hidden by default.
  var isShow = [];
  $(dropdownID).empty();
  categoryList.forEach(function (element) {
    isShow.push(false);
  });

  // Loop through items from glossary that are currently visible.
  var visibleArray = glossaryList.visibleItems;

  for (var v in visibleArray) {
    // Get category or subcategory for each table entry.
    var tableCategory = visibleArray[v].values().category;

    // <br> is separator for category and subcategory on html page.
    if (tableCategory !== null) {
      if (isSubcategory) {
        tableCategory = tableCategory.slice(tableCategory.indexOf("<br>") + 4);
      } else {
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));
      }

      // Loops through category for each table entry.
      // If match, show category on menu.

      for (var i = 0; i < categoryList.length; i++) {
        if (isShow[i]) {
          continue;
        }
        if (categoryList[i] === tableCategory) {
          isShow[i] = true;
          categoryContent += "<option class='categoryOption'>" + categoryList[i] + "</option>";
        }
      }
    }

  }
// Update dropdown.
  $(dropdownID).append(categoryContent);
  $(dropdownID).selectpicker('refresh');

}




