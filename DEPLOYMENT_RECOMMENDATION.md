# 🚀 Solar AI Platform - Deployment Architecture Recommendation

Based on your project analysis, here's an optimal deployment strategy.

---

## 📊 Project Summary

**Tech Stack:**

- **Backend:** FastAPI (Python 3.11) + PostgreSQL + Redis + Firebase
- **Frontend:** Next.js 16 + React + TypeScript + Firebase Auth
- **ML Models:** YOLO (roof detection) + Random Forest (forecasting)
- **Storage:** Firebase Storage (configured)
- **Auth:** Firebase Authentication + JWT

**Key Components:**

- Heavy ML inference (YOLO for images, Random Forest predictions)
- Real-time API (rate-limited)
- File uploads (max 10MB)
- Async database with connection pooling

---

## 🎯 Recommended Deployment Stack

### **Tier 1: RECOMMENDED (Best Balance)**

```
┌─────────────────────────────────────────────────────────┐
│                  RECOMMENDED SETUP                      │
├─────────────────────────────────────────────────────────┤
│ Frontend:    Vercel                                     │
│ Backend:     Railway.app                                │
│ Database:    PostgreSQL (Railway managed)               │
│ File Store:  Firebase Storage (free tier)               │
│ Auth:        Firebase Authentication                    │
│ Monitoring:  Railway + Sentry (optional)                │
│                                                         │
│ Monthly Cost: $5-20 (free tier included)                │
└─────────────────────────────────────────────────────────┘
```

**Why this stack?**

- ✅ Next.js optimized (Vercel native)
- ✅ PostgreSQL support (Railway excels at this)
- ✅ Easy scaling for ML workloads
- ✅ Simple to manage + good documentation
- ✅ Firebase integration already built-in
- ✅ Free tier covers small-medium projects

---

### **Tier 2: ENTERPRISE (Scalable)**

```
┌─────────────────────────────────────────────────────────┐
│              ENTERPRISE SETUP                           │
├─────────────────────────────────────────────────────────┤
│ Frontend:    Vercel (or AWS CloudFront + S3)            │
│ Backend:     AWS EC2 (t3.medium) or ECS                 │
│ Database:    AWS RDS PostgreSQL (managed)               │
│ File Store:  AWS S3                                     │
│ ML Models:   Lambda (serverless) or EC2                 │
│ Auth:        Firebase or AWS Cognito                    │
│ CDN:         CloudFront                                 │
│ Monitoring:  CloudWatch + Datadog                       │
│                                                         │
│ Monthly Cost: $50-150+                                  │
└─────────────────────────────────────────────────────────┘
```

**Why AWS?**

- ✅ Unlimited scalability
- ✅ Global CDN (CloudFront)
- ✅ High-performance RDS
- ✅ Auto-scaling groups
- ✅ Better for CPU-intensive ML

---

### **Tier 3: BUDGET (Free/Minimal Cost)**

```
┌─────────────────────────────────────────────────────────┐
│              BUDGET-FRIENDLY SETUP                      │
├─────────────────────────────────────────────────────────┤
│ Frontend:    Vercel (free tier) or GitHub Pages         │
│ Backend:     Render.com (free tier) or Heroku free tier*│
│ Database:    Railway (free tier) or Supabase (free)     │
│ File Store:  Firebase Storage (free)                    │
│ Auth:        Firebase Authentication (free)            │
│                                                         │
│ Monthly Cost: FREE (with limitations)                   │
│ * Heroku free tier will be discontinued Nov 2024        │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Step-by-Step: Railway Deployment (Recommended)

### **1. Prepare Backend**

```bash
# Update .env for production
cd backend

# Create production environment file
cat > .env.production << 'EOF'
ENVIRONMENT=production
DEBUG=False
APP_NAME=Solar AI Platform
DATABASE_URL=postgresql+asyncpg://user:pass@railway-db:5432/solar_db
REDIS_URL=redis://:password@redis-host:6379/0
ALLOWED_ORIGINS_STR=https://your-frontend.vercel.app
SECRET_KEY=generate-strong-random-key-here
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=...
# Add other Firebase creds
EOF
```

### **2. Deploy Backend to Railway**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Create new Railway project
railway init

# Link project
railway link

# Deploy
git push origin main  # Or deploy directly with railway up
```

