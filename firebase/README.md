# Firebase Configuration & Setup Guide

This directory contains Firebase configuration for the Solar AI Platform.

## Overview

Firebase provides a **serverless backend** with:

- **Firestore** - Real-time NoSQL database
- **Cloud Functions** - Serverless API endpoints
- **Firebase Auth** - User authentication with social login
- **Cloud Storage** - File uploads and CDN delivery
- **Realtime Database** - Real-time subscriptions and cache

## Prerequisites

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to your Google account
firebase login

# Create a new Firebase project
firebase projects:create solar-ai-prod
```

## Project Setup

### 1. Initialize Firebase Project

```bash
cd /path/to/solar-2
firebase init

# When prompted, select:
# ✓ Firestore
# ✓ Cloud Functions
# ✓ Hosting
# ✓ Storage
# ✓ Emulators (for local development)

# Choose project: solar-ai-prod
```

### 2. Configure Environment Variables

**frontend/.env.local:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**firebase/functions/.env.local:**

```env
FIREBASE_PROJECT_ID=solar-ai-prod
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

### 3. Deploy to Firebase

#### Deploy Everything

```bash
firebase deploy
```

#### Deploy Specific Services

```bash
# Deploy only Cloud Functions
firebase deploy --only functions

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage

# Deploy only Hosting
firebase deploy --only hosting
```

## Firestore Database Schema

### Collections

#### `/users/{uid}`

```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string,
  role: 'user' | 'admin',  // default: 'user'
  subscription_tier: 'free' | 'pro' | 'enterprise',
  credits_available: number,
  created_at: timestamp,
  updated_at: timestamp,
  last_login: timestamp,
  preferences: {
    theme: 'light' | 'dark',
    notifications_enabled: boolean,
    email_notifications: boolean
  }
}
```

#### `/projects/{projectId}`

```javascript
{
  projectId: string,
  uid: string,  // Owner's user ID
  name: string,
  description: string,
  address: string,
  latitude: number,
  longitude: number,
  status: 'draft' | 'analysis_in_progress' | 'complete',

  // Analysis data
  roof_area_sqft: number,
  usable_area_sqft: number,
  estimated_capacity_kw: number,
  annual_production_kwh: number,
  estimated_savings_year_1: number,
  payback_period_years: number,

  // Metadata
  created_at: timestamp,
  updated_at: timestamp,

  // Subcollection: analysis_history
  // Subcollection: collaborators
}
```

#### `/predictions/{predictionId}`

```javascript
{
  predictionId: string,
  uid: string,  // User who made the prediction
  endpoint: 'solar_forecast' | 'roof_detection' | 'savings',
  model_version: string,

  // Request data
  input_data: {
    // endpoint-specific fields
  },

  // Response data
  output_data: {
    // endpoint-specific fields
  },

  // Metrics
  latency_ms: number,
  status: 'success' | 'error',
  error_message: string | null,

  // Metadata
  created_at: timestamp,
  correlation_id: string
}
```

#### `/roof_analysis/{analysisId}`

```javascript
{
  analysisId: string,
  uid: string,  // User who uploaded the image

  // Image metadata
  image_filename: string,
  image_url: string,  // Cloud Storage URL
  image_dimensions: {
    width: number,
    height: number
  },

  // Detection results
  total_segments_detected: number,
  detected_segments: [
    {
      segment_id: string,
      confidence: number,
      area_m2: number,
      usable_area_m2: number,
      orientation: 'north' | 'south' | 'east' | 'west',
      tilt_degrees: number,
      shading_level: 'none' | 'low' | 'moderate' | 'high',
      bounding_box: {
        x1: number, y1: number,
        x2: number, y2: number,
        width: number, height: number
      }
    }
  ],

  // Aggregated results
  total_usable_area_m2: number,
  total_capacity_kw: number,
  estimated_annual_kwh: number,
  installation_suitability: 'excellent' | 'good' | 'fair' | 'poor' | 'unsuitable',
  recommendations: string[],

  // Metadata
  processing_time_ms: number,
  created_at: timestamp
}
```

## Security Rules

### Firestore Rules (`firestore.rules`)

Key principles:

- ✅ Users can only access their own data
- ✅ Admins can access all data for moderation
- ✅ Authenticated users required for all operations
- ✅ Server-side timestamp validation
- ✅ Data structure validation

### Storage Rules (`storage.rules`)

Key principles:

- ✅ Users can upload images up to 10MB
- ✅ ML models (500MB) restricted to admins
- ✅ Public assets for everyone
- ✅ MIME type validation (JPEG, PNG, WebP)

## Cloud Functions

### Solar Forecast Function

**Endpoint:** `POST /solar-forecast`

