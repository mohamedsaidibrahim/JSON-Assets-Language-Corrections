const fs = require("fs"); // Use the synchronous fs module for createReadStream
const fsp = require("fs").promises; // Use fs.promises for other async operations
const path = require("path");
const csv = require("csv-parser");

const rootDir = "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs3";
const csvFiles = {
  ar: path.join(__dirname, "ar.csv"),
  en: path.join(__dirname, "en.csv"),
};

// Load corrections from CSV (First column = "Wrong", Last column = "Correct")
async function loadCorrections(csvPath) {
  return new Promise((resolve, reject) => {
    const corrections = new Map();
    let firstKey, lastKey;

    fs.createReadStream(csvPath) // Use synchronous fs module for createReadStream
      .pipe(csv())
      .on("headers", (headers) => {
        if (headers.length < 2) {
          return reject(new Error(`Invalid CSV format: ${csvPath}`));
        }
        firstKey = headers[0]; // First column
        lastKey = headers[headers.length - 1]; // Last column
      })
      .on("data", (row) => {
        if (row[firstKey] && row[lastKey]) {
          const wrong = row[firstKey].trim();
          const correct = row[lastKey].trim();
          corrections.set(wrong, correct);
        }
      })
      .on("end", () => resolve(corrections))
      .on("error", (err) => reject(err));
  });
}

// Recursively find JSON files
async function findJsonFiles(dir) {
  let jsonFiles = [];
  try {
    const files = await fsp.readdir(dir); // Use fs.promises for async operations
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fsp.stat(filePath);

      if (stat.isDirectory()) {
        jsonFiles = jsonFiles.concat(await findJsonFiles(filePath));
      } else if (file.endsWith(".json")) {
        jsonFiles.push(filePath);
      }
    }
  } catch (err) {
    console.error(`❌ Error reading directory: ${dir}`);
  }
  return jsonFiles;
}

// Recursively correct values in JSON object
function correctJsonValues(obj, corrections) {
  let modified = false;

  for (const key in obj) {
    if (typeof obj[key] === "string") {
      // Correct only string values
      const correctedValue = correctString(obj[key], corrections);
      if (correctedValue !== obj[key]) {
        obj[key] = correctedValue;
        modified = true;
      }
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      // Recursively process nested objects or arrays
      const nestedModified = correctJsonValues(obj[key], corrections);
      modified = modified || nestedModified;
    }
  }

  return modified;
}

// Correct a single string using the corrections map
function correctString(str, corrections) {
  const regex = new RegExp(
    `\\b(${Array.from(corrections.keys())
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special characters
      .join("|")})\\b`,
    "g"
  );

  return str.replace(regex, (match) => corrections.get(match) || match);
}

// Process JSON files
async function processJsonFiles() {
  try {
    const jsonFiles = await findJsonFiles(rootDir);
    const [arCorrections, enCorrections] = await Promise.all([
      loadCorrections(csvFiles.ar),
      loadCorrections(csvFiles.en),
    ]);

    for (const filePath of jsonFiles) {
      const fileName = path.basename(filePath).toLowerCase();
      const isArabic = fileName.includes("ar");
      const isEnglish = fileName.includes("en");

      if (!isArabic && !isEnglish) continue;

      const corrections = isArabic ? arCorrections : enCorrections;

      try {
        const fileContent = await fsp.readFile(filePath, "utf-8");
        const jsonContent = JSON.parse(fileContent);

        // Correct values in the JSON object
        const modified = correctJsonValues(jsonContent, corrections);

        if (modified) {
          await fsp.writeFile(filePath, JSON.stringify(jsonContent, null, 2), "utf-8");
          console.log(`✅ Corrected file saved: ${filePath}`);
        } else {
          console.log(`ℹ️ No corrections needed: ${filePath}`);
        }
      } catch (err) {
        console.error(`❌ Failed to process JSON file: ${filePath} - ${err.message}`);
      }
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
}

// Run the script
processJsonFiles();