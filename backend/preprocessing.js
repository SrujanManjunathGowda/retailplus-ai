// Comprehensive Spelling Correction Dictionary
const spellingCorrections = {
  delivary: "delivery",
  deliverry: "delivery",
  delivry: "delivery",
  qualilty: "quality",
  qualty: "quality",
  qaulity: "quality",
  battary: "battery",
  battry: "battery",
  batery: "battery",
  prodcut: "product",
  prodctu: "product",
  prouduct: "product",
  servis: "service",
  serviz: "service",
  servise: "service",
  custmer: "customer",
  cutsomer: "customer",
  costumer: "customer",
  packging: "packaging",
  paackging: "packaging",
  pakcing: "packaging",
  sheeping: "shipping",
  shipement: "shipment",
  shiping: "shipping",
  recieved: "received",
  recived: "received",
  recevied: "received",
  repalce: "replace",
  replae: "replace",
  repace: "replace",
  expenisve: "expensive",
  expensiv: "expensive",
  expesnive: "expensive",
  awsome: "awesome",
  awsum: "awesome",
  awesum: "awesome",
  horrible: "horrible",
  horible: "horrible",
  horrable: "horrible",
  terible: "terrible",
  terrble: "terrible",
  tiribble: "terrible",
  excelent: "excellent",
  excellant: "excellent",
  exelent: "excellent",
  definitly: "definitely",
  definately: "definitely",
  defintely: "definitely",
  recieve: "receive",
  recieve: "receive",
  recieive: "receive",
  agressive: "aggressive",
  agresive: "aggressive",
  agresiv: "aggressive",
  realy: "really",
  relly: "really",
  realli: "really",
  alot: "a lot",
  allot: "a lot",
  alott: "a lot",
  awfull: "awful",
  aweful: "awful",
  awfull: "awful",
  gud: "good",
  gd: "good",
  goood: "good",
  gr8: "great",
  gr9: "great",
  grate: "great",
  thx: "thanks",
  thanx: "thanks",
  thnks: "thanks",
  lagg: "lag",
  lagging: "lagging",
  laggy: "laggy",
  slowww: "slow",
  slooow: "slow",
  sloow: "slow",
  fastt: "fast",
  fasstt: "fast",
  fagsat: "fast",
  waste: "waste",
  wastee: "waste",
  wast: "waste",
  breakn: "broken",
  brken: "broken",
  broke: "broken",
};

// Hinglish to English Translations
const hinglishTranslations = {
  bahut: "very",
  "bahut slow": "very slow",
  "bahut jaldi": "very fast",
  bilkul: "completely",
  "bilkul kharab": "completely bad",
  "bilkul galat": "completely wrong",
  "bilkul nahi": "absolutely not",
  thik: "okay",
  theek: "okay",
  thikthak: "okay",
  shi: "yes",
  haan: "yes",
  haaan: "yes",
  na: "no",
  nahi: "no",
  mast: "great",
  mastiii: "great",
  kamal: "amazing",
  kamaal: "amazing",
  bekaar: "bad",
  bekar: "useless",
  bakwas: "terrible",
  ghatia: "terrible",
  kharab: "bad",
  kharaaab: "bad",
  faltu: "useless",
  jaldi: "fast",
  der: "delay",
  "delivery der": "delivery delay",
  paisa: "money",
  kharcha: "expense",
  "budget mein": "budget friendly",
  thoda: "some",
  "thoda kharab": "somewhat bad",
  ekdum: "absolutely",
  "ekdum bilkul": "absolutely",
  jhaat: "bad",
  "jhaat kharab": "totally bad",
  sakkath: "excellent",
  chandanaaa: "cool",
  accha: "good",
  "accha hai": "is good",
  tumba: "very",
  "tumba costly": "very expensive",
  "tumba jasthi": "very high",
  nice: "nice",
  badhiya: "good",
  shukriya: "thanks",
};

// Emoji to Text Mapping
const emojiMap = {
  "😢": "sad",
  "😭": "very sad",
  "😞": "disappointed",
  "😔": "sad",
  "😡": "angry",
  "😠": "angry",
  "🤬": "angry",
  "😤": "frustrated",
  "😊": "happy",
  "😃": "happy",
  "😄": "very happy",
  "😆": "happy",
  "😁": "happy",
  "😍": "love",
  "❤️": "love",
  "💕": "love",
  "💖": "love",
  "👍": "good",
  "👎": "bad",
  "⭐": "star",
  "✨": "excellent",
  "🔥": "great",
  "💔": "broken heart",
  "😒": "dislike",
  "🤷": "uncertain",
  "😋": "tasty",
};

/**
 * Normalize emojis to text
 */
function normalizeEmojis(text) {
  let normalized = text;
  for (const [emoji, meaning] of Object.entries(emojiMap)) {
    normalized = normalized.replace(new RegExp(emoji, "g"), ` ${meaning} `);
  }
  // Remove any remaining emojis (Unicode ranges)
  normalized = normalized.replace(
    /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/gu,
    " ",
  );
  return normalized;
}

