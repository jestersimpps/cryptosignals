import * as fs from "fs";

export const storeDataRowsToCsv = (name: string, data: number[][]): void => {
  const fileName = `${name}.csv`;
  const stringArray = data.map((singleRow) => singleRow.toString());
  const csv = stringArray.join("\n");

  fs.exists(fileName, (exists) => {
    if (exists) {
      return fs.appendFile(fileName, "\n" + csv, (err) => {
        if (err) throw err;
      });
    } else {
      return fs.writeFile(fileName, csv, (err) => {
        if (err) throw err;
      });
    }
  });
};

export const getDataRowsFromCsv = (name: string): Promise<number[][]> => {
  const fileName = `${name}.csv`;
  return new Promise((resolve) => {
    fs.exists(fileName, (exists) => {
      if (exists) {
        fs.readFile(fileName, function read(err, data) {
          if (err) throw err;
          if (!data) throw "No csv Data";
          resolve(
            data
              .toString() // convert Buffer to string
              .split("\n") // split string to lines
              .filter((e) => !!e && e.length)
              .filter((e) => e.indexOf("NaN") === -1)
              .filter((e) => e.indexOf("Infinity") === -1)
              .map((e) => e.trim()) // remove white spaces for each line
              .map((e) => e.split(",").map((e) => +e.trim())) // split each line to array);
          );
        });
      } else {
        resolve([]);
      }
    });
  });
};

export const clearData = (name: string): Promise<void> => {
  const fileName = `${name}.csv`;
  return new Promise((resolve) => {
    fs.exists(fileName, (exists) => {
      if (exists) {
        return fs.unlink(fileName, (err) => {
          if (err) throw err;
          resolve();
        });
      }
      resolve();
    });
  });
};
