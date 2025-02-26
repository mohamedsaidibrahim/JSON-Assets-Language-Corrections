const loadCorrections = require("./loadCorrections.js"); 
const findJsonFiles = require("./findJsonFiles.js");
const correctJsonValues = require("./correctJsonValues.js");
const fsp = require("fs").promises; // Use fs.promises for other async operations
const path = require("path");

// Process JSON files
export async function processJsonFiles(csvFiles,rootDir) {
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
            await fsp.writeFile(
              filePath,
              JSON.stringify(jsonContent, null, 2),
              "utf-8"
            );
            console.log(`✅ Corrected file saved: ${filePath}`);
          } else {
            console.log(`ℹ️ No corrections needed: ${filePath}`);
          }
        } catch (err) {
          console.error(
            `❌ Failed to process JSON file: ${filePath} - ${err.message}`
          );
        }
      }
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
  }