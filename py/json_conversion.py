import json, csv
import sys

# for converting codebook file to glossary
def glossary_conversion(csvreader):
  rows_arr = []
  categories = set()
  subcategories = set()
  exported_headers = ["code", "category", "subcategory", "description", "variable"]
  exported = dict()
  for row in csvreader:
    entry = {e: row[e] for e in exported_headers}
    # each row in table as a dictionary
    rows_arr.append(entry)

    categories.add(row["category"])
    subcategories.add(row["subcategory"])

  exported = {"rows": rows_arr, "categories": list(categories), "subcategories": list(subcategories)}
  return exported

# for converting current/repealed list to a state-based json file
def history_conversion(csvreader):
  states_list = []
  states_dict = dict()
  exported_headers = ["law", "definition", "status", "link"]
  new_entry = True
  for row in csvreader:
    entry = {e: row[e] for e in exported_headers}
    # encountering new state
    if row["state"] not in states_list:
      if new_entry:
        states_list = [row["state"]]
        new_entry = False
      if not new_entry:
        with open(states_list[len(states_list) - 1] + ".json", "w") as outfile:
          states_dict = {"history": states_dict}
          json.dump(states_dict, outfile, sort_keys=True, indent=4)

      states_list.append(row["state"])
      states_dict = dict()
      states_dict[row["year"]] = [entry]
    else:
      # new year encountered
      if row["year"] not in states_dict:
        states_dict[row["year"]] = [entry]
      # existing law(s) for that year
      else:
        old_entry = states_dict[row["year"]]
        merged_entry = old_entry + [entry]
        states_dict[row["year"]] = merged_entry

  return states_dict

# parses csv file to convert to json
with open(sys.argv[1], 'r') as csvfile:
  csvreader = csv.DictReader(csvfile)
  #exported = glossary_conversion(csvreader)
  exported = history_conversion(csvreader)
  with open("out.json", "w") as outfile:
    json.dump(exported, outfile, sort_keys=True, indent=4)



