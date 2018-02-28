# How to Build Data

Ensure you have `NumPy` installed for making the TSNE data.

1. Untar `buffer/raw_csv.tar.gz`. These are the relevant CSVs taken from the Kaggle set.
2. Run `utilities/csvs2jsons.js` with the necessary paramters documented inside.
3. Run `utilities/exportBins.js` to build data for R usage.
4. Build the BHTSNE binary inside deps (`g++ sptree.cpp tsne.cpp tsne_main.cpp -o bh_tsne -O2`)
5. Run `buildBHTSNE.js` to make the wordMap.json, topkeywords.json, and all the tSNE data.

Alternatively, just run "npm run build". To only make tSNE data (and not untar the CSVs, build the JSONs or exported bins), just run "npm run buildTSNE".