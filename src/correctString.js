// Correct a single string using the corrections map
export function correctString(str, corrections) {
  const regex = new RegExp(
      `\\b(${Array.from(corrections.keys())
          .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special characters
          .join('|')})\\b`,
      'g'
  );

  return str.replace(regex, (match) => corrections.get(match) || match);
}

// // Correct a single string using the corrections map
// export function correctString(str, corrections) {
//     const regex = new RegExp(
//       `\\b(${Array.from(corrections.keys())
//         .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) // Escape special characters
//         .join("|")})\\b`,
//       "g"
//     );
  
//     return str.replace(regex, (match) => corrections.get(match) || match);
//   }