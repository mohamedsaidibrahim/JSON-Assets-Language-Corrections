import { join } from "path";
import {processJsonFiles} from "./src/processJsonFiles.js";

const rootDir = "D:\\Erp\\Langs";

const csvFiles = {
    ar: join(process.cwd(), "reference", "ar.csv"),
    en: join(process.cwd(), "reference", "en.csv"),
  };


  // Run the script
processJsonFiles(csvFiles,rootDir);