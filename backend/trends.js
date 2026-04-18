/**
 * Advanced Trend Detection Engine with Adaptive Thresholds
 * Detects emerging issues, systemic problems, and sentiment spikes
 * NEW: Volume-adaptive thresholds, recency weighting, confidence intervals
 */

/**
 * Calculate volume-adaptive spike threshold
 * Smaller datasets need lower thresholds to be meaningful
 * Larger datasets can afford stricter thresholds
 */
function calculateAdaptiveThreshold(recentCount, pastCount) {
  const totalCount = recentCount + pastCount;

  // Base thresholds
  let threshold = 2.0;

  // Adjust based on dataset size
  if (totalCount < 20) {
    threshold = 1.3; // Very small dataset: any change is significant
  } else if (totalCount < 50) {
    threshold = 1.5; // Small dataset: lower threshold
  } else if (totalCount < 100) {
    threshold = 1.7; // Medium dataset: moderate threshold
  } else if (totalCount < 200) {
    threshold = 2.0; // Larger dataset: standard threshold
  } else {
    threshold = 2.2; // Large dataset: stricter threshold (need bigger changes)
  }

  // Adjust based on recent batch size
  if (recentCount < 5) {
    threshold *= 0.8; // Small recent batch: lower threshold (fewer data points)
  } else if (recentCount >= 50) {
    threshold *= 1.1; // Large recent batch: higher threshold (more variance expected)
  }

  return threshold;
}

/**
 * Apply recency weighting to reviews
 * Newer reviews weighted more heavily than older reviews
 * Exponential decay: weight = 1.0 for most recent, ~0.5 for oldest
 */
function applyRecencyWeighting(reviews) {
  if (reviews.length <= 1) {
    return reviews.map((r) => ({ ...r, recencyWeight: 1.0 }));
  }

  return reviews.map((review, index) => {
    // Exponential weighting: newer reviews get higher weight
    // Formula: weight = e^(-(n-i-1)/n) where n=total, i=current index
    const position = index / (reviews.length - 1); // 0 to 1, where 1 is most recent
    const recencyWeight = Math.exp(position - 1); // Ranges from ~0.37 (oldest) to 1.0 (newest)

    return {
      ...review,
      recencyWeight: Math.max(0.3, recencyWeight), // Never lower than 0.3
    };
  });
}

/**
 * Calculate confidence interval for trend metrics
 * Uses binomial proportion confidence interval (Wilson score)
 * Returns bounds for true proportion with 95% confidence
 */
function calculateConfidenceInterval(successes, total, confidenceLevel = 0.95) {
  if (total === 0) return { lower: 0, upper: 0, point: 0 };

  const z = confidenceLevel === 0.95 ? 1.96 : 1.645; // z-score for confidence level
  const p = successes / total;

  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const variance =
    ((p * (1 - p)) / total + (z * z) / (4 * total * total)) /
    (denominator * denominator);
  const margin = z * Math.sqrt(variance);

  return {
    point: Math.round(p * 100),
    lower: Math.max(0, Math.round((center - margin) * 100)),
    upper: Math.min(100, Math.round((center + margin) * 100)),
    margin: Math.round(margin * 100),
    sampleSize: total,
    confidence: `${(confidenceLevel * 100).toFixed(0)}%`,
  };
}

/**
 * Calculate batch statistics with recency weighting
 */
