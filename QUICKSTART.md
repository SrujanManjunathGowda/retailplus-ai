# 🚀 RetailPulse AI - Quick Start Guide (5 Minutes)

Get your Customer Review Intelligence Platform up and running in 5 minutes!

## ⚡ Prerequisites (1 minute)

1. **Node.js 14+** - [Download](https://nodejs.org/)
2. **Groq API Key** (FREE) - [Get it here](https://console.groq.com/)
   - Sign up → Create API Key → Copy it

## 📦 Installation (2 minutes)

### Step 1: Clone/Download Project

```bash
# Navigate to project folder
cd retail_ai
```

### Step 2: Backend Setup

```bash
cd backend
npm install

# Create .env file with:
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
echo "PORT=5000" >> .env
```

Replace `your_groq_api_key_here` with your actual key from Groq Console.

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
```

## ▶️ Run the Platform (2 minutes)

### Terminal 1 - Start Backend

```bash
cd backend
node server.js
```

Expected output:

```
🚀 RetailPulse AI server running on port 5000
📊 Dashboard: http://localhost:5000
🔍 API: http://localhost:5000/api
```

### Terminal 2 - Start Frontend

```bash
cd frontend
npm run dev
```

Expected output:

```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

### Open Dashboard

Open http://localhost:5173 in your browser

## 🎯 Try It Out (30 seconds)

### Load Sample Data

1. Click **"Load Demo Data"** button (top right)
2. Wait 30-60 seconds
3. Dashboard will populate with 30 analyzed reviews

### Analyze a Review

1. Scroll down to "Analyze Review" section
2. Paste a review: "This phone is amazing! Fast delivery but expensive."
3. Click **"✨ Analyze"**
4. See results instantly

### Upload CSV

1. Prepare CSV with "text" column
2. Click **"📤 Upload CSV"**
3. Select file
4. System processes up to 50 reviews

## 📊 What You'll See

| Section                | What It Shows                |
| ---------------------- | ---------------------------- |
| **KPI Cards**          | CSAT, NPS, CES scores        |
| **Sentiment Timeline** | Trends over time             |
| **Alerts**             | Emerging issues & spikes     |
| **Top Complaints**     | Most mentioned issues        |
| **Top Praise**         | Strengths to leverage        |
| **Recent Reviews**     | Detailed analysis per review |

## 🔍 API Endpoints (Try These!)

### Single Review Analysis

```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Amazing product! Highly recommended."}'
```

### Get Dashboard Metrics

```bash
curl http://localhost:5000/api/dashboard
```

### Get Business Insights

```bash
curl http://localhost:5000/api/reports/insights
```

### Get Trend Analysis

```bash
curl http://localhost:5000/api/reports/trends
```

### List All Reviews

```bash
curl http://localhost:5000/api/reviews?limit=20
```

## ✅ Validation Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Dashboard loaded without errors
- [ ] Sample data loaded successfully
- [ ] At least 1 review analyzed
- [ ] Can see CSAT/NPS/CES metrics
- [ ] Alerts section populated
- [ ] Can manually analyze a review

## 🎓 Next Steps

### Learn the Platform

- Read [Full Documentation](./README.md)
- Explore [API Endpoints](./README.md#-api-endpoints)
- Try [Business Use Cases](./README.md#-business-intelligence-use-cases)

### Analyze Your Data

1. Prepare reviews in CSV format
2. Upload via CSV upload feature
3. View results in dashboard

### Customize

- [Add Hinglish terms](./README.md#-configuration--customization)
- [Adjust alert thresholds](./README.md#-configuration--customization)
- [Modify CES weights](./README.md#-configuration--customization)

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Change port in .env
PORT=5001

# Or kill existing process
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### Groq API Error

- Check GROQ_API_KEY in .env
- Verify key is active at https://console.groq.com
- Wait 1 minute if exceeded rate limit

### CORS Error

- Backend must be running on :5000
- Frontend must be running on :5173
- Restart both services

### CSV Upload Fails

- Ensure CSV has "text" column
- Check file encoding (UTF-8)
- Try smaller batch (< 50 rows)

## 📈 Real-World Scenario

**You have 500 customer reviews to analyze. Here's how:**

```bash
# 1. Save reviews to CSV (reviews.csv)
text
"Amazing product! Highly recommended"
"Delivery was delayed but good quality"
"Worst purchase ever, defective"
...

# 2. Upload via UI or API
curl -X POST -F "file=@reviews.csv" \
  http://localhost:5000/api/upload

# 3. Review insights
curl http://localhost:5000/api/reports/insights

# 4. See results in dashboard
# Open http://localhost:5173
```

**Results in 2-3 minutes:**

- ✅ CSAT score calculated
- ✅ NPS determined
- ✅ Top 5 complaints identified
- ✅ Emerging issues flagged
- ✅ Department routing suggested
- ✅ Actionable recommendations generated

## 💡 Pro Tips

1. **Load Sample Data First** - Understand the platform before analyzing real data
2. **Batch Process Weekly** - Upload all reviews once per week for trend analysis
3. **Monitor Alerts** - Check dashboard daily for emerging issues
4. **Export Insights** - Use `/api/reports/insights` for executive reporting
5. **Track Metrics** - Monitor CSAT/NPS trend over time

## 🔄 Update Your Reviews Database

```bash
# Add more reviews
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "Your review here"}'

# Get current count
curl http://localhost:5000/api/health

# Reset all (for testing)
curl -X POST http://localhost:5000/api/reset
```

## 📞 Need Help?

1. **Check README.md** - Comprehensive documentation
2. **Review API Docs** - All endpoints documented
3. **Test with Sample Data** - Load demo first
4. **Check Frontend Console** - Browser dev tools for errors
5. **Server Logs** - Terminal shows request/error logs

## 🎉 You're Ready!

Your AI-powered customer review intelligence platform is now live!

**Start with:** http://localhost:5173

---

**Last Updated:** 2026-04-16  
**Version:** 1.0.0  
**Status:** Production Ready ✅
