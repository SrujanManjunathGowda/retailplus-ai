/**
 * Intelligent Insights & Recommendations Engine
 * Generates actionable, human-readable business recommendations
 */

/**
 * Generate business intelligence insights from review data
 */
function generateInsights(reviewsDB, cxMetrics, topComplaints, topPraise) {
  const insights = [];

  if (!reviewsDB || reviewsDB.length === 0) return insights;

  const csat = parseFloat(cxMetrics?.csat?.replace("%", "") || 0);
  const nps = parseInt(cxMetrics?.nps || 0);
  const ces = parseFloat(cxMetrics?.ces?.split("/")[0] || 3);

  // Insight 1: CSAT Status
  if (csat >= 80) {
    insights.push({
      category: "CSAT",
      severity: "positive",
      title: "✅ Excellent Customer Satisfaction",
      message: `CSAT is at ${csat}% - Well above industry average (70%)`,
      action:
        "Maintain current quality standards and communicate achievements internally",
      impact: "High customer loyalty and positive word-of-mouth",
    });
  } else if (csat >= 70) {
    insights.push({
      category: "CSAT",
      severity: "warning",
      title: "⚠️ CSAT at Acceptable Level",
      message: `CSAT is ${csat}% - Near average but room for improvement`,
      action: "Focus on improving top complaint areas to reach 80%+",
      impact: "Potential 10-15% improvement in customer retention",
    });
  } else {
    insights.push({
      category: "CSAT",
      severity: "critical",
      title: "🔴 CSAT Below Target",
      message: `CSAT is only ${csat}% - Significant customer dissatisfaction`,
      action:
        "Emergency meeting with product/service teams to identify root causes",
      impact: "High churn risk - immediate action required",
    });
  }

  // Insight 2: NPS Analysis
  if (nps > 50) {
    insights.push({
      category: "NPS",
      severity: "positive",
      title: "🌟 Strong Net Promoter Score",
      message: `NPS is +${nps} - Customers actively recommend your product`,
      action: "Encourage promoters to leave reviews and refer friends",
      impact: "Likely to achieve >40% organic growth",
    });
  } else if (nps > 0) {
    insights.push({
      category: "NPS",
      severity: "warning",
      title: "🎯 Moderate NPS",
      message: `NPS is +${nps} - Mixed customer sentiment`,
      action:
        "Convert passives into promoters by addressing neutral review themes",
      impact: "Potential to gain 20-30% more advocates",
    });
  } else {
    insights.push({
      category: "NPS",
      severity: "critical",
      title: "⚠️ Low or Negative NPS",
      message: `NPS is ${nps} - More detractors than promoters`,
      action:
        "Retain detractors with outreach program; identify common complaints",
      impact: "High risk of negative word-of-mouth",
    });
  }

  // Insight 3: CES Analysis
  if (ces < 2.5) {
    insights.push({
      category: "CES",
      severity: "positive",
      title: "✅ Low Customer Effort",
      message: `CES is ${ces}/5 - Customers find it easy to do business with you`,
      action: "Document and scale your simplified processes",
      impact: "Lower support costs, higher satisfaction",
    });
  } else if (ces < 3.5) {
    insights.push({
      category: "CES",
      severity: "warning",
      title: "⚠️ Moderate Customer Effort",
      message: `CES is ${ces}/5 - Some friction points in customer journey`,
      action:
        "Streamline process: reduce steps, improve documentation, faster support response",
      impact: "Potential to reduce support burden by 20-30%",
    });
  } else {
    insights.push({
      category: "CES",
      severity: "critical",
      title: "🔴 High Customer Effort",
      message: `CES is ${ces}/5 - Customers struggle with your processes`,
      action: "Audit entire customer journey for friction points",
      impact: "High churn risk due to effort required",
    });
  }

  // Insight 4: Top Complaints Analysis
  if (topComplaints && topComplaints.length > 0) {
    const topComplaint = topComplaints[0];
    const complaintPercentage = topComplaint.percentage;

    if (complaintPercentage > 25) {
      insights.push({
        category: "ISSUES",
        severity: "critical",
        title: `🚨 Systemic Issue: ${topComplaint.aspect}`,
        message: `${complaintPercentage}% of reviews mention ${topComplaint.aspect} negatively (${topComplaint.count} mentions)`,
        action: `Create task force to address ${topComplaint.aspect} issues within 7 days`,
        impact: `Fixing this alone could improve CSAT by ${Math.min(15, Math.round(complaintPercentage / 2))}%`,
      });
    } else if (complaintPercentage > 10) {
      insights.push({
        category: "ISSUES",
        severity: "warning",
        title: `⚠️ Recurring Issue: ${topComplaint.aspect}`,
        message: `${complaintPercentage}% of customers complain about ${topComplaint.aspect}`,
        action: `Investigate root cause of ${topComplaint.aspect} issues and create improvement plan`,
        impact: `Could improve CSAT by ${Math.round(complaintPercentage / 2)}%`,
      });
    } else if (topComplaints.length > 2) {
      insights.push({
        category: "ISSUES",
        severity: "info",
        title: "📋 Multiple Minor Issues",
        message: `Top issues: ${topComplaints
          .slice(0, 3)
          .map((c) => c.aspect)
          .join(", ")}`,
        action: "Prioritize by frequency and impact on CES",
        impact: "Addressing all 3 could improve CSAT by 10%",
      });
    }
  }

  // Insight 5: Top Praise Analysis
  if (topPraise && topPraise.length > 0) {
    const topStrength = topPraise[0];
    insights.push({
      category: "STRENGTHS",
      severity: "positive",
      title: `⭐ Key Strength: ${topStrength.aspect}`,
      message: `${topStrength.percentage}% of reviews praise ${topStrength.aspect} (${topStrength.count} mentions)`,
      action: `Feature this strength in marketing campaigns and case studies`,
      impact: `Use as differentiator vs. competitors`,
    });
  }

  // Insight 6: Multilingual Sentiment
  const hinglishReviews = reviewsDB.filter((r) => r.language === "hinglish");
  if (hinglishReviews.length > reviewsDB.length * 0.1) {
    const hinglishSentiment = calculateAverageSentiment(hinglishReviews);
    insights.push({
      category: "MULTILINGUAL",
      severity: "info",
      title: `🌐 Hinglish Segment Insight`,
      message: `${hinglishReviews.length} Hinglish reviews (${Math.round((hinglishReviews.length / reviewsDB.length) * 100)}%) show ${hinglishSentiment} sentiment`,
      action: "Consider targeted communications in Hindi/regional languages",
      impact: "Better engagement with regional markets",
    });
  }

  // Insight 7: Category-Level Intelligence
  const categories = collectCategories(reviewsDB);
  const categoryInsights = analyzeCategories(categories);
  insights.push(...categoryInsights);

  // Insight 8: Department Routing
  const departments = getDepartmentLoad(reviewsDB);
  const overloadedDept = Object.entries(departments).sort(
    ([, a], [, b]) => b - a,
  )[0];

  if (overloadedDept && overloadedDept[1] > reviewsDB.length * 0.4) {
    insights.push({
      category: "OPERATIONS",
      severity: "warning",
      title: `📦 Department Overload: ${overloadedDept[0]}`,
      message: `${overloadedDept[0]} is handling ${Math.round((overloadedDept[1] / reviewsDB.length) * 100)}% of routed issues`,
      action: `Consider expanding team or improving process for ${overloadedDept[0].toLowerCase()}`,
      impact: "Better resource allocation and faster issue resolution",
    });
  }

  return insights;
}