function calculateBatchStats(
  reviews,
  aspect = null,
  useRecencyWeighting = true,
) {
  // Apply recency weighting if requested
  const weightedReviews = useRecencyWeighting
    ? applyRecencyWeighting(reviews)
    : reviews.map((r) => ({ ...r, recencyWeight: 1.0 }));

  const stats = {
    total: reviews.length,
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
    avgConfidence: 0,
    confidenceSum: 0,
    weightedPositive: 0,
    weightedNegative: 0,
    totalWeight: 0,
  };

  weightedReviews.forEach((review) => {
    const weight = review.recencyWeight || 1.0;

    if (aspect) {
      // Aspect-specific stats
      const aspects = Array.isArray(review.aspects)
        ? review.aspects
        : review.aspects
          ? Object.entries(review.aspects).map(([k, v]) => ({
              aspect: k,
              ...v,
            }))
          : [];
      const aspectMatch = aspects.find(
        (a) => (a.aspect || Object.keys(a)[0]) === aspect,
      );
      if (!aspectMatch) return;

      const sentiment = aspectMatch.sentiment?.toLowerCase();
      if (sentiment === "positive") {
        stats.positive++;
        stats.weightedPositive += weight;
      } else if (sentiment === "negative") {
        stats.negative++;
        stats.weightedNegative += weight;
      } else if (sentiment === "neutral") stats.neutral++;
      else if (sentiment === "mixed") stats.mixed++;

      stats.confidenceSum += (aspectMatch.confidence || 0) * weight;
    } else {
      // Overall sentiment stats
      const sentiment = review.overallSentiment?.toLowerCase();
      if (sentiment === "positive" || sentiment === "mixed") {
        stats.positive++;
        stats.weightedPositive += weight;
      } else if (sentiment === "negative") {
        stats.negative++;
        stats.weightedNegative += weight;
      } else if (sentiment === "neutral") stats.neutral++;

      stats.confidenceSum += (review.overallConfidence || 0) * weight;
    }

    stats.totalWeight += weight;
  });

  stats.avgConfidence =
    stats.total > 0 ? Math.round(stats.confidenceSum / stats.totalWeight) : 0;

  // Weighted rates (newer reviews count more)
  stats.negativeRate =
    stats.totalWeight > 0 ? stats.weightedNegative / stats.totalWeight : 0;
  stats.positiveRate =
    stats.totalWeight > 0 ? stats.weightedPositive / stats.totalWeight : 0;

  // Confidence intervals for rates
  stats.negativeRateCI = calculateConfidenceInterval(
    stats.negative,
    stats.total,
  );
  stats.positiveRateCI = calculateConfidenceInterval(
    stats.positive + stats.mixed,
    stats.total,
  );

  return stats;
}

/**
 * Detect spike or drop in complaints with adaptive thresholds
 */
function detectIssueSpike(recentStats, pastStats, aspect, threshold = null) {
  if (recentStats.total === 0 || pastStats.total === 0) return null;

  // Calculate adaptive threshold if not provided
  const spikeThreshold =
    threshold || calculateAdaptiveThreshold(recentStats.total, pastStats.total);

  const recentNegRate = recentStats.negativeRate || 0;
  const pastNegRate = pastStats.negativeRate || 0;

  if (pastNegRate === 0 && recentNegRate > 0.3) {
    return {
      type: "EMERGING_ISSUE",
      aspect,
      severity: "HIGH",
      message: `🚨 NEW ISSUE: ${aspect} complaints emerging (${Math.round(recentNegRate * 100)}%)`,
      stats: {
        recent: Math.round(recentNegRate * 100),
        past: Math.round(pastNegRate * 100),
        recentCI: recentStats.negativeRateCI,
        increase: "∞",
      },
      confidence: recentStats.avgConfidence,
    };
  }

  const spikeRatio =
    pastNegRate > 0 ? recentNegRate / pastNegRate : recentNegRate > 0 ? 10 : 1;

  if (spikeRatio >= spikeThreshold && recentStats.negative >= 2) {
    const increasePercent = Math.round((spikeRatio - 1) * 100);
    return {
      type: "SPIKE_DETECTED",
      aspect,
      severity: "HIGH",
      message: `⚠️  SPIKE: ${aspect} complaints increased by ${increasePercent}% (from ${Math.round(pastNegRate * 100)}% → ${Math.round(recentNegRate * 100)}%)`,
      stats: {
        recent: Math.round(recentNegRate * 100),
        recentCI: recentStats.negativeRateCI,
        past: Math.round(pastNegRate * 100),
        pastCI: pastStats.negativeRateCI,
        increase: increasePercent,
        threshold: Math.round(spikeThreshold * 100) / 100,
      },
      confidence: recentStats.avgConfidence,
    };
  }

  if (recentNegRate > 0.6 && recentStats.negative >= 3) {
    return {
      type: "SYSTEMIC_ISSUE",
      aspect,
      severity: "CRITICAL",
      message: `🔴 SYSTEMIC: ${aspect} has persistent complaints (${Math.round(recentNegRate * 100)}% negative)`,
      stats: {
        recent: Math.round(recentNegRate * 100),
        recentCI: recentStats.negativeRateCI,
        past: Math.round(pastNegRate * 100),
        reviews: recentStats.negative,
        threshold: Math.round(spikeThreshold * 100) / 100,
      },
      confidence: recentStats.avgConfidence,
    };
  }

  return null;
}

