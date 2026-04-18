const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Papa = require("papaparse");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const { initModel, analyzeSentiment } = require("./sentiment");
const { detectTrends, getTrendAnalysis } = require("./trends");
const { preprocessReview } = require("./preprocessing");
const {
  calculateCSAT,
  calculateNPS,
  calculateAdvancedCES,
  getTopComplaints,
  getTopPraise,
  generateCXReport,
  identifyAtRiskCustomers,
  getAspectSatisfaction,
} = require("./cx_metrics");
const {
  generateSampleDataset,
  getCategoryForReview,
} = require("./sample_data");
const {
  generateInsights,
  generateRecommendations,
  generateExecutiveSummary,
} = require("./insights");
const {
  addReview,
  getReviewsByUser,
  getReviewById,
  deleteReviewById,
  deleteReviewsByUser,
  deleteAllReviews,
  addUser,
} = require("./database");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    console.log("[MULTER] fileFilter called:", {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });
    cb(null, true);
  },
});

initModel();

function getUserEmail(req) {
  return (
    req.body?.email || req.query?.email || req.headers["x-user-email"] || null
  );
}

function ensureUserEmail(req, res) {
  const userEmail = getUserEmail(req);
  if (!userEmail) {
    res.status(400).json({ error: "User email required" });
    return null;
  }
  return userEmail;
}

function sortReviewsByDate(reviews) {
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
}

function ensureCompanyStore() {
  if (!global.companyData) {
    global.companyData = [];
  }
  return global.companyData;
}

function normalizeCompanyName(company, fallbackEmail = "") {
  if (typeof company === "string" && company.trim()) {
    return company.trim();
  }
  if (fallbackEmail && fallbackEmail.includes("@")) {
    return fallbackEmail.split("@")[0];
  }
  return "Unknown Company";
}

function getFeatureSentiment(reviews, feature) {
  const related = reviews.filter((review) => {
    const aspects = Array.isArray(review.aspects)
      ? review.aspects
      : review.aspectsArray || [];
    return aspects.some((aspect) =>
      (aspect.aspect || "").toLowerCase().includes(feature.toLowerCase()),
    );
  });

  if (related.length === 0) return "No data";

  const score = related.reduce((sum, review) => {
    const sentiment = (review.overallSentiment || "").toLowerCase();
    if (sentiment === "positive") return sum + 1;
    if (sentiment === "mixed") return sum + 0.25;
    if (sentiment === "negative") return sum - 1;
    return sum;
  }, 0);

  if (score > 0.5) return "Positive";
  if (score < -0.5) return "Negative";
  return "Neutral";
}

function buildCompanySnapshot(company, reviews, userEmail = "") {
  const cxReport = generateCXReport(reviews);
  const alerts = detectTrends(reviews).map((alert) => alert.message);
  const topComplaints = getTopComplaints(reviews, 3);
  const topPraise = getTopPraise(reviews, 3);
  const spamCount = reviews.filter(
    (review) => review.spamAnalysis?.isSpam || review.isSpamFlagged,
  ).length;

  // Generate unique ID using company name + user email to avoid conflicts
  const companyId = `${company.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${userEmail.split("@")[0] || "default"}`;

  return {
    id: companyId,
    company,
    userEmail,
    totalReviews: reviews.length,
    spam: spamCount,
    avgCSAT: Number.parseFloat(cxReport.csat || 0),
    alerts,
    featureStats: {
      battery: getFeatureSentiment(reviews, "battery"),
      packaging: getFeatureSentiment(reviews, "packaging"),
      delivery: getFeatureSentiment(reviews, "delivery"),
    },
    topIssues: topComplaints.map(
      (item) => `${item.aspect} is a recurring issue`,
    ),
    topPraise: topPraise.map((item) => `${item.aspect} is performing well`),
    timestamp: new Date().toISOString(),
  };
}

