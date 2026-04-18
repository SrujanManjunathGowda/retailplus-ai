const { Groq } = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

let groqClient = null;
const MODEL_NAME = "llama-3.1-8b-instant"; // Extremely fast and strict JSON capable model!

async function initModel() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is completely missing from process.env!");
    } else {
      groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log(`Groq Client Initialized pointing to: ${MODEL_NAME}`);
    }
  }
}

async function analyzeSentiment(rawText) {
  if (!rawText || rawText.length < 3) {
    return {
      status: "invalid",
      overallSentiment: "neutral",
      overallConfidence: 0,
      explanation: "Invalid or meaningless input.",
      priority: "LOW",
      impactAnalysis: "None",
      aspects: {},
      insights: [],
      suggestedActions: [],
      alerts: [],
    };
  }

  if (!groqClient) {
    console.error("Groq Client not initialized, returning UNCERTAIN defaults.");
    return generateUncertainFallback(rawText);
  }

  // Build the rigorous Prompt instruction
  const sysPrompt = `You are a critical AI Sentiment Engine. Analyze the customer review string.
1. Split contrast sentences logic (e.g. "not bad but laggy") into separate clauses and analyze each independently.
2. Explicit mappings: "laggy", "slow", "heating", "battery" MUST map strictly to "product". "delay", "late" MUST map strictly to "delivery".
3. Validate sentiments explicitly logic: negative, neutral, positive, or mixed.
4. CONFIDENCE CALIBRATION: Adjust confidence scores based on text clarity. Short reviews get lower confidence, detailed reviews with examples get higher.
5. Validate that all aspect confidences align reasonably with overall confidence.
Return ONLY a valid stringified JSON matching this EXACT structure:
{
  "overallSentiment": "positive|neutral|negative|mixed",
  "overallConfidence": 75,
  "explanation": "Short 1-sentence analytical reason.",
  "priority": "HIGH|MEDIUM|LOW",
  "impactAnalysis": "Short 1-sentence mapping the impact.",
  "department": "Logistics|Product Team|Customer Service|HR Recognition|General",
  "aspects": {"general": {"sentiment": "neutral", "confidence": 70}},
  "insights": ["Insight 1"],
  "suggestedActions": ["Action 1"]
}
ALWAYS return valid JSON without markdown wrapping.`;

  try {
    console.log(`[Groq Inference Started]: "${rawText.substring(0, 30)}..."`);
    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: rawText },
      ],
      model: MODEL_NAME,
      response_format: { type: "json_object" },
      temperature: 0.1, // Keeping hallucination chances essentially 0
    });

    const rawJsonString = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(rawJsonString);

    console.log("[Groq Success]: Extracted JSON natively.");

    const baseResult = {
      status: "valid",
      overallSentiment: parsed.overallSentiment || "neutral",
      overallConfidence: parsed.overallConfidence || 80,
      explanation: parsed.explanation || "Analyzed via LLM",
      priority: parsed.priority || "LOW",
      impactAnalysis: parsed.impactAnalysis || "Minimal impact detected",
      department: parsed.department || "General",
      aspects: parsed.aspects || {
        general: {
          sentiment: parsed.overallSentiment || "neutral",
          confidence: parsed.overallConfidence || 80,
        },
      },
      insights: parsed.insights || [],
      suggestedActions: parsed.suggestedActions || [],
    };

    // Apply confidence calibration validation
    const validatedResult = validateAndCalibrateConfidence(baseResult, rawText);

    // Add aspectsArray after validation (uses possibly updated aspects)
    return {
      ...validatedResult,
      aspectsArray: Object.keys(validatedResult.aspects || {}).map((k) => ({
        aspect: k,
        ...validatedResult.aspects[k],
      })),
    };
  } catch (e) {
    console.error("[Groq Inference Failed]:", e.message);
    return generateUncertainFallback(rawText);
  }
}

function generateUncertainFallback(text) {
  return {
    status: "valid",
    overallSentiment: "UNCERTAIN",
    overallConfidence: 0,
    explanation: "API completely failed to respond. Sentiments uncertain.",
    priority: "LOW",
    impactAnalysis: "None",
    aspects: { general: { sentiment: "UNCERTAIN", confidence: 0 } },
    aspectsArray: [
      { aspect: "general", sentiment: "UNCERTAIN", confidence: 0 },
    ],
    insights: [],
    suggestedActions: [],
    confidenceValidation: { reason: "API failure", adjusted: false },
  };
}

/**
 * Post-process LLM confidence scores for realistic calibration
 * Validates and adjusts confidence based on text characteristics
 */
