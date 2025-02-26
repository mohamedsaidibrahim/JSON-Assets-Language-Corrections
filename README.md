# Language Correction Tool

## Overview
This project is a JavaScript application designed to correct language-specific errors in JSON files. It processes JSON files stored in nested directories, identifies language-specific errors using reference CSV files (one for Arabic and one for English), and replaces incorrect words with their correct counterparts. The corrected JSON files are saved in their original locations, and the tool logs the changes made.

### Key Features:
- **Recursive JSON File Search**: Scans nested directories to locate JSON files.
- **Language-Specific Corrections**: Uses separate CSV files for Arabic (`ar.csv`) and English (`en.csv`) corrections.
- **Dynamic Correction Application**: Applies corrections based on the language identified in the JSON file name.
- **Logging**: Provides detailed logs about the corrections performed and the file paths.

---

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/language-correction-tool.git
   cd language-correction-tool
   ```

2. **Install Dependencies**:
   Install the required npm packages:
   ```bash
   npm install
   ```

3. **Prepare CSV Files**:
   - Place your Arabic corrections in `reference/ar.csv`.
   - Place your English corrections in `reference/en.csv`.

   The CSV files should have the following format:
   ```
   Wrong,Correct
   incorrect_word,correct_word
   ```

4. **Set Up JSON Files**:
   - Place your JSON files in the desired directory (e.g., `D:\Erp\Langs`).
   - Ensure the JSON file names contain `ar` for Arabic or `en` for English to identify the language.

---

## Usage

### Running the Project
1. Update the `rootDir` and `csvFiles` paths in the `index.js` file to match your directory structure:
   ```javascript
   import { join } from "path";
   import { processJsonFiles } from "./src/processJsonFiles.js";

   const rootDir = "D:\\Erp\\Langs"; // Update this path to your JSON files directory

   const csvFiles = {
       ar: join(process.cwd(), "reference", "ar.csv"), // Path to Arabic corrections CSV
       en: join(process.cwd(), "reference", "en.csv"), // Path to English corrections CSV
   };

   // Run the script
   processJsonFiles(csvFiles, rootDir);
   ```

2. Run the application:
   ```bash
   node index.js
   ```

### Output
- The tool will log the following:
  - ✅ Corrected file saved: `[file path]` (for files with corrections).
  - ℹ️ No corrections needed: `[file path]` (for files without corrections).
  - ❌ Error messages for any issues encountered.

---

## Project Structure

```
language-correction-tool/
├── src/
│   ├── correctJsonValues.js       # Recursively corrects JSON values
│   ├── correctString.js           # Corrects a single string using the corrections map
│   ├── findJsonFiles.js           # Recursively finds JSON files in a directory
│   ├── loadCorrections.js         # Loads corrections from CSV files
│   └── processJsonFiles.js        # Main script to process JSON files
├── reference/
│   ├── ar.csv                     # Arabic corrections CSV
│   └── en.csv                     # English corrections CSV
├── index.js                       # Entry point for the application
├── package.json                   # Project dependencies and configuration
└── README.md                      # Project documentation
```

---

## Code Explanation

### 1. **`correctJsonValues.js`**
Recursively traverses a JSON object and corrects string values using the provided corrections map.

### 2. **`correctString.js`**
Corrects a single string by replacing incorrect words with their correct counterparts using a regex pattern.

### 3. **`findJsonFiles.js`**
Recursively searches a directory for JSON files and returns their paths.

### 4. **`loadCorrections.js`**
Loads corrections from a CSV file into a `Map` object for quick lookup.

### 5. **`processJsonFiles.js`**
Orchestrates the process:
- Finds JSON files.
- Loads corrections from CSV files.
- Applies corrections to JSON files.
- Saves corrected JSON files and logs the results.

---

## Example CSV Files

### `ar.csv` (Arabic Corrections)
```
Wrong,Correct
كلمة_خاطئة,كلمة_صحيحة
خطأ,تصحيح
```

### `en.csv` (English Corrections)
```
Wrong,Correct
incorrect_word,correct_word
error,correction
```

---

## Example JSON File

### Before Correction
```json
{
  "message": "This is an incorrect_word example."
}
```

### After Correction
```json
{
  "message": "This is a correct_word example."
}
```

---

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

---

## License
This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.

---

## Support
For any questions or issues, please open an issue on the [GitHub repository](https://github.com/your-repo/language-correction-tool).

---