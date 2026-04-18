# 🔧 Troubleshooting & Production Deployment Guide

## 🐛 Common Issues & Solutions

### Issue 1: "GROQ_API_KEY not found"

**Error Message**:

```
Error: GROQ_API_KEY environment variable not set
```

**Causes**:

- `.env` file missing or in wrong directory
- Key not saved after adding to `.env`
- Terminal not restarted after creating `.env`

**Solutions**:

1. **Create `.env` in backend directory**:

   ```bash
   cd backend
   echo "GROQ_API_KEY=gsk_your_key_here" > .env
   ```

2. **Verify file exists**:

   ```bash
   cat .env  # On macOS/Linux
   type .env  # On Windows PowerShell
   ```

3. **Restart backend**:

   ```bash
   npm run dev
   ```

4. **Test API connection**:
   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"ok"}
   ```

---

### Issue 2: "Port 5000 already in use"

**Error Message**:

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Causes**:

- Backend already running in another terminal
- Another app using port 5000
- Previous backend session not properly closed

**Solutions**:

**Option A: Kill existing process**

```bash
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows PowerShell:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Option B: Use different port**

```bash
# Add to .env:
PORT=5001

# Restart backend:
npm run dev

# Update frontend proxy (vite.config.js):
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001'  // ← Changed from 5000
      }
    }
  }
}
```

**Option C: Restart computer**

```bash
# Last resort - clears all node processes
npm run dev
```

---

### Issue 3: "CORS Error: Access denied from localhost:5173"

**Error Message**:

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Causes**:

- Frontend and backend ports don't match
- Backend CORS not properly configured
- Browser cache

**Solutions**:

1. **Verify ports**:

   ```bash
   # Terminal 1: Backend should be :5000
   npm run dev

   # Terminal 2: Frontend should be :5173
   npm run dev

   # Browser: Open http://localhost:5173
   ```

2. **Check backend CORS middleware**:

   ```javascript
   // backend/server.js - Should have:
   const cors = require("cors");
   app.use(
     cors({
       origin: ["http://localhost:5173", "http://localhost:3000"],
       credentials: true,
     }),
   );
   ```

3. **Clear browser cache**:

   ```
   Chrome: Ctrl+Shift+Delete → Clear browsing data
   Firefox: Ctrl+Shift+Delete → Clear Recently Used
   ```

4. **Hard refresh**:
   ```
   Chrome/Firefox: Ctrl+F5 (or Cmd+Shift+R on Mac)
   ```

---

### Issue 4: "Reviews not appearing in dashboard"

**Symptoms**:

- Analyze works (sees result in console)
- Upload works (says success)
- Dashboard shows "Total Reviews: 0"

**Causes**:

- Frontend not fetching from backend
- Backend database (reviewsDB) empty
- Network requests failing silently

**Solutions**:

1. **Check browser network tab**:

   ```
   F12 → Network → Filter "dashboard"
   Click → Look for 200 OK response with data
   ```

2. **Check backend logs**:

   ```bash
   # Terminal should show:
   POST /api/analyze 200 1234ms
   GET /api/dashboard 200 456ms
   ```

3. **Manually test API**:

   ```bash
   # Test analyze endpoint
   curl -X POST http://localhost:5000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"text":"This product is great"}'

   # Test dashboard endpoint
   curl http://localhost:5000/api/dashboard
   ```

4. **Load demo data**:
   ```
   Frontend: Click "Load Demo Data" button
   Wait 10 seconds for processing
   Check if reviews appear
   ```

---

### Issue 5: "Groq API rate limit exceeded"

**Error Message**:

```
Error: Rate limit exceeded - 30 requests per minute
```

**Causes**:

- Processing >30 reviews in 60 seconds
- Multiple clients making simultaneous requests
- Testing with large batches

**Solutions**:

1. **Wait for throttling to work**:
   - Backend auto-delays 600ms between requests
   - Processing 50 reviews = ~30 seconds (expected)
   - Just wait for it to complete

2. **Increase delay in `.env`**:

   ```bash
   GROQ_REQUEST_DELAY=1000  # 1 second instead of 600ms
   ```

3. **Reduce batch size in `.env`**:

   ```bash
   MAX_BATCH_SIZE=20  # 20 instead of 50
   # Then upload multiple 20-review batches
   ```

