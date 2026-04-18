/**
 * CX Metrics Engine - Convert sentiment to business KPIs
 * CSAT: Customer Satisfaction Score (0-100%)
 * NPS: Net Promoter Score (-100 to +100)
 * CES: Customer Effort Score (1-5, lower is better)
 */

/**
 * Calculate CSAT (Customer Satisfaction Score)
 * Based on positive vs negative sentiment
 * Formula: (Positive Reviews / Total Reviews) * 100
 */
function calculateCSAT(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  // Count sentiments with weighted confidence
  let satisfactionScore = 0;
  let totalWeight = 0;

  reviews.forEach((review) => {
    const sentiment = review.overallSentiment?.toLowerCase();
    const confidence = (review.overallConfidence || 0) / 100;

    let sentimentValue = 0;
    if (sentiment === "positive" || sentiment === "mixed") {
      // Positive = 100, Mixed = 50
      sentimentValue = sentiment === "positive" ? 100 : 50;
    } else if (sentiment === "neutral") {
      sentimentValue = 50;
    } else if (sentiment === "negative") {
      sentimentValue = 0;
    }

    satisfactionScore += sentimentValue * confidence;
    totalWeight += confidence;
  });

  return totalWeight > 0 ? Math.round(satisfactionScore / totalWeight) : 0;
}

/**
 * Calculate NPS (Net Promoter Score)
 * Formula: % Promoters - % Detractors
 * Promoters: positive sentiment (score 9-10)
 * Passives: neutral sentiment (score 7-8)
 * Detractors: negative sentiment (score 0-6)
 * Weighted by confidence scores
 */
function calculateNPS(reviews) {
  if (!reviews || reviews.length === 0) return 0;

  let promoters = 0;
  let detractors = 0;
  let total = 0;

  reviews.forEach((review) => {
    const sentiment = review.overallSentiment?.toLowerCase();
    const confidence = Math.max(0.3, (review.overallConfidence || 0) / 100); // Min 0.3 weight

    if (
      (sentiment === "positive" || sentiment === "mixed") &&
      confidence > 0.6
    ) {
      promoters += confidence;
    } else if (sentiment === "negative") {
      detractors += confidence;
    }

    total += confidence;
  });

  const nps = total > 0 ? ((promoters - detractors) / total) * 100 : 0;
  return Math.round(nps);
}

/**
 * Calculate CES (Customer Effort Score)
 * Lower is better (1-5 scale)
 * Based on sentiment and presence of friction keywords
 * Weighted by confidence scores
 */
function calculateCES(reviews) {
  if (!reviews || reviews.length === 0) return 3;

  const frictionKeywords = [
    "difficult",
    "hard",
    "complicated",
    "confusing",
    "frustrating",
    "annoying",
    "inconvenient",
    "hassle",
    "pain",
    "slow",
    "delayed",
    "error",
    "problem",
    "issue",
    "broken",
    "not working",
    "doesn't work",
    "quality issue",
    "defect",
  ];

  let effortSum = 0;
  let totalWeight = 0;

  reviews.forEach((review) => {
    const text = (review.text || review.originalText || "").toLowerCase();
    const sentiment = review.overallSentiment?.toLowerCase();
    const confidence = Math.max(0.3, (review.overallConfidence || 0) / 100); // Min 0.3 weight

    // Base effort score on sentiment
    let effortScore = 3; // Neutral baseline

    if (sentiment === "positive") {
      effortScore = 1; // Least effort
    } else if (sentiment === "negative") {
      effortScore = 5; // Most effort
    }

    // Check for friction keywords
    const hasFriction = frictionKeywords.some((keyword) =>
      text.includes(keyword),
    );
    if (hasFriction && effortScore < 5) {
      effortScore = Math.min(5, effortScore + 1);
    }

    effortSum += effortScore * confidence;
    totalWeight += confidence;
  });

  const avgCES = totalWeight > 0 ? (effortSum / totalWeight).toFixed(1) : 3;
  return parseFloat(avgCES);
}

/**
 * Calculate CES Extended with aspect-level effort
 */
function calculateAdvancedCES(reviews) {
  if (!reviews || reviews.length === 0) return { overall: 3, byAspect: {} };

  const effortByAspect = {};
  let totalEffort = 0;

  reviews.forEach((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspects
        ? Object.entries(review.aspects).map(([k, v]) => ({ aspect: k, ...v }))
        : [];

    aspects.forEach((aspect) => {
      const aspectName = aspect.aspect || Object.keys(aspect)[0];
      if (!aspectName || aspectName === "general") return;

      const sentiment = aspect.sentiment?.toLowerCase();

      let effortScore = 3;
      if (sentiment === "positive") effortScore = 1;
      if (sentiment === "negative") effortScore = 5;
      if (sentiment === "neutral") effortScore = 3;

      if (!effortByAspect[aspectName]) {
        effortByAspect[aspectName] = { total: 0, count: 0 };
      }

      effortByAspect[aspectName].total += effortScore;
      effortByAspect[aspectName].count++;
    });

    totalEffort += parseFloat(calculateCES([review]).toFixed(1));
  });

  const byAspect = {};
  for (const [aspect, data] of Object.entries(effortByAspect)) {
    byAspect[aspect] = parseFloat((data.total / data.count).toFixed(1));
  }

  return {
    overall: parseFloat((totalEffort / reviews.length).toFixed(1)),
    byAspect,
  };
}

/**
 * Identify Top Complaints (Negative Aspects)
 */
