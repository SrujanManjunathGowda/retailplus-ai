/**
 * Test Suite: Confidence Scoring Improvements
 * Demonstrates enhanced confidence calibration across all modules
 */

const {
  analyzeSentiment,
  validateAndCalibrateConfidence,
} = require("./sentiment.js");
const {
  filterByConfidence,
  getConfidenceWeights,
  calculateWeightedAverageSentiment,
  getConfidenceDistribution,
  getHighConfidenceConsensus,
} = require("./insights.js");
const {
  calculateCSAT,
  calculateNPS,
  calculateCES,
} = require("./cx_metrics.js");

// Initialize sentiment model
const { initModel } = require("./sentiment.js");

/**
 * Test 1: Single Review Confidence Calibration
 * Tests validateAndCalibrateConfidence on various review types
 */
async function testConfidenceCalibration() {
  console.log("\n=== TEST 1: Confidence Calibration ===\n");

  await initModel();

  const testReviews = [
    {
      text: "Good product", // Very short
      overallSentiment: "positive",
      overallConfidence: 95,
      aspects: {},
    },
    {
      text: "This is a comprehensive review. The product quality is excellent with great battery life. However, the delivery was delayed by 2 weeks. Overall satisfied despite the delay. Would recommend.", // Long, mixed
      overallSentiment: "positive",
      overallConfidence: 92,
      aspects: {
        delivery: { sentiment: "negative", confidence: 88 },
        product: { sentiment: "positive", confidence: 95 },
      },
    },
    {
      text: "TERRIBLE!!! WORST EVER??? Product broken immediately!!!", // Emotional
      overallSentiment: "negative",
      overallConfidence: 85,
      aspects: {},
    },
    {
      text: "It's okay I guess, maybe good maybe bad not really sure.", // Ambiguous
      overallSentiment: "neutral",
      overallConfidence: 75,
      aspects: {},
    },
  ];

  console.log("Testing confidence calibration on 4 review types:\n");

  testReviews.forEach((review, idx) => {
    const validated = validateAndCalibrateConfidence(review, review.text);
    console.log(`Review ${idx + 1}:`);
    console.log(
      `  Original Text: "${review.text.substring(0, 50)}${review.text.length > 50 ? "..." : ""}"`,
    );
    console.log(`  Original Confidence: ${review.overallConfidence}%`);
    console.log(`  Adjusted Confidence: ${validated.overallConfidence}%`);
    console.log(
      `  Adjustment: ${validated.confidenceValidation.adjustment} points`,
    );
    console.log(
      `  Reasons: ${validated.confidenceValidation.reasons.join(", ")}`,
    );
    console.log(`  Text Metrics:`, validated.confidenceValidation.textMetrics);
    console.log();
  });
}

/**
 * Test 2: Review Filtering by Confidence
 * Tests filterByConfidence with different thresholds
 */
function testConfidenceFiltering() {
  console.log("\n=== TEST 2: Confidence-Based Review Filtering ===\n");

  const sampleReviews = [
    { text: "Great!", overallConfidence: 95, overallSentiment: "positive" },
    {
      text: "Good product",
      overallConfidence: 72,
      overallSentiment: "positive",
    },
    { text: "Not sure", overallConfidence: 45, overallSentiment: "neutral" },
    {
      text: "Bad experience",
      overallConfidence: 88,
      overallSentiment: "negative",
    },
    { text: "OK I guess", overallConfidence: 55, overallSentiment: "neutral" },
  ];

  console.log("Sample reviews confidence levels:");
  sampleReviews.forEach((r, i) => {
    console.log(
      `  ${i + 1}. "${r.text}" - Confidence: ${r.overallConfidence}%`,
    );
  });

  const highConf = filterByConfidence(sampleReviews, 80);
  const mediumConf = filterByConfidence(sampleReviews, 60);
  const allReviews = filterByConfidence(sampleReviews, 0);

  console.log(`\nFiltering results:`);
  console.log(`  High confidence (≥80%): ${highConf.length} reviews`);
  console.log(`  Medium+ confidence (≥60%): ${mediumConf.length} reviews`);
  console.log(`  All reviews (≥0%): ${allReviews.length} reviews`);
}

