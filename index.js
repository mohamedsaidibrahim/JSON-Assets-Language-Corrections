const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const rootDir = "C:\\Users\\Microtec-Web\\Desktop\\26022025\\Langs\\Langs";
const csvFiles = {
  ar: path.join(__dirname, "ar.csv"),
  en: path.join(__dirname, "en.csv"),
};

// Load corrections from CSV (First column = "Wrong", Last column = "Correct")
async function loadCorrections(csvPath) {
  return new Promise((resolve, reject) => {
    const corrections = {};
    let firstKey, lastKey;

    fs.createReadStream(csvPath)
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
          corrections[wrong] = correct;
        }
      })
      .on("end", () => resolve(corrections))
      .on("error", (err) => reject(err));
  });
}

// Recursively find JSON files
function findJsonFiles(dir) {
  let jsonFiles = [];
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      jsonFiles = jsonFiles.concat(findJsonFiles(filePath));
    } else if (file.endsWith(".json")) {
      jsonFiles.push(filePath);
    }
  });

  return jsonFiles;
}

// Replace words in JSON content
function correctJsonContent(jsonContent, corrections) {
  let modified = false;
  let jsonString = JSON.stringify(jsonContent, null, 2);

  // Match words with letters (Arabic & English) and special characters
  const regex = new RegExp(
    Object.keys(corrections)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special characters
      .join("|"),
    "g"
  );

  jsonString = jsonString.replace(regex, (match) => {
    if (corrections[match]) {
      modified = true;
      return corrections[match];
    }
    return match;
  });

  return { correctedJson: jsonString, modified };
}

// Process JSON files
async function processJsonFiles() {
  try {
    const jsonFiles = findJsonFiles(rootDir);
    const arCorrections = await loadCorrections(csvFiles.ar);
    const enCorrections = await loadCorrections(csvFiles.en);

    jsonFiles.forEach((filePath) => {
      const fileName = path.basename(filePath).toLowerCase();
      const isArabic = fileName.includes("ar");
      const isEnglish = fileName.includes("en");

      if (!isArabic && !isEnglish) return;

      const corrections = isArabic ? arCorrections : enCorrections;
      let jsonContent;

      try {
        jsonContent = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (err) {
        console.error(`❌ Failed to read JSON file: ${filePath}`);
        return;
      }

      const { correctedJson, modified } = correctJsonContent(jsonContent, corrections);

      if (modified) {
        fs.writeFileSync(filePath, correctedJson, "utf-8");
        console.log(`✅ Corrected file saved: ${filePath}`);
      } else {
        console.log(`ℹ️ No corrections needed: ${filePath}`);
      }
    });
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
  }
}

// Run the script
processJsonFiles();