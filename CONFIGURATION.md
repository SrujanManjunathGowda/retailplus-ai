# ⚙️ Configuration & Customization Guide

## 📋 Environment Setup

### Required Environment Variables

Create `.env` file in the `backend/` directory:

```bash
# Groq LLM API Configuration
GROQ_API_KEY=gsk_your_api_key_here    # Get from https://console.groq.com

# Server Configuration
PORT=5000                              # Backend port
NODE_ENV=development                   # development|production

# Rate Limiting (Groq Free Tier)
GROQ_REQUEST_DELAY=600                 # ms between requests (30 req/min limit)
MAX_BATCH_SIZE=50                      # Max reviews per batch
MAX_INLINE_BATCH=20                    # Max reviews per bulk-analyze

# File Upload Configuration
MAX_UPLOAD_SIZE=10485760               # 10MB
UPLOAD_DIR=./uploads

# Data Configuration
MAX_REVIEWS_IN_MEMORY=1000              # Before pruning old data
DEFAULT_CONFIDENCE_THRESHOLD=70         # For reports

# CORS Configuration
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend Configuration

Frontend automatically proxies to backend via `vite.config.js`. No additional env needed.

```javascript
// vite.config.js (existing)
export default {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
};
```

---

## 🎛️ Customization Options

### 1. Hinglish Dictionary Expansion

Edit `backend/preprocessing.js` → `normalizeHinglish()` function:

```javascript
const hinglishTerms = {
  bahut: "very", // ← Add your terms here
  kharab: "bad",
  jaldi: "fast",
  // NEW ADDITIONS:
  ekdum: "completely",
  bilkul: "absolutely",
  mazaa: "fun",
  bakwas: "nonsense",
};
```

**Impact**: Translations happen before LLM analysis, improving accuracy for mixed-language reviews.

---

### 2. Emoji Mapping Customization

Edit `backend/preprocessing.js` → `normalizeEmojis()` function:

```javascript
const emojiMap = {
  "😭": "very sad", // ← Customize meanings
  "😢": "upset",
  "👍": "good",
  "🔥": "excellent", // NEW:
  "💔": "disappointed",
  "🤔": "confused",
  "😡": "angry",
};
```

**Impact**: Emoji-heavy reviews (common in mobile users) are properly sanitized.

---

### 3. Spam Detection Tuning

Edit `backend/preprocessing.js` → `detectSpam()` function:

```javascript
// Current thresholds (adjust as needed):
const SPAM_SCORE_THRESHOLD = 50; // Overall spam threshold
const REPETITION_RATIO = 0.5; // >50% repeated words = spam
const CAPS_RATIO = 0.3; // >30% CAPS = spam
const DUPLICATE_SIMILARITY = 0.85; // >85% duplicate = spam

// Scoring weights:
const weights = {
  repetition: 15, // How much repetition matters
  caps: 10, // How much caps matters
  keyboardMash: 20, // How much mashing matters
  duplicateFound: 35, // How much matching duplicates matter
  urlCount: 25, // How much URLs matter
  spamPhrases: 30, // How much spam phrases matter
};
```

**Impact**: Higher thresholds = fewer false positives (legitimate reviews marked spam).

---

### 4. Sentiment Priority Classification

Edit `backend/sentiment.js` → LLM prompt section:

```javascript
// Current priority assignment:
// HIGH: Extreme negative (-confidence >80%) or positive business impact
// MEDIUM: Mixed sentiment with specific issue
// LOW: General positive or neutral

// Customize the prompt instruction:
const prompt = `
Classify priority as:
- HIGH: Urgent business impact
  * Safety concerns
  * Major product defects (>10% users affected)
  * Severe delivery issues
  * Specific customer escalation signals
  
- MEDIUM: Important but not urgent
  * Minor product issues
  * Occasional delivery delays
  * Moderate dissatisfaction
  
- LOW: General feedback
  * Positive comments
  * Neutral observations
  * Feature requests
`;
```

**Impact**: Only HIGH priority reviews trigger immediate alerts.

---

### 5. Department Routing Rules

Edit `backend/sentiment.js` → LLM prompt:

```javascript
// Current routing:
// - Logistics: Delivery, packaging, shipping, timing issues
// - Product Team: Quality, features, design, performance
// - Customer Service: General complaints, refunds, returns
// - General: Other feedback

// Customize the routing logic:
const routingRules = {
  'Logistics': ['delivery', 'packaging', 'shipping', 'timing', 'late'],
  'Product Team': ['quality', 'feature', 'design', 'performance', 'bug'],
  'Customer Service': ['refund', 'return', 'complaint', 'support', 'help'],
  'General': DEFAULT
};

// Add new departments as needed:
const routingRules = {
  'Logistics': [...],
  'Product Team': [...],
  'Customer Service': [...],
  'Quality Assurance': ['defect', 'broken', 'doesn\'t work'],
  'Marketing': ['recommendation', 'positive', 'promotion'],
  'General': DEFAULT
};
```

**Impact**: Reviews routed to most appropriate team for faster resolution.

---

### 6. CX Metrics Thresholds

Edit `backend/cx_metrics.js` → metric calculation sections:

```javascript
// Current thresholds:
// CSAT: Score positive=100, neutral=50, negative=0 → average
// NPS:  Promoters (80-100) − Detractors (0-50)
// CES:  Effort from text + sentiment base

