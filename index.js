const fs = require("fs").promises;
const path = require("path");
const csv = require("csv-parser");
const rootDir = "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs2";

const csvFiles = {
  ar: path.join(__dirname, "ar.csv"),
  en: path.join(__dirname, "en.csv"),
};

// Load corrections from CSV (First column = "Wrong", Last column = "Correct")
async function loadCorrections(csvPath) {
  return new Promise((resolve, reject) => {
    const corrections = {};
    let firstKey, lastKey;

    fs.readFile(csvPath)
      .then((data) => {
        const stream = require("stream");
        const readableStream = new stream.PassThrough();
        readableStream.end(data);
        readableStream
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
      })
      .catch((err) => reject(err));
  });
}

// Recursively find JSON files
async function findJsonFiles(dir) {
  let jsonFiles = [];
  try {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

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

// Replace words in JSON content
function correctJsonContent(jsonContent, corrections) {
  let modified = false;
  let jsonString = JSON.stringify(jsonContent, null, 2);

  // Match full words (Arabic & English) with special character support
  const regex = new RegExp(
    `\\b(${Object.keys(corrections)
      .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special characters
      .join("|")})\\b`,
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
    const jsonFiles = await findJsonFiles(rootDir);
    const arCorrections = await loadCorrections(csvFiles.ar);
    const enCorrections = await loadCorrections(csvFiles.en);

    for (const filePath of jsonFiles) {
      const fileName = path.basename(filePath).toLowerCase();
      const isArabic = fileName.includes("ar");
      const isEnglish = fileName.includes("en");

      if (!isArabic && !isEnglish) continue;

      const corrections = isArabic ? arCorrections : enCorrections;

      try {
        let jsonContent = JSON.parse(await fs.readFile(filePath, "utf-8"));

        const { correctedJson, modified } = correctJsonContent(jsonContent, corrections);

        if (modified) {
          await fs.writeFile(filePath, correctedJson, "utf-8");
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
