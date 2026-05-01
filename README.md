# ☀️ Solar AI Optimization Platform

**AI-powered solar energy forecasting, savings prediction, and roof detection system.**

[![GitHub](https://img.shields.io/badge/GitHub-solar--2-blue?logo=github)](https://github.com/varshithdepa45/solar-2)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?logo=github)](https://varshithdepa45.github.io/solar-2)
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

## 🌐 Live Demo

**Try the app now:** https://varshithdepa45.github.io/solar-2

No installation required! Test features:

- 🔐 Create account (email/password or Google)
- ⚡ Get solar forecast for any location
- 🏠 Upload roof image for analysis
- 💰 View 25-year financial projections
- 📊 Real-time dashboard with predictions

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

## 🔥 Complete Firebase Connection Guide

### Step 1: Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to your Google account
firebase login

# Follow the browser popup to authenticate
```

### Step 2: Create Firebase Project

**Option A: Web Console (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name: `solar-ai-prod`
4. Enable Google Analytics (optional)
5. Click "Create Project"
6. Wait for setup to complete

**Option B: CLI**

```bash
firebase projects:create solar-ai-prod --display-name "Solar AI Platform"
```

### Step 3: Initialize Firebase in Your Project

```bash
cd /path/to/solar-2

# Run interactive setup
firebase init

# When prompted, select these features:
# ✓ Firestore Database
# ✓ Cloud Functions
# ✓ Hosting
# ✓ Cloud Storage
# ✓ Emulators (for local development)

# Choose project: solar-ai-prod

# When asked about Firestore location: us-central1
# When asked about language for functions: JavaScript
# When asked about overwriting files: No (keep existing)
```

### Step 4: Configure Firebase Credentials

#### For Frontend (Next.js)

**frontend/.env.local:**

```env
# Get these from Firebase Console → Project Settings → Your apps
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB0g... (Your API Key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789... (Sender ID)
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc... (App ID)
```

**How to Find These Values:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `solar-ai-prod`
3. Click "Project Settings" (gear icon)
4. Go to "Your apps" section
5. Click your web app (or create one with `</>` icon)
6. Copy all values from the config object

**Example Config Object:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB0gvXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "solar-ai-prod.firebaseapp.com",
  projectId: "solar-ai-prod",
  storageBucket: "solar-ai-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcd",
};
```

#### For Backend (Cloud Functions)

**firebase/functions/.env.local:**

```env
FIREBASE_PROJECT_ID=solar-ai-prod
FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
```

### Step 5: Install Frontend Dependencies

```bash
cd frontend

# Install Firebase SDK
npm install firebase @react-oauth/google

# Install Firebase Admin SDK (for backend)
cd ../firebase/functions
npm install firebase-admin firebase-functions
```

### Step 6: Create Firestore Database

```bash
# Create Firestore database
firebase firestore:databases:create --region us-central1 --database-id=solar-ai-prod

# Or create via Firebase Console:
# 1. Go to Firestore Database
# 2. Click "Create Database"
# 3. Choose: us-central1
# 4. Start in Production Mode (we have security rules)
```

### Step 7: Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com) → solar-ai-prod project:

**Enable These:**

1. **Authentication**
   - Click "Authentication"
   - Go to "Sign-in method"
   - Enable: Email/Password, Google, GitHub (optional)

2. **Firestore Database**
   - Click "Firestore Database"
   - Click "Create Database"
   - Mode: Production
   - Location: us-central1

3. **Cloud Storage**
   - Click "Storage"
   - Click "Get Started"
   - Choose Production Rules
   - Default Location: us-central1

4. **Cloud Functions**
   - Already enabled with `firebase init`

### Step 8: Deploy Firebase Rules

```bash
cd /path/to/solar-2

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Storage security rules
firebase deploy --only storage

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Step 9: Deploy Cloud Functions

```bash
cd firebase/functions

# Install dependencies (if not already done)
npm install

# Go back to root and deploy
cd ../..

# Deploy only functions
firebase deploy --only functions

# View logs
firebase functions:log --limit 50
```

### Step 10: Configure Frontend to Use Firebase

**Create `frontend/lib/firebase.ts`:**

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Connect to emulators in development (localhost)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  if (window.location.hostname === "localhost") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
      connectFunctionsEmulator(functions, "localhost", 5001);
    } catch (e) {
      // Emulator already connected
    }
  }
}

export default app;
```

### Step 11: Create Auth Context (React)

**Create `frontend/lib/auth-context.tsx`:**

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Add to `frontend/app/layout.tsx`:**

```typescript
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Step 12: Test Connection Locally

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start frontend
cd frontend
npm run dev

# In another terminal, start backend (if using FastAPI)
cd backend
python run.py --reload
```

**Emulator URLs:**

- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- Frontend: http://localhost:3000

### Step 13: Deploy to Production

```bash
# Build frontend
cd frontend
npm run build

# Deploy everything to Firebase
cd ..
firebase deploy

# This deploys:
# ✓ Cloud Functions
# ✓ Firestore rules
# ✓ Storage rules
# ✓ Hosting (if configured)
```

**Your site will be live at:**

- Hosting: `https://solar-ai-prod.web.app`
- API: Cloud Functions endpoints

### Step 14: Monitor Firebase

Access your Firebase Console:

**[Firebase Console Dashboard](https://console.firebase.google.com)**

Monitor:

- ✅ Firestore usage (reads/writes/deletes)
- ✅ Cloud Function execution time
- ✅ Storage bandwidth
- ✅ Authentication events
- ✅ Error logs

---

## 📚 Firebase API Examples

### Login

```typescript
import { useAuth } from '@/lib/auth-context';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

### Call Cloud Function

```typescript
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

const callSolarForecast = httpsCallable(functions, "solarForecast");

async function predictSolar(data) {
  try {
    const result = await callSolarForecast(data);
    return result.data;
  } catch (error) {
    console.error("Forecast failed:", error);
    throw error;
  }
}
```

### Firestore Query

```typescript
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function getUserPredictions(userId: string) {
  const q = query(
    collection(db, "predictions"),
    where("uid", "==", userId),
    orderBy("created_at", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
```

### Real-time Subscription

```typescript
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

function subscribeToProject(projectId: string) {
  return onSnapshot(doc(db, "projects", projectId), (snapshot) => {
    console.log("Project updated:", snapshot.data());
  });
}
```

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

---

## 🔗 GitHub Pages (.io) Domain

Deploy your Solar AI frontend to a free `.io` domain using GitHub Pages.

### Setup GitHub Pages

#### 1. Configure Repository

```bash
# Go to your GitHub repository settings
# https://github.com/varshithdepa45/solar-2/settings/pages

# Under "Source", select:
# ✓ Deploy from a branch
# ✓ Branch: main
# ✓ Folder: /frontend (if frontend is in a subfolder)
#          or / (if using root-level build)
```

#### 2. Update Next.js for Static Export

**frontend/next.config.mjs:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static export
  distDir: "out", // Output directory for GitHub Pages
  basePath: "", // Root domain (no subfolder needed)

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

#### 3. Build and Deploy

```bash
cd frontend

# Build static site
npm run build

# This creates the 'out/' directory

# Push to GitHub
cd ..
git add frontend/out/
git commit -m "Deploy frontend to GitHub Pages"
git push origin main
```

#### 4. Access Your Site

Your site will be live at:

```
https://varshithdepa45.github.io/solar-2/
```

Or with a custom domain (optional):

```bash
# Create CNAME file in frontend/public/
echo "solar.yourdomain.com" > frontend/public/CNAME

# Add custom domain in GitHub settings
# https://github.com/varshithdepa45/solar-2/settings/pages
```

#### 5. GitHub Actions Workflow (Automatic Deployment)

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: cd frontend && npm install

      - name: Build
        run: cd frontend && npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "frontend/out"

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Save this file and GitHub will automatically deploy whenever you push to main!

---

## 🌐 Deployment Options

### Option 1: Local Docker

```bash
docker compose up -d
docker compose logs -f api
docker compose down -v
```

### Option 2: GitHub Pages (Frontend Only - FREE ⭐)

```bash
# Perfect for static site deployment
cd frontend
npm run build
# Push 'out/' folder to GitHub
# Access at: https://varshithdepa45.github.io/solar-2/
```

### Option 3: Firebase Hosting + Cloud Functions (RECOMMENDED)

```bash
firebase deploy --only hosting,functions,firestore:rules
```

**Live at:** `https://solar-ai-prod.web.app`

### Option 4: Cloud Run / Kubernetes (Enterprise)

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