// Customize scoring:
const CSAT_POSITIVE_VALUE = 100; // Score for positive sentiment
const CSAT_NEUTRAL_VALUE = 50; // Score for neutral
const CSAT_NEGATIVE_VALUE = 0; // Score for negative

const NPS_PROMOTER_THRESHOLD = 80; // >80 = promoter
const NPS_PASSIVE_THRESHOLD = 50; // 50-80 = passive
// <50 = detractor

const CES_FRICTION_KEYWORDS = [
  "difficult",
  "confusing",
  "complicated",
  "slow",
  "hard",
  "struggle",
  "frustrat",
  "annoying",
  "complex",
  "hassle",
];
```

**Impact**: Metrics better reflect your business standards.

---

### 7. Trend Detection Sensitivity

Edit `backend/trends.js` → spike detection section:

```javascript
// Current settings:
const SPIKE_MULTIPLIER = 2.0; // 2x increase = alert
const SPIKE_MIN_COMPLAINTS = 2; // At least 2 complaints to trigger
const SYSTEMIC_COMPLAINT_COUNT = 5; // 5+ complaints = systemic
const SYSTEMIC_NEGATIVE_RATE = 0.6; // 60%+ negative = systemic

// Make trend detection:
// More sensitive (catch issues faster): Reduce multipliers
const SPIKE_MULTIPLIER = 1.5; // 1.5x = alert (more sensitive)
const SYSTEMIC_COMPLAINT_COUNT = 3; // Only 3 needed

// Less sensitive (fewer false alarms): Increase multipliers
const SPIKE_MULTIPLIER = 3.0; // 3x = alert (less sensitive)
const SYSTEMIC_COMPLAINT_COUNT = 10; // Need 10 to trigger
```

**Impact**: Adjust alert frequency based on your tolerance.

---

### 8. Sample Data Customization

Edit `backend/sample_data.js` → Add your categories:

```javascript
// Current categories:
const categories = ["smartphone", "laptop", "headphones", "smartwatch"];

// Add new product categories:
const categories = [
  "smartphone",
  "laptop",
  "headphones",
  "smartwatch",
  "tablet", // NEW
  "camera", // NEW
  "speaker", // NEW
];

// Then add sample reviews for each:
sampleReviews: [
  {
    originalText: "Camera is amazing, photos are crystal clear!",
    category: "camera",
    // ... rest of review structure
  },
];
```

**Impact**: Platform reflects your product portfolio.

---

### 9. LLM Model Switching

Edit `backend/sentiment.js` → Replace Groq model:

```javascript
// Current: llama-3.1-8b-instant
// Performance: ~1 token/ms, free tier throttled

client.messages.create({
  model: "llama-3.1-8b-instant", // ← Change this
  // ... rest of config
});

// Available Groq models:
// - llama-3.1-8b-instant (fast, small) ← RECOMMENDED
// - llama-3.1-70b-versatile (slower, better quality - PAID)
// - mixtral-8x7b-32768 (medium)
// - gemma-7b-it (small, fast)

// Impact: Trade-off between speed and accuracy
// Speed ranked: gemma > llama-8b > mixtral > llama-70b
// Accuracy ranked: llama-70b > mixtral > llama-8b > gemma
```

**Impact**: Different model = different quality/speed tradeoff.

---

### 10. Dashboard Refresh Rate

Edit `frontend/src/App.jsx` → useEffect section:

```javascript
// Current: 15-second refresh
useEffect(() => {
  const interval = setInterval(refreshDashboard, 15000); // ← Change this
  // ...
}, []);

// Options:
// 5000 ms = 5 second refresh (more real-time, more load)
// 15000 ms = 15 second refresh (balanced, default)
// 30000 ms = 30 second refresh (less load, less real-time)
// 60000 ms = 60 second refresh (minimal load)

// Impact: Faster = more responsive but more server load
```

**Impact**: Trade-off between responsiveness and server load.

---

### 11. Chart Data Points

Edit `frontend/src/App.jsx` → Chart configuration:

```javascript
// Current: Last 10 sentiment batches
const chartData = prepareChartData(reviewsDB.slice(-10));

// Customize time window:
const chartData = prepareChartData(reviewsDB.slice(-30)); // Last 30
// or
const chartData = prepareChartData(reviewsDB.slice(-50)); // Last 50

// Impact: Affects X-axis range in line charts
```

**Impact**: Shows trends over different time horizons.

---

### 12. Confidence Score Sensitivity

Edit `backend/sentiment.js` → LLM instructions:

```javascript
// Add to Groq prompt:
`
Confidence scoring:
- 90-100%: Absolutely certain
- 75-90%: Very confident
- 60-75%: Moderately confident
- 0-60%: Limited confidence

For ambiguous text, score lower.
For clear text, score higher.
`;

