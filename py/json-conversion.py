'''
*** note: the term "provision" and "variable" are used interchangeably

glossary_conversion()

uses:
- codebook.csv

modifies/creates:
- glossary.json, to be used with glossary.html to show table of variables and corresponding definitions
- raw_data.json, to be used with table.html to show overall table of data for download
_____

history_conversion()

uses:
- current-repealed-list.csv

modifies/creates:
- history/<state-name>.json files, to be used with state-by-state.html
_________

rates_conversion()

uses:
- state-rates.csv

modifies/creates
- history/<state-name>.json files, to be used with state-by-state.html
_________

raw_data_conversion()

uses:
- states-list.json
- firearms.database.csv (columns for state, year, and each variable)

modifies/creates:
- raw-data.json
'''

import sys
import os
import csv
import json
from tqdm import tqdm

# For converting codebook file to glossary, as well as adding variable data to raw_data table.
def glossary_conversion(csvreader):
    cwd = os.getcwd()
    rows_arr = []
    categories = set()
    subcategories = set()
    prov_list = []
    exported_headers = ["code", "category", "subcategory", "description", "variable"]

    for row in tqdm(csvreader, desc="Reading codebook file"):
        entry = {e: row[e] for e in exported_headers}
        entry2 = dict()
        entry2["category"] = row["category"]
        entry2["variable"] = row["variable"]
        prov_list += [row["variable"]]
        entry2["subcategory"] = row["subcategory"]
        # Each row in table as a dictionary.
        rows_arr.append(entry)

        categories.add(row["category"])
        subcategories.add(row["subcategory"])

    exported = {"rows": rows_arr, "categories": list(sorted(categories)), "subcategories": list(sorted(subcategories))}

    # Create mappings of categories -> provisions, subcategories -> provisions, and vice versa
    # to be used in filters.

    cat_map = dict() # Maps cat to prov and subcat.
    subcat_map = dict() # Maps subcat to prov and cat.
    prov_map = dict() # Maps prov to subcat and cat.

    for row in tqdm(rows_arr, desc="Building glossary file"):
        subcat = row["subcategory"]
        cat = row["category"]
        prov = row["variable"]
        prov_map[prov] = {"subcategory": subcat, "category": cat}
        if cat not in cat_map:
            cat_map[cat] = {"subcategories": {subcat}, "provisions": {prov}}
        else:
            cat_map[cat]["subcategories"] = cat_map[cat]["subcategories"] | {subcat}
            cat_map[cat]["provisions"] = cat_map[cat]["provisions"] | {prov}
        if subcat not in subcat_map:
            subcat_map[subcat] = {"categories": {cat}, "provisions": {prov}}
        else:
            subcat_map[subcat]["categories"] = subcat_map[subcat]["categories"] | {cat}
            subcat_map[subcat]["provisions"] = subcat_map[subcat]["provisions"] | {prov}

    cat_map = convert_map(cat_map, ["subcategories", "provisions"])
    subcat_map = convert_map(subcat_map, ["categories", "provisions"])

    # Export glossary file.
    with open(os.path.join("js", "glossary.json"), 'w') as outfile:
        json.dump(exported, outfile, sort_keys=True, indent=4)
    # Add to raw-data-table file.
    with open(os.path.join(cwd, "js", "raw-data.json"), 'w') as outfile2:
        exported = {"provisions": prov_list, "maps": {"categorymap": cat_map, "subcategorymap": subcat_map, "provmap": prov_map}, "categories": list(sorted(categories)), "subcategories": list(sorted(subcategories))}
        json.dump(exported, outfile2, sort_keys=True, indent=4)


def convert_map(map, labels):
    for entry in map:
        for label in labels:
            map[entry][label] = list(map[entry][label])
    return map


