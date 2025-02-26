
const correctString = require("./correctString");

// Recursively correct values in JSON object
export function correctJsonValues(obj, corrections) {
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