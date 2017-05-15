import sys
import os
import csv
import json
import json_conversion

# Converts raw data table (csv format) to JSON.
def raw_data_conversion_two(file_name):

    exported = dict()
    variable_list = []

    with open(file_name, 'r') as csvfile:
        csvreader = csv.DictReader(csvfile)
        exported["rows"] = []

        # Collect list of variables, get columns
        variable_list = list(set(row["variable"] for row in csvreader))
        exported["columns"] = ["state", "year"] + variable_list

    with open(file_name, 'r') as csvfile:
        csvreader = csv.DictReader(csvfile)

        temp = dict()
        for row in csvreader:
            k = str(row["state"]) + str(row["year"]) # key

            if k not in temp:
                temp[k] = {"state": str(row["state"]), "year": str(row["year"]), row["variable"]: str(row["code"])}
            else:
                # Add new value for given provision (0/1).
                temp2 = temp[k].copy()
                new_var = dict({row["variable"]: str(row["code"])})
                temp2.update(new_var)
                temp[k] = temp2

        exported["rows"] = [temp[t] for t in sorted(temp.keys())]

        year_range = {int(r["year"]) for r in exported["rows"]}
        exported["yearbounds"] = [min(year_range), max(year_range)]

        cwd = os.getcwd()

        # Add existing raw_data info.
        with open(os.path.join(cwd, "js", "raw-data.json"), "r") as inputfile:
            raw_data = json.load(inputfile)
            raw_data_export = raw_data.copy()
            raw_data_export.update(exported)

            # Add list of states to raw data.
            with open(os.path.join(cwd, "js", "states-list.json"), "r") as inputfile2:
                states_list = json.load(inputfile2)
                raw_data_export.update(states_list)

            # Update JSON file.
            with open( os.path.join("js", "raw-data.json"), "w") as outfile:
                json.dump(raw_data_export, outfile, sort_keys=True, indent=4)

with open(sys.argv[1], 'r') as csvfile:
    csvreader = csv.DictReader(csvfile)
    json_conversion.glossary_conversion(csvreader)
    raw_data_conversion_two(sys.argv[2])
