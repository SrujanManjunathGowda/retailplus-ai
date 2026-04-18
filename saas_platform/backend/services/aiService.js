const { Groq } = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

let groqClient = null;
const MODEL_NAME = "llama-3.1-8b-instant";

/**
 * Initialize Groq client
 */
async function initGroqModel() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not configured in environment variables",
      );
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log(`✓ Groq AI Model Initialized: ${MODEL_NAME}`);
  }
  return groqClient;
}

/**
 * Analyze review sentiment using Groq AI
 */
async function analyzeSentiment(reviewText) {
  if (!reviewText || reviewText.length < 3) {
    return {
      status: "invalid",
      overallSentiment: "neutral",
      overallConfidence: 0,
      explanation: "Invalid or too short review text",
      priority: "LOW",
      impactAnalysis: "None",
      aspects: { general: { sentiment: "neutral", confidence: 0 } },
      insights: [],
      suggestedActions: [],
    };
  }

  if (!groqClient) {
    await initGroqModel();
  }

  const systemPrompt = `You are an expert AI Sentiment Analysis Engine for retail reviews. Analyze the customer review carefully:

1. Identify sentiment: positive, negative, neutral, or mixed
2. Rate confidence (0-100) based on clarity and detail
3. Extract key aspects mentioned (product quality, delivery, service, price, etc.)
4. Provide actionable insights and suggested actions
5. Assign priority based on sentiment and impact

Return ONLY valid JSON (no markdown) with this exact structure:
{
  "overallSentiment": "positive|negative|neutral|mixed",
  "overallConfidence": 85,
  "explanation": "Brief analytical summary",
  "priority": "HIGH|MEDIUM|LOW",
  "impactAnalysis": "How this affects business",
  "department": "Product Team|Logistics|Customer Service|General",
  "aspects": {
    "product": {"sentiment": "positive", "confidence": 90},
    "delivery": {"sentiment": "neutral", "confidence": 70}
  },
  "insights": ["Key insight 1", "Key insight 2"],
  "suggestedActions": ["Action 1", "Action 2"]
}`;

  try {
    console.log(`[Groq] Analyzing: "${reviewText.substring(0, 50)}..."`);

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: reviewText },
      ],
      model: MODEL_NAME,
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 500,
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    const analysis = JSON.parse(responseContent);

    return {
      status: "valid",
      overallSentiment: analysis.overallSentiment || "neutral",
      overallConfidence: analysis.overallConfidence || 70,
      explanation: analysis.explanation || "Analyzed via Groq AI",
      priority: analysis.priority || "MEDIUM",
      impactAnalysis: analysis.impactAnalysis || "Standard impact",
      department: analysis.department || "General",
      aspects: analysis.aspects || {
        general: { sentiment: "neutral", confidence: 70 },
      },
      insights: analysis.insights || [],
      suggestedActions: analysis.suggestedActions || [],
    };
  } catch (error) {
    console.error("[Groq] Analysis failed:", error.message);
    return generateFallbackAnalysis(reviewText);
  }
}

/**
 * Extract key aspects from review
 */
function extractAspects(reviewText) {
  const aspectKeywords = {
    product: [
      "product",
      "item",
      "quality",
      "built",
      "material",
      "design",
      "device",
      "battery",
      "camera",
      "build",
    ],
    delivery: [
      "delivery",
      "shipping",
      "packaging",
      "arrived",
      "received",
      "late",
      "fast",
      "delay",
      "courier",
    ],
    price: [
      "price",
      "cost",
      "expensive",
      "cheap",
      "value",
      "money",
      "affordable",
      "worth",
    ],
    service: [
      "service",
      "support",
      "staff",
      "customer",
      "response",
      "refund",
      "return",
      "help",
    ],
  };

  const aspects = {};
  const textLower = reviewText.toLowerCase();

  Object.entries(aspectKeywords).forEach(([aspectName, keywords]) => {
    const found = keywords.some((keyword) => textLower.includes(keyword));
    if (found) {
      aspects[aspectName] = {
        mentioned: true,
        confidence: 0.8,
      };
    }
  });

  return aspects;
}

/**
 * Generate fallback analysis when API fails
 */
