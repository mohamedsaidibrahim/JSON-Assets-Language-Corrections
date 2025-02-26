import csv from 'csv-parser';
import { createReadStream } from 'fs';

// Load corrections from CSV (First column = "Wrong", Last column = "Correct")
export async function loadCorrections(csvPath) {
    return new Promise((resolve, reject) => {
        const corrections = new Map();
        let firstKey, lastKey;

        createReadStream(csvPath) // Use synchronous fs module for createReadStream
            .pipe(csv())
            .on('headers', (headers) => {
                if (headers.length < 2) {
                    return reject(new Error(`Invalid CSV format: ${csvPath}`));
                }
                firstKey = headers[0]; // First column
                lastKey = headers[headers.length - 1]; // Last column
            })
            .on('data', (row) => {
                if (row[firstKey] && row[lastKey]) {
                    const wrong = row[firstKey].trim();
                    const correct = row[lastKey].trim();
                    corrections.set(wrong, correct);
                }
            })
            .on('end', () => resolve(corrections))
            .on('error', (err) => reject(err));
    });
}


// const csv = require("csv-parser");

// // Load corrections from CSV (First column = "Wrong", Last column = "Correct")
// export async function loadCorrections(csvPath) {
//     return new Promise((resolve, reject) => {
//       const corrections = new Map();
//       let firstKey, lastKey;
  
//       fs.createReadStream(csvPath) // Use synchronous fs module for createReadStream
//         .pipe(csv())
//         .on("headers", (headers) => {
//           if (headers.length < 2) {
//             return reject(new Error(`Invalid CSV format: ${csvPath}`));
//           }
//           firstKey = headers[0]; // First column
//           lastKey = headers[headers.length - 1]; // Last column
//         })
//         .on("data", (row) => {
//           if (row[firstKey] && row[lastKey]) {
//             const wrong = row[firstKey].trim();
//             const correct = row[lastKey].trim();
//             corrections.set(wrong, correct);
//           }
//         })
//         .on("end", () => resolve(corrections))
//         .on("error", (err) => reject(err));
//     });
//   }