4. **Upgrade Groq account**:
   - Visit https://console.groq.com
   - Check pricing tiers (free → pro → enterprise)
   - Higher tiers have higher rate limits

---

### Issue 6: "CSV upload fails - 'Unexpected token'"

**Error Message**:

```
Error: Unexpected token " in JSON
```

**Causes**:

- CSV has non-UTF8 encoding
- CSV file corrupted
- Quoted fields in CSV causing issues

**Solutions**:

1. **Verify CSV format**:

   ```
   Required column: "text" or "review"
   Example:
   text,category
   "Product is great","smartphone"
   "Delivery was slow","laptop"
   ```

2. **Re-save CSV with correct encoding**:

   ```
   Excel: Save As → CSV UTF-8 (.csv)
   Google Sheets: Download → CSV
   Numbers: Export → CSV
   ```

3. **Test with sample CSV**:

   ```bash
   # Create test.csv:
   echo 'text,category
   "Great product","electronics"
   "Terrible service","support"' > test.csv

   # Upload it via frontend
   ```

4. **Check file size**:
   - Max 10MB (set in backend)
   - Very large files may timeout

---

### Issue 7: "LLM returns same analysis for different reviews"

**Symptoms**:

- All reviews get same sentiment
- All reviews mapped to same department
- Aspects not varying

**Causes**:

- LLM temperature too low (too consistent)
- Groq API connection issue
- Fallback mode activating

**Solutions**:

1. **Check if fallback is activating**:

   ```bash
   # Backend logs should show:
   Analyzing review via Groq...
   # (NOT: Using fallback analysis)
   ```

2. **Verify API connection**:

   ```bash
   # Test Groq directly:
   curl -X POST https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer $GROQ_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "llama-3.1-8b-instant",
       "messages": [{"role": "user", "content": "Test"}]
     }'
   ```

3. **Check API quota**:
   - Visit https://console.groq.com
   - Check "Analytics" → "Usage"
   - Verify you haven't exceeded monthly limit

4. **Increase LLM temperature**:
   ```javascript
   // backend/sentiment.js
   completion = await client.messages.create({
     model: "llama-3.1-8b-instant",
     temperature: 0.1, // ← Change to 0.3
     // ... rest
   });
   ```

---

### Issue 8: "Dashboard shows no trends/alerts"

**Symptoms**:

- All reviews load correctly
- KPIs calculate correctly
- Alerts section empty
- Top complaints empty

**Causes**:

- Insufficient data (need 10+ reviews)
- No negative reviews in dataset
- Trend thresholds too high

**Solutions**:

1. **Add more reviews**:

   ```bash
   - Click "Load Demo Data" (adds 30 reviews)
   - Upload CSV with 20+ reviews
   - Manually enter several negative reviews
   ```

2. **Add negative reviews**:

   ```
   - "Terrible quality, doesn't work"
   - "Shipping took forever, very disappointed"
   - "Customer service was unhelpful"
   ```

3. **Lower trend thresholds temporarily**:

   ```javascript
   // backend/trends.js
   const SPIKE_MULTIPLIER = 1.5; // ← From 2.0
   const SYSTEMIC_COMPLAINT_COUNT = 3; // ← From 5
   ```

4. **Manually trigger trends**:
   ```bash
   # Add 5 reviews about same issue:
   "Delivery is slow and takes too long"
   "Package took 2 weeks to arrive"
   "Shipping is extremely slow"
   "Why is delivery taking so long?"
   "Deliver speed is terrible"
   ```

---

### Issue 9: "Spam detector flagging legitimate reviews"

**Symptoms**:

- Short reviews marked as spam
- Real customer feedback flagged
- High spam score on good reviews

**Solutions**:

1. **Lower spam threshold**:

   ```javascript
   // backend/preprocessing.js
   const SPAM_SCORE_THRESHOLD = 30; // ← From 50 (more lenient)
   ```

2. **Check what's triggering spam score**:

   ```bash
   # In logs, should show why flagged:
   [SPAM] Repetition ratio: 0.3
   [SPAM] Keyboard mashing detected
   [SPAM] Duplicate found
   ```