### **3. Create PostgreSQL Database**

In Railway dashboard:

1. Add Plugin → PostgreSQL
2. Copy connection string to `DATABASE_URL`
3. Run migrations:
   ```bash
   alembic upgrade head
   ```

### **4. Deploy Frontend to Vercel**

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_FIREBASE_API_KEY
# - NEXT_PUBLIC_FIREBASE_PROJECT_ID
# - NEXT_PUBLIC_API_BASE_URL=https://railway-backend.railway.app/api/v1
```

### **5. Update CORS & Auth**

Update `backend/app/core/config.py`:

```python
ALLOWED_ORIGINS_STR = "https://your-app.vercel.app,https://www.your-app.vercel.app"
```

Update `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend-railway.railway.app/api/v1
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

---

## 🗄️ Database Options Comparison

| Provider               | Type               | Storage     | Backup    | Cost        | Best For    |
| ---------------------- | ------------------ | ----------- | --------- | ----------- | ----------- |
| **Railway PostgreSQL** | Managed SQL        | 5GB free    | Automatic | $5/mo       | Recommended |
| **Supabase**           | Managed PostgreSQL | 500MB free  | Automatic | Free tier   | Alternative |
| **AWS RDS**            | Managed SQL        | Pay-per-use | Automatic | $15+/mo     | Enterprise  |
| **Firebase Firestore** | NoSQL              | 1GB free    | Automatic | Pay-per-use | Lightweight |

**Recommendation:** Use Railway PostgreSQL (already in your config).

---

## 💾 File Storage Options

### Option 1: Firebase Storage (RECOMMENDED)

```
✅ Already integrated in your code
✅ 5GB free tier
✅ Simple authentication
✅ Great for images (YOLO inputs)
Cost: Free for first 5GB/month
```

### Option 2: AWS S3

```
✅ Unlimited storage
✅ Better for large files
✅ Signed URLs for downloads
Cost: ~$0.023/GB (first 50TB)
```

### Option 3: Cloudinary

```
✅ Image optimization built-in
✅ Good for ML preprocessing
Cost: Free tier includes 25GB
```

**Recommendation:** Keep Firebase Storage (zero config needed).

---

## 🔐 Environment Variables Checklist

Create `.env.production`:

```bash
# === BACKEND ===
ENVIRONMENT=production
DEBUG=False
APP_NAME=Solar AI Platform
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40

# API
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS_STR=https://your-frontend.vercel.app
ALLOWED_HOSTS_STR=your-api-domain.railway.app

# Rate Limiting
RATE_LIMIT_DEFAULT=120/minute
RATE_LIMIT_ML=30/minute
REDIS_URL=redis://:password@redis-host:6379/0

# Firebase (Backend Admin)
FIREBASE_PROJECT_ID=your-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
FIREBASE_CLIENT_ID=...
FIREBASE_CLIENT_X509_CERT_URL=...

# ML Models (keep in repo or use model registry)
MODELS_BASE_DIR=/app/trained-models

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# === FRONTEND ===
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# API Endpoint
NEXT_PUBLIC_API_BASE_URL=https://your-api.railway.app/api/v1
```

---

## 🚨 ML Models Deployment Strategy

### Challenge: Model Size

- YOLO: ~100MB
- Random Forest models: ~50MB
- Total: ~150MB

### Solution 1: Ship with Backend (RECOMMENDED)

```
✅ Simple deployment
✅ No additional latency
✅ Models available at startup
❌ Larger Docker image (~200MB base + 150MB models)
```

**How to:**

1. Keep models in `trained-models/` folder
2. Add to `.dockerignore` (or include selectively)
3. Load during app startup in `core/config.py`

### Solution 2: Model Registry (Hugging Face / ModelHub)