/**
 * Categorize issues with recency consideration
 */
function categorizeIssue(
  count,
  aspect,
  timeWindow = "recent",
  confidence = 80,
) {
  // Adjust severity based on confidence level
  const confidenceMultiplier = confidence >= 80 ? 1.0 : 0.8;

  if (count >= 5 * confidenceMultiplier) {
    return {
      category: "SYSTEMIC_ISSUE",
      severity: "CRITICAL",
      flag: "🔴",
      description: `Persistent issue affecting many customers`,
    };
  }
  if (count >= 3 * confidenceMultiplier) {
    return {
      category: "RECURRING_ISSUE",
      severity: "HIGH",
      flag: "🟠",
      description: `Pattern of complaints detected`,
    };
  }
  if (count >= 2 * confidenceMultiplier) {
    return {
      category: "EMERGING_ISSUE",
      severity: "MEDIUM",
      flag: "🟡",
      description: `Potential concern forming`,
    };
  }
  if (count === 1) {
    return {
      category: "ISOLATED_ISSUE",
      severity: "LOW",
      flag: "🔵",
      description: `One-off complaint`,
    };
  }

  return null;
}

/**
 * Detect sentiment trend with recency weighting and confidence intervals
 */
function detectSentimentTrend(reviews, windowSize = null) {
  if (reviews.length === 0) return { trend: "NEUTRAL", message: "No data" };

  const batchSize = windowSize || Math.ceil(reviews.length / 2);
  const cutoff = Math.max(0, reviews.length - batchSize);

  const recentReviews = reviews.slice(cutoff);
  const pastReviews = cutoff > 0 ? reviews.slice(0, cutoff) : [];

  // Calculate stats with recency weighting
  const recentStats = calculateBatchStats(recentReviews, null, true);
  const pastStats = calculateBatchStats(pastReviews, null, true);

  let trend = "NEUTRAL";
  let message = "";
  let confidence = recentStats.avgConfidence;

  if (
    recentStats.positiveRate > 0.7 &&
    recentStats.positiveRate > pastStats.positiveRate
  ) {
    trend = "IMPROVING";
    message = `😊 Improving: ${Math.round(recentStats.positiveRate * 100)}% positive in recent batch (CI: ${recentStats.positiveRateCI.lower}-${recentStats.positiveRateCI.upper}%)`;
  } else if (
    recentStats.negativeRate > 0.6 &&
    recentStats.negativeRate > pastStats.negativeRate
  ) {
    trend = "DETERIORATING";
    message = `😞 Deteriorating: ${Math.round(recentStats.negativeRate * 100)}% negative in recent batch (CI: ${recentStats.negativeRateCI.lower}-${recentStats.negativeRateCI.upper}%)`;
  } else if (recentStats.positiveRate > pastStats.positiveRate) {
    trend = "IMPROVING";
    const improvement = Math.round(
      (recentStats.positiveRate - pastStats.positiveRate) * 100,
    );
    message = `📈 Trend improving: ${improvement}% increase in satisfaction`;
  } else if (recentStats.negativeRate < pastStats.negativeRate) {
    trend = "IMPROVING";
    message = `✨ Complaints decreasing`;
  }

  return {
    trend,
    message,
    recentStats,
    pastStats,
    confidence,
    adaptiveThreshold: calculateAdaptiveThreshold(
      recentReviews.length,
      pastReviews.length,
    ),
  };
}

