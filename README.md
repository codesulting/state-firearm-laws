# state-firearm-laws
Interactive website for visualizing data about firearm regulation laws in the United States.

## Requirements
Python module(s) required include:
* [`tqdm`](https://pypi.python.org/pypi/tqdm)

JavaScript libraries used include:
* jQuery 1.12.4
* [clusterize.js](https://clusterize.js.org/)
* [Underscore.js](http://underscorejs.org/)
* [js-xlsx](https://github.com/SheetJS/js-xlsx) 
* [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
* [List.js](http://listjs.com/)

Miscellaneous libraries used:
* [Bootstrap 3.3.7](http://getbootstrap.com/)
* [Font Awesome](http://fontawesome.io/)
* [MapGlyphs 2.0](http://mapglyphs.com/)
* [Bootstrap Slider](http://seiyria.com/bootstrap-slider/)
* [Bootstrap Select](https://silviomoreto.github.io/bootstrap-select/)


## Deployment
While in the project's root directory, run the data generation script to update the web-ready JSON files using the latest database files:

    python py\json-conversion.py data/codebook.csv data/current-repealed-list.csv data/state-rates.csv database/database.csv

Copy the following directories and files to a running web server to deploy the website to the web:
* `css/`
* `js/`
* `database/`
* `codebook/`
* `fact-sheet/`
* `report/`
* `*.html`

## Collaborators
Michael Siegel, Professor, Community Health Sciences


