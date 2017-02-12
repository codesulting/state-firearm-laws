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

  with open("out.json", "w") as outfile:
    json.dump(exported, outfile, sort_keys=True, indent=4)


# for converting current/repealed list to a state-based json file
def history_conversion(csvreader):
  states_dict = dict()
  history_headers = ["definition", "law", "link", "status"]
  for row in csvreader:
    # add new state to dictionary
    if row["state"] not in states_dict:
      states_dict[row["state"]] = []
      # gather relevant info from row
      history = {h: row[h] for h in history_headers}
      states_dict[row["state"]].append({row["year"]: [{"history": [history]}, {"num_laws": 1}]})
    else:
      # state exists in dictionary
      # check if year exists
      year_found = False
      history = {h: row[h] for h in history_headers}

      for ind_year in range(len(states_dict[row["state"]])):
        # format of year_entries: {Year: [history, num_laws]}
        year_entries = states_dict[row["state"]][ind_year]
        year = list(year_entries.keys())[0]
        if year == row["year"]:
          # update history
          #print(states_dict[row["state"]][ind_year][year])
          states_dict[row["state"]][ind_year][year][0]["history"].append(history)
          # update num_laws
          states_dict[row["state"]][ind_year][year][1]["num_laws"] += 1
          year_found = True
          break

      if not year_found:
        states_dict[row["state"]].append({row["year"]: [{"history": [history]}, {"num_laws": 1}]})

    states_list = list(states_dict.keys())

  for state in states_list:
    with open(state + ".json", "w") as outfile:
      json.dump({"data": states_dict[state]}, outfile, sort_keys=True, indent=4)

def rates_conversion(csvreader):
  return

#with open(sys.argv[1], 'r') as csvfile:
#  csvreader = csv.DictReader(csvfile)
#  glossary_conversion(csvreader)

with open(sys.argv[2], 'r') as csvfile2:
  csvreader = csv.DictReader(csvfile2)
  history_conversion(csvreader)

# with open(sys.argv[3], 'r') as csvfile3:
#  csvreader = csv.DictReader(csvfile3)
#  rates_conversion(csvreader)