function validateAndCalibrateConfidence(result, rawText) {
  const textLength = rawText.length;
  const wordCount = rawText.split(/\s+/).length;
  const sentenceCount = rawText
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  const hasQuestionMarks = (rawText.match(/\?/g) || []).length > 0;
  const hasMultipleExclamations = (rawText.match(/!/g) || []).length > 1;
  const allCapsWords = (rawText.match(/\b[A-Z]{2,}\b/g) || []).length;
  const capsRatio = wordCount > 0 ? allCapsWords / wordCount : 0;
  const hasQuotes = /["']/.test(rawText);
  const hasComparisons = /better|worse|than|versus|compared/i.test(rawText);

  let confidenceAdjustment = 0;
  let adjustmentReasons = [];

  // Factor 1: Text length validation
  // Short texts (< 10 words) should have lower confidence
  if (wordCount < 10) {
    confidenceAdjustment -= Math.max(5, Math.floor((10 - wordCount) * 3));
    adjustmentReasons.push(`Short text (${wordCount} words)`);
  }
  // Very short texts (< 3 words) are highly unreliable
  if (wordCount < 3) {
    confidenceAdjustment -= 25;
    adjustmentReasons.push("Extremely short review");
  }

  // Factor 2: Sentence complexity validation
  // Simple texts (avg < 4 words/sentence) tend to be less reliable
  if (avgWordsPerSentence < 4 && wordCount > 5) {
    confidenceAdjustment -= 8;
    adjustmentReasons.push("Simple sentence structure");
  }
  // Complex texts (avg > 20 words/sentence) might have mixed sentiments
  if (avgWordsPerSentence > 20) {
    confidenceAdjustment -= 5;
    adjustmentReasons.push("Complex sentence structure");
  }

  // Factor 3: Ambiguity signals
  if (hasQuestionMarks) {
    confidenceAdjustment -= 10;
    adjustmentReasons.push("Contains questions (uncertainty)");
  }
  if (hasMultipleExclamations) {
    confidenceAdjustment -= 5;
    adjustmentReasons.push("Emotional/emphatic tone");
  }

  // Factor 4: ALL CAPS words validation
  if (capsRatio > 0.3) {
    confidenceAdjustment -= 8;
    adjustmentReasons.push("High proportion of caps (intensity)");
  }

  // Factor 5: Review contains quoted text (might be reporting others' opinions)
  if (hasQuotes) {
    confidenceAdjustment -= 3;
    adjustmentReasons.push("Contains quoted text");
  }

  // Factor 6: Comparative language (often mixed sentiment)
  if (hasComparisons) {
    confidenceAdjustment -= 8;
    adjustmentReasons.push("Comparative language detected");
  }

  // Factor 7: Multi-aspect agreement validation
  if (result.aspects && Object.keys(result.aspects).length > 1) {
    const sentiments = Object.values(result.aspects).map((a) => a.sentiment);
    const uniqueSentiments = new Set(sentiments);

    // If all aspects agree, boost confidence slightly
    if (uniqueSentiments.size === 1) {
      confidenceAdjustment += 5;
      adjustmentReasons.push("All aspects aligned");
    }
    // If mixed sentiments detected, reduce confidence significantly
    else if (uniqueSentiments.size > 2 || sentiments.includes("mixed")) {
      confidenceAdjustment -= 15;
      adjustmentReasons.push("Conflicting aspects detected");
    }
    // If some positive and some negative
    else if (
      uniqueSentiments.has("positive") &&
      uniqueSentiments.has("negative")
    ) {
      confidenceAdjustment -= 12;
      adjustmentReasons.push("Mixed positive/negative sentiments");
    }

    // Validate that individual aspect confidences are reasonable
    Object.entries(result.aspects).forEach(([aspect, data]) => {
      const aspectConf = data.confidence || 50;
      // If aspect has very high confidence but differs from overall, penalize overall
      if (Math.abs(aspectConf - result.overallConfidence) > 35) {
        confidenceAdjustment -= 5;
        adjustmentReasons.push(`High divergence in ${aspect} confidence`);
      }
    });
  }

  // Factor 8: Unrealistic confidence bounds from LLM
  // If LLM claims very high confidence on uncertain text, reduce it
  if (result.overallConfidence > 95) {
    if (wordCount < 20 || hasQuestionMarks || hasMultipleExclamations) {
      confidenceAdjustment -= Math.min(result.overallConfidence - 85, 15);
      adjustmentReasons.push("LLM over-confidence on ambiguous text");
    }
  }
  // If LLM gives very low confidence on clear text, normalize it slightly
  else if (
    result.overallConfidence < 50 &&
    wordCount > 30 &&
    !hasQuestionMarks
  ) {
    confidenceAdjustment += 5;
    adjustmentReasons.push("LLM under-confidence on clear text");
  }

  // Factor 9: Calibrate aspect confidences to be internally consistent
  if (result.aspects && Object.keys(result.aspects).length > 1) {
    const aspectConfidences = Object.values(result.aspects).map(
      (a) => a.confidence || 50,
    );
    const avgAspectConfidence =
      aspectConfidences.reduce((a, b) => a + b, 0) / aspectConfidences.length;
    const stdDev = Math.sqrt(
      aspectConfidences.reduce(
        (sq, n) => sq + Math.pow(n - avgAspectConfidence, 2),
        0,
      ) / aspectConfidences.length,
    );

    // High variance in aspect confidence might indicate unreliable overall assessment
    if (stdDev > 25) {
      confidenceAdjustment -= Math.min(stdDev / 4, 8);
      adjustmentReasons.push(
        `High variance in aspect confidence (std: ${Math.round(stdDev)})`,
      );
    }
  }

  // Apply adjustment with bounds [0, 100]
  const finalConfidence = Math.max(
    0,
    Math.min(100, result.overallConfidence + confidenceAdjustment),
  );

  return {
    ...result,
    overallConfidence: finalConfidence,
    confidenceValidation: {
      originalConfidence: result.overallConfidence,
      adjustedConfidence: finalConfidence,
      adjustment: confidenceAdjustment,
      reasons: adjustmentReasons,
      textMetrics: { wordCount, sentenceCount, avgWordsPerSentence, capsRatio },
      adjustmentApplied: confidenceAdjustment !== 0,
    },
  };
}

module.exports = {
  initModel,
  analyzeSentiment,
  validateAndCalibrateConfidence,
};
