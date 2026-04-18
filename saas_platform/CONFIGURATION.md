# RetailPulse SaaS Platform - Configuration Guide

Comprehensive guide for configuring RetailPulse for your environment.

## Environment Variables

### Backend Configuration (.env)

#### Server & Environment

```env
# Environment mode
NODE_ENV=development  # development | production | test

# Server port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

#### Database Configuration

```env
# MongoDB URI
# Local development
MONGODB_URI=mongodb://localhost:27017/retailpulse_saas

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/retailpulse_saas?retryWrites=true&w=majority

# Connection options
MONGODB_POOL_SIZE=5
MONGODB_MAX_POOL_SIZE=10
```

#### Authentication

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=30d
JWT_REFRESH_EXPIRE=90d

# Session timeout (ms)
SESSION_TIMEOUT=1800000  # 30 minutes
```

#### Groq AI Configuration

```env
# Groq API Key (get from https://console.groq.com)
GROQ_API_KEY=gsk_... your_api_key_here

# Model selection
GROQ_MODEL=llama-3.1-8b-instant  # Recommended for speed

# Analysis settings
GROQ_TEMPERATURE=0.1             # Low for consistency
GROQ_MAX_TOKENS=500              # Max response length
GROQ_TIMEOUT=30000               # 30 seconds
GROQ_BATCH_SIZE=10               # Batch processing size
GROQ_ENABLE_BATCHING=true        # Enable/disable batch mode
```

#### Email Configuration (for notifications)

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password      # Use app-specific password, not regular password
SMTP_FROM=noreply@retailpulse.com

# Email alerts
EMAIL_ALERTS_ENABLED=true
ALERT_EMAIL_SUBJECT_PREFIX=[RetailPulse]
```

#### Stripe Payment Configuration

```env
# Stripe API Keys
STRIPE_PUBLIC_KEY=pk_test_your_public_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_test_webhook_secret

# Product IDs
STRIPE_FREE_PLAN_ID=price_...
STRIPE_PRO_PLAN_ID=price_...
STRIPE_ENTERPRISE_PLAN_ID=price_...
```

#### Logging Configuration

```env
# Log level
LOG_LEVEL=info  # error | warn | info | debug | trace

# Log files
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=14

# Console logging
CONSOLE_LOG=true
LOG_FORMAT=json  # json | simple
```

#### Rate Limiting

```env
# Rate limit window (milliseconds)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Max requests per window per user
RATE_LIMIT_MAX_REQUESTS=100

# Whitelist IPs (comma-separated)
RATE_LIMIT_WHITELIST=127.0.0.1,192.168.1.1
```

#### Feature Flags

```env
# Features
ENABLE_EMAIL_ALERTS=true
ENABLE_BATCH_ANALYSIS=true
ENABLE_EXPORT_FEATURES=true
ENABLE_API_KEY_AUTH=false
ENABLE_ANALYTICS_EXPORT=true

# AI Features
ENABLE_ASPECT_ANALYSIS=true
ENABLE_TREND_DETECTION=true
ENABLE_ANOMALY_DETECTION=false
```

#### Data Retention

```env
# How long to keep data (days)
REVIEW_RETENTION_DAYS=365
LOG_RETENTION_DAYS=30
API_USAGE_RETENTION_DAYS=30
AUDIT_LOG_RETENTION_DAYS=365
```

#### Analytics & Monitoring

```env
# Analytics Service
ANALYTICS_ENABLED=true
ANALYTICS_SERVICE=google  # google | mixpanel | amplitude

# Error Tracking (Sentry)
SENTRY_DSN=https://xxx@sentry.io/1234567
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Application Configuration

### Default Plans

Modify in `models/index.js` if needed:

```javascript
// Free Plan
plan: "free";
maxUsers: 5;
maxProducts: 10;
apiCallsLimit: 10000; // per month

// Pro Plan
maxUsers: 50;
maxProducts: 100;
apiCallsLimit: 1000000;

// Enterprise Plan
maxUsers: unlimited;
maxProducts: unlimited;
apiCallsLimit: unlimited;
```

### Groq Analysis Configuration

Modify in `services/aiService.js`:

