# RetailPulse SaaS Platform - Deployment Guide

Complete guide for deploying RetailPulse to production.

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificate ready
- [ ] Groq API key set
- [ ] MongoDB replication configured
- [ ] Frontend optimized (npm run build)
- [ ] Backend security headers configured

## Backend Deployment

### Option 1: Heroku (Quickest)

```bash
# 1. Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# 2. Login to Heroku
heroku login

# 3. Create app
heroku create retailpulse-api

# 4. Add buildpack (Node.js)
heroku buildpacks:add heroku/nodejs

# 5. Configure environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set GROQ_API_KEY=your_groq_api_key
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/retailpulse_saas
heroku config:set FRONTEND_URL=https://your-frontend-url.com

# 6. Deploy
git push heroku main

# 7. View logs
heroku logs --tail
```

### Option 2: AWS EC2

```bash
# 1. SSH into EC2 instance
ssh -i key.pem ubuntu@your-instance-ip

# 2. Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install MongoDB (or use MongoDB Atlas)
# If using local MongoDB:
sudo apt-get install -y mongodb-org
sudo systemctl start mongod

# 4. Clone repository
git clone your-repo-url
cd saas_platform/backend

# 5. Install dependencies
npm install --production

# 6. Create .env file
nano .env
# Add all configuration

# 7. Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "retailpulse-api"
pm2 startup
pm2 save

# 8. Setup Nginx as reverse proxy
sudo apt-get install -y nginx

# Create Nginx config
sudo tee /etc/nginx/sites-available/retailpulse > /dev/null << EOF
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/retailpulse /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# 9. Setup SSL with Let's Encrypt
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-api-domain.com
```

### Option 3: Docker

```bash
# 1. Create Dockerfile in backend/
cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
EOF

# 2. Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/retailpulse_saas
      - GROQ_API_KEY=${GROQ_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:6.0
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=retailpulse_saas
    restart: always

volumes:
  mongo_data:
EOF

# 3. Build and run
docker-compose up -d

# 4. View logs
docker-compose logs -f api
```

### Option 4: Google Cloud Run

```bash
# 1. Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
gcloud init

# 2. Set project
gcloud config set project YOUR_PROJECT_ID

# 3. Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/retailpulse-api

# 4. Deploy to Cloud Run
gcloud run deploy retailpulse-api \
  --image gcr.io/YOUR_PROJECT_ID/retailpulse-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI=your_mongodb_uri,GROQ_API_KEY=your_api_key,JWT_SECRET=your_secret \
  --memory 512Mi \
  --timeout 3600

# 5. Get service URL
gcloud run services describe retailpulse-api --platform managed --region us-central1
```

## Frontend Deployment

### Option 1: Vercel (Recommended for React)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
cd saas_platform/frontend
vercel

# 3. Configure environment
# In Vercel dashboard > Settings > Environment Variables
VITE_API_URL=https://your-api-domain.com/api

# 4. Production deployment
vercel --prod
```

### Option 2: Netlify

```bash
# 1. Install Netlify CLI
npm i -g netlify-cli

# 2. Build
cd saas_platform/frontend
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist

# 4. Configure build settings
# Build command: npm run build
# Publish directory: dist
# Environment variables: VITE_API_URL=...
```

### Option 3: AWS S3 + CloudFront

```bash
# 1. Build frontend
cd saas_platform/frontend
npm run build

# 2. Create S3 bucket
aws s3 mb s3://retailpulse-frontend

# 3. Upload files
aws s3 sync dist/ s3://retailpulse-frontend

# 4. Configure CloudFront for HTTPS/CDN
# Via AWS Console or AWS CLI