function upsertCompanySnapshot(snapshot) {
  const companyStore = ensureCompanyStore();
  const existingIndex = companyStore.findIndex(
    (item) =>
      item.company.toLowerCase() === snapshot.company.toLowerCase() &&
      item.userEmail === snapshot.userEmail,
  );

  if (existingIndex >= 0) {
    companyStore[existingIndex] = snapshot;
  } else {
    companyStore.push(snapshot);
  }

  return snapshot;
}

function updateCompanyAnalytics(company, reviews, userEmail = "") {
  const snapshot = buildCompanySnapshot(company, reviews, userEmail);
  return upsertCompanySnapshot(snapshot);
}

function getTextColumn(row, rowIndex = 0) {
  if (!row || typeof row !== "object") {
    return null;
  }

  if (rowIndex === 0) {
    console.log("[TEXT_COLUMN] Row 0 structure:");
    Object.entries(row).forEach(([key, value]) => {
      console.log(`  "${key}": "${value}" (len: ${value?.length || 0})`);
    });
  }

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

  for (const keyword of textKeywords) {
    for (const [key, value] of Object.entries(row)) {
      if (
        key.toLowerCase().includes(keyword) &&
        value &&
        typeof value === "string" &&
        value.length > 0
      ) {
        if (rowIndex < 3) {
          console.log(
            `[TEXT_COLUMN] Row ${rowIndex}: Found in "${key}": "${value.slice(0, 50)}..."`,
          );
        }
        return value;
      }
    }
  }

  for (const [key, value] of Object.entries(row)) {
    if (value && typeof value === "string" && value.length > 3) {
      if (rowIndex < 3) {
        console.log(
          `[TEXT_COLUMN] Row ${rowIndex}: Using "${key}": "${value.slice(0, 50)}..."`,
        );
      }
      return value;
    }
  }

  if (rowIndex < 3) {
    console.log(
      `[TEXT_COLUMN] Row ${rowIndex}: NO TEXT FOUND. Keys: ${Object.keys(row).join(", ")}`,
    );
  }
  return null;
}

