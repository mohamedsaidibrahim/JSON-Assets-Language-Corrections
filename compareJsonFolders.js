const fs = require("fs").promises;
const path = require("path");

// Define the ancestor folders to compare
const ancestorFolders = [
  "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs",
//   "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs1",
//   "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs2",
  "C:\\Users\\Microtec-Web\\Desktop\\26022025\\TEST\\Langs3",
];

// Recursively find JSON files in a directory
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
    console.error(`❌ Error reading directory: ${dir} - ${err.message}`);
  }
  return jsonFiles;
}

// Compare two JSON files line by line
function compareJsonFiles(content1, content2) {
  const lines1 = content1.split("\n");
  const lines2 = content2.split("\n");

  const differences = [];
  const maxLength = Math.max(lines1.length, lines2.length);

  for (let i = 0; i < maxLength; i++) {
    const line1 = lines1[i] || "";
    const line2 = lines2[i] || "";

    if (line1.trim() !== line2.trim()) {
      differences.push(`Line ${i + 1}:\nFolder1: ${line1}\nFolder2: ${line2}`);
    }
  }

  return differences;
}

// Compare JSON files across ancestor folders
async function compareAncestorFolders() {
  try {
    // Get JSON files from each ancestor folder
    const jsonFilesByFolder = await Promise.all(
      ancestorFolders.map(async (folder) => {
        const jsonFiles = await findJsonFiles(folder);
        return { folder, jsonFiles };
      })
    );

    // Create a map of relative paths to JSON files
    const fileMap = new Map();
    for (const { folder, jsonFiles } of jsonFilesByFolder) {
      for (const filePath of jsonFiles) {
        const relativePath = path.relative(folder, filePath);
        if (!fileMap.has(relativePath)) {
          fileMap.set(relativePath, []);
        }
        fileMap.get(relativePath).push(filePath);
      }
    }

    // Compare JSON files with the same relative path
    for (const [relativePath, filePaths] of fileMap) {
      if (filePaths.length < 2) continue; // Skip if there's only one file

      // Read and compare the content of the files
      const fileContents = await Promise.all(
        filePaths.map(async (filePath) => {
          return await fs.readFile(filePath, "utf-8");
        })
      );

      // Compare the first file with the rest
      const referenceContent = fileContents[0];
      for (let i = 1; i < fileContents.length; i++) {
        const differences = compareJsonFiles(referenceContent, fileContents[i]);
        if (differences.length > 0) {
          console.log(`❌ Differences found in: ${relativePath}`);
          console.log(`Comparing:\n- ${filePaths[0]}\n- ${filePaths[i]}`);
          differences.forEach((diff) => console.log(diff));
          console.log("-----------------------------");
        }
      }
    }

    console.log("✅ Comparison completed.");
  } catch (err) {
    console.error(`❌ Error during comparison: ${err.message}`);
  }
}

// Run the comparison
compareAncestorFolders();