/**
 * Test 3: Confidence Weights for Metrics
 * Tests how confidence weights affect metric calculations
 */
function testConfidenceWeighting() {
  console.log("\n=== TEST 3: Confidence Weighting for Metrics ===\n");

  const reviews = [
    {
      text: "Amazing product!",
      overallConfidence: 95,
      overallSentiment: "positive",
    },
    {
      text: "Pretty good",
      overallConfidence: 70,
      overallSentiment: "positive",
    },
    {
      text: "Not great but OK",
      overallConfidence: 50,
      overallSentiment: "neutral",
    },
    {
      text: "Disappointing",
      overallConfidence: 88,
      overallSentiment: "negative",
    },
    { text: "Ehh", overallConfidence: 30, overallSentiment: "neutral" },
  ];

  const weights = getConfidenceWeights(reviews);

  console.log("Confidence-based weights for reviews:");
  reviews.forEach((r, i) => {
    const weight = weights[i];
    const barLength = Math.round(weight * 20);
    const bar = "█".repeat(barLength) + "░".repeat(20 - barLength);
    console.log(
      `  ${i + 1}. [${bar}] Weight: ${weight.toFixed(2)} (Conf: ${r.overallConfidence}%)`,
    );
  });

  const weightedSentiment = calculateWeightedAverageSentiment(reviews);
  console.log(`\nWeighted average sentiment: ${weightedSentiment}`);

  // Compare with simple average
  const positiveCount = reviews.filter(
    (r) => r.overallSentiment === "positive",
  ).length;
  const simplePercentage = ((positiveCount / reviews.length) * 100).toFixed(0);
  console.log(
    `Simple positive count: ${positiveCount}/${reviews.length} (${simplePercentage}%)`,
  );
}

/**
 * Test 4: Confidence Distribution Analysis
 * Tests getConfidenceDistribution metrics
 */
function testConfidenceDistribution() {
  console.log("\n=== TEST 4: Confidence Distribution Analysis ===\n");

  const reviews = [
    { overallConfidence: 92 },
    { overallConfidence: 88 },
    { overallConfidence: 85 },
    { overallConfidence: 72 },
    { overallConfidence: 68 },
    { overallConfidence: 55 },
    { overallConfidence: 45 },
    { overallConfidence: 30 },
  ];

  const distribution = getConfidenceDistribution(reviews);

  console.log("Confidence distribution statistics:");
  console.log(`  Average: ${distribution.average}%`);
  console.log(`  Min: ${distribution.min}%`);
  console.log(`  Max: ${distribution.max}%`);
  console.log(`  Std Dev: ${distribution.stdDev}%`);
  console.log(
    `  High confidence (≥80%): ${distribution.highConfidence} reviews (${distribution.highConfidenceRatio}%)`,
  );
  console.log(
    `  Medium confidence (60-79%): ${distribution.mediumConfidence} reviews`,
  );
  console.log(`  Low confidence (<60%): ${distribution.lowConfidence} reviews`);
  console.log(`  Overall data quality: ${distribution.dataQuality}`);
}

/**
 * Test 5: High Confidence Consensus
 * Tests identifying when multiple high-confidence reviews agree
 */