// Then in frontend filters (App.jsx):
const highConfidenceReviews = reviews.filter((r) => r.overallConfidence >= 75);
const allReviews = reviews; // Include all
```

**Impact**: Filter noise from analysis when needed.

---

## 🔧 Advanced Configuration

### Database Optimization (Future)

Replace in-memory `reviewsDB` with persistent storage:

```javascript
// Current: backend/server.js
let reviewsDB = [];

// Replace with MongoDB:
const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  id: String,
  originalText: String,
  overallSentiment: String,
  // ... all fields
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", reviewSchema);

// Then use: await Review.find(), await Review.create()
```

---

### Horizontal Scaling

Current: Single Node.js process

To scale:

```bash
# Option 1: PM2 Cluster Mode
npm install -g pm2
pm2 start backend/server.js -i max

# Option 2: Docker + Load Balancer
docker build -t retail-ai .
docker run -p 5000 retail-ai
docker run -p 5001 retail-ai
# nginx loadbalancer on :5000 → routes to both containers
```

---

### Caching Layer

Add Redis caching:

```javascript
// Install: npm install redis
const redis = require("redis");
const client = redis.createClient();

// Cache dashboard results
const dashboardKey = "dashboard_metrics";
const cached = await client.get(dashboardKey);
if (cached) return JSON.parse(cached);

const metrics = calculateMetrics();
await client.setEx(dashboardKey, 300, JSON.stringify(metrics)); // 5-minute cache
return metrics;
```

---

## 📊 Monitoring & Logging

### Add Application Logging

```javascript
// backend/server.js - top of file
const fs = require("fs");
const logFile = fs.createWriteStream("app.log", { flags: "a" });

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${level}: ${message}\n`;
  logFile.write(logEntry);
  console.log(logEntry);
}

// In endpoints:
log("INFO", `Received review: ${review.id}`);
log("ERROR", `LLM API error: ${error.message}`);
```

### Metrics Collection

```javascript
// Track performance
const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  avgResponseTime: 0,
  apiCallTimes: [],
};

// Update every request:
const startTime = Date.now();
// ... process request
const duration = Date.now() - startTime;
metrics.apiCallTimes.push(duration);
metrics.avgResponseTime =
  metrics.apiCallTimes.reduce((a, b) => a + b) / metrics.apiCallTimes.length;
```

---

## ✅ Testing Customizations

### Validation Checklist

After making changes:

- [ ] **Preprocessing**: Upload a test CSV with Hinglish + emojis
- [ ] **Sentiment**: Verify aspect extraction matches expectations
- [ ] **Trends**: Push 5 negative reviews → Check spike detection
- [ ] **Metrics**: Verify CSAT/NPS calculations match manual math
- [ ] **Dashboard**: Load demo data → All KPIs populate
- [ ] **Performance**: Single review <1.5s, batch of 10 <15s
- [ ] **Email**: No console errors in dev tools

---

## 🚀 Quick Customization Recipes

### Recipe 1: Add Support for Spanish

```javascript
// backend/preprocessing.js
const spanishTerms = {
  "muy malo": "very bad",
  excelente: "excellent",
  rapido: "fast",
};

function normalizeSpanish(text) {
  let normalized = text.toLowerCase();
  for (const [spanish, english] of Object.entries(spanishTerms)) {
    normalized = normalized.replace(new RegExp(spanish, "gi"), english);
  }
  return normalized;
}

// Call in preprocessText():
text = normalizeSpanish(text);
```

### Recipe 2: Alert on Delivery Issues

```javascript
// backend/trends.js
function detectDeliverySpike(reviews) {
  const recentDelivery = reviews
    .filter((r) => r.aspects.delivery?.sentiment === "negative")
    .slice(-10);

  if (recentDelivery.length >= 5) {
    return {
      type: "CRITICAL",
      message: "50% of recent reviews mention delivery issues",
      department: "Logistics",
    };
  }
}
```

### Recipe 3: Auto-Escalate High-Priority Reviews

```javascript
// backend/server.js in POST /api/analyze
if (review.priority === "HIGH") {
  // Send to Slack/Email/SMS
  await notificationService.send({
    channel: "urgent-reviews",
    message: `HIGH PRIORITY: ${review.originalText}`,
    department: review.department,
  });
}
```

---

## 📚 Configuration Reference Table

| Component   | Setting            | Default | Range      | Impact          |
| ----------- | ------------------ | ------- | ---------- | --------------- |
| Groq API    | Request Delay      | 600ms   | 100-2000ms | Rate limiting   |
| Spam Filter | Threshold          | 50      | 0-100      | Sensitivity     |
| Trends      | Spike Multiplier   | 2.0x    | 1.0-5.0x   | Alert frequency |
| CSAT        | Positive Value     | 100     | 0-100      | Score weight    |
| NPS         | Promoter Threshold | 80      | 0-100      | Classification  |
| Dashboard   | Refresh Rate       | 15s     | 5-60s      | Real-time-ness  |
| Similarity  | Duplicate Match    | 85%     | 0-100%     | Dedup tolerance |
| Batch       | Max Size           | 50      | 1-100      | Upload time     |

---

**Remember**: Test customizations in development before production deployment!
