const fs = require('fs');

const templates = [
  "The battery life is amazing, but the packaging was horrible. 👎",
  "ಬೆಲೆ ತುಂಬಾ ಜಾಸ್ತಿ (Price is too high), standard quality though.",
  "Excellent delivery speed, arrived before expected. Service is top-notch! 🚀",
  "Product completely dead on arrival. Support isn't answering. Very bad.",
  "Worth the price. Awesome ambient lighting inside.",
  "Superb camera quality, but the phone heats up fast...",
  "खराब डिलीवरी (Bad delivery). Box was torn. Neutral on the product itself.",
  "Worst experience ever. It's totally fake and the battery drains in 1 hour.",
  "Great purchase. The delivery, packaging and price are perfectly balanced.",
  "It's just okay. Nothing special. Service was decent.",
  "I am lovig it!! Excelet built quality 😍 (pardon my speeling)",
  "Delivery boy was very rude. Expected better service.",
  "Value for money 💯. Unboxing experience (packaging) felt premium.",
  "The screen has a scratch. They denied replacement. Horrible.",
  "Quality is awesome. Best in this segment."
];

let csvContent = "text\n";
for (let i = 0; i < 200; i++) {
  const randomReview = templates[Math.floor(Math.random() * templates.length)];
  // Add a little randomness so they aren't exactly duplicates
  const review = `"${randomReview} ${Math.floor(Math.random() * 1000)}"` 
  csvContent += review + "\n";
}

fs.writeFileSync('../sample_reviews.csv', csvContent);
console.log("sample_reviews.csv generated with 200 rows.");