app.post("/api/analyze", async (req, res) => {
  try {
    const { text, loadSampleData, company } = req.body;
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;
    const companyName = normalizeCompanyName(company, userEmail);

    if (loadSampleData) {
      const existingReviews = await getReviewsByUser(userEmail);
      if (existingReviews.length === 0) {
        const samples = generateSampleDataset();
        for (const sample of samples.slice(0, 30)) {
          const result = await analyzeSentiment(sample.text);
          if (result.status !== "invalid") {
            const preprocessed = preprocessReview(sample.text, existingReviews);
            const entry = {
              id: `sample_${Date.now()}_${Math.random().toString(36).substring(7)}`,
              userEmail,
              ...sample,
              ...result,
              overallSentiment: result.overallSentiment,
              overallConfidence: result.overallConfidence,
              aspects: result.aspects,
              aspectsArray: result.aspectsArray || [],
              source: "sample",
              category: sample.category,
              spamAnalysis: preprocessed?.spamAnalysis || { isSpam: false },
              isDuplicate: preprocessed?.isDuplicate || false,
              isSpamFlagged: preprocessed?.spamAnalysis?.isSpam || false,
              createdAt: new Date().toISOString(),
            };
            await addReview(entry);
          }
        }
        await addUser(userEmail, userEmail.split("@")[0], "Pro");
        const allReviews = await getReviewsByUser(userEmail);
        const companySnapshot = updateCompanyAnalytics(
          companyName,
          allReviews,
          userEmail,
        );
        return res.json({
          message: `Loaded ${Math.min(30, samples.length)} sample reviews`,
          reviewsCount: allReviews.length,
          cxReport: generateCXReport(allReviews),
          companySnapshot,
        });
      }
    }

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const existingReviews = await getReviewsByUser(userEmail);
    const preprocessed = preprocessReview(text, existingReviews);
    if (!preprocessed) {
      return res.json({
        status: "invalid",
        message: "Review text too short or invalid",
      });
    }

    const analysis = await analyzeSentiment(preprocessed.processedText);
    if (analysis.status === "invalid") {
      return res.json({
        status: "invalid",
        message: "Could not analyze review",
      });
    }

    const reviewEntry = {
      id: `review_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userEmail,
      originalText: text,
      processedText: preprocessed.processedText,
      text: preprocessed.processedText,
      language: preprocessed.language,
      category: getCategoryForReview(text),
      source: "manual",
      overallSentiment: analysis.overallSentiment,
      overallConfidence: analysis.overallConfidence,
      aspects: analysis.aspects,
      aspectsArray: analysis.aspectsArray || [],
      explanation: analysis.explanation,
      priority: analysis.priority,
      impactAnalysis: analysis.impactAnalysis,
      department: analysis.department,
      insights: analysis.insights || [],
      suggestedActions: analysis.suggestedActions || [],
      spamAnalysis: preprocessed.spamAnalysis,
      isDuplicate: preprocessed.isDuplicate,
      isSpamFlagged: preprocessed.spamAnalysis.isSpam,
      createdAt: new Date().toISOString(),
    };

    await addReview(reviewEntry);
    await addUser(userEmail, userEmail.split("@")[0], "Pro");

    const allReviews = await getReviewsByUser(userEmail);
    const companySnapshot = updateCompanyAnalytics(
      companyName,
      allReviews,
      userEmail,
    );
    res.json({
      status: "success",
      review: reviewEntry,
      isSpam: preprocessed.spamAnalysis.isSpam,
      spamReason: preprocessed.spamAnalysis.isSpam
        ? preprocessed.spamAnalysis.reason
        : null,
      alerts: detectTrends(allReviews),
      cxMetrics: generateCXReport(allReviews),
      companySnapshot,
    });
  } catch (error) {
    console.error("Analysis error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  const tempFilePath = req.file?.path;

  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;
    const companyName = normalizeCompanyName(req.body?.company, userEmail);

    console.log("[UPLOAD] ========== NEW UPLOAD REQUEST ==========");
    console.log(`[UPLOAD] User: ${userEmail}`);
    console.log("[UPLOAD] File received:", {
      filename: req.file?.originalname,
      size: req.file?.size,
      path: tempFilePath,
      mimetype: req.file?.mimetype,
    });

    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        error: `File must be CSV format, got: ${req.file.originalname}`,
      });
    }

    if (!fs.existsSync(tempFilePath)) {
      return res
        .status(400)
        .json({ error: "File upload failed - multer did not save file" });
    }

    const stats = fs.statSync(tempFilePath);
    if (stats.size === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: "Uploaded file is empty" });
    }

    const fileContent = fs.readFileSync(tempFilePath, "utf8");
    if (!fileContent || fileContent.trim().length === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: "CSV file is empty" });
    }

    const parsedData = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: false,
      trimHeaders: true,
      trimValues: true,
    });

    if (parsedData.errors && parsedData.errors.length > 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        error: "Invalid CSV format",
        parseErrors: parsedData.errors.slice(0, 3),
      });
    }

    const reviews = parsedData.data || [];
    if (reviews.length === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: "CSV file has no data rows" });
    }

    const validReviews = reviews.filter((row) => {
      if (!row || typeof row !== "object") return false;
      return Object.values(row).some(
        (v) => v && typeof v === "string" && v.length > 0,
      );
    });

    if (validReviews.length === 0) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(400).json({
        error: "CSV file has data rows but all are empty",
        sampleRow: reviews[0],
      });
    }

    let existingReviews = await getReviewsByUser(userEmail);
    const results = [];
    const errors = [];

    for (let i = 0; i < Math.min(validReviews.length, 500); i++) {
      const row = validReviews[i];
      const reviewText = getTextColumn(row, i);

      if (!reviewText) {
        errors.push(`Row ${i + 2}: Missing text field`);
        continue;
      }

      try {
        const preprocessed = preprocessReview(reviewText, existingReviews);
        if (!preprocessed) {
          errors.push(`Row ${i + 2}: Text too short or invalid`);
          continue;
        }

        const result = await analyzeSentiment(preprocessed.processedText);
        if (result.status === "invalid") {
          errors.push(`Row ${i + 2}: Could not analyze sentiment`);
          continue;
        }

        const entry = {
          id: `csv_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          userEmail,
          originalText: reviewText,
          processedText: preprocessed.processedText,
          text: preprocessed.processedText,
          language: preprocessed.language,
          category: getCategoryForReview(reviewText),
          source: "csv",
          overallSentiment: result.overallSentiment,
          overallConfidence: result.overallConfidence,
          aspects: result.aspects,
          aspectsArray: result.aspectsArray || [],
          explanation: result.explanation,
          priority: result.priority,
          impactAnalysis: result.impactAnalysis,
          department: result.department,
          insights: result.insights || [],
          suggestedActions: result.suggestedActions || [],
          spamAnalysis: preprocessed.spamAnalysis,
          isDuplicate: preprocessed.isDuplicate,
          isSpamFlagged: preprocessed.spamAnalysis.isSpam,
          createdAt: new Date().toISOString(),
        };

        await addReview(entry);
        existingReviews.push(entry);
        results.push(entry);
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        errors.push(`Row ${i + 2}: ${err.message}`);
      }
    }

    await addUser(userEmail, userEmail.split("@")[0], "Pro");
    const allReviews = await getReviewsByUser(userEmail);
    const companySnapshot = updateCompanyAnalytics(
      companyName,
      allReviews,
      userEmail,
    );

    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.json({
      message: `Successfully processed ${results.length} reviews out of ${validReviews.length}`,
      processed: results.length,
      total: validReviews.length,
      errors: errors.slice(0, 10),
      errorCount: errors.length,
      spamCount: results.filter((r) => r.isSpamFlagged).length,
      results,
      companySnapshot,
    });
  } catch (error) {
    console.error("[UPLOAD] Unexpected error:", error.message);
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error(
          "[UPLOAD] Failed to delete temp file on error:",
          err.message,
        );
      }
    }
    res.status(500).json({
      error: "Upload processing failed: " + error.message,
    });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("[MULTER_ERROR]", err.code, err.message);
    return res.status(400).json({ error: "File upload error: " + err.message });
  }
  if (err) {
    console.error("[MULTER_UNKNOWN_ERROR]", err.message);
    return res.status(400).json({ error: "Upload error: " + err.message });
  }
  next();
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const userReviews = await getReviewsByUser(userEmail);
    if (userReviews.length === 0) {
      return res.json({
        totalReviews: 0,
        sentimentCounts: { positive: 0, negative: 0, neutral: 0, mixed: 0 },
        cxMetrics: { csat: "0%", nps: "0", ces: "3.0/5" },
        alerts: [],
        reviews: [],
      });
    }

    const sentimentDist = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0,
    };

    userReviews.forEach((r) => {
      const s = r.overallSentiment?.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(sentimentDist, s)) {
        sentimentDist[s]++;
      }
    });

    const csat = calculateCSAT(userReviews);
    const nps = calculateNPS(userReviews);
    const cesData = calculateAdvancedCES(userReviews);
    const complaints = getTopComplaints(userReviews, 5);
    const praise = getTopPraise(userReviews, 5);
    const aspectSatisfaction = getAspectSatisfaction(userReviews);
    const alerts = detectTrends(userReviews);
    const atRiskCustomers = identifyAtRiskCustomers(userReviews).length;

    const categories = {};
    userReviews.forEach((r) => {
      if (!categories[r.category]) {
        categories[r.category] = { total: 0, positive: 0, negative: 0 };
      }
      categories[r.category].total++;
      if (r.overallSentiment === "positive" || r.overallSentiment === "mixed") {
        categories[r.category].positive++;
      } else if (r.overallSentiment === "negative") {
        categories[r.category].negative++;
      }
    });

    res.json({
      totalReviews: userReviews.length,
      sentimentCounts: sentimentDist,
      cxMetrics: {
        csat: `${csat}%`,
        nps: nps > 0 ? `+${nps}` : `${nps}`,
        ces: `${cesData.overall}/5`,
        cesByAspect: cesData.byAspect,
        atRiskCustomers,
      },
      topComplaints: complaints,
      topPraise: praise,
      aspectSatisfaction,
      categories,
      alerts,
      reviews: sortReviewsByDate(userReviews).slice(0, 500),
      statistics: {
        avgConfidence: Math.round(
          userReviews.reduce((sum, r) => sum + (r.overallConfidence || 0), 0) /
            userReviews.length,
        ),
        spamCount: userReviews.filter((r) => r.spamAnalysis?.isSpam).length,
        duplicateCount: userReviews.filter((r) => r.isDuplicate).length,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Dashboard error: " + err.message });
  }
});