# For converting current/repealed list to a state-based JSON file;
# also tallies number of laws by year.
def history_conversion(csvreader):
    states_dict = dict()
    # headers to read from csv file
    #history_headers = ["definition", "law", "link", "status"]
    history_headers = ["definition", "variable", "status"]
    for row in tqdm(csvreader, desc="Reading current/repealed list file"):
        # Add new state to dictionary.
        if row["state"] not in states_dict:
            states_dict[row["state"]] = dict()
            # Gather relevant info from row.
            history = {h: row[h] for h in history_headers}
            states_dict[row["state"]][row["year"]] = [{"history": [history]}, {"num_laws": 1}]
        else:
            # State exists in dictionary; check if year exists.
            history = {h: row[h] for h in history_headers}

            # Format of a year's entries: {Year: [history, num_laws]}.

            if not row["year"] in (states_dict[row["state"]]):
                # New entry for a given year, update.
                states_dict[row["state"]][row["year"]] = [{"history": [history]}, {"num_laws": 1}]
            else:
                # Update history.
                # print(states_dict[row["state"]][ind_year][year])
                states_dict[row["state"]][row["year"]][0]["history"].append(history)
                # Update num_laws.
                states_dict[row["state"]][row["year"]][1]["num_laws"] += 1

        states_list = list(states_dict.keys())

    # Create output JSON file for each state.
    for state in tqdm(states_list, desc="Generating per-state JSON files"):
        with open(os.path.join("js", "history", state + ".json"), 'w') as outfile:
            json.dump({"data": states_dict[state]}, outfile, sort_keys=True, indent=4)

# Converts CSV with homicide, suicide rates.
# Rates_conversion must be run after history conversion.
def rates_conversion(csvreader):
    # get list of files
    cwd = os.getcwd()

    json_files = []

    for root, dirs, files in tqdm(os.walk(os.path.join(cwd, "js/history")), desc="Loading per-state JSON files"):
        json_files = [f for f in files if ".json" in f]

    rates_states_dict = dict()

    # Create dictionary from CSV files.
    for row in tqdm(csvreader, desc="Reading rates file"):
        # State not present.
        if row["state"] not in rates_states_dict:
            rates_states_dict[row["state"]] = dict()
        # Gather relevant info from row.
        rates_states_dict[row["state"]][row["year"]] = [{"suicide_rate": row["suicide"]},
                                                        {"homicide_rate": row["homicide"]}]

    # Then merge with JSON files.
    for state_file in tqdm(json_files, desc="Updating per-state JSON files"):
        with open(os.path.join(cwd, "js/history", state_file), 'r') as current_state_dict:
            current_state_dict = json.load(current_state_dict)
            state = state_file[:-5]  # Name of state.
            years = list(rates_states_dict[state].keys())  # Valid year entries for given state.
            for y in years:
                # Merge entries by year for a given state.
                if y not in current_state_dict["data"]:
                    current_state_dict["data"][y] = []
                current_state_dict["data"][y] = current_state_dict["data"][y] + rates_states_dict[state][y]

            # Update JSON file.
            with open(os.path.join(cwd, "js/history", state_file), 'w') as updated_state_file:
                json.dump(current_state_dict, updated_state_file, sort_keys=True, indent=4)

# Converts raw data table (CSV format) to JSON.
def raw_data_conversion(csvreader):
    exported = dict()
    exported["columns"] = list(csvreader.fieldnames)
    exported["rows"] = []
    for row in tqdm(csvreader, desc="Reading dataset file"):
        exported["rows"].append({i: row[i] for i in exported["columns"]})

    year_range = {r["year"] for r in exported["rows"]}
    exported["yearbounds"] = [min(year_range), max(year_range)]

    cwd = os.getcwd()

    # Add existing raw_data info.
    with open(os.path.join(cwd, "js", "raw-data.json"), 'r') as inputfile:
        raw_data = json.load(inputfile)
        raw_data_export = raw_data.copy()
        raw_data_export.update(exported)

        # Add list of states to raw data.
        with open(os.path.join(cwd, "js", "states-list.json"), 'r') as inputfile2:
            states_list = json.load(inputfile2)
            raw_data_export.update(states_list)

        # Update JSON file.
        with open(os.path.join("js", "raw-data.json"), 'w') as outfile:
            json.dump(raw_data_export, outfile, sort_keys=True, indent=4)

with open(sys.argv[1], 'r') as csvfile:
    csvreader = csv.DictReader(csvfile)
    glossary_conversion(csvreader)

with open(sys.argv[2], 'r') as csvfile2:
    csvreader = csv.DictReader(csvfile2)
    history_conversion(csvreader)

with open(sys.argv[3], 'r') as csvfile3:
    csvreader = csv.DictReader(csvfile3)
    rates_conversion(csvreader)

with open(sys.argv[4], 'r') as csvfile4:
    csvreader = csv.DictReader(csvfile4)
    raw_data_conversion(csvreader)
