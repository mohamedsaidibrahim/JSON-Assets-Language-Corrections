import { join } from "path";
import {processJsonFiles} from "./src/processJsonFiles.js";

const rootDir = "D:\\Erp\\Langs";

const csvFiles = {
    ar: join(__dirname, "reference", "ar.csv"),
    en: join(__dirname, "reference", "en.csv"),
  };


  // Run the script
processJsonFiles(csvFiles,rootDir);