# 5. Point domain to CloudFront
# Update DNS CNAME records
```

### Option 4: Nginx Static Hosting

```bash
# On your server
sudo mkdir -p /var/www/retailpulse
cd saas_platform/frontend
npm run build
sudo cp -r dist/* /var/www/retailpulse/

# Configure Nginx
sudo tee /etc/nginx/sites-available/retailpulse-frontend > /dev/null << 'EOF'
server {
    listen 443 ssl http2;
    server_name your-app-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-app-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-app-domain.com/privkey.pem;

    root /var/www/retailpulse;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass https://your-api-domain.com;
    }
}
EOF

sudo systemctl restart nginx
```

## Database Setup

### MongoDB Atlas (Cloud - Recommended)

```bash
# 1. Create cluster at https://www.mongodb.com/cloud/atlas
# 2. Create database user
# 3. Whitelist IP addresses
# 4. Get connection string
# 5. Add to .env: MONGODB_URI=mongodb+srv://...
```

### MongoDB Self-Hosted

```bash
# 1. Install MongoDB on server
# (See Option 2 EC2 section above)

# 2. Enable Replication for HA
cat > /etc/mongod.conf << 'EOF'
replication:
  replSetName: "rs0"
EOF

mongosh
rs.initiate()

# 3. Create application user
use retailpulse_saas
db.createUser({
  user: "app_user",
  pwd: "strong_password",
  roles: ["readWrite"]
})

# 4. Enable authentication in mongod.conf
security:
  authorization: "enabled"
```

## Monitoring & Logs

### Application Monitoring

```bash
# Using PM2 (on EC2/self-hosted)
pm2 monit
pm2 logs

# Using CloudWatch (AWS)
aws logs tail /aws/lambda/retailpulse-api --follow

# Using Stackdriver (GCP)
gcloud logging read --limit=50 --follow
```

### Error Tracking (Sentry)

```bash
# 1. Create Sentry project at https://sentry.io
# 2. Install Sentry in backend
npm install @sentry/node

# 3. Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({
  dsn: "your_sentry_dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});

# 4. Dashboard at https://sentry.io/organizations/...
```

## Performance Optimization

### Backend

```javascript
// Enable compression
app.use(compression());

// Enable caching
app.use((req, res, next) => {
  res.header("Cache-Control", "public, max-age=3600");
  next();
});

// Database connection pooling
mongoose.connect(URI, {
  maxPoolSize: 10,
  minPoolSize: 5,
});
```

### Frontend

```bash
# Build optimization
npm run build  # Creates optimized dist/

# Enable gzip compression
# In Vercel/Netlify: automatic
# In Nginx: add gzip on; to nginx.conf

# Setup CDN
# Use Cloudflare, CloudFront, or similar
```

## Security Configuration

### HTTPS/SSL

```bash
# Let's Encrypt (Free)
sudo certbot certonly --standalone -d your-domain.com

# Configure auto-renewal
sudo certbot renew --quiet --no-self-upgrade
# Add to crontab: 0 3 * * * sudo certbot renew --quiet --no-self-upgrade
```

### Environment Security

```bash
# Rotate secrets regularly
# Use secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)

# Never commit .env files
echo ".env" >> .gitignore

# Use .env.example for documentation
```

### CORS Configuration

```javascript
app.use(
  cors({
    origin: "https://your-frontend-domain.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

## Database Backups

### MongoDB Atlas (Automatic)

- Backups enabled by default
- Dashboard: Backup > Configure

### Manual Backups

```bash
# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/retailpulse_saas" --out /backups/

# Restore
mongorestore --uri="mongodb+srv://..." /backups/
```

## Scaling Strategy

### Phase 1: Initial Launch (1-100 users)

- Single server EC2 or PaaS (Heroku)
- MongoDB Atlas free tier or small cluster
- CloudFront CDN for frontend

### Phase 2: Growing (100-10k users)

- Load balancer with 2-3 backend servers
- MongoDB replica set
- Redis for caching
- Separate analytics worker processes

### Phase 3: Enterprise (10k+ users)

- Kubernetes cluster (EKS, GKE, AKS)
- MongoDB sharded cluster
- Multi-region deployment
- Dedicated Groq API tier

## Post-Deployment Testing

```bash
# Health check
curl https://your-api-domain.com/health

# API test
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass"}'

# Database connection
curl https://your-api-domain.com/api/version

# Load testing
npm install -g artillery
artillery quick --count 100 --num 1000 https://your-api-domain.com
```

## Troubleshooting

### Common Issues

**Cold Start on Serverless:**

- Solution: Use provisioned concurrency or reserved capacity

**Database Connection Timeout:**

- Solution: Increase maxPoolSize, check firewall/security groups

**High Memory Usage:**

- Solution: Implement pagination, optimize queries, add Redis caching

**API Rate Limiting Issues:**

- Solution: Adjust RATE_LIMIT settings, use API gateway

## Maintenance

### Regular Tasks

```bash
# Weekly
- Monitor error logs in Sentry
- Check database size and indexes
- Review API performance metrics

# Monthly
- Update Node.js and dependencies
- Review and rotate secrets
- Check SSL certificate expiration
- Backup database

# Quarterly
- Security audit
- Performance optimization review
- Capacity planning assessment
```

---

**Deployment complete! Monitor your application and watch it scale.** 🚀
