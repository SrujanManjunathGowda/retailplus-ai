const fs = require("fs");
const Papa = require("papaparse");

// Read the sample CSV
const fileContent = fs.readFileSync("../sample_reviews.csv", "utf8");

console.log("=== CSV RAW CONTENT (first 200 chars) ===");
console.log(fileContent.substring(0, 200));
console.log("\n");

// Parse it exactly like the server does
const parsedData = Papa.parse(fileContent, {
  header: true,
  skipEmptyLines: "greedy",
  dynamicTyping: false,
  trimHeaders: true,
  trimValues: true,
});

console.log("=== PAPA.PARSE RESULT ===");
console.log("Total rows:", parsedData.data.length);
console.log("Parse errors:", parsedData.errors.length);
console.log("Headers/fields:", parsedData.meta?.fields);

console.log("\n=== FIRST 3 ROWS ===");
for (let i = 0; i < Math.min(3, parsedData.data.length); i++) {
  const row = parsedData.data[i];
  console.log(`\nRow ${i}:`);
  console.log("  All keys:", Object.keys(row));
  for (const [k, v] of Object.entries(row)) {
    console.log(
      `  "${k}" = "${v}" (type: ${typeof v}, length: ${v?.length || 0})`,
    );
  }
}

console.log("\n=== TESTING getTextColumn LOGIC ===");
function getTextColumn(row, rowIndex = 0) {
  const textKeywords = [
    "text",
    "review",
    "comment",
    "feedback",
    "message",
    "content",
    "description",
    "body",
    "remarks",
    "note",
  ];

  // Try to find columns with text keywords (case-insensitive)
  for (const keyword of textKeywords) {
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes(keyword) &&
        value &&
        typeof value === "string" &&
        value.length > 0
      ) {
        console.log(`  ✓ Found in "${key}": "${value.substring(0, 40)}..."`);
        return value;
      }
    }
  }

  // Fallback: Return first non-empty string value
  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === "string" && value.length > 3) {
      console.log(
        `  ✓ Using fallback "${key}": "${value.substring(0, 40)}..."`,
      );
      return value;
    }
  }

  console.log(`  ✗ NO TEXT FOUND`);
  return null;
}

for (let i = 0; i < Math.min(3, parsedData.data.length); i++) {
  console.log(`\nRow ${i}: getTextColumn result:`);
  const text = getTextColumn(parsedData.data[i], i);
  if (text) {
    console.log(`  SUCCESS: "${text.substring(0, 60)}..."`);
  } else {
    console.log(`  FAILED: null`);
  }
}
