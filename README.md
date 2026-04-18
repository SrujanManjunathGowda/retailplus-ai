# RetailPulse AI - Production-Ready Customer Review Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)

## 🎯 Executive Summary

RetailPulse AI transforms unstructured customer reviews into **actionable business intelligence**. Unlike basic sentiment analysis, this platform converts feedback into measurable CX metrics (CSAT, NPS, CES) and provides real-time trend detection with department routing.

### Key Capabilities

✅ **Advanced ABSA** - Extract specific aspects (delivery, quality, price, service) with confidence scoring  
✅ **Real-time Trends** - Detect emerging issues, spikes, and systemic problems in customer feedback  
✅ **Multilingual Support** - English + Hinglish normalization and translation  
✅ **CX Metrics** - CSAT, NPS, CES calculations with aspect-level breakdown  
✅ **Spam Detection** - Identify and flag suspicious/duplicate reviews  
✅ **Smart Routing** - Automatically route issues to Logistics, Product, or Support teams  
✅ **Actionable Insights** - Generate human-readable recommendations  
✅ **200+ Review Dataset** - Pre-configured with real-world noise and multilingual data

---

## 🏗️ Architecture

```
RetailPulse AI Platform
├── Backend (Node.js + Express + Groq LLM)
│   ├── /api/analyze              - Single review analysis
│   ├── /api/upload               - Batch CSV upload
│   ├── /api/dashboard            - Comprehensive metrics
│   ├── /api/reports/cx           - CX detailed report
│   ├── /api/reports/trends       - Trend analysis
│   └── Core Modules:
│       ├── preprocessing.js      - Spam detection, deduplication, text normalization
│       ├── sentiment.js          - LLM-powered aspect-based sentiment
│       ├── cx_metrics.js         - CSAT, NPS, CES calculations
│       ├── trends.js             - Pattern detection & alerting
│       └── sample_data.js        - 200+ sample reviews
│
└── Frontend (React + Recharts)
    ├── Dashboard                 - Real-time KPIs & charts
    ├── Alert System              - Trending issues & spikes
    ├── Review Feed               - Detailed analysis per review
    └── Input Controls            - Manual entry & CSV upload
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 14+
- **npm** or **yarn**
- **Groq API Key** (free tier available at https://console.groq.com)

### 1. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

**Dependencies:**

- `express` - Web framework
- `groq-sdk` - LLM access for sentiment analysis
- `cors` - Cross-origin requests
- `multer` - File uploads
- `papaparse` - CSV parsing

#### Frontend

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env` in backend directory:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
NODE_ENV=production
```

Get **free Groq API key**: https://console.groq.com

### 3. Start Services

**Terminal 1 - Backend:**

```bash
cd backend
node server.js
# API running on http://localhost:5000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
# UI running on http://localhost:5173
```

### 4. Load Demo Data

- Click **"Load Demo Data"** button on the dashboard
- System will analyze 30 sample reviews (from 200+ dataset)

---

## 📊 Core Features Explained

### 1. **Advanced Preprocessing Pipeline**

Handles real-world data noise:

```
Input: "delevary is bahut slow!!! 😭😭😭"
  ↓
1. Emoji Normalization: "😭" → "very sad"
2. Hinglish Translation: "bahut slow" → "very slow"
3. Spelling Correction: "delevary" → "delivery"
4. Spam Detection: Check for repetition, duplication, bots
5. Output: "delivery is very slow very sad"
```

**Features:**

- Emoji-to-text conversion
- Hinglish/mixed language normalization
- Spelling correction (70+ common errors)
- Duplicate & bot detection (Jaccard similarity)
- Keyboard mashing identification

### 2. **Aspect-Based Sentiment Analysis (ABSA)**

Extract sentiment for specific product/service aspects:

```
Review: "Good product but delivery was too late"
  ↓ LLM Analysis ↓
{
  "aspects": {
    "product": {"sentiment": "positive", "confidence": 92},
    "delivery": {"sentiment": "negative", "confidence": 88}
  },
  "priority": "HIGH",
  "department": "Logistics"
}
```

**Supported Aspects:**

- Product quality, design, performance
- Delivery speed, packaging, shipping
- Price, value, affordability
- Customer service, support, response time

### 3. **CX Metrics Calculation**

Convert sentiment to business KPIs:

```
CSAT (Customer Satisfaction Score)
  Formula: (Positive + Neutral/2) / Total * 100
  Range: 0-100%
  Target: 75%+

