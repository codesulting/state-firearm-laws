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

  // create category dropdown menu
  var categoryContent = "<select class='selectpicker' title='Category' id='category_menu'>";

  for (var i = 0; i < categories.length; i++) {
    categoryContent += "<option class='categoryOption'>" + categories[i] + "</option>";
  }

  categoryContent += "</select>"

  $('#category_menu_placeholder').append(categoryContent);


  // create subcategory dropdown menu

  var subcategoryContent = "<select class='selectpicker' title='Subcategory' id='subcategory_menu'>";

  for (var i = 0; i < subcategories.length; i++) {
    subcategoryContent += "<option class='categoryOption'>" + subcategories[i] + "</option>";
  }

  subcategoryContent += "</select>";

  $('#subcategory_menu_placeholder').append(subcategoryContent);


  // create new List using list.js for manipulating the glossary table
  var glossaryOptions = {
    valueNames: ["variable", "description", "category"]
  };
  var glossaryList = new List('glossary_table', glossaryOptions);


  // change both dropdown menus on search event
  $('#glossary_search').keyup(function () {
    updateDropdown(categories, glossaryList, false);
    updateDropdown(subcategories, glossaryList, true);
  });

  // changes table based on category filter
  $('#category_menu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      // option from category menu
      var categoryOption = $('#category_menu option:selected').text();

      // update glossary table
      glossaryList.filter(function (item) {
        // from table, includes category and subcategory
        var tableCategory = item.values().category;
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));

        return (tableCategory === categoryOption && item.visible());
      });

      // update subcategory dropdown
      updateDropdown(subcategories, glossaryList, true);

    });


  // changes table based on subcategory filter
  $('#subcategory_menu').on('changed.bs.select',
    function (event, clickedIndex, newValue, oldValue) {

      // option from category menu
      var categoryOption = $('#subcategory_menu option:selected').text();

      glossaryList.filter(function (item) {
        // from table, includes category and subcategory
        var tableCategory = item.values().category;
        tableCategory = tableCategory.slice(tableCategory.indexOf("<br>") + 4);

        return (tableCategory === categoryOption && item.visible());
      });

      // update subcategory dropdown
      updateDropdown(categories, glossaryList, false);
      updateDropdown(subcategories, glossaryList, true);

    });

  // reset search settings to show complete glossary, empty search
  $('#reset_search').click(function () {
    glossaryList.search(); // resets table
    glossaryList.filter();
    $('#glossary_search').val(""); // resets searchbar


    // reset category dropdowns
    resetDropdown(categories, false);
    resetDropdown(subcategories, true);
  });

});

// resets dropdowns

function resetDropdown(categories, isSubcategory) {
  // create category dropdown menu
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


// function that updates category/subcategory dropdown
function updateDropdown(categoryList, glossaryList, isSubcategory) {
  var categoryContent = "";
  var dropdownID;

  if (isSubcategory) {
    dropdownID = '#subcategory_menu';
  } else {
    dropdownID = '#category_menu';
  }


  // assume all categories hidden by default
  var isShow = [];
  $(dropdownID).empty();
  categoryList.forEach(function (element) {
    isShow.push(false);
  });

  // find list of categories
  var visibleArray = glossaryList.visibleItems;

  for (var v in visibleArray) {
    // get category or subcategory for each table entry
    var tableCategory = visibleArray[v].values().category;
    if (tableCategory !== null) {
      if (isSubcategory) {
        tableCategory = tableCategory.slice(tableCategory.indexOf("<br>") + 4);
      } else {
        tableCategory = tableCategory.slice(0, tableCategory.indexOf("<br>"));
      }

      // loops through category for each table entry
      // if match, show category


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
// update dropdown
  $(dropdownID).append(categoryContent);
  $(dropdownID).selectpicker('refresh');

}




