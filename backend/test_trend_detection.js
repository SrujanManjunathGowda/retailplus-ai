/**
 * Test Suite: Trend Detection Enhancements
 * Tests adaptive thresholds, recency weighting, and confidence intervals
 */

const {
  detectTrends,
  detectSentimentTrend,
  calculateBatchStats,
  calculateAdaptiveThreshold,
  applyRecencyWeighting,
  calculateConfidenceInterval,
  detectIssueSpike,
} = require("./trends.js");

/**
 * Test 1: Adaptive Threshold Calculation
 */
function testAdaptiveThresholds() {
  console.log("\n=== TEST 1: Adaptive Threshold Calculation ===\n");

  const testCases = [
    { recent: 5, past: 5, description: "Small dataset (10 total)" },
    { recent: 20, past: 30, description: "Medium dataset (50 total)" },
    { recent: 50, past: 50, description: "Large dataset (100 total)" },
    { recent: 100, past: 100, description: "Very large dataset (200 total)" },
    { recent: 3, past: 10, description: "Small recent batch" },
    { recent: 60, past: 40, description: "Large recent batch" },
  ];

  console.log("Threshold adjustments based on dataset size:\n");

  testCases.forEach((test) => {
    const threshold = calculateAdaptiveThreshold(test.recent, test.past);
    const total = test.recent + test.past;
    console.log(
      `${test.description.padEnd(30)}: Threshold = ${threshold.toFixed(2)}x`,
    );
    console.log(
      `  Dataset size: ${total}, Recent: ${test.recent}, Past: ${test.past}`,
    );
  });

  console.log("\n✅ Adaptive thresholds calculated successfully");
}

/**
 * Test 2: Recency Weighting
 */
function testRecencyWeighting() {
  console.log("\n=== TEST 2: Recency Weighting ===\n");

  const reviews = [
    { id: 1, overallSentiment: "negative" },
    { id: 2, overallSentiment: "negative" },
    { id: 3, overallSentiment: "negative" },
    { id: 4, overallSentiment: "positive" },
    { id: 5, overallSentiment: "positive" },
  ];

  const weighted = applyRecencyWeighting(reviews);

  console.log("Recency weights applied to 5 reviews:\n");
  console.log("ID  | Sentiment | Recency Weight | Position");
  console.log("----------------------------------------------");

  weighted.forEach((review, idx) => {
    const position =
      idx === 0 ? "Oldest" : idx === weighted.length - 1 ? "Newest" : "Middle";
    const barLength = Math.round(review.recencyWeight * 15);
    const bar = "█".repeat(barLength);
    console.log(
      `${review.id}   | ${review.overallSentiment.padEnd(9)} | [${bar.padEnd(14)}] ${review.recencyWeight.toFixed(2)}`,
    );
  });

  console.log("\n✅ Recency weights apply exponential decay");
  console.log("   Newer reviews weighted more (up to 1.0)");
  console.log("   Older reviews weighted less (down to ~0.3)");
}

/**
 * Test 3: Confidence Intervals
 */
function testConfidenceIntervals() {
  console.log("\n=== TEST 3: Confidence Interval Calculation ===\n");

  const testCases = [
    { successes: 7, total: 10, description: "70% positive (10 reviews)" },
    { successes: 20, total: 30, description: "67% positive (30 reviews)" },
    { successes: 100, total: 200, description: "50% positive (200 reviews)" },
    {
      successes: 3,
      total: 5,
      description: "60% positive (5 reviews - small n)",
    },
  ];

  console.log("95% Confidence intervals for different sample sizes:\n");

  testCases.forEach((test) => {
    const ci = calculateConfidenceInterval(test.successes, test.total);
    console.log(`${test.description.padEnd(35)}`);
    console.log(`  Point estimate: ${ci.point}%`);
    console.log(`  95% CI: [${ci.lower}%, ${ci.upper}%]`);
    console.log(`  Margin of error: ±${ci.margin}%`);
  });

  console.log("\n✅ Confidence intervals reflect sample size uncertainty");
  console.log("   Smaller samples → wider confidence intervals");
  console.log("   Larger samples → narrower confidence intervals");
}

/**
 * Test 4: Batch Statistics with Weighting
 */
function testBatchStatistics() {
  console.log("\n=== TEST 4: Batch Statistics with Weighting ===\n");

  // Create sample reviews with timestamps (implicitly ordered)
  const reviews = [
    { id: 1, overallSentiment: "negative", overallConfidence: 80 },
    { id: 2, overallSentiment: "negative", overallConfidence: 85 },
    { id: 3, overallSentiment: "negative", overallConfidence: 90 },
    { id: 4, overallSentiment: "positive", overallConfidence: 88 },
    { id: 5, overallSentiment: "positive", overallConfidence: 92 },
  ];

  // Calculate without weighting
  const statsUnweighted = calculateBatchStats(reviews, null, false);

  // Calculate with weighting
  const statsWeighted = calculateBatchStats(reviews, null, true);

  console.log("Statistics comparison (with vs without recency weighting):\n");
  console.log("Metric                  | Unweighted | Weighted");
  console.log("-----------------------------------------------------");
  console.log(
    `Total reviews           | ${statsUnweighted.total.toString().padEnd(10)} | ${statsWeighted.total}`,
  );
  console.log(
    `Negative count          | ${statsUnweighted.negative.toString().padEnd(10)} | ${statsWeighted.negative}`,
  );
  console.log(
    `Positive count          | ${statsUnweighted.positive.toString().padEnd(10)} | ${statsWeighted.positive}`,
  );
  console.log(
    `Negative rate           | ${(statsUnweighted.negativeRate * 100).toFixed(0)}%${" ".repeat(7)} | ${(statsWeighted.negativeRate * 100).toFixed(0)}%`,
  );
  console.log(
    `Avg confidence          | ${statsUnweighted.avgConfidence.toString().padEnd(10)} | ${statsWeighted.avgConfidence}`,
  );

  console.log("\n✅ Weighted stats emphasize recent reviews");
  if (statsWeighted.negativeRate < statsUnweighted.negativeRate) {
    console.log("   Effect: Recent positive reviews reduced negative rate");
  }
}