3. **Whitelist legitimate patterns**:
   ```javascript
   // If "😭😭😭" gets flagged as repetition but is valid:
   if (isLegitimateEmphasis(text)) return false;
   ```

---

### Issue 10: "Frontend freezes when loading large CSV"

**Symptoms**:

- After uploading CSV, browser becomes unresponsive
- Console shows no errors
- Takes >30 seconds to process

**Causes**:

- CSV too large (>50 reviews)
- Browser rendered too many DOM elements at once
- Backend processing taking too long (LLM latency)

**Solutions**:

1. **Split larger CSV files**:

   ```bash
   # Instead of 100 reviews at once:
   # Upload 50, wait for completion
   # Upload 50 more
   ```

2. **Increase MAX_BATCH_SIZE gradually**:

   ```bash
   # Current: 50
   # If CPU powerful: Try 100
   # If CPU weak: Try 25
   ```

3. **Monitor backend processing**:
   ```bash
   # Terminal should show progress:
   Processing review 1/50...
   Processing review 2/50...
   # If stuck, server might be overloaded
   ```

---

## 🚀 Production Deployment Guide

### Pre-Deployment Checklist

- [ ] **Code Review**
  - [ ] No console.log statements left in production code
  - [ ] All error boundaries in place
  - [ ] Input validation on all endpoints
- [ ] **Security**
  - [ ] GROQ_API_KEY is secret (not in code)
  - [ ] CORS whitelist configured for your domain only
  - [ ] Rate limiting enabled (600ms throttle)
  - [ ] Auth added (if needed)
- [ ] **Performance**
  - [ ] Database indexed (if using MongoDB/PostgreSQL)
  - [ ] CDN configured (if possible)
  - [ ] Caching headers set
  - [ ] Bundle size <1MB (frontend)
- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Performance metrics collected
  - [ ] Alerts set up for failures
- [ ] **Documentation**
  - [ ] README updated with deployment info
  - [ ] Runbooks created for common issues
  - [ ] Team trained on system

---

### Deployment Option 1: Docker (Recommended)

#### Step 1: Create Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
```

#### Step 2: Build Docker image

```bash
docker build -t retail-ai-backend:1.0 -f backend/Dockerfile .
```

#### Step 3: Run container

```bash
docker run \
  -e GROQ_API_KEY=your_api_key \
  -e PORT=5000 \
  -p 5000:5000 \
  retail-ai-backend:1.0
```

#### Step 4: Push to registry

```bash
# Docker Hub
docker tag retail-ai-backend:1.0 yourusername/retail-ai-backend:1.0
docker login
docker push yourusername/retail-ai-backend:1.0

# Or: AWS ECR, Google Container Registry, etc.
```

---

### Deployment Option 2: AWS EC2

#### Setup

```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t3.medium)

# 2. SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# 3. Install dependencies
sudo apt update
sudo apt install nodejs npm git -y

# 4. Clone repository
git clone your-repo-url
cd retail_ai

# 5. Install backend packages
cd backend
npm install

# 6. Create .env
echo "GROQ_API_KEY=your_key" > .env
echo "PORT=3000" >> .env  # Use 3000 since 80/443 need sudo

# 7. Install PM2 for process management
npm install -g pm2

# 8. Start backend with PM2
pm2 start server.js --name "retail-ai"
pm2 startup
pm2 save