app.get("/api/reports/cx", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const reviews = await getReviewsByUser(userEmail);
    res.json({
      reportType: "CX_COMPREHENSIVE",
      generatedAt: new Date().toISOString(),
      ...generateCXReport(reviews),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reports/trends", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const reviews = await getReviewsByUser(userEmail);
    const { category } = req.query;
    res.json({
      reportType: "TREND_ANALYSIS",
      generatedAt: new Date().toISOString(),
      filter: category || "all",
      ...getTrendAnalysis(reviews, category),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    let filtered = await getReviewsByUser(userEmail);
    const { sentiment, category, priority, limit = 50, offset = 0 } = req.query;

    if (sentiment) {
      filtered = filtered.filter(
        (r) => r.overallSentiment?.toLowerCase() === sentiment.toLowerCase(),
      );
    }
    if (category) {
      filtered = filtered.filter((r) => r.category === category);
    }
    if (priority) {
      filtered = filtered.filter((r) => r.priority === priority);
    }

    const sorted = sortReviewsByDate(filtered);
    const parsedOffset = parseInt(offset, 10);
    const parsedLimit = parseInt(limit, 10);
    const paginated = sorted.slice(parsedOffset, parsedOffset + parsedLimit);

    res.json({
      total: filtered.length,
      count: paginated.length,
      offset: parsedOffset,
      limit: parsedLimit,
      reviews: paginated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reviews/:id", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const review = await getReviewById(req.params.id, userEmail);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/statistics", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const reviews = await getReviewsByUser(userEmail);
    if (reviews.length === 0) {
      return res.json({ message: "No reviews in database" });
    }

    const stats = {
      totalReviews: reviews.length,
      sentimentDistribution: {
        positive: 0,
        negative: 0,
        neutral: 0,
        mixed: 0,
      },
      confidenceDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
      departmentRouting: {},
      sourceBreakdown: {},
      languageBreakdown: {},
      spamStatistics: {
        totalSpam: 0,
        spamReasons: {},
      },
    };

    reviews.forEach((review) => {
      const sentiment = review.overallSentiment?.toLowerCase();
      if (
        Object.prototype.hasOwnProperty.call(
          stats.sentimentDistribution,
          sentiment,
        )
      ) {
        stats.sentimentDistribution[sentiment]++;
      }

      const conf = review.overallConfidence || 0;
      if (conf >= 80) stats.confidenceDistribution.high++;
      else if (conf >= 50) stats.confidenceDistribution.medium++;
      else stats.confidenceDistribution.low++;

      const dept = review.department || "General";
      stats.departmentRouting[dept] = (stats.departmentRouting[dept] || 0) + 1;

      const src = review.source || "unknown";
      stats.sourceBreakdown[src] = (stats.sourceBreakdown[src] || 0) + 1;

      const lang = review.language || "unknown";
      stats.languageBreakdown[lang] = (stats.languageBreakdown[lang] || 0) + 1;

      if (review.spamAnalysis?.isSpam) {
        stats.spamStatistics.totalSpam++;
        const reason = review.spamAnalysis.reason || "Unknown";
        stats.spamStatistics.spamReasons[reason] =
          (stats.spamStatistics.spamReasons[reason] || 0) + 1;
      }
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const review = await getReviewById(req.params.id, userEmail);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    await deleteReviewById(req.params.id, userEmail);
    res.json({
      message: "Review deleted successfully",
      deletedReview: review,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/bulk-analyze", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const { reviews, company } = req.body;
    const companyName = normalizeCompanyName(company, userEmail);
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: "Array of reviews required" });
    }

    const existingReviews = await getReviewsByUser(userEmail);
    const results = [];
    const errors = [];

    for (let i = 0; i < Math.min(reviews.length, 20); i++) {
      try {
        const text =
          typeof reviews[i] === "string" ? reviews[i] : reviews[i].text;
        if (!text) continue;

        const preprocessed = preprocessReview(
          text,
          existingReviews.concat(results),
        );
        if (!preprocessed) continue;

        const analysis = await analyzeSentiment(preprocessed.processedText);
        if (analysis.status === "invalid") continue;

        const entry = {
          id: `bulk_${i}_${Date.now()}`,
          userEmail,
          text: preprocessed.processedText,
          originalText: text,
          processedText: preprocessed.processedText,
          language: preprocessed.language,
          category: getCategoryForReview(text),
          source: "bulk",
          overallSentiment: analysis.overallSentiment,
          overallConfidence: analysis.overallConfidence,
          aspects: analysis.aspects,
          aspectsArray: analysis.aspectsArray || [],
          explanation: analysis.explanation,
          priority: analysis.priority,
          impactAnalysis: analysis.impactAnalysis,
          department: analysis.department,
          insights: analysis.insights || [],
          suggestedActions: analysis.suggestedActions || [],
          spamAnalysis: preprocessed.spamAnalysis,
          isDuplicate: preprocessed.isDuplicate,
          isSpamFlagged: preprocessed.spamAnalysis.isSpam,
          createdAt: new Date().toISOString(),
        };

        await addReview(entry);
        results.push(entry);
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        errors.push(`Review ${i}: ${err.message}`);
      }
    }

    await addUser(userEmail, userEmail.split("@")[0], "Pro");
    const allReviews = await getReviewsByUser(userEmail);
    const companySnapshot = updateCompanyAnalytics(
      companyName,
      allReviews,
      userEmail,
    );

    res.json({
      processed: results.length,
      total: reviews.length,
      results,
      errors,
      companySnapshot,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/process", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const companyName = normalizeCompanyName(req.body?.company, userEmail);
    const inputReviews = Array.isArray(req.body?.reviews)
      ? req.body.reviews
      : typeof req.body?.text === "string"
        ? req.body.text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 2)
        : [];

    if (inputReviews.length === 0) {
      return res.status(400).json({ error: "At least one review is required" });
    }

    const existingReviews = await getReviewsByUser(userEmail);
    const processed = [];
    const errors = [];

    for (let i = 0; i < inputReviews.length; i++) {
      const rawReview =
        typeof inputReviews[i] === "string"
          ? inputReviews[i]
          : inputReviews[i]?.text;
      if (!rawReview) continue;

      const preprocessed = preprocessReview(
        rawReview,
        existingReviews.concat(processed),
      );
      if (!preprocessed) {
        errors.push(`Review ${i + 1}: Text too short or invalid`);
        continue;
      }

      const analysis = await analyzeSentiment(preprocessed.processedText);
      if (analysis.status === "invalid") {
        errors.push(`Review ${i + 1}: Could not analyze sentiment`);
        continue;
      }

      const entry = {
        id: `process_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userEmail,
        originalText: rawReview,
        processedText: preprocessed.processedText,
        text: preprocessed.processedText,
        language: preprocessed.language,
        category: getCategoryForReview(rawReview),
        source: "process",
        overallSentiment: analysis.overallSentiment,
        overallConfidence: analysis.overallConfidence,
        aspects: analysis.aspects,
        aspectsArray: analysis.aspectsArray || [],
        explanation: analysis.explanation,
        priority: analysis.priority,
        impactAnalysis: analysis.impactAnalysis,
        department: analysis.department,
        insights: analysis.insights || [],
        suggestedActions: analysis.suggestedActions || [],
        spamAnalysis: preprocessed.spamAnalysis,
        isDuplicate: preprocessed.isDuplicate,
        isSpamFlagged: preprocessed.spamAnalysis.isSpam,
        createdAt: new Date().toISOString(),
      };

      await addReview(entry);
      processed.push(entry);
    }

    await addUser(userEmail, userEmail.split("@")[0], "Pro");
    const allReviews = await getReviewsByUser(userEmail);
    const companySnapshot = updateCompanyAnalytics(
      companyName,
      allReviews,
      userEmail,
    );

    res.json({
      companySnapshot,
      processedCount: processed.length,
      errorCount: errors.length,
      errors,
      reviews: processed,
      dashboard: {
        alerts: detectTrends(allReviews),
        cxMetrics: generateCXReport(allReviews),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/companies", (req, res) => {
  const companies = ensureCompanyStore();
  res.json({
    companies: sortReviewsByDate(
      companies.map((company, index) => ({
        ...company,
        createdAt: company.timestamp,
        order: index,
      })),
    ),
  });
});

app.get("/api/admin/companies/:id", (req, res) => {
  const companies = ensureCompanyStore();
  const company = companies.find((item) => item.id === req.params.id);

  if (!company) {
    return res.status(404).json({ error: "Company not found" });
  }

  res.json(company);
});

app.get("/api/reports/insights", async (req, res) => {
  try {
    const userEmail = ensureUserEmail(req, res);
    if (!userEmail) return;

    const reviews = await getReviewsByUser(userEmail);
    if (reviews.length === 0) {
      return res.json({
        message: "No reviews analyzed yet",
        insights: [],
        recommendations: [],
      });
    }

    const cxMetrics = generateCXReport(reviews);
    const complaints = getTopComplaints(reviews, 10);
    const praise = getTopPraise(reviews, 10);
    const trends = getTrendAnalysis(reviews);
    const stats = {
      totalReviews: reviews.length,
      avgConfidence: Math.round(
        reviews.reduce((sum, r) => sum + (r.overallConfidence || 0), 0) /
          reviews.length,
      ),
    };

    const insights = generateInsights(reviews, cxMetrics, complaints, praise);
    const recommendations = generateRecommendations(
      cxMetrics,
      complaints,
      praise,
      trends,
      stats,
    );
    const summary = generateExecutiveSummary(reviews, cxMetrics, insights);

    res.json({
      reportType: "BUSINESS_INTELLIGENCE",
      generatedAt: new Date().toISOString(),
      executiveSummary: summary,
      insights: insights.slice(0, 10),
      recommendations: recommendations.slice(0, 6),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reset", async (req, res) => {
  try {
    const userEmail = getUserEmail(req);

    if (userEmail) {
      await deleteReviewsByUser(userEmail);
      return res.json({
        message: `Database reset successfully for ${userEmail}`,
      });
    }

    await deleteAllReviews();
    res.json({ message: "Database reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/health", async (req, res) => {
  try {
    const userEmail = getUserEmail(req);
    const reviews = userEmail ? await getReviewsByUser(userEmail) : [];

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      reviewsCount: reviews.length,
      uptime: process.uptime(),
      database: "sqlite",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5051;
app.listen(PORT, async () => {
  await initModel();
  console.log(`🚀 RetailPulse AI server running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 API: http://localhost:${PORT}/api`);
  console.log(`💡 Try: http://localhost:${PORT}/api/dashboard`);
});

module.exports = app;
