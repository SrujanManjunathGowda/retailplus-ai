# RetailPulse SaaS Platform - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pages: Dashboard, Products, Reviews, Analytics, Settings │   │
│  │ Components: Layout, Navigation, Charts, Forms            │   │
│  │ State: Zustand stores (Auth, Business, Reviews, Products)│   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST API │
                              │
┌──────────────────────────────────────────────────────────────────┐
│                   Backend (Express.js + Node.js)                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Routes                                                   │   │
│  │  ├─ /api/auth          (Register, Login, Refresh)       │   │
│  │  ├─ /api/businesses    (CRUD, Analytics, Users)         │   │
│  │  ├─ /api/products      (CRUD, List)                     │   │
│  │  └─ /api/reviews       (Submit, Analyze, List, Analytics) │  │
│  └───────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Services                                                 │   │
│  │  └─ aiService.js       (Groq AI Integration)            │   │
│  │     ├─ analyzeSentiment() → Groq API                    │   │
│  │     ├─ calculateCXMetrics()                             │   │
│  │     ├─ generateExecutiveSummary()                       │   │
│  │     └─ getTopInsights()                                 │   │
│  └───────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  Middleware                                               │   │
│  │  ├─ authMiddleware        (JWT validation)              │   │
│  │  ├─ businessContextMiddleware (Tenant context)          │   │
│  │  ├─ rateLimitMiddleware   (Usage tracking)              │   │
│  │  ├─ errorHandler          (Error handling)              │   │
│  │  └─ requestLogger         (Logging)                     │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                    MongoDB API │
                              │
┌──────────────────────────────────────────────────────────────────┐
│                         MongoDB                                   │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │ Collections:                                              │   │
│  │ ├─ users        (email, password, role, businesses)     │   │
│  │ ├─ businesses   (owner, products, users, subscription)  │   │
│  │ ├─ products     (name, category, reviews, analytics)    │   │
│  │ ├─ reviews      (text, analysis*, rating, status)       │   │
│  │ ├─ insights     (business, product, type, priority)     │   │
│  │ ├─ reports      (business, metrics, period)             │   │
│  │ └─ apiusage     (business, endpoint, timestamp)         │   │
│  └───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                              │
                   Groq API Call │
                              │
┌──────────────────────────────────────────────────────────────────┐
│                    Groq Cloud / API                               │
│  Model: llama-3.1-8b-instant                                     │
│  - Lightning-fast sentiment analysis                             │
│  - JSON response format                                          │
│  - <100ms latency per review                                     │
└──────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Architecture (React + Vite)

**Technology Stack:**

- React 18 - UI library
- Vite - Build tool (lightning-fast dev server)
- React Router - Client-side routing
- Zustand - State management (lightweight, no boilerplate)
- Axios - HTTP client with interceptors
- Tailwind CSS - Utility-first CSS
- React Hot Toast - Notifications

**State Management (Zustand Stores):**

```javascript
-useAuthStore - // User auth, login, logout
  useBusinessStore - // Business context, analytics
  useReviewStore - // Reviews, submissions
  useProductStore; // Products CRUD
```

**Pages Structure:**

```
src/pages/
├─ Login.jsx           - Authentication
├─ Signup.jsx          - User registration
├─ Dashboard.jsx       - Main KPI overview
├─ Products.jsx        - Product management
├─ Reviews.jsx         - Review submission & listing
├─ Analytics.jsx       - Detailed analytics
└─ Settings.jsx        - Business & account settings
```

### 2. Backend Architecture (Express.js + Node.js)

**Technology Stack:**

- Express.js 5 - Web framework
- MongoDB - NoSQL database
- Mongoose - ODM
- Groq SDK - AI integration
- JWT - Authentication
- Bcrypt - Password hashing

**Request Flow:**

