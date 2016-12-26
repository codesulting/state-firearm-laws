var data =  $.getJSON("js/glossary.json", function (obj) {
  data = obj['rows'];
  var headers = ["Code", "Definition", "Category"];

//Generate Table Header Section
  var tableContent = "";
  tableContent += "<table class='table table-responsive table-hover'><thead><tr>";


for (var i = 0; i < headers.length; i++) {
  tableContent += "<th>" + headers[i] + "</th>";
}
  tableContent += "</tr></thead><tbody>"

//Generate table rows from the data
  for (var i = 0; i < data.length; i++) {
    var glossaryData = data[i]
    tableContent += "<tr>"
    tableContent += "<td><i>" +  glossaryData['variable'] + "</i></td>"
    tableContent += "<td>" + glossaryData['description'] + "</td>"
    tableContent += "<td>" + glossaryData['category'] + "<br>" + glossaryData['subcategory'] + "</td>"
    tableContent += "</tr>"
    //tableContent += "</tr><tr><td class='hiddenRow'><div class= 'accordian-body collapse' id='" + glossaryData[headers[0]] + "'>" + printHiddenRowData(glossaryData[headers[0]], caseOrgs) + "</div></td></tr>"
  }

  tableContent += "</tbody></table>";

//Appends all the javascript created table into the html
  $('#glossary_table').append(tableContent);

})