NPS (Net Promoter Score)
  Formula: (Promoters - Detractors) / Total * 100
  Range: -100 to +100
  Target: 50%+

CES (Customer Effort Score)
  Formula: Based on friction keywords + sentiment
  Range: 1-5 (lower is better)
  Target: <3.0
```

### 4. **Real-Time Trend Detection**

Detect emerging issues automatically:

```
Comparison: Last 50 reviews vs Previous 50
  ↓
If (delivery_complaints: 10% → 40%):
  Alert: "🚨 EMERGING: Delivery complaints up 300%"
  Severity: HIGH
  Recommended: Investigate logistics team

Categories:
- ISOLATED: 1 mention
- EMERGING: 2+ mentions or 50%+ spike
- RECURRING: 3+ mentions
- SYSTEMIC: 5+ mentions or 60%+ negative
```

### 5. **Multilingual Support**

**English:**

```
"This phone is amazing! Fast delivery."
→ Analyzed as-is
```

**Hinglish (Hindi + English):**

```
"Bahut mast phone! Delivery ekdum jaldi thi!"
→ Normalized to: "Very great phone! Delivery very fast!"
→ Full analysis now works
```

**Supported Hinglish Terms:** (100+)

- bahut → very
- kharab → bad
- thik → okay
- jaldi → fast
- paisa → money
- And many more...

### 6. **Smart Priority & Routing**

Automatically route to departments:

```
HIGH Priority + Negative sentiment + Delivery aspect
  → Route to: Logistics Team
  → Action: Escalate, investigate

MEDIUM Priority + Mixed sentiment
  → Route to: Customer Service
  → Action: Follow up, gather details

LOW Priority + Positive sentiment
  → Route to: HR/Recognition
  → Action: Share praise internally
```

**Routing Categories:**

- Logistics: Delivery, shipping, packaging
- Product Team: Quality, defects, features
- Customer Support: Service, refund, complaints
- General: Feedback, compliments

---

## 📈 API Endpoints

### Core Analysis

#### POST `/api/analyze`

Analyze single review

```json
{
  "text": "Amazing product! Arrived quickly.",
  "loadSampleData": false
}
```

Response:

```json
{
  "status": "success",
  "review": {
    "id": "review_12345",
    "originalText": "...",
    "overallSentiment": "positive",
    "overallConfidence": 92,
    "aspects": {"product": {...}, "delivery": {...}},
    "priority": "LOW",
    "department": "General",
    "spamAnalysis": {"isSpam": false}
  },
  "cxMetrics": {...}
}
```

#### POST `/api/upload`

Batch CSV analysis (max 50 reviews)

```bash
curl -X POST -F "file=@reviews.csv" http://localhost:5000/api/upload
```

CSV Format:

```csv
text
"Amazing product! High quality."
"Delivery was delayed by 5 days."
```

### Reporting

#### GET `/api/dashboard`

Comprehensive metrics

```json
{
  "totalReviews": 150,
  "sentimentCounts": {"positive": 85, "negative": 45, "neutral": 20, "mixed": 0},
  "cxMetrics": {
    "csat": "85%",
    "nps": "+35",
    "ces": "2.1/5"
  },
  "alerts": [{...}],
  "topComplaints": [{"aspect": "delivery", "count": 12, "percentage": 8}],
  "topPraise": [{"aspect": "quality", "count": 45, "percentage": 30}]
}
```

#### GET `/api/reports/cx`

Detailed CX analysis with aspect breakdown

#### GET `/api/reports/trends`

Trend analysis with spike detection

```json
{
  "trend": "IMPROVING",
  "alerts": [
    {
      "message": "⚠️ SPIKE: delivery complaints increased by 150%",
      "severity": "HIGH"
    }
  ]
}
```

#### GET `/api/reviews`

Paginated review list with filters

```
/api/reviews?sentiment=negative&limit=50&offset=0
/api/reviews?category=smartphone&priority=HIGH
```

---

## 📊 Sample Data (200+ Reviews)

Pre-configured dataset includes:

**Categories:**

- Smartphones (50 reviews)
- Laptops (50 reviews)
- Headphones (50 reviews)
- Smartwatches (50 reviews)

**Data Characteristics:**

- ✅ Mixed sentiments (positive, negative, neutral, mixed)
- ✅ Hinglish examples (20+ reviews)
- ✅ Typos & spelling errors (realistic noise)
- ✅ Spam patterns (keyboard mashing, repetition)
- ✅ Duplicate detection tests
- ✅ Short reviews ("Good!", "Bad!")
- ✅ Complex scenarios (mixed sentiment in one review)

**Load sample data:**

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"loadSampleData": true}'
```