```
✅ Lighter Docker image
✅ Version control for models
❌ Download latency on startup
```

**How to:**

```python
from huggingface_hub import hf_hub_download

model_path = hf_hub_download("your-username/solar-models", "yolo.pt")
```

### Solution 3: AWS Lambda (Serverless)

```
✅ Pay only when used
✅ Auto-scaling
❌ Cold start latency (10-30s)
```

**Recommendation:** Solution 1 - Ship models with backend (simplest for small-medium load).

---

## 📈 Scaling Strategy

### Phase 1: Launch (~100 users)

- Single Railway dyno (512MB)
- PostgreSQL basic plan
- Firebase Storage (free tier)
- Cost: ~$10/month

### Phase 2: Growth (~1,000 users)

- Railway Standard dyno (2GB)
- PostgreSQL Pro plan
- Redis for caching
- Cost: ~$30-50/month

### Phase 3: Scale (~10,000+ users)

- Multiple Railway instances (auto-scale)
- RDS PostgreSQL (multi-AZ)
- AWS Lambda for ML (serverless)
- CloudFront for CDN
- Cost: ~$100-200/month

---

## 🔍 Monitoring & Observability

### Essential Metrics

```
1. API Response Time (target: <500ms)
2. ML Inference Time (target: <5s for YOLO)
3. Database Query Time (target: <200ms)
4. Error Rate (target: <1%)
5. Memory Usage (target: <80%)
```

### Tools

- **Railway Dashboard:** Built-in logs & metrics
- **Sentry:** Error tracking (free tier)
- **Datadog:** Advanced monitoring (optional, paid)
- **Grafana:** Self-hosted dashboard (optional)

### Setup Sentry

```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment="production"
)
```

---

## 💡 Cost Breakdown (Monthly)

| Service           | Free    | Recommended | Enterprise |
| ----------------- | ------- | ----------- | ---------- |
| Frontend (Vercel) | $0      | $0-20       | $20+       |
| Backend (Railway) | $5      | $5-15       | $50+       |
| Database          | $5      | $5-15       | $50+       |
| Storage           | $0      | $0-5        | $10+       |
| **TOTAL**         | **$10** | **$10-55**  | **$130+**  |

---

## ✅ Deployment Checklist

- [ ] Update `ALLOWED_ORIGINS_STR` in config
- [ ] Generate strong `SECRET_KEY`
- [ ] Create Firebase service account JSON
- [ ] Set up Railway PostgreSQL
- [ ] Run Alembic migrations (`alembic upgrade head`)
- [ ] Test API endpoints on staging
- [ ] Configure CORS headers
- [ ] Set up Vercel environment variables
- [ ] Test Firebase Auth flow
- [ ] Test file upload functionality
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring (Sentry/Railway)
- [ ] Configure backups (PostgreSQL)
- [ ] Document API endpoint in frontend
- [ ] Test ML inference (YOLO, Random Forest)

---

## 🔗 Quick Links

- **Railway:** https://railway.app
- **Vercel:** https://vercel.com
- **Firebase Console:** https://console.firebase.google.com
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **FastAPI Deployment:** https://fastapi.tiangolo.com/deployment/

---

## 📞 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'ultralytics'"

**Fix:** Add to `requirements.txt`: `ultralytics>=8.0.0`

### Issue: YOLO model takes 10+ seconds to load

**Fix:** Load model once at startup, keep in memory:

```python
# In app/core/config.py or main.py
@lru_cache(maxsize=1)
def get_yolo_model():
    from ultralytics import YOLO
    return YOLO(str(YOLO_MODEL_PATH))
```

### Issue: "CORS error" in frontend

**Fix:** Update `ALLOWED_ORIGINS_STR` in backend config and redeploy.

### Issue: Database connection pooling exhausted

**Fix:** Increase `DATABASE_POOL_SIZE` and `DATABASE_MAX_OVERFLOW` in `.env`.

---

**Recommended Action:** Deploy to Railway + Vercel following the step-by-step guide above. This gives you production-ready setup in 30 minutes.
