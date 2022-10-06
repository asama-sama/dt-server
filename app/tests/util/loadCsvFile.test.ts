/// <reference types="@types/jest" />;
import { DATASOURCES } from "../../src/const/datasource";
import { DataFile } from "../../src/db/models/DataFile";
import { DataSource } from "../../src/db/models/DataSource";
import { handleCrimeData } from "../../src/util/loadCsvFile";
import { getConnection } from "../../src/db/connect";
import { CrimeIncident } from "../../src/db/models/CrimeIncident";
import { Suburb } from "../../src/db/models/Suburb";
import { CrimeCategory } from "../../src/db/models/CrimeCategory";

describe("loadCsvFile", () => {
  describe("handleCrimeData", () => {
    let dataFile: DataFile;
    beforeEach(async () => {
      const dataSource = await DataSource.findOne({
        where: {
          name: DATASOURCES.nswCrimeBySuburb.name,
        },
      });
      dataFile = await DataFile.create({
        name: "test file",
        dataSourceId: dataSource?.id,
      });

      const crimeResults = [
        {
          "Offence category": "Derp",
          Subcategory: "derpderp",
          LGA: "suburb 1",
          "jan 2020": "20",
          "feb 2020": "35",
        },
        {
          "Offence category": "Derp",
          Subcategory: "derpderp 2",
          LGA: "suburb 2",
          "jan 2020": "20",
          "feb 2020": "35",
        },
      ];
      const connection = getConnection();
      await connection.transaction(async (trx) => {
        await handleCrimeData(crimeResults, dataFile, trx);
      });
    });

    test("it should load results into the database", async () => {
      const incidents = await CrimeIncident.findAll({});
      expect(incidents.length).toBe(4);
    });

    test("it should load the year and month values correctly for crime incidents", async () => {
      const incidents = await CrimeIncident.findAll({});
      for (const incident of incidents) {
        const month = incident.month;
        expect([0, 1]).toContain(month);
        expect(incident.year).toBe(2020);
      }
    });

    test("it should create associations for records loaded in", async () => {
      const suburbs = await Suburb.findAll({});
      expect(suburbs.length).toBe(2);
      const crimeCategories = await CrimeCategory.findAll({});
      expect(crimeCategories.length).toBe(2);
    });

    test("it should should not create new entries for repeat values", async () => {
      const crimeResults = [
        {
          "Offence category": "Derp",
          Subcategory: "derpderp",
          LGA: "suburb 1",
          "jan 2020": "20",
          "feb 2020": "35",
        },
      ];
      const connection = getConnection();
      await connection.transaction(async (trx) => {
        await handleCrimeData(crimeResults, dataFile, trx);
      });
      const crimeIncidents = await CrimeIncident.findAll({});
      expect(crimeIncidents.length).toBe(4);
    });
  });
});

// emissions loading code
// describe("loadDataFiles", () => {
//   describe("loadDataFiles", () => {
//     beforeEach(async () => {
//       await loadDataFiles();
//     });

//     test("it should load all emissions from the files", async () => {
//       const emissions = await Emission.findAll();
//       expect(emissions.length).toBe(14 * 10 + 4);
//     });
//   });

//   describe("loadDataFile: multiple rows", () => {
//     beforeEach(async () => {
//       await loadDataFile(
//         "ghgEmissionsTest.csv",
//         "./tests/dataFiles/ghgEmissionsTest.csv"
//       );
//     });

//     test("correct number of suburbs loaded", async () => {
//       const SUBURB_LIST = [
//         "NEWTOWN + ST PETERS",
//         "ALEXANDRIA",
//         "WATERLOO + MOORE PARK",
//         "CHIPPENDALE",
//         "ZETLAND",
//       ];
//       const suburbs = await Suburb.findAll();
//       expect(suburbs.length).toBe(5);
//       suburbs.forEach((suburb) => {
//         expect(SUBURB_LIST).toContain(suburb.name);
//       });
//     });

//     test("correct number of categories loaded", async () => {
//       const CATEGORY_LIST = [
//         "Electricity (Disaggregated)",
//         "Waste Water (Disaggregated)",
//         "Gas (Disaggregated)",
//       ];
//       const categories = await Category.findAll();
//       expect(categories.length).toBe(3);
//       categories.forEach((category) => {
//         expect(CATEGORY_LIST).toContain(category.name);
//       });
//     });

//     test("correct number of emissions loaded", async () => {
//       const emissions = await Emission.findAll();
//       expect(emissions.length).toBe(14 * 10);
//       emissions.forEach((emission) => {
//         expect(emission.reading).not.toBeNaN();
//       });
//     });
//   });

//   describe("loadDataFile: small", () => {
//     let promiseResult: LoadDataFileResult;
//     beforeEach(async () => {
//       promiseResult = await loadDataFile(
//         "ghgEmissionsTest_small.csv",
//         "./tests/dataFiles/ghgEmissionsTest_small.csv"
//       );
//     });
//     test("it has the correct number of emissions", async () => {
//       const emissions = await Emission.findAll({});
//       expect(emissions.length).toBe(4);
//     });
//     test("it read the emissions correctly", async () => {
//       const emissions = await Emission.findAll();
//       const EMISSION_READINGS = [68244.71853, null, 3, null];
//       for (let i = 0; i < emissions.length; i++) {
//         expect(emissions[i].reading).toBe(EMISSION_READINGS[i]);
//       }
//     });
//     test("it should have the correct returned values from the promise", () => {
//       expect(promiseResult).toMatchObject({
//         totalReads: 4,
//         nullReads: 2,
//       });
//     });
//   });
// });
