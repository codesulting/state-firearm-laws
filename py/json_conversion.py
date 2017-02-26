import json, csv
import sys, os


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

    with open("glossary.json", "w") as outfile:
        json.dump(exported, outfile, sort_keys=True, indent=4)


# for converting current/repealed list to a state-based json file
# also tallies number of laws by year
def history_conversion(csvreader):
    states_dict = dict()
    history_headers = ["definition", "law", "link", "status"]
    for row in csvreader:
        # add new state to dictionary
        if row["state"] not in states_dict:
            states_dict[row["state"]] = dict()
            # gather relevant info from row
            history = {h: row[h] for h in history_headers}
            states_dict[row["state"]][row["year"]] = [{"history": [history]}, {"num_laws": 1}]
        else:
            # state exists in dictionary
            # check if year exists
            history = {h: row[h] for h in history_headers}

            # format of a year's entries: {Year: [history, num_laws]}

            if not row["year"] in (states_dict[row["state"]]):
                # new entry for a given year, update
                states_dict[row["state"]][row["year"]] = [{"history": [history]}, {"num_laws": 1}]
            else:
                # update history
                # print(states_dict[row["state"]][ind_year][year])
                states_dict[row["state"]][row["year"]][0]["history"].append(history)
                # update num_laws
                states_dict[row["state"]][row["year"]][1]["num_laws"] += 1

        states_list = list(states_dict.keys())

    # create output json file for each state
    for state in states_list:
        with open(state + ".json", "w") as outfile:
            json.dump({"data": states_dict[state]}, outfile, sort_keys=True, indent=4)


# converts csv with homicide, suicide rates
# rates_conversion must be run after history conversion
def rates_conversion(csvreader):
    # get list of files
    cwd = os.getcwd()

    json_files = []

    for root, dirs, files in os.walk(os.path.join(cwd, "js/history")):
        json_files = [f for f in files if ".json" in f]

    rates_states_dict = dict()

    # create dictionary from csv files
    for row in csvreader:
        # state not present
        if row["state"] not in rates_states_dict:
            rates_states_dict[row["state"]] = dict()
        # gather relevant info from row
        rates_states_dict[row["state"]][row["year"]] = [{"suicide_rate": row["suicide"]},
                                                        {"homicide_rate": row["homicide"]}]

        # then merge with json files
    for state_file in json_files:
        with open(os.path.join(cwd, "js/history", state_file), 'r') as current_state_dict:
            current_state_dict = json.load(current_state_dict)
            state = state_file[:-5]  # name of state
            years = list(rates_states_dict[state].keys())  # valid year entries for given state
            for y in years:
                # merge entries by year for a given state
                current_state_dict["data"][y] = current_state_dict["data"][y] + rates_states_dict[state][y]

            # update json file
            with open(os.path.join(cwd, "js/history", state_file), 'w') as updated_state_file:
                json.dump(current_state_dict, updated_state_file, sort_keys=True, indent=4)


# converts raw data table (csv format) to json
def raw_data_conversion(csvreader):
    exported = dict()
    exported["columns"] = list(csvreader.fieldnames)
    exported["rows"] = []
    for row in csvreader:
        exported["rows"].append({i: row[i] for i in exported["columns"]})

    with open("raw-data.json", "w") as outfile:
        json.dump(exported, outfile, sort_keys=True, indent=4)


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