/**
 * Calculate average sentiment for a set of reviews
 */
function calculateAverageSentiment(reviews) {
  if (reviews.length === 0) return "neutral";

  let positiveCount = 0;
  reviews.forEach((r) => {
    if (r.overallSentiment === "positive" || r.overallSentiment === "mixed") {
      positiveCount++;
    }
  });

  const ratio = positiveCount / reviews.length;
  return ratio > 0.6 ? "positive" : ratio > 0.4 ? "mixed" : "negative";
}

/**
 * Collect category distribution
 */
function collectCategories(reviews) {
  const categories = {};
  reviews.forEach((r) => {
    const category = r.category || "general";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(r);
  });
  return categories;
}

/**
 * Analyze category-level performance
 */
function analyzeCategories(categories) {
  const insights = [];

  const categoryPerformance = Object.entries(categories).map(
    ([name, reviews]) => {
      const positive = reviews.filter(
        (r) =>
          r.overallSentiment === "positive" || r.overallSentiment === "mixed",
      ).length;
      const satisfactionRate = (positive / reviews.length) * 100;

      return { name, satisfaction: satisfactionRate, count: reviews.length };
    },
  );

  // Find best and worst categories
  const sorted = categoryPerformance.sort(
    (a, b) => b.satisfaction - a.satisfaction,
  );

  if (sorted.length > 0) {
    const best = sorted[0];
    if (best.satisfaction > 70) {
      insights.push({
        category: "CATEGORIES",
        severity: "positive",
        title: `🏆 Best Performer: ${best.name}`,
        message: `${best.name} has ${best.satisfaction.toFixed(0)}% satisfaction (${best.count} reviews)`,
        action: "Study best practices from this category for others",
        impact: "Can improve other categories by 10-15%",
      });
    }

    const worst = sorted[sorted.length - 1];
    if (worst.satisfaction < 50) {
      insights.push({
        category: "CATEGORIES",
        severity: "critical",
        title: `⚠️ Problem Category: ${worst.name}`,
        message: `${worst.name} has only ${worst.satisfaction.toFixed(0)}% satisfaction (${worst.count} reviews)`,
        action: `Deep-dive analysis needed for ${worst.name} category`,
        impact: "Fixing this category could improve overall CSAT by 5-10%",
      });
    }
  }

  return insights;
}