function testHighConfidenceConsensus() {
  console.log("\n=== TEST 5: High Confidence Consensus Detection ===\n");

  const positiveReviews = [
    { overallConfidence: 92, overallSentiment: "positive" },
    { overallConfidence: 88, overallSentiment: "positive" },
    { overallConfidence: 85, overallSentiment: "positive" },
  ];

  const mixedReviews = [
    { overallConfidence: 88, overallSentiment: "positive" },
    { overallConfidence: 82, overallSentiment: "negative" },
    { overallConfidence: 75, overallSentiment: "neutral" },
  ];

  const weakConsensus = [
    { overallConfidence: 70, overallSentiment: "positive" },
    { overallConfidence: 65, overallSentiment: "positive" },
    { overallConfidence: 60, overallSentiment: "negative" },
  ];

  console.log("Consensus Detection Results:\n");

  const consensus1 = getHighConfidenceConsensus(positiveReviews, 75, 0.6);
  console.log("Strong positive consensus:");
  console.log(`  Result: ${JSON.stringify(consensus1)}`);

  const consensus2 = getHighConfidenceConsensus(mixedReviews, 75, 0.6);
  console.log("\nMixed sentiment reviews:");
  console.log(
    `  Result: ${consensus2 ? JSON.stringify(consensus2) : "No consensus (too mixed)"}`,
  );

  const consensus3 = getHighConfidenceConsensus(weakConsensus, 75, 0.6);
  console.log("\nWeak/low confidence reviews:");
  console.log(
    `  Result: ${consensus3 ? JSON.stringify(consensus3) : "No consensus (confidence too low)"}`,
  );
}

/**
 * Test 6: Metrics Calculation with Confidence Weighting
 * Tests how confidence affects CSAT, NPS, CES
 */
function testMetricsWithConfidence() {
  console.log(
    "\n=== TEST 6: Metrics Calculation with Confidence Weighting ===\n",
  );

  // Same sentiments, different confidence levels
  const lowConfidentReviews = [
    { overallSentiment: "positive", overallConfidence: 30 },
    { overallSentiment: "positive", overallConfidence: 35 },
    { overallSentiment: "negative", overallConfidence: 40 },
  ];

  const highConfidentReviews = [
    { overallSentiment: "positive", overallConfidence: 92 },
    { overallSentiment: "positive", overallConfidence: 88 },
    { overallSentiment: "negative", overallConfidence: 95 },
  ];

  console.log("Review Set 1 (Low Confidence):");
  lowConfidentReviews.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.overallSentiment} (${r.overallConfidence}%)`);
  });

  const csat1 = calculateCSAT(lowConfidentReviews);
  const nps1 = calculateNPS(lowConfidentReviews);
  const ces1 = calculateCES(lowConfidentReviews);

  console.log(`  CSAT: ${csat1}%, NPS: ${nps1}, CES: ${ces1}/5\n`);

  console.log("Review Set 2 (High Confidence - Same Sentiments):");
  highConfidentReviews.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.overallSentiment} (${r.overallConfidence}%)`);
  });

  const csat2 = calculateCSAT(highConfidentReviews);
  const nps2 = calculateNPS(highConfidentReviews);
  const ces2 = calculateCES(highConfidentReviews);

  console.log(`  CSAT: ${csat2}%, NPS: ${nps2}, CES: ${ces2}/5\n`);

  console.log("Impact of confidence weighting:");
  console.log(
    `  CSAT difference: ${csat2 - csat1}% (high conf gives higher weight)`,
  );
  console.log(`  NPS difference: ${nps2 - nps1} points`);
  console.log(
    `  CES difference: ${(ces2 - ces1).toFixed(1)}/5 (lower is better)`,
  );
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Confidence Scoring Improvements - Test Suite 3/10        ║");
  console.log("║   Testing enhanced confidence calibration and weighting    ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    await testConfidenceCalibration();
    testConfidenceFiltering();
    testConfidenceWeighting();
    testConfidenceDistribution();
    testHighConfidenceConsensus();
    testMetricsWithConfidence();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║   ✅ All confidence scoring tests completed successfully   ║",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║   Key Improvements:                                        ║",
    );
    console.log(
      "║   • Multi-factor confidence validation (9 factors)        ║",
    );
    console.log("║   • Confidence-weighted metrics (CSAT, NPS, CES)         ║");
    console.log("║   • High-confidence consensus detection                 ║");
    console.log("║   • Review filtering & distribution analysis             ║");
    console.log("║   • LLM prompt guidance for calibration                  ║");
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