```
HTTP Request
    ↓
CORS Middleware
    ↓
Request Logger
    ↓
Auth Middleware (JWT verification)
    ↓
Business Context Middleware (tenant isolation)
    ↓
Rate Limit Middleware (usage tracking)
    ↓
Route Handler
    ├─ Input Validation
    ├─ Database Query
    ├─ AI Processing (if review submission)
    ├─ Analytics Update
    └─ Response
    ↓
Error Handler (if error)
    ↓
HTTP Response
```

### 3. Groq AI Integration

**Review Analysis Pipeline:**

```
Review Text Input
    ↓
[AI Analysis Service]
    ├─ Text Validation (min 3 chars)
    ├─ Groq API Call
    │  ├─ System Prompt (sentiment rules)
    │  ├─ User Input (review text)
    │  ├─ Model: llama-3.1-8b-instant
    │  ├─ Temperature: 0.1 (consistency)
    │  └─ Response Format: JSON
    ├─ Response Parsing
    └─ Fallback if API Error
    ↓
Analysis Result
├─ overallSentiment (positive/negative/neutral/mixed)
├─ overallConfidence (0-100)
├─ aspects {} (aspect-level sentiment)
├─ insights [] (key takeaways)
├─ suggestedActions [] (recommendations)
└─ priority (HIGH/MEDIUM/LOW)
    ↓
[Store in MongoDB]
    ├─ Save to Review document
    ├─ Update Product analytics
    ├─ Update Business analytics
    └─ Create Insight if priority=HIGH
    ↓
Return to Client
```

### 4. Database Schema Design

**Multi-Tenant Isolation:**

- Every collection has `business` field
- Queries always filter by current business
- No cross-tenant data access possible

**Key Collections:**

```javascript
// User Model
{
  email,           // unique index
  password,        // bcrypted
  firstName,
  lastName,
  role,           // admin, business_user, analyst
  businesses,     // [ObjectId]
  isActive,
  createdAt
}

// Business Model (Tenant)
{
  owner,          // User reference
  name,
  industry,
  products,       // [ObjectId]
  users,          // [ObjectId]

  subscription: {
    plan,         // free, pro, enterprise
    status,       // active, paused, cancelled
    maxUsers,
    maxProducts,
    apiCallsLimit,
    apiCallsUsed
  },

  analytics: {    // Denormalized for performance
    totalReviews,
    totalProducts,
    csat,
    nps,
    averageConfidence,
    lastAnalysisUpdate
  },

  groqSettings: {
    enabled,
    analysisModel,
    confidenceThreshold
  }
}

// Review Model (with Groq Analysis)
{
  product,        // Product reference
  business,       // Business reference (tenant isolation)
  text,
  rating,
  source,         // manual, api, import, email

  analysis: {
    status,       // pending, valid, invalid, fallback
    sentiment,    // From Groq AI
    overallConfidence,  // 0-100
    explanation,
    priority,     // HIGH, MEDIUM, LOW
    aspects,      // { product: { sentiment, confidence } }
    insights,     // []
    suggestedActions,
    analyzedAt,
    language
  },

  isSpam,
  spamScore,
  isDuplicate,

  isResolved,
  response,
  responseGeneratedAt,
  respondedBy
}
```

### 5. Authentication & Security

**JWT Flow:**

```
User Credentials
    ↓
[Auth Service]
├─ Verify email exists
├─ Bcrypt compare password
├─ Generate JWT token
│  └─ Payload: { id, email, role }
│  └─ Expiry: 30 days
└─ Return token
    ↓
Client stores token in localStorage
    ↓
[Protected Route]
├─ Extract token from header
├─ Verify JWT signature
├─ Check token expiry
├─ Fetch user from DB
└─ Attach req.user
    ↓
Route Handler
```

**Password Security:**

- Bcrypt with 10 salt rounds
- Never store plaintext passwords
- Never return password in API responses
- Automatic hashing on user create/update

**Tenant Isolation:**

- Every query filters by `business` field
- Middleware ensures user has access to business
- No cross-tenant queries possible

