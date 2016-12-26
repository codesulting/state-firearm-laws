var data = $.getJSON("js/glossary.json", function (obj) {

  data = obj['rows'];
  var headers = ["Code", "Definition", "Category"];

//Generate Table Header Section
  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover'><thead><tr>";

  for (var i = 0; i < headers.length; i++) {
    tableContent += "<th>" + headers[i] + "</th>";
  }
  tableContent += "</tr></thead><tbody>"

//Generate all table rows from the glossary codebook
  for (var i = 0; i < data.length; i++) {
    var glossaryData = data[i]
    tableContent += "<tr>"
    tableContent += "<td><i>" + glossaryData['variable'] + "</i></td>"
    tableContent += "<td>" + glossaryData['description'] + "</td>"
    tableContent += "<td>" + glossaryData['category'] + "<br>" + glossaryData['subcategory'] + "</td>"
    tableContent += "</tr>"
  }

  tableContent += "</tbody></table>";

//js-generated table is appended to div
  $('#glossary_table').append(tableContent);


  // when user types into search bar, matches against glossary to show matches
  $('#glossary_search').keyup(function () {
    // user input
    var search = $('#glossary_search').val().toUpperCase();

    // looks at each row for match
    $("#glossary_table").find("tr").each(function (index) {
      // all text in a row
      var rowText = $(this).find("td");
      var matchFound = false;

      // sets css for each row based on match
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

})