/**
 * Get department load distribution
 */
function getDepartmentLoad(reviews) {
  const departments = {};
  reviews.forEach((r) => {
    const dept = r.department || "General";
    departments[dept] = (departments[dept] || 0) + 1;
  });
  return departments;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  cxMetrics,
  topComplaints,
  topPraise,
  trends,
  statistics,
) {
  const recommendations = [];

  const csat = parseFloat(cxMetrics?.csat?.replace("%", "") || 0);

  // Recommendation 1: Quick Wins (quick improvements)
  if (topComplaints && topComplaints.length > 0) {
    const quickWin = topComplaints[0];
    recommendations.push({
      priority: "HIGH",
      timeframe: "7-14 days",
      title: `Address Top Complaint: ${quickWin.aspect}`,
      details: `Currently mentioned in ${quickWin.percentage}% of negative reviews`,
      steps: [
        `1. Form cross-functional task force on ${quickWin.aspect}`,
        `2. Analyze root cause from top 5 negative reviews`,
        `3. Implement quick fix and pilot with 10% of customers`,
        `4. Roll out fix to all customers`,
        `5. Track improvement over next 30 days`,
      ],
      expectedImpact: `+${Math.min(20, quickWin.percentage / 2 + 5)}% CSAT improvement`,
      successMetric: `Reduce ${quickWin.aspect} complaints by 50%`,
    });
  }

  // Recommendation 2: Process Improvement
  recommendations.push({
    priority: "MEDIUM",
    timeframe: "30 days",
    title: "Streamline Customer Journey",
    details: `Current CES shows room for improvement in process efficiency`,
    steps: [
      "1. Map entire customer journey (order → delivery → support)",
      '2. Identify friction points using "Why" analysis',
      "3. Prioritize top 3 friction points",
      "4. Implement solutions (automation, reduction of steps)",
      "5. Measure CES improvement",
    ],
    expectedImpact: "CES reduction by 0.5-1.0 points",
    successMetric: "Achieve CES < 2.5",
  });

  // Recommendation 3: Customer Segmentation
  if (csat < 70) {
    recommendations.push({
      priority: "HIGH",
      timeframe: "14 days",
      title: "Proactive Outreach to At-Risk Customers",
      details: "Identify and retain customers with negative sentiment",
      steps: [
        "1. Segment customers by NPS (promoters, passives, detractors)",
        "2. For detractors: Assign account manager for personal outreach",
        "3. Understand specific issues and offer solutions",
        "4. Implement retention incentives for high-value detractors",
        "5. Track conversion rate over 60 days",
      ],
      expectedImpact: "30-40% detractor recovery rate",
      successMetric: "NPS improvement by +10 points",
    });
  }

  // Recommendation 4: Leverage Strengths
  if (topPraise && topPraise.length > 0) {
    const strength = topPraise[0];
    recommendations.push({
      priority: "MEDIUM",
      timeframe: "21 days",
      title: `Amplify Key Strength: ${strength.aspect}`,
      details: `${strength.percentage}% of customers praise this, use as differentiator`,
      steps: [
        `1. Document your ${strength.aspect} competitive advantage`,
        `2. Create case studies featuring ${strength.aspect} benefits`,
        `3. Train sales team to mention in conversations`,
        `4. Feature in marketing campaigns and social media`,
        `5. Measure brand perception improvement`,
      ],
      expectedImpact: "Increase brand preference by 15-20%",
      successMetric: "Higher conversion rate in sales funnel",
    });
  }

  // Recommendation 5: Quality Assurance
  recommendations.push({
    priority: "MEDIUM",
    timeframe: "30-60 days",
    title: "Implement QA Program",
    details: "Prevent recurring issues through quality checks",
    steps: [
      "1. Design QA checklist based on top complaints",
      "2. Train team on quality standards",
      "3. Implement pre-delivery/pre-support quality check",
      "4. Track defect rates weekly",
      "5. Continuous improvement cycle",
    ],
    expectedImpact: "50-70% reduction in quality-related complaints",
    successMetric: "Zero critical issues for 30 consecutive days",
  });

  // Recommendation 6: Feedback Loop
  recommendations.push({
    priority: "LOW",
    timeframe: "Ongoing",
    title: "Establish Continuous Feedback Loop",
    details: "Make customer feedback part of product development",
    steps: [
      "1. Monthly review of customer feedback trends",
      "2. Quarterly business reviews with all departments",
      "3. Bi-annual customer advisory board meetings",
      "4. Real-time alerts for emerging issues",
      "5. Closed-loop follow-up on critical issues",
    ],
    expectedImpact: "Faster issue resolution, better product fit",
    successMetric: "Issue resolution time < 48 hours",
  });

  return recommendations;
}