```javascript
const MODEL_NAME = "llama-3.1-8b-instant";
const TEMPERATURE = 0.1;           // Consistency level (0-2)
const MAX_TOKENS = 500;            // Response length limit
const RESPONSE_FORMAT = "json_object"; // Force JSON output

// Aspect keywords (customize per business domain)
const aspectKeywords = {
  product: ["product", "item", "quality", ...],
  delivery: ["delivery", "shipping", ...],
  price: ["price", "cost", ...],
  service: ["service", "support", ...]
};
```

### Database Indexes

MongoDB automatically creates these indexes for optimal performance:

```javascript
// User
- email (unique)
- createdAt

// Business
- owner
- users
- subscription.status

// Product
- business
- createdAt

// Review
- business
- product
- analysis.sentiment
- analysis.priority
- createdAt (TTL for old data)
```

Add custom indexes in MongoDB:

```javascript
db.reviews.createIndex({ business: 1, createdAt: -1 });
db.reviews.createIndex({ business: 1, "analysis.priority": 1 });
```

## Frontend Configuration

### Environment Variables (.env in frontend/)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_ENV=development  # development | production

# Features
VITE_ENABLE_DEMO_MODE=false
VITE_ENABLE_DEV_TOOLS=true
```

### Build Configuration (vite.config.js)

```javascript
export default defineConfig({
  // Dev server settings
  server: {
    port: 5173,
    // Proxy API calls to backend
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  // Build optimization
  build: {
    outDir: "dist",
    minify: "terser",
    sourcemap: false,
    // Chunk size limits
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["recharts", "react-hot-toast"],
        },
      },
    },
  },
});
```

### Component Configuration

Customize styling in `src/index.css`:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #16a34a;
  --error-color: #dc2626;
}
```

## Advanced Configuration

### Security Headers

Add to backend server.js:

```javascript
app.use((req, res, next) => {
  // Security headers
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  res.header("Content-Security-Policy", "default-src 'self'");
  next();
});
```

### CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL?.split(",") || "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

### Rate Limiting Strategy

Customize in middleware:

```javascript
// Per-user limits
const limits = {
  free: { requests: 100, window: 900000 }, // 100/15min
  pro: { requests: 1000, window: 900000 }, // 1000/15min
  enterprise: { requests: 10000, window: 900000 }, // 10000/15min
};
```

### Database Connection Pooling

```javascript
const mongooseOptions = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: "majority",
};
```

## Performance Tuning

### Caching Strategy

```javascript
// Cache business analytics (5 minutes)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCachedAnalytics(businessId) {
  const cached = cache.get(businessId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}
```

### Database Query Optimization

```javascript
// Use projection to limit fields
Review.find(query)
  .select("text analysis.sentiment analysis.confidence")
  .lean() // Return plain objects, not Mongoose documents
  .limit(50);

// Use aggregation for complex analytics
db.reviews.aggregate([
  { $match: { business: businessId } },
  {
    $group: {
      _id: "$analysis.sentiment",
      count: { $sum: 1 },
      avgConfidence: { $avg: "$analysis.overallConfidence" },
    },
  },
]);
```

### API Response Optimization

```javascript
// Compression
app.use(
  compression({
    level: 6,
    threshold: 1024, // Only compress > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);
```

## Monitoring Configuration

### Health Check Endpoint

```bash
curl http://localhost:5000/health
```

Returns:

```json
{
  "status": "OK",
  "service": "RetailPulse SaaS Platform",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "database": "connected",
  "groqAI": "ready"
}
```

### Metrics Collection

Add to middleware:

```javascript
const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  avgResponseTime: 0,
  statusCodes: {},
};

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    metrics.totalRequests++;
    metrics.statusCodes[res.statusCode] =
      (metrics.statusCodes[res.statusCode] || 0) + 1;
  });
  next();
});
```

## Troubleshooting Configuration

### Common Issues

**Connection Timeout**

```env
# Increase timeout values
MONGODB_CONNECT_TIMEOUT=10000
GROQ_TIMEOUT=60000
```

**Memory Leak**

```bash
# Monitor with node-inspect
node --inspect server.js
# Visit chrome://inspect
```

**Slow Queries**

```env
# Enable slow query logging
LOG_LEVEL=debug
```

---

For additional configuration help, see the main README.md
