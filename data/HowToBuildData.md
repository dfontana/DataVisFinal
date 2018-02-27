# How to Build Data.

1. Untar `buffer/raw_csv.tar.gz`. These are the relevant CSVs taken from the Kaggle set.
2. Run `utilities/csvs2jsons.js` with the necessary paramters documented inside.
3. Run `utilities/exportBins.js` to build data for R usage.
4. Run `buildBHTSNE.js` to make the wordMap.json, topkeywords.json, and all the tSNE data.

Alternatively, just run "npm run build". To only make tSNE data (and not untar the CSVs, build the JSONs or exported bins), just run "npm run fast".