/**
 * Generate executive summary
 */
function generateExecutiveSummary(reviewsDB, cxMetrics, insights) {
  const csat = parseFloat(cxMetrics?.csat?.replace("%", "") || 0);
  const nps = parseInt(cxMetrics?.nps || 0);
  const ces = parseFloat(cxMetrics?.ces?.split("/")[0] || 3);

  let overallStatus = "HEALTHY";
  let statusIcon = "✅";
  let statusDescription = "Performance within target ranges";

  if (csat < 70 || nps < 0 || ces > 3.5) {
    overallStatus = "AT RISK";
    statusIcon = "⚠️";
    statusDescription = "One or more metrics below target - action recommended";
  }

  if (csat < 60 || nps < -20 || ces > 4.0) {
    overallStatus = "CRITICAL";
    statusIcon = "🔴";
    statusDescription =
      "Multiple metrics in critical zone - immediate action required";
  }

  return {
    timestamp: new Date().toISOString(),
    reviewsAnalyzed: reviewsDB.length,
    overallStatus,
    statusIcon,
    statusDescription,
    metrics: {
      csat: `${csat}%`,
      nps: `${nps > 0 ? "+" : ""}${nps}`,
      ces: `${ces}/5`,
    },
    topInsight: insights.length > 0 ? insights[0] : null,
    needsAttention: insights.filter(
      (i) => i.severity === "critical" || i.severity === "warning",
    ).length,
    totalInsights: insights.length,
  };
}

/**
 * Filter reviews by confidence threshold
 * Returns reviews above a minimum confidence level
 */
function filterByConfidence(reviews, minConfidence = 60) {
  if (!Array.isArray(reviews)) return [];

  return reviews.filter((r) => {
    const confidence = r.overallConfidence || r.sentiment?.confidence || 0;
    return confidence >= minConfidence;
  });
}

/**
 * Weight reviews by confidence for aggregation
 * Returns normalized confidence weights for statistical analysis
 */