function generateFallbackAnalysis(text) {
  const hasPositiveWords =
    /excellent|great|amazing|love|perfect|best|wonderful/i.test(text);
  const hasNegativeWords = /terrible|awful|bad|hate|worst|horrible|poor/i.test(
    text,
  );

  let sentiment = "neutral";
  if (hasPositiveWords && !hasNegativeWords) sentiment = "positive";
  else if (hasNegativeWords && !hasPositiveWords) sentiment = "negative";
  else if (hasPositiveWords && hasNegativeWords) sentiment = "mixed";

  return {
    status: "fallback",
    overallSentiment: sentiment,
    overallConfidence: 50,
    explanation: "Analyzed with fallback logic (API unavailable)",
    priority: sentiment === "negative" ? "HIGH" : "MEDIUM",
    impactAnalysis: "Requires manual review",
    department: "General",
    aspects: extractAspects(text),
    insights: ["Review requires Groq API for detailed analysis"],
    suggestedActions: ["Retry analysis", "Manual review recommended"],
  };
}

/**
 * Calculate CX metrics from reviews
 */
function calculateCXMetrics(reviews) {
  if (!reviews || reviews.length === 0) {
    return {
      csat: 0,
      nps: 0,
      ces: 3,
      totalReviews: 0,
      sentimentBreakdown: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
      averageConfidence: 0,
    };
  }

  const sentimentCounts = {
    positive: 0,
    negative: 0,
    neutral: 0,
    mixed: 0,
  };

  let totalConfidence = 0;
  let promoters = 0;
  let detractors = 0;

  reviews.forEach((review) => {
    const sentiment = review.overallSentiment?.toLowerCase() || "neutral";
    const confidence = (review.overallConfidence || 0) / 100;

    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
    totalConfidence += review.overallConfidence || 0;

    if (sentiment === "positive" && confidence > 0.6) promoters++;
    else if (sentiment === "negative") detractors++;
  });

  const csat = Math.round(
    ((sentimentCounts.positive + sentimentCounts.mixed * 0.5) /
      reviews.length) *
      100,
  );
  const nps = Math.round(((promoters - detractors) / reviews.length) * 100);
  const avgConfidence = Math.round(totalConfidence / reviews.length);

  return {
    csat,
    nps,
    ces: 3, // Default medium effort
    totalReviews: reviews.length,
    sentimentBreakdown: sentimentCounts,
    averageConfidence: avgConfidence,
  };
}

/**
 * Generate executive summary from reviews
 */
function generateExecutiveSummary(reviews) {
  const metrics = calculateCXMetrics(reviews);
  const topAspects = getTopAspects(reviews);
  const topInsights = getTopInsights(reviews);

  return {
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    metrics,
    topAspects,
    keyInsights: topInsights,
    recommendations: generateRecommendations(metrics, topAspects),
  };
}

/**
 * Extract top aspects from reviews
 */
function getTopAspects(reviews) {
  const aspectCounts = {};

  reviews.forEach((review) => {
    Object.entries(review.aspects || {}).forEach(([aspect, data]) => {
      if (!aspectCounts[aspect]) {
        aspectCounts[aspect] = { count: 0, sentiments: {} };
      }
      aspectCounts[aspect].count++;
      const sentiment = data.sentiment || "neutral";
      aspectCounts[aspect].sentiments[sentiment] =
        (aspectCounts[aspect].sentiments[sentiment] || 0) + 1;
    });
  });

  return Object.entries(aspectCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([aspect, data]) => ({
      aspect,
      mentions: data.count,
      sentiments: data.sentiments,
    }));
}

/**
 * Get top insights from reviews
 */
function getTopInsights(reviews) {
  const insightFrequency = {};

  reviews.forEach((review) => {
    (review.insights || []).forEach((insight) => {
      const key = insight.toLowerCase();
      insightFrequency[key] = (insightFrequency[key] || 0) + 1;
    });
  });

  return Object.entries(insightFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([insight, frequency]) => ({ insight, frequency }));
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(metrics, topAspects) {
  const recommendations = [];

  if (metrics.csat < 70) {
    recommendations.push({
      priority: "HIGH",
      action: "Improve overall customer satisfaction",
      details: "CSAT is below 70% - address top issues immediately",
    });
  }

  if (metrics.nps < 0) {
    recommendations.push({
      priority: "HIGH",
      action: "Convert detractors to promoters",
      details: "NPS is negative - focus on preventing negative reviews",
    });
  }

  topAspects.forEach((aspect) => {
    const negativeCount = aspect.sentiments.negative || 0;
    if (negativeCount / aspect.mentions > 0.3) {
      recommendations.push({
        priority: "MEDIUM",
        action: `Improve ${aspect.aspect}`,
        details: `${Math.round((negativeCount / aspect.mentions) * 100)}% of ${aspect.aspect} mentions are negative`,
      });
    }
  });

  return recommendations.slice(0, 5);
}

module.exports = {
  initGroqModel,
  analyzeSentiment,
  extractAspects,
  calculateCXMetrics,
  generateExecutiveSummary,
  getTopAspects,
  getTopInsights,
  generateRecommendations,
};