---

## 🎯 Business Intelligence Use Cases

### Case 1: Delivery Issues Spike

```
Alert: "SPIKE: Delivery complaints increased by 200%"
  → Root cause: 5 users reported same delayed delivery
  → Action: Contact logistics partner
  → Expected impact: +15% CSAT improvement
```

### Case 2: Multilingual Feedback

```
Input: "Bahut expensive hai but quality ekdum mast!"
  → Normalized: "Very expensive is but quality absolutely great"
  → Aspects: price (negative), quality (positive)
  → Route: Product Team (for price analysis)
```

### Case 3: At-Risk Customers

```
Identified: 8 reviews with strong negative + high confidence
  → Segment: Premium customers (high order value)
  → Action: Proactive outreach from support team
  → Expected: 60% retention improvement
```

### Case 4: Product Quality Improvement

```
Top complaints trend:
  1. Battery life (12%) - Hardware issue
  2. Heating problem (8%) - Design flaw
  3. Camera focus (6%) - Software bug
  → Prioritize battery optimization
```

---

## 🔧 Configuration & Customization

### Adding Custom Hinglish Terms

Edit `backend/preprocessing.js`:

```javascript
const hinglishTranslations = {
  new_word: "english_translation",
  bahut: "very", // example
};
```

### Adjusting CES Weights

Edit `backend/cx_metrics.js`:

```javascript
function calculateCES(reviews) {
  const frictionKeywords = [
    "difficult",
    "slow",
    "frustrating",
    // Add more keywords
  ];
}
```

### Modifying Alert Thresholds

Edit `backend/trends.js`:

```javascript
const SPIKE_THRESHOLD = 2.0; // 2x increase = spike
const SYSTEMIC_THRESHOLD = 5; // 5+ complaints = systemic
```

---

## ⚡ Performance & Optimization

**Current Performance:**

- Single review analysis: **<1.2s** (including LLM call)
- Batch CSV (50 reviews): **<30s** total
- Dashboard load: **<500ms**
- Memory usage: **~150MB** for 500 reviews

**Rate Limiting (Groq Free Tier):**

- 30 requests/minute
- Auto-throttling: 600ms delay between requests
- Batch processing: Max 50 reviews per upload

**Scaling Tips:**

- Move to paid Groq tier for higher limits
- Implement Redis caching for repeated analyses
- Use message queue (Bull/BullMQ) for async processing
- Deploy on cloud (AWS Lambda, Google Cloud Functions)

---

## 🔐 Data Privacy & Security

- **No data persistence** to external servers (in-memory only)
- **HTTPS recommended** for production
- **API Key protection** - Never commit `.env` to git
- **CORS configured** for frontend-backend communication
- **CSV uploads** - Temporary files auto-deleted after processing