/**
 * Main trend detection function
 */
function detectTrends(reviewsDB) {
  const alerts = [];
  if (reviewsDB.length === 0) return alerts;

  // 1. Detect overall sentiment trend
  const sentimentTrend = detectSentimentTrend(reviewsDB);
  if (sentimentTrend.message) {
    alerts.push({
      type: sentimentTrend.trend === "DETERIORATING" ? "danger" : "info",
      message: sentimentTrend.message,
      severity: sentimentTrend.trend === "DETERIORATING" ? "HIGH" : "LOW",
    });
  }

  // 2. Aspect-level trend detection
  const batchSize = Math.ceil(reviewsDB.length / 2);
  const recentCutoff = Math.max(0, reviewsDB.length - batchSize);

  const recentBatch = reviewsDB.slice(recentCutoff);
  const pastBatch = recentCutoff > 0 ? reviewsDB.slice(0, recentCutoff) : [];

  // Collect all aspects mentioned
  const allAspects = new Set();
  reviewsDB.forEach((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspects
        ? Object.entries(review.aspects).map(([k, v]) => ({ aspect: k, ...v }))
        : [];
    aspects.forEach((a) => {
      const aspectName = a.aspect || Object.keys(a)[0];
      if (aspectName && aspectName !== "general") {
        allAspects.add(aspectName);
      }
    });
  });

  // Analyze each aspect
  const aspectAlerts = [];
  for (const aspect of allAspects) {
    const recentStats = calculateBatchStats(recentBatch, aspect);
    const pastStats = calculateBatchStats(pastBatch, aspect);

    if (recentStats.negative === 0) continue; // No issues for this aspect

    const spikeAlert = detectIssueSpike(recentStats, pastStats, aspect);
    if (spikeAlert) {
      aspectAlerts.push(spikeAlert);
    }
  }

  // Sort by severity and add top 3 aspect alerts
  aspectAlerts.sort((a, b) => {
    const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (
      (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99)
    );
  });

  for (const alert of aspectAlerts.slice(0, 3)) {
    alerts.push({
      type:
        alert.severity === "CRITICAL"
          ? "danger"
          : alert.severity === "HIGH"
            ? "warning"
            : "info",
      message: alert.message,
      severity: alert.severity,
      trend: alert.type,
      aspect: alert.aspect,
      stats: alert.stats,
    });
  }

  // 3. Spam/quality issues
  const spamCount = reviewsDB.filter((r) => r.spamAnalysis?.isSpam).length;
  if (spamCount >= 3) {
    alerts.push({
      type: "warning",
      message: `⚠️ Spam detected: ${spamCount} suspicious reviews identified`,
      severity: "MEDIUM",
    });
  }

  return alerts.slice(0, 5); // Return top 5 alerts
}

/**
 * Get detailed trend analysis
 */
function getTrendAnalysis(reviewsDB, categoryFilter = null) {
  const filtered = categoryFilter
    ? reviewsDB.filter((r) => r.category === categoryFilter)
    : reviewsDB;

  if (filtered.length === 0) {
    return {
      summary: "No data available",
      trend: "UNKNOWN",
      alerts: [],
    };
  }

  const sentimentTrend = detectSentimentTrend(filtered);
  const alerts = detectTrends(filtered);

  return {
    summary: sentimentTrend.message,
    trend: sentimentTrend.trend,
    alerts,
    statistics: {
      total: filtered.length,
      recent: sentimentTrend.recentStats,
      historical: sentimentTrend.pastStats,
    },
  };
}

module.exports = {
  detectTrends,
  detectSentimentTrend,
  detectIssueSpike,
  calculateBatchStats,
  categorizeIssue,
  getTrendAnalysis,
  calculateAdaptiveThreshold,
  applyRecencyWeighting,
  calculateConfidenceInterval,
};
