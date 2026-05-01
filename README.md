# ☀️ Solar AI Optimization Platform

**AI-powered solar energy forecasting, savings prediction, and roof detection system.**

[![GitHub](https://img.shields.io/badge/GitHub-solar--2-blue?logo=github)](https://github.com/varshithdepa45/solar-2)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production--Ready-success)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Firebase Migration](#firebase-migration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Solar AI is a full-stack SaaS platform that uses machine learning to:

1. **Analyze Rooftops** - YOLOv8 computer vision detects solar-suitable areas from aerial imagery
2. **Forecast Energy** - Random Forest ML predicts hourly/daily solar generation with confidence intervals
3. **Project Savings** - Financial modeling calculates ROI, payback period, and 25-year NPV

**Use Cases:**

- Solar installers qualifying leads and predicting system performance
- Homeowners estimating financial returns on solar investments
- Energy companies analyzing roof adoption potential
- Utilities planning distributed solar capacity

---

## ✨ Features

### 🏢 Backend (FastAPI)

- ✅ **Multi-version API** (v1 production, v2 beta)
- ✅ **Async/Await** - High-performance request handling
- ✅ **Rate Limiting** - Per-IP, per-endpoint tiers via slowapi + Redis
- ✅ **Health Checks** - Kubernetes-ready liveness/readiness probes
- ✅ **ML Model Registry** - Lazy-loaded, thread-safe singleton pattern
- ✅ **Structured Logging** - JSON format with correlation IDs
- ✅ **Error Handling** - Standardized response envelopes
- ✅ **Security Middleware** - CORS, CSRF, security headers (OWASP)

### 🎨 Frontend (Next.js)

- ✅ **5 Main Pages** - Landing, dashboard, roof detection, solar estimation, admin
- ✅ **40+ UI Components** - shadcn/ui with Radix primitives
- ✅ **Dark Mode** - Theme provider with next-themes
- ✅ **Animations** - Framer Motion for scroll/hover effects
- ✅ **Financial Charts** - Recharts for visualizations
- ✅ **Responsive Design** - Mobile-first Tailwind CSS
- ✅ **Type Safety** - Full TypeScript with strict mode

### 🤖 ML Models

- **Solar Forecast** - Random Forest (6-feature vector, 95% confidence intervals)
- **Savings Prediction** - Random Forest (financial projection engine)
- **Roof Detection** - YOLOv8 (aerial image analysis with segmentation)

### 🗄️ Database & Infrastructure

- ✅ **Firebase** - Firestore database + Cloud Functions (recommended)
- ✅ **PostgreSQL 16** - Async SQLAlchemy ORM (alternative)
- ✅ **Redis 7** - Rate limiting store + caching
- ✅ **Alembic** - Database migrations
- ✅ **Docker** - Multi-stage builds, health checks
- ✅ **Nginx** - Reverse proxy, SSL/TLS termination

---

## 🛠️ Tech Stack

### Backend

| Component    | Version | Purpose              |
| ------------ | ------- | -------------------- |
| FastAPI      | 0.115.0 | Web framework        |
| Python       | 3.11    | Runtime              |
| Firebase     | latest  | Database + Functions |
| SQLAlchemy   | 2.0.36  | ORM (async)          |
| scikit-learn | 1.5.2+  | ML models            |
| ultralytics  | latest  | YOLOv8               |
| slowapi      | 0.1.9   | Rate limiting        |
| Pydantic     | 2.9.2   | Data validation      |

### Frontend

| Component     | Version | Purpose             |
| ------------- | ------- | ------------------- |
| Next.js       | 16.2.4  | React framework     |
| TypeScript    | 5.7.3   | Type safety         |
| Tailwind CSS  | 4.2     | Styling             |
| Radix UI      | latest  | Primitives          |
| Framer Motion | 12.38.0 | Animations          |
| Recharts      | 2.15.0  | Charts              |
| Firebase      | latest  | Real-time DB + Auth |

---

## 📁 Project Structure

```
solar-2/
├── backend/                          # FastAPI backend
│   ├── app/
│   │   ├── api/v1/                  # Production endpoints
│   │   │   ├── health.py
│   │   │   ├── solar_forecast.py
│   │   │   ├── roof_detection.py
│   │   │   └── savings.py
│   │   ├── services/                # Business logic
│   │   ├── core/                    # Infrastructure
│   │   ├── ml/                      # Model registry
│   │   ├── models/                  # ORM models
│   │   └── main.py
│   ├── tests/                       # Pytest tests
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                         # Next.js frontend
│   ├── app/
│   │   ├── page.tsx                 # Landing page
│   │   ├── dashboard/               # Dashboard
│   │   ├── roof-detection/          # Image upload
│   │   └── solar-estimation/        # Forecasting
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── firebase/                        # Firebase configuration
│   ├── functions/                   # Cloud Functions
│   ├── firestore.rules              # Firestore rules
│   ├── storage.rules                # Storage rules
│   └── README.md
│
├── trained-models/                  # ML model files
├── docker-compose.yml
├── VERIFICATION_REPORT.md
└── README.md
```

---

## 🚀 Quick Start

### Option 1: Local Development

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py --reload
# Swagger: http://localhost:8000/docs
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:3000
```

### Option 2: Docker Compose

```bash
docker compose up -d
docker compose logs -f api
```

### Option 3: Firebase (Recommended) ⭐

```bash
npm install -g firebase-tools
firebase login
firebase deploy
# See Firebase Migration section below
```

---

## 🔥 Firebase Migration Guide

We're transitioning to **Firebase for maximum scalability and zero infrastructure management**.

### Current vs Firebase Architecture

**Before:**

```
Next.js → FastAPI → PostgreSQL + Redis → Nginx (self-managed)
```

**After:**

```
Next.js → Firebase → Firestore + Cloud Functions (serverless, auto-scaling)
```

### Firebase Services

| Service             | Replaces        | Benefit                                    |
| ------------------- | --------------- | ------------------------------------------ |
| **Firestore**       | PostgreSQL      | Real-time sync, global scale               |
| **Cloud Functions** | FastAPI + Nginx | Serverless, auto-scaling, $0 baseline cost |
| **Firebase Auth**   | Manual auth     | Social login, MFA, passwordless            |
| **Cloud Storage**   | Local storage   | CDN integrated, secure uploads             |
| **Realtime DB**     | Redis           | Instant subscriptions, real-time updates   |

### Setup Firebase

#### 1. Create Firebase Project

```bash
firebase init
# Select: Firestore, Functions, Hosting, Storage
# Choose project: solar-2-prod
```

#### 2. Configure Environment

**frontend/.env.local:**

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```

#### 3. Deploy

```bash
# Deploy all services
firebase deploy

# Or deploy selectively
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

### Firestore Database Schema

```
projects/
├── {projectId}
│   ├── email, name, created_at
│   ├── analysis_history/ (subcollection)

predictions/
├── {predictionId}
│   ├── endpoint, model_version, input_data, output_data, latency_ms

users/
├── {uid}
│   ├── email, displayName, createdAt, subscription_tier
```

### Cloud Functions Examples

```javascript
// functions/solar-forecast.js
exports.forecast = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be logged in",
    );

  // Call ML model (can keep Python backend or use TensorFlow.js)
  const prediction = await callMLModel(data);

  // Save to Firestore
  await db.collection("predictions").add({
    uid: context.auth.uid,
    input_data: data,
    output_data: prediction,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  return prediction;
});
```

### Benefits

✅ **Zero infrastructure** - Google manages everything  
✅ **Global scale** - Automatic worldwide distribution  
✅ **Real-time** - Instant data sync with Firestore listeners  
✅ **Cost-efficient** - Free tier + pay-as-you-go  
✅ **Built-in auth** - Social login, MFA, passwordless  
✅ **Secure** - Firestore security rules

---

## 📡 API Endpoints

### Health Checks

```
GET /api/v1/health
GET /api/v1/health/ready
GET /api/v1/health/detail
```

### Solar Forecast

```
POST /api/v1/solar/forecast
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "month": 6,
  "temperature_celsius": 25,
  "ghi": 800,
  "panel_capacity_kw": 5
}
→ { "total_predicted_kwh": 18.5, "confidence_intervals": {...} }
```

### Roof Detection

```
POST /api/v1/roof/analyze
FormData: { file: <image.jpg> }
→ { "detected_segments": [...], "total_capacity_kw": 20.1, "suitability": "excellent" }
```

### Savings Prediction

```
POST /api/v1/savings/predict
{
  "panel_capacity_kw": 5,
  "annual_solar_kwh": 7000,
  "electricity_rate_per_kwh": 0.15,
  "installation_cost": 12000
}
→ { "year_1_savings": 987.50, "payback_period_years": 12.1, "roi_percentage": 154.5 }
```

See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for complete API documentation.

---

## 🐳 Deployment

### Local Docker

```bash
docker compose up -d
docker compose logs -f
docker compose down -v
```

### Firebase Hosting + Functions

```bash
firebase deploy --only hosting,functions
```

### Cloud Run / Kubernetes

```bash
docker build -t solar-ai-backend .
docker push gcr.io/PROJECT/solar-ai:1.0.0
kubectl apply -f deployment.yaml
```

---

## 🧪 Testing

```bash
# Backend tests
cd backend && pytest -v

# Frontend tests
cd frontend && npm test
```

---

## 🔒 Security

- ✅ Rate limiting (120 req/min)
- ✅ API key authentication
- ✅ CORS + CSRF protection
- ✅ Security headers (HSTS, CSP)
- ✅ Input validation (Pydantic)
- ✅ Firebase security rules
- ✅ Non-root Docker user

---

## 📊 Performance

- **API Response:** < 200ms (p95)
- **ML Inference:** < 5s (roof detection), < 1s (forecast)
- **Frontend LCP:** < 2.5s
- **Concurrent Requests:** 1000+

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and open a PR

**Code Style:** PEP 8 (Python), ESLint (TypeScript), Conventional Commits

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/varshithdepa45/solar-2/issues)
- **Docs:** [Full Documentation](https://solarai.dev/docs)
- **Email:** support@solarai.dev

---

**Made with ☀️ by the Solar AI Team**  
**⭐ Star this repo if you find it useful!**