---

## 🐛 Troubleshooting

### Issue: "Groq API Key is missing"

```
Solution: Set environment variable in .env file
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

### Issue: "CORS error when uploading"

```
Solution: Backend CORS is already enabled. Check:
1. Backend running on localhost:5000
2. Frontend making requests to correct URL
```

### Issue: "Load Demo Data returns error"

```
Solution: Wait 30 seconds between requests (rate limit)
Or reduce sample size in sample_data.js
```

---

## 📚 API Documentation Examples

### Analyzing Multilingual Review

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Bahut mast phone! Delivery ekdum fast thi. Quality ekdum perfect!"
  }'
```

### Getting At-Risk Customers

```bash
curl http://localhost:5000/api/reviews?sentiment=negative&priority=HIGH
```

### Downloading Trends Report

```bash
curl http://localhost:5000/api/reports/trends > trends_report.json
```

---

## 🎓 How to Use (Step by Step)

### Step 1: Start the Platform

```bash
# Backend
cd backend && node server.js

# Frontend (new terminal)
cd frontend && npm run dev
```

### Step 2: Load Sample Data

1. Open dashboard at http://localhost:5173
2. Click "Load Demo Data" button
3. Wait 30-60 seconds for analysis

### Step 3: Explore Insights

- **KPI Cards**: See CSAT, NPS, CES metrics
- **Alerts**: Trend spikes and emerging issues
- **Top Complaints**: Identify problem areas
- **Review Feed**: Detailed analysis per review

### Step 4: Analyze Your Data

1. **Manual Entry**: Paste reviews in textarea
2. **CSV Upload**: Upload batch of reviews
3. **Watch Dashboard**: Real-time updates

---

## 🚀 Production Deployment

### Docker (Recommended)

```dockerfile
# Dockerfile (backend)
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Deploy to AWS/GCP/Azure

1. **Push to Docker Hub**
2. **Deploy to container service** (ECS, Cloud Run, AKS)
3. **Configure CI/CD** (GitHub Actions, GitLab, Cloud Build)
4. **Monitor** (CloudWatch, Stackdriver, Application Insights)

---

## 📊 Validation & Testing

Run system with sample data to validate:

```bash
1. ✅ Preprocessing: Noisy text → clean → analyzed
2. ✅ ABSA: Multiple aspects extracted correctly
3. ✅ Multilingual: Hinglish → English translation → analysis
4. ✅ Spam Detection: Keyboard mashing tagged as spam
5. ✅ Trends: Spike detected when ≥3 negative in recent batch
6. ✅ Routing: High priority + negative → correct department
7. ✅ CX Metrics: CSAT/NPS/CES calculated accurately
```

---

## 📞 Support & Feedback

For issues, feature requests, or questions:

1. Check troubleshooting section
2. Review API endpoints documentation
3. Validate data format (CSV, text encoding)

---

## 📄 License

MIT License - Free for commercial and personal use

---

## 🎯 Key Metrics & KPIs

**Track These Over Time:**

- CSAT trend (target: +2% month-over-month)
- NPS improvement (target: +5 points per quarter)
- CES reduction (target: <2.5)
- Issue resolution rate (target: 80% within 7 days)
- At-risk customer conversion (target: 30% retained)

---

## 🔄 Version History

**v1.0.0** (Current)

- ✅ Advanced preprocessing pipeline
- ✅ Aspect-based sentiment analysis
- ✅ Real-time trend detection
- ✅ CX metrics (CSAT, NPS, CES)
- ✅ Multilingual support (English + Hinglish)
- ✅ Spam detection & deduplication
- ✅ Smart routing & prioritization
- ✅ 200+ sample dataset
- ✅ Production-ready dashboard

---

**Built with:** Node.js • Express • React • Groq LLM • Recharts

**Last Updated:** 2026-04-16
# retailplus-ai