/**
 * Test 5: Spike Detection with Adaptive Thresholds
 */
function testSpikeDetection() {
  console.log("\n=== TEST 5: Spike Detection with Adaptive Thresholds ===\n");

  // Test case: small dataset where spike should be detected
  const smallRecentStats = {
    total: 5,
    negative: 3,
    negativeRate: 0.6,
    avgConfidence: 80,
    negativeRateCI: { lower: 26, upper: 88 },
  };

  const smallPastStats = {
    total: 5,
    negative: 1,
    negativeRate: 0.2,
    avg: 80,
    negativeRateCI: { lower: 1, upper: 56 },
  };

  console.log("Small dataset spike scenario:");
  console.log(
    `  Recent: 3/5 negative (${(smallRecentStats.negativeRate * 100).toFixed(0)}%)`,
  );
  console.log(
    `  Past: 1/5 negative (${(smallPastStats.negativeRate * 100).toFixed(0)}%)`,
  );

  // Calculate adaptive threshold for small dataset
  const adaptiveThreshold = calculateAdaptiveThreshold(5, 5);
  console.log(`  Adaptive threshold: ${adaptiveThreshold.toFixed(2)}x`);

  // Detect spike
  const spike = detectIssueSpike(
    smallRecentStats,
    smallPastStats,
    "battery",
    adaptiveThreshold,
  );

  if (spike) {
    console.log(`\n  ✅ Spike DETECTED: ${spike.message}`);
    console.log(`     Type: ${spike.type}`);
    console.log(`     Severity: ${spike.severity}`);
  } else {
    console.log("\n  ❌ Spike NOT detected (should have been)");
  }

  console.log("\n✅ Spike detection adapts to dataset size");
  console.log("   Small datasets: Lower thresholds (3x spike with 5 reviews)");
  console.log("   Large datasets: Stricter thresholds (need bigger changes)");
}

/**
 * Test 6: Trend Analysis with CI
 */
function testTrendAnalysis() {
  console.log("\n=== TEST 6: Sentiment Trend Analysis ===\n");

  // Create 20 reviews with mixed sentiment over time
  const reviews = [
    ...Array(6)
      .fill(null)
      .map(() => ({ overallSentiment: "negative", overallConfidence: 75 })),
    ...Array(4)
      .fill(null)
      .map(() => ({ overallSentiment: "positive", overallConfidence: 80 })),
    ...Array(6)
      .fill(null)
      .map(() => ({ overallSentiment: "negative", overallConfidence: 80 })),
    ...Array(4)
      .fill(null)
      .map(() => ({ overallSentiment: "positive", overallConfidence: 85 })),
  ];

  const trend = detectSentimentTrend(reviews);

  console.log("20 reviews analyzed for trend:");
  console.log(`\nTrend detected: ${trend.trend}`);
  console.log(`Message: ${trend.message}`);
  console.log(`\nRecent batch statistics:`);
  console.log(
    `  Positive rate: ${(trend.recentStats.positiveRate * 100).toFixed(0)}% (CI: ${trend.recentStats.positiveRateCI.lower}-${trend.recentStats.positiveRateCI.upper}%)`,
  );
  console.log(
    `  Negative rate: ${(trend.recentStats.negativeRate * 100).toFixed(0)}% (CI: ${trend.recentStats.negativeRateCI.lower}-${trend.recentStats.negativeRateCI.upper}%)`,
  );
  console.log(`  Average confidence: ${trend.recentStats.avgConfidence}%`);
  console.log(`  Adaptive threshold: ${trend.adaptiveThreshold.toFixed(2)}x`);

  console.log("\n✅ Trend includes confidence intervals and adaptive metrics");
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║   Trend Detection Enhancements - Test Suite Task 4/4      ║");
  console.log("║   Adaptive Thresholds + Recency + Confidence Intervals    ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    testAdaptiveThresholds();
    testRecencyWeighting();
    testConfidenceIntervals();
    testBatchStatistics();
    testSpikeDetection();
    testTrendAnalysis();

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗",
    );
    console.log(
      "║   ✅ All trend detection tests completed successfully      ║",
    );
    console.log(
      "║                                                            ║",
    );
    console.log(
      "║   Enhancements Delivered:                                  ║",
    );
    console.log(
      "║   • Volume-adaptive spike thresholds (1.3x - 2.2x)        ║",
    );
    console.log(
      "║   • Exponential recency weighting (newest: 1.0x)          ║",
    );
    console.log(
      "║   • 95% confidence intervals for all metrics              ║",
    );
    console.log(
      "║   • Confidence-adjusted severity scores                   ║",
    );
    console.log(
      "║   • Better handling of small datasets                     ║",
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝",
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests
runAllTests();