### 6. API Architecture

**REST Conventions:**

- GET /api/resource - List/fetch
- POST /api/resource - Create
- PUT /api/resource/:id - Update
- DELETE /api/resource/:id - Delete

**Response Format:**

```json
// Success
{
  "message": "...",
  "data": { ... }
}

// Error
{
  "error": "Error message",
  "details": "Optional details"
}
```

**Status Codes:**

- 200 - Success
- 201 - Created
- 400 - Bad request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not found
- 429 - Rate limit exceeded
- 500 - Server error

### 7. Performance Optimization

**Database:**

- Indexed queries on email, business, product
- Denormalized analytics fields
- TTL index on apiusage collection (30 days)
- Connection pooling with MongoDB

**API Response:**

- JSON compression
- Response caching headers
- Pagination (limit/offset)
- Selective field projection

**Frontend:**

- Vite code splitting
- React lazy loading
- Axios request interceptors
- Zustand optimized state updates

**AI Analysis:**

- Groq model is pre-optimized (<100ms)
- Optional batch processing for reviews
- Fallback analysis if API fails
- Temperature=0.1 for consistency

## Scaling Considerations

### Horizontal Scaling

- Stateless backend servers
- Load balancer (Nginx, HAProxy)
- Session state in MongoDB (no server-side sessions)
- JWT for distributed auth

### Vertical Scaling

- Increase server resources
- Database indexing optimization
- Connection pooling tuning
- Cache layer (Redis) for frequent queries

### Database Scaling

- Sharding by business_id
- Replica sets for HA
- Read replicas for analytics queries
- Backup/disaster recovery

## Deployment Architecture

```
┌─────────────────────┐
│   Client Browser    │
└────────────┬────────┘
             │ HTTPS
    ┌────────▼────────┐
    │  CDN / Frontend  │
    │   (Vercel/S3)   │
    └────────┬────────┘
             │ API Calls
    ┌────────▼────────┐
    │   Load Balancer │
    └────────┬────────┘
             │
    ┌────────▼────────────────────────┐
    │   Backend Servers (Autoscaling)  │
    │   ├─ Server 1 (Express)         │
    │   ├─ Server 2 (Express)         │
    │   └─ Server N (Express)         │
    └────────┬────────────────────────┘
             │
    ┌────────▼────────────────┐
    │   MongoDB Cluster       │
    │   ├─ Primary            │
    │   ├─ Secondary 1        │
    │   └─ Secondary 2        │
    └─────────────────────────┘
```

## Data Flow Examples

### Example 1: Submit Review

```
User (Frontend)
  │
  └─→ POST /api/reviews
      │
      ├─ Input Validation
      ├─ Verify Product Access
      │
      ├─→ [AI Service]
      │   │
      │   └─→ Groq API Call
      │       ├─ llama-3.1-8b-instant
      │       └─ Returns JSON analysis
      │
      ├─ Save Review with Analysis
      ├─ Update Product.reviews
      ├─ Update Product.analytics
      ├─ Update Business.analytics
      │
      └─→ Return Review + Analysis
          │
          └─ Frontend displays results
```

### Example 2: Get Analytics Dashboard

```
User (Frontend)
  │
  └─→ GET /api/businesses/:businessId/analytics
      │
      ├─ Auth check (middleware)
      ├─ Tenant check (middleware)
      │
      ├─ Query Reviews (filter by business)
      ├─ Query Products (filter by business)
      │
      ├─ Calculate CX Metrics
      │   ├─ CSAT = (positive+mixed) / total
      │   ├─ NPS = (promoters - detractors) / total
      │   └─ sentimentBreakdown count
      │
      ├─ Identify Top Aspects
      ├─ Generate Top Products
      └─ Return aggregated data
          │
          └─ Frontend renders charts
```

---

**Next Steps:** See DEPLOYMENT.md for production setup
