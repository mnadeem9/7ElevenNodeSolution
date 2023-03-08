// const counts = require("./data/counts.json");
// const collections = require("./data/collectionList.json").collections;

import fs from "fs";
import { exit } from "process";

// Async Arrow Function that reads data from file.
const readJsonFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const jsonData = JSON.parse(data);
      resolve(jsonData);
    });
  });
};

const getMaxDifference = (storeCollectionMap) => {
  let selectedCollection = "";
  let maxDifference = -Infinity;
  for (let [key, value] of storeCollectionMap) {
    if (value.length >= 0 && value.length <= 2) {
      const difference = Math.abs(value[0].counts - value[1].counts);
      if (difference > maxDifference) {
        maxDifference = difference;
        selectedCollection = key;
      }
    }
  }
  return [selectedCollection, maxDifference];
};

// Creating auto Trigger function
(async () => {
  // Read JSON Files Start
  let counts = [];
  let collections = [];

  try {
    counts = await readJsonFile("./data/counts.json", "utf8");
    collections = (await readJsonFile("./data/collectionList.json", "utf8")).collections;
  } catch (err) {
    console.err("Unable to read Counts JSON");
    exit(1);
  } finally {
    // Clean up here
  }

  // Read JSON Files End

  // Get unique Store Id
  const uniqueStoreIds = new Set(counts.map((each) => each["storeId:"]));
  const result = [];
  uniqueStoreIds.forEach((eachStoreId) => {
    //Get Unique Collection for Each StoreId
    const uniqueCollectionForStores = new Set();
    counts.forEach((each) => (each["storeId:"] === eachStoreId ? uniqueCollectionForStores.add(each.collection) : ""));
    //Create and populate store and collection Mapping
    const storeCollectionMap = new Map();
    uniqueCollectionForStores.forEach((eachUniqueCollection) => {
      if (collections.includes(eachUniqueCollection)) {
        storeCollectionMap.set(
          eachUniqueCollection,
          counts.filter((each) => each["storeId:"] === eachStoreId && each.collection === eachUniqueCollection)
        );
      }
    });

    // Get Max Difference from  each Store Collection Map
    const [selectedCollection, maxDifference] = getMaxDifference(storeCollectionMap);
    if (selectedCollection) {
      //Add the Finalized Collection with difference to results array
      result.push({
        storeId: eachStoreId,
        collection: selectedCollection,
        difference: maxDifference,
      });
    }
  });

  console.log(result);
})();