function getConfidenceWeights(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return [];

  return reviews.map((r) => {
    const confidence = Math.max(0, Math.min(100, r.overallConfidence || 50));
    // Normalize to 0.5-1.0 range (even low confidence reviews have some weight)
    return (confidence / 100) * 0.5 + 0.5;
  });
}

/**
 * Calculate weighted average sentiment
 * Gives more weight to high-confidence reviews
 */
function calculateWeightedAverageSentiment(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) return "neutral";

  const weights = getConfidenceWeights(reviews);
  let positiveScore = 0;
  let negativeScore = 0;
  let totalWeight = 0;

  reviews.forEach((review, idx) => {
    const sentiment = review.overallSentiment || "neutral";
    const weight = weights[idx];

    if (sentiment === "positive") positiveScore += weight;
    else if (sentiment === "negative") negativeScore += weight;

    totalWeight += weight;
  });

  if (totalWeight === 0) return "neutral";

  const positiveRatio = positiveScore / totalWeight;
  const negativeRatio = negativeScore / totalWeight;

  if (positiveRatio > 0.6) return "positive";
  if (negativeRatio > 0.6) return "negative";
  return "mixed";
}

/**
 * Get confidence distribution statistics
 * Useful for understanding review data quality
 */
function getConfidenceDistribution(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return { avg: 0, min: 0, max: 0, stdDev: 0, high: 0, medium: 0, low: 0 };
  }

  const confidences = reviews.map((r) => r.overallConfidence || 50);
  const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;
  const min = Math.min(...confidences);
  const max = Math.max(...confidences);

  const variance =
    confidences.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) /
    confidences.length;
  const stdDev = Math.sqrt(variance);

  const high = confidences.filter((c) => c >= 80).length;
  const medium = confidences.filter((c) => c >= 60 && c < 80).length;
  const low = confidences.filter((c) => c < 60).length;

  return {
    average: Math.round(avg),
    min: Math.round(min),
    max: Math.round(max),
    stdDev: Math.round(stdDev),
    highConfidence: high,
    mediumConfidence: medium,
    lowConfidence: low,
    highConfidenceRatio: Math.round((high / confidences.length) * 100),
    dataQuality:
      high > confidences.length * 0.7
        ? "HIGH"
        : high > confidences.length * 0.5
          ? "MEDIUM"
          : "LOW",
  };
}

/**
 * Identify high-confidence consensus
 * Returns sentiments that multiple high-confidence reviews agree on
 */
function getHighConfidenceConsensus(
  reviews,
  minConfidence = 75,
  minAgreement = 0.6,
) {
  if (!Array.isArray(reviews)) return null;

  const highConfReviews = reviews.filter(
    (r) => (r.overallConfidence || 0) >= minConfidence,
  );

  if (highConfReviews.length < 2) return null;

  const sentiments = highConfReviews.map(
    (r) => r.overallSentiment || "neutral",
  );
  const positive = sentiments.filter((s) => s === "positive").length;
  const negative = sentiments.filter((s) => s === "negative").length;
  const neutral = sentiments.filter((s) => s === "neutral").length;
  const mixed = sentiments.filter((s) => s === "mixed").length;

  const total = sentiments.length;
  const maxAgreement = Math.max(positive, negative, neutral, mixed) / total;

  if (maxAgreement < minAgreement) return null;

  if (positive === Math.max(positive, negative, neutral, mixed)) {
    return {
      consensus: "positive",
      agreement: Math.round((positive / total) * 100),
      reviewCount: total,
    };
  } else if (negative === Math.max(positive, negative, neutral, mixed)) {
    return {
      consensus: "negative",
      agreement: Math.round((negative / total) * 100),
      reviewCount: total,
    };
  }

  return null;
}

module.exports = {
  generateInsights,
  generateRecommendations,
  generateExecutiveSummary,
  collectCategories,
  analyzeCategories,
  getDepartmentLoad,
  calculateAverageSentiment,
  filterByConfidence,
  getConfidenceWeights,
  calculateWeightedAverageSentiment,
  getConfidenceDistribution,
  getHighConfidenceConsensus,
};