```javascript
// firebase/functions/solar-forecast.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.solarForecast = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in'
    );
  }

  const uid = context.auth.uid;
  const { latitude, longitude, panel_capacity_kw, ... } = data;

  // Validate input
  if (!latitude || !longitude || !panel_capacity_kw) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields'
    );
  }

  try {
    // Call ML model (Python backend or TensorFlow.js)
    const prediction = await callMLModel({
      endpoint: 'solar_forecast',
      input: data
    });

    // Save prediction to Firestore
    const predictionRef = await admin.firestore()
      .collection('predictions')
      .add({
        uid,
        endpoint: 'solar_forecast',
        model_version: 'v1.0',
        input_data: data,
        output_data: prediction,
        latency_ms: Date.now() - startTime,
        status: 'success',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        correlation_id: context.auth.token.jti
      });

    // Deduct credits
    await admin.firestore()
      .collection('users')
      .doc(uid)
      .update({
        credits_available: admin.firestore.FieldValue.increment(-1)
      });

    return {
      success: true,
      data: prediction,
      predictionId: predictionRef.id
    };
  } catch (error) {
    console.error('Forecast error:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Forecast prediction failed'
    );
  }
});
```

### Roof Analysis Function

**Endpoint:** `POST /roof-analysis`

```javascript
// firebase/functions/roof-analysis.js
exports.roofAnalysis = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Login required");
  }

  const uid = context.auth.uid;
  const { image_url, project_id } = data;

  try {
    // Call YOLO model for analysis
    const analysis = await callYOLOModel(image_url);

    // Save analysis results
    const analysisRef = await admin
      .firestore()
      .collection("roof_analysis")
      .add({
        uid,
        image_url,
        project_id,
        ...analysis,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update project with results
    await admin.firestore().collection("projects").doc(project_id).update({
      total_usable_area_m2: analysis.total_usable_area_m2,
      estimated_capacity_kw: analysis.total_capacity_kw,
      status: "complete",
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      data: analysis,
      analysisId: analysisRef.id,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    throw new functions.https.HttpsError("internal", "Analysis failed");
  }
});
```

## Local Development with Emulators

### Start Emulators

```bash
firebase emulators:start

# Accessible at:
# Firestore: http://localhost:8080
# Functions: http://localhost:5001
# Hosting: http://localhost:5000
```

### Using Emulators in Code

**Frontend (lib/firebase.ts):**

```typescript
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
}

export { db, auth };
```

## Monitoring & Analytics

### View Logs

```bash
# Function logs
firebase functions:log

# Real-time logs
firebase functions:log --limit 100
```

### Firebase Console

https://console.firebase.google.com/project/solar-ai-prod

Monitor:

- Firestore usage (reads, writes, deletes)
- Cloud Function execution
- Storage bandwidth
- Authentication events

## Migrating from PostgreSQL to Firestore

### 1. Export PostgreSQL Data

```bash
pg_dump -U solar_user -d solar_db > backup.sql
python scripts/export_to_firestore.py backup.sql
```

### 2. Transform and Import

```python
# scripts/export_to_firestore.py
import json
from firebase_admin import firestore, credentials

db = firestore.client()

# Load exported data
with open('backup.sql') as f:
    data = json.load(f)

# Import predictions
for pred in data['predictions']:
    db.collection('predictions').add({
        uid: pred['user_id'],
        endpoint: pred['endpoint'],
        input_data: pred['input_data'],
        output_data: pred['output_data'],
        created_at: pred['created_at']
    })

print('Migration complete!')
```

### 3. Test & Validate

```bash
# Query Firestore
firebase firestore:query predictions --all-documents
```

## Troubleshooting

### Issue: "Authentication required"

**Solution:** Make sure user is logged in and token is included in request

### Issue: "Permission denied"

**Solution:** Check Firestore rules and ensure user owns the document

### Issue: "Function timeout"

**Solution:** Increase timeout in firebase.json (default: 60s, max: 540s)

```json
{
  "functions": {
    "timeoutSeconds": 300
  }
}
```

### Issue: Emulator not starting

**Solution:** Check if ports 8080, 5001, 5000 are available

```bash
# Kill existing processes
lsof -i :8080
kill -9 <PID>

# Try again
firebase emulators:start
```

## Costs

### Firebase Pricing (as of 2026)

| Service         | Free Tier                   | Pay-as-you-go        |
| --------------- | --------------------------- | -------------------- |
| Firestore       | 1 GB storage, 50K reads/day | $0.06/100K reads     |
| Cloud Functions | 2M invocations/month        | $0.40/1M invocations |
| Hosting         | 1 GB storage, 10 GB/month   | $0.18/GB             |
| Cloud Storage   | 5 GB                        | $0.020/GB            |

**Estimate for 1000 users:** $50-150/month

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Guides](https://firebase.google.com/docs/functions)
- [Firebase Console](https://console.firebase.google.com)

---

**Next Steps:**

1. Create Firebase project
2. Deploy Firestore rules
3. Create Cloud Functions
4. Update frontend to use Firebase SDK
5. Test with emulators locally
6. Deploy to production
