import json, csv
import sys

# parses codebook csv file to convert to json
with open(sys.argv[1], 'r') as csvfile:
	csvreader = csv.DictReader(csvfile)
	rowsarr = []
	categories = set()
	subcategories = set()
	exported_headers = ["code", "category", "subcategory", "description", "variable"]
	for row in csvreader:
		entry = {e: row[e] for e in exported_headers}
		# each row in table as a dictionary
		rowsarr.append(entry)

		categories.add(row["category"])
		subcategories.add(row["subcategory"])

	exported = {"rows": rowsarr, "categories": list(categories), "subcategories": list(subcategories)}

	with open("out.json", "w") as outfile:
		json.dump(exported, outfile, sort_keys=True, indent=4)