/**
 * Normalize Hinglish (Hindi-English mix) to English
 */
function normalizeHinglish(text) {
  let normalized = text.toLowerCase();

  // Apply longest matches first to avoid partial replacements
  const sortedTranslations = Object.entries(hinglishTranslations).sort(
    (a, b) => b[0].length - a[0].length,
  );

  for (const [hinglish, english] of sortedTranslations) {
    const regex = new RegExp(`\\b${hinglish}\\b`, "gi");
    normalized = normalized.replace(regex, english);
  }

  return normalized;
}

/**
 * Correct common spelling mistakes
 */
function correctSpelling(text) {
  let corrected = text.toLowerCase();

  // Fix repeated characters: "loooong" -> "long"
  corrected = corrected.replace(/(.)\1{2,}/g, "$1");

  for (const [wrong, correct] of Object.entries(spellingCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");
    corrected = corrected.replace(regex, correct);
  }

  return corrected;
}

/**
 * Detect language (English vs Hinglish)
 */
function detectLanguage(text) {
  const hinglishIndicators = [
    "bahut",
    "haan",
    "na",
    "thik",
    "mast",
    "bekaar",
    "jaldi",
    "paisa",
    "ekdum",
    "bilkul",
    "kharab",
    "kamal",
    "sakkath",
  ];
  const lowerText = text.toLowerCase();

  const matches = hinglishIndicators.filter((indicator) =>
    new RegExp(`\\b${indicator}\\b`).test(lowerText),
  );

  if (matches.length > 0) return "hinglish";

  // Check for any non-ASCII characters
  if (/[^\x00-\x7F]/.test(text)) return "mixed";

  return "english";
}

/**
 * Clean text: lowercase, remove special chars, normalize whitespace
 */
function cleanText(text) {
  if (!text) return "";

  let cleaned = text.toLowerCase();

  // Normalize URLs
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/g, "URL");

  // Remove @ mentions
  cleaned = cleaned.replace(/@\w+/g, "mention");

  // Remove hashtags but preserve word
  cleaned = cleaned.replace(/#(\w+)/g, "$1");

  // Keep only alphanumeric, spaces, and basic punctuation
  cleaned = cleaned.replace(/[^a-z0-9\s\.,!?\-']/g, " ");

  // Normalize multiple spaces
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Remove trailing punctuation
  cleaned = cleaned.replace(/[!?.,]+$/, "");

  return cleaned;
}

/**
 * Detect spam/bot-like reviews
 */
function detectSpam(text, existingReviews = []) {
  const checks = [];
  let spamScore = 0;

  if (!text || text.length < 5) {
    return { isSpam: true, reason: "Too short", confidence: 95 };
  }

  // Check 1: Excessive repetition (stricter)
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = 1 - uniqueWords.size / words.length;
  if (repetitionRatio > 0.7) {
    spamScore += 30;
    checks.push("High word repetition");
  }
  if (repetitionRatio > 0.85) {
    spamScore += 20;
    checks.push("Extreme repetition");
  }

  // Check 2: Same sentence repeated (stricter)
  const sentences = text.split(/[.!?]/);
  if (sentences.length > 3) {
    const sentenceCount = {};
    sentences.forEach((s) => {
      const normalized = s.trim().toLowerCase();
      if (normalized.length > 5)
        sentenceCount[normalized] = (sentenceCount[normalized] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(sentenceCount), 0);
    if (maxCount > 2) {
      spamScore += 45;
      checks.push("Duplicate sentences (x" + maxCount + ")");
    }
  }

  // Check 3: All caps screaming (adjusted threshold)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.9 && text.length > 10) {
    spamScore += 20;
    checks.push("Excessive caps");
  }

  // Check 4: Keyboard mashing patterns
  if (/(.)\1{4,}/.test(text)) {
    spamScore += 25;
    checks.push("Keyboard mashing detected");
  }
  if (/[aeiou]{5,}|[bcdfghjklmnpqrstvwxyz]{6,}/.test(text)) {
    spamScore += 15;
    checks.push("Unnatural character patterns");
  }

  // Check 5: Exact duplicate
  const textLower = text.toLowerCase();
  const duplicates = existingReviews.filter(
    (r) => r.text && r.text.toLowerCase() === textLower,
  );
  if (duplicates.length > 0) {
    spamScore += 100;
    checks.push("Exact duplicate found");
  }

  // Check 6: Near-duplicate (>80% similarity - mark as spam if 4+ duplicates)
  if (existingReviews.length > 0) {
    const similarities = existingReviews
      .map((r) => calculateSimilarity(text, r.text))
      .filter((s) => s > 0.8);
    if (similarities.length >= 4) {
      spamScore += 85; // Higher penalty for 4+ duplicates - mark as spam
      checks.push(`SPAM: ${similarities.length} duplicate reviews detected`);
    } else if (similarities.length > 1) {
      spamScore += 35;
      checks.push("Similar to existing reviews");
    } else if (similarities.length > 0) {
      spamScore += 20;
      checks.push("Similar to existing review");
    }
  }

  // Check 7: Phone numbers or excessive numbers
  const phoneMatches = text.match(/(\d{3}[-.\s]?){2}\d{4}|(\d{10})/g) || [];
  const emailMatches =
    text.match(/[a-zA-Z0-9.%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  const urls = text.match(/http[s]?:\/\/[^\s]+/g) || [];

  if (phoneMatches.length > 1 || emailMatches.length > 1) {
    spamScore += 50;
    checks.push("Contact farming detected");
  }
  if (urls.length > 3) {
    spamScore += 45;
    checks.push("Too many URLs (" + urls.length + ")");
  } else if (urls.length > 1) {
    spamScore += 15;
    checks.push("Contains multiple links");
  } else if (urls.length > 0) {
    spamScore += 5;
    checks.push("Contains link");
  }

  // Check 8: Aggressive spam phrases (expanded list)
  const aggressiveSpamPhrases = [
    /click here|click link|open link|follow link/i,
    /buy now|purchase now|order now|get now/i,
    /limited offer|limited time|act now|don't miss/i,
    /guaranteed|100% guaranteed|risk free|free money/i,
    /claim (your|the) (prize|reward|bonus|gift)/i,
    /congratulations|you (have|won)/i,
    /verify (account|identity|payment)/i,
    /confirm (password|account|details)/i,
    /call me|dm me|message me|contact me/i,
    /follow|subscribe|like|comment|share/i,
  ];

  const aggresiveMatches = aggressiveSpamPhrases.filter((phrase) =>
    phrase.test(text),
  );
  if (aggresiveMatches.length > 0) {
    spamScore += 35 + aggresiveMatches.length * 8;
    checks.push("Aggressive marketing phrases");
  }

  // Check 9: Character frequency anomalies
  const charFreq = {};
  for (const char of text.toLowerCase()) {
    if (!/[a-z0-9\s]/.test(char)) charFreq[char] = (charFreq[char] || 0) + 1;
  }
  const specialCharCount = Object.values(charFreq).reduce((a, b) => a + b, 0);
  if (specialCharCount / text.length > 0.4) {
    spamScore += 20;
    checks.push("Excessive special characters");
  }

  // Check 10: Word count extremes
  if (words.length < 3) {
    spamScore += 10;
    checks.push("Too few words");
  }

  const isSpam = spamScore >= 50;
  const confidence = Math.min(spamScore, 100);

  return {
    isSpam,
    reason: checks.join(", ") || "Suspicious content",
    confidence,
    score: spamScore,
  };
}

/**
 * Calculate Jaccard similarity for near-duplicate detection
 */
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Validate input has meaningful content
 */
function validateInput(text) {
  const trimmed = text.trim();
  if (trimmed.length < 3) return false;
  const words = trimmed.split(/\W+/);
  if (words.length === 1 && !/[aeiouy]/i.test(trimmed)) return false;
  return true;
}

/**
 * Comprehensive preprocessing pipeline
 */
function preprocessText(text) {
  if (!validateInput(text)) return { valid: false, processedText: null };

  let processed = normalizeEmojis(text);
  processed = normalizeHinglish(processed);
  processed = correctSpelling(processed);
  processed = cleanText(processed);

  if (processed.length < 3) return { valid: false, processedText: null };

  const language = detectLanguage(text);

  return {
    valid: true,
    originalText: text,
    processedText: processed,
    language,
    wordCount: processed.split(/\s+/).length,
    charCount: processed.length,
  };
}

/**
 * Advanced preprocessing with spam detection
 */
function preprocessReview(rawText, existingReviews = []) {
  if (!rawText || typeof rawText !== "string") return null;

  const preprocessing = preprocessText(rawText);
  if (!preprocessing.valid) return null;

  const text = preprocessing.processedText;
  const spamAnalysis = detectSpam(text, existingReviews);

  return {
    originalText: rawText,
    processedText: text,
    language: preprocessing.language,
    wordCount: preprocessing.wordCount,
    charCount: preprocessing.charCount,
    spamAnalysis,
    preprocessedAt: new Date().toISOString(),
    isDuplicate: false,
    isSpam: spamAnalysis.isSpam,
  };
}

/**
 * Batch preprocessing with deduplication
 */
function batchPreprocess(reviewTexts, existingReviews = []) {
  const results = [];
  const seenHashes = new Set();

  for (const rawText of reviewTexts) {
    if (!rawText) continue;

    const preprocessed = preprocessReview(rawText, existingReviews);
    if (!preprocessed) continue;

    // Deduplication within batch
    const hash = preprocessed.processedText.slice(0, 40);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      results.push(preprocessed);
    } else {
      preprocessed.isDuplicate = true;
      results.push(preprocessed);
    }
  }

  return results;
}

module.exports = {
  preprocessText,
  preprocessReview,
  batchPreprocess,
  detectSpam,
  calculateSimilarity,
  normalizeEmojis,
  normalizeHinglish,
  correctSpelling,
  cleanText,
  detectLanguage,
  validateInput,
};