# 9. Setup Nginx reverse proxy
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/default
```

**Nginx configuration:**

```nginx
server {
    listen 80 default_server;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# 10. Restart Nginx
sudo systemctl restart nginx

# 11. Enable SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

### Deployment Option 3: Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Configure environment in Vercel dashboard
# Add: VITE_BACKEND_URL=https://your-backend-url.com
```

---

### Deployment Option 4: Heroku (Full Stack)

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create retail-ai-app

# 4. Set environment variables
heroku config:set GROQ_API_KEY=your_key

# 5. Deploy backend
git subtree push --prefix backend heroku main

# 6. Check logs
heroku logs --tail

# 7. Deploy frontend to Vercel (separate)
vercel
```

---

### Production Optimization

#### 1. Environment Setup

```bash
# backend/.env production
NODE_ENV=production
PORT=5000
GROQ_REQUEST_DELAY=800
MAX_BATCH_SIZE=50

# Enable monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn  # Error tracking
```

#### 2. Database Migration (from in-memory)

```javascript
// backend/database.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    id: String,
    originalText: String,
    text: String,
    language: String,
    category: String,
    overallSentiment: String,
    overallConfidence: Number,
    aspects: Object,
    priority: String,
    department: String,
    spamAnalysis: Object,
    createdAt: { type: Date, default: Date.now },
  },
  { indexes: true },
);

module.exports = mongoose.model("Review", reviewSchema);
```

#### 3. Redis Caching

```javascript
// backend/cache.js
const redis = require("redis");
const client = redis.createClient();

async function getDashboardMetrics() {
  const cached = await client.get("dashboard_metrics");
  if (cached) return JSON.parse(cached);

  const metrics = calculateMetrics();
  await client.setEx("dashboard_metrics", 300, JSON.stringify(metrics));
  return metrics;
}
```

#### 4. API Rate Limiting

```javascript
// backend/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit to 100 requests per window
  message: "Too many requests",
});

app.use("/api/", limiter);
```

---

### Monitoring & Alerting

#### 1. Error Tracking (Sentry)

```bash
npm install @sentry/node
```

```javascript
// backend/server.js
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

#### 2. Application Performance Monitoring

```bash
npm install newrelic
```

```javascript
// backend/server.js (top of file, before other requires)
require("newrelic");
```

#### 3. Uptime Monitoring

Use services like:

- **UptimeRobot**: https://uptimerobot.com
- **Pingdom**: https://www.pingdom.com
- **StatusCake**: https://www.statuscake.com

Monitor: `http://your-api.com/api/health`

---

### Scaling Strategy

```
Phase 1: Single Server (0-1000 reviews/month)
├─ Single EC2 t3.medium
├─ In-memory database
└─ No caching

Phase 2: Load Balanced (1000-10000 reviews/month)
├─ 2x EC2 instances
├─ Shared MongoDB
├─ Redis cache layer
└─ Nginx load balancer

Phase 3: Microservices (10000+ reviews/month)
├─ API Gateway
├─ Analysis service (auto-scaling)
├─ Analytics service
├─ Frontend CDN
└─ Database sharding
```

---

### Disaster Recovery

#### Backup Strategy

```bash
# Daily backup of MongoDB
mongodump --uri mongodb+srv://user:pass@cluster.mongodb.net/database
gzip -r dump/
aws s3 cp dump.tar.gz s3://backups/retail-ai/

# Retention: 30 days
```

#### Recovery Procedure

```bash
# 1. Upon data loss
aws s3 cp s3://backups/retail-ai/latest-dump.tar.gz .
gunzip -r dump.tar.gz

# 2. Restore to database
mongorestore --uri mongodb+srv://user:pass@cluster.mongodb.net dump/

# 3. Verify integrity
db.reviews.count()
db.reviews.findOne()

# 4. Resume operations
# If issues, rollback to previous day's backup
```

---

### Security Hardening

```javascript
// backend/security.js
const helmet = require("helmet");
const express = require("express");

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS.split(","),
    credentials: true,
  }),
);

// Input validation
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb" }));

// Sanitization
const mongoSanitize = require("express-mongo-sanitize");
app.use(mongoSanitize());

// Rate limiting
app.use("/api/", rateLimit);

// HTTPS redirect
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## 📋 Production Runbook

### New Review Spike

**Alert**: "50+ reviews received in last 10 minutes"

**Response**:

1. Check LLM quota: https://console.groq.com
2. If at limit, wait 60 seconds (rate limiting)
3. If not limit, check CPU: `top` command
4. If CPU >90%, add more instances
5. Scale processing to handle load

### Database Size Growing

**Alert**: "Database reached 1GB"

**Response**:

1. Archive old reviews (>90 days)
2. Check for duplicates: `db.reviews.aggregate(...)`
3. Implement partitioning by month
4. Add index on `createdAt` field

### API Response Time Slow

**Alert**: "/api/dashboard takes >2 seconds"

**Response**:

1. Check Redis cache status
2. Verify database query indexes
3. Review recent Groq rate limits
4. Check backend CPU/memory
5. Scale horizontally if needed

---

**Need help? Contact your DevOps team or consult the README.md for additional support options.**
