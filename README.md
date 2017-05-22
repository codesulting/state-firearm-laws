# state-firearm-laws
Interactive website for visualizing data about firearm regulation laws in the United States.

## Deployment

While in the project's root directory, run the data generation script to update the web-ready JSON files using the latest dataset files:

    python py\json-conversion.py data/codebook.csv data/current-repealed-list.csv data/state-rates.csv dataset/dataset.csv

Copy the following directories and files to a running web server to deploy the website to the web:
* `css/`
* `js/`
* `dataset/`
* `fact-sheet/`
* `report/`
* `*.html`