function getTopComplaints(reviews, limit = 5) {
  const complaintMap = {};

  reviews.forEach((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspects
        ? Object.entries(review.aspects).map(([k, v]) => ({ aspect: k, ...v }))
        : [];

    aspects.forEach((aspect) => {
      const aspectName = aspect.aspect || Object.keys(aspect)[0];
      if (!aspectName || aspectName === "general") return;

      const sentiment = aspect.sentiment?.toLowerCase();
      if (sentiment === "negative") {
        if (!complaintMap[aspectName]) {
          complaintMap[aspectName] = { count: 0, intensity: 0 };
        }
        complaintMap[aspectName].count++;
        complaintMap[aspectName].intensity += (aspect.confidence || 50) / 100;
      }
    });
  });

  return Object.entries(complaintMap)
    .map(([aspect, data]) => ({
      aspect,
      count: data.count,
      avgConfidence: Math.round((data.intensity / data.count) * 100),
      percentage: Math.round((data.count / reviews.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Identify Top Praise (Positive Aspects)
 */
function getTopPraise(reviews, limit = 5) {
  const praiseMap = {};

  reviews.forEach((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspects
        ? Object.entries(review.aspects).map(([k, v]) => ({ aspect: k, ...v }))
        : [];

    aspects.forEach((aspect) => {
      const aspectName = aspect.aspect || Object.keys(aspect)[0];
      if (!aspectName || aspectName === "general") return;

      const sentiment = aspect.sentiment?.toLowerCase();
      if (sentiment === "positive") {
        if (!praiseMap[aspectName]) {
          praiseMap[aspectName] = { count: 0, intensity: 0 };
        }
        praiseMap[aspectName].count++;
        praiseMap[aspectName].intensity += (aspect.confidence || 50) / 100;
      }
    });
  });

  return Object.entries(praiseMap)
    .map(([aspect, data]) => ({
      aspect,
      count: data.count,
      avgConfidence: Math.round((data.intensity / data.count) * 100),
      percentage: Math.round((data.count / reviews.length) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Generate comprehensive CX report
 */
function generateCXReport(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      csat: 0,
      nps: 0,
      ces: 3,
      topComplaints: [],
      topPraise: [],
      sentimentDistribution: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
      confidenceStats: { avg: 0, min: 0, max: 0 },
    };
  }

  const csat = calculateCSAT(reviews);
  const nps = calculateNPS(reviews);
  const cesData = calculateAdvancedCES(reviews);
  const topComplaints = getTopComplaints(reviews);
  const topPraise = getTopPraise(reviews);

  // Sentiment distribution
  const sentimentDist = { positive: 0, negative: 0, neutral: 0, mixed: 0 };
  reviews.forEach((review) => {
    const sentiment = review.overallSentiment?.toLowerCase() || "neutral";
    if (sentimentDist.hasOwnProperty(sentiment)) {
      sentimentDist[sentiment]++;
    }
  });

  // Confidence stats
  const confidences = reviews
    .map((r) => r.overallConfidence || 0)
    .filter((c) => c > 0);
  const confidenceStats = {
    avg: Math.round(
      confidences.reduce((a, b) => a + b, 0) / confidences.length,
    ),
    min: Math.min(...confidences),
    max: Math.max(...confidences),
  };

  return {
    csat,
    nps,
    cesOverall: cesData.overall,
    cesByAspect: cesData.byAspect,
    totalReviews: reviews.length,
    topComplaints,
    topPraise,
    sentimentDistribution: sentimentDist,
    confidenceStats,
    spamCount: reviews.filter((r) => r.spamAnalysis?.isSpam).length,
    duplicateCount: reviews.filter((r) => r.isDuplicate).length,
  };
}

/**
 * Identify at-risk customers (high complaints, low satisfaction)
 */
function identifyAtRiskCustomers(reviews, threshold = 0.3) {
  return reviews.filter((review) => {
    const sentiment = review.overallSentiment?.toLowerCase();
    const confidence = (review.overallConfidence || 0) / 100;

    // At-risk if strongly negative
    return (
      (sentiment === "negative" && confidence > threshold) ||
      (sentiment === "mixed" && confidence > 0.7)
    );
  });
}

/**
 * Calculate aspect-specific satisfaction
 */
function getAspectSatisfaction(reviews) {
  const aspectSatisfaction = {};
  const aspectCounts = {};

  reviews.forEach((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspects
        ? Object.entries(review.aspects).map(([k, v]) => ({ aspect: k, ...v }))
        : [];

    aspects.forEach((aspect) => {
      const aspectName = aspect.aspect || Object.keys(aspect)[0];
      if (!aspectName || aspectName === "general") return;

      if (!aspectSatisfaction[aspectName]) {
        aspectSatisfaction[aspectName] = 0;
        aspectCounts[aspectName] = 0;
      }

      const sentiment = aspect.sentiment?.toLowerCase();
      const value =
        sentiment === "positive" ? 100 : sentiment === "neutral" ? 50 : 0;

      aspectSatisfaction[aspectName] += value;
      aspectCounts[aspectName]++;
    });
  });

  const result = {};
  for (const [aspect, total] of Object.entries(aspectSatisfaction)) {
    result[aspect] = {
      satisfaction: Math.round(total / aspectCounts[aspect]),
      mentions: aspectCounts[aspect],
    };
  }

  return result;
}

module.exports = {
  calculateCSAT,
  calculateNPS,
  calculateCES,
  calculateAdvancedCES,
  getTopComplaints,
  getTopPraise,
  generateCXReport,
  identifyAtRiskCustomers,
  getAspectSatisfaction,
};
