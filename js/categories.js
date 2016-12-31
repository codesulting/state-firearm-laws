var categories = [
  "Ammunition regulation",
  "Gun trafficking",
  "Background checks",
  "Stand your ground laws",
  "Buyer regulation",
  "Prohibitors for gun purchase/possession",
  "Assault weapons and large capacity ammunition magazines",
  "Gun safety",
  "Domestic violence-related laws",
  "Immunity statutes",
  "Dealer regulation",
  "Possession regulation",
  "Preemption",
  "Concealed carry permitting"
];

var categoriesContent = "<select class='selectpicker'>";

for (var i = 0; i < categories.length; i++) {
  categoriesContent += "<option>" + categories[i] + "</option>";
}

categoriesContent += "</select>";

$('#category_div').append(categoriesContent);
