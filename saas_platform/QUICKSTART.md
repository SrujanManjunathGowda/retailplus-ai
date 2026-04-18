# RetailPulse SaaS Platform - Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Prerequisites

Ensure you have installed:

- Node.js 16+ ([download](https://nodejs.org))
- MongoDB ([local setup](https://docs.mongodb.com/manual/installation/) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Git

## Step 2: Get Your Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Copy your API key

## Step 3: Clone & Setup Backend

```bash
# Clone the repository
git clone <repo-url>
cd saas_platform/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your favorite editor
```

**Important .env values:**

```
MONGODB_URI=mongodb://localhost:27017/retailpulse_saas
GROQ_API_KEY=<your_groq_api_key>
JWT_SECRET=your-random-secret-key-here
FRONTEND_URL=http://localhost:5173
```

## Step 4: Start Backend Server

```bash
npm run dev
```

Expected output:

```
✓ MongoDB connected successfully
✓ Groq AI Model initialized
Server running on: http://localhost:5000
```

## Step 5: Setup Frontend

In a new terminal:

```bash
cd saas_platform/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:

```
VITE v4.x.x  ready in 500 ms
➜  Local:   http://localhost:5173/
```

## Step 6: Access the Platform

1. Open your browser: `http://localhost:5173`
2. Click "Sign Up" to create an account
3. Fill in your details and create a business
4. You're ready to go!

## Quick Test: Submit Your First Review

1. **Create a Product**
   - Navigate to "Products"
   - Click "+ Add Product"
   - Enter product details
   - Click "Create"

2. **Add a Review**
   - Go to "Reviews"
   - Click "+ Add Review"
   - Select the product you just created
   - Write a review (e.g., "This product is amazing! Great quality and fast shipping.")
   - Rate it (1-5 stars)
   - Click "Analyze & Submit"

3. **View Analysis**
   - See the AI analysis results immediately
   - Check sentiment, confidence score, and aspects
   - Groq AI identifies product quality and delivery sentiment

4. **Check Analytics**
   - Go to "Analytics"
   - View CSAT, NPS, and other metrics
   - See top aspects and insights

## API Testing with cURL

### 1. Register/Login

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "businessName": "My Business"
  }'
```

### 2. Submit a Review (with Groq AI)

```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "your_business_id",
    "productId": "your_product_id",
    "text": "Excellent product! Fast shipping and great quality.",
    "rating": 5,
    "customerName": "Jane Smith"
  }'
```

### 3. Get Review Analytics

```bash
curl http://localhost:5000/api/reviews/YOUR_BUSINESS_ID/analytics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error

```
Error: Failed to connect to MongoDB
```

**Solution:**

- Check MongoDB is running: `mongod` (if local)
- Verify MONGODB_URI in .env
- For MongoDB Atlas, ensure your IP is whitelisted

### Groq API Error

```
Error: GROQ_API_KEY is not configured
```

**Solution:**

- Get API key from https://console.groq.com
- Add to .env file
- Restart backend server

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**

```bash
# Find process on port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend not connecting to backend

```
Error: Network error / CORS error
```

**Solution:**

- Ensure backend is running on port 5000
- Check FRONTEND_URL in backend .env
- Clear browser cache and restart

## Next Steps

1. **Add More Products** - Build your product catalog
2. **Invite Team Members** - Go to Settings > Manage Users
3. **Import Reviews** - Use the API to batch import reviews
4. **Setup Notifications** - Configure email alerts in Settings
5. **Explore Reports** - Check Analytics for detailed insights

## Key Features to Try

### 📊 Real-Time Sentiment Analysis

- Submit reviews and see Groq AI analyze them instantly
- View sentiment breakdown by aspect
- Track confidence scores

### 📈 CX Metrics Dashboard

- CSAT (Customer Satisfaction) Score
- NPS (Net Promoter Score)
- CES (Customer Effort Score)
- Real-time metric updates

### 🎯 Aspect-Based Analysis

- Product quality sentiment
- Delivery experience feedback
- Service interactions
- Price perception

### 💡 Actionable Insights

- Department-specific issues
- Auto-generated recommendations
- Trend detection across reviews

## Production Deployment

When ready for production:

1. **Backend Environment**

   ```bash
   NODE_ENV=production
   # Use strong JWT_SECRET
   # Configure MongoDB Atlas
   # Enable rate limiting
   ```

2. **Frontend Build**

   ```bash
   npm run build
   # Deploy dist/ to Vercel, Netlify, or S3
   ```

3. **Enable Security**
   - Set HTTPS/SSL certificate
   - Configure CORS origins
   - Enable request logging
   - Setup database backups

## Support & Documentation

- **Full API Docs**: See README.md in project root
- **Architecture**: See ARCHITECTURE.md
- **Deployment Guide**: See DEPLOYMENT.md
- **Issues**: Check GitHub Issues or contact support

---

**Happy analyzing! 🚀**
