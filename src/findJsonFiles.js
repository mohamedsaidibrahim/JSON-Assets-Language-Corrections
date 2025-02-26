import { promises as fsp } from 'fs'; // Use fs.promises for async operations
import path from 'path';

// Recursively find JSON files
export async function findJsonFiles(dir) {
    let jsonFiles = [];
    try {
        const files = await fsp.readdir(dir); // Use fs.promises for async operations
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fsp.stat(filePath);

            if (stat.isDirectory()) {
                jsonFiles = jsonFiles.concat(await findJsonFiles(filePath));
            } else if (file.endsWith('.json')) {
                jsonFiles.push(filePath);
            }
        }
    } catch (err) {
        console.error(`❌ Error reading directory: ${dir}`);
    }
    return jsonFiles;
}


// const fsp = require("fs").promises; // Use fs.promises for other async operations
// const path = require("path");

// // Recursively find JSON files
// export async function findJsonFiles(dir) {
//     let jsonFiles = [];
//     try {
//       const files = await fsp.readdir(dir); // Use fs.promises for async operations
//       for (const file of files) {
//         const filePath = path.join(dir, file);
//         const stat = await fsp.stat(filePath);
  
//         if (stat.isDirectory()) {
//           jsonFiles = jsonFiles.concat(await findJsonFiles(filePath));
//         } else if (file.endsWith(".json")) {
//           jsonFiles.push(filePath);
//         }
//       }
//     } catch (err) {
//       console.error(`❌ Error reading directory: ${dir}`);
//     }
//     return jsonFiles;
//   }