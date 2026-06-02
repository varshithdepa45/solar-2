# Firebase Setup: New Account Connection Guide

## Step 1: Create a New Firebase Project

### 1.1 Go to Firebase Console

1. Open [firebase.google.com](https://firebase.google.com)
2. Click **"Go to console"** (top-right)
3. Click **"Add project"** or **"+"**

### 1.2 Project Creation

1. **Project name**: Enter `solar-ai-optimization` (or your choice)
2. Click **"Continue"**
3. **Enable Google Analytics**: Choose based on preference (recommended: Yes)
4. Click **"Create project"** and wait ~1 minute

### 1.3 After Project Created

- You'll see: "Your new cloud project is ready"
- Click **"Continue"** to enter the project console

---

## Step 2: Get Your Firebase Configuration

### 2.1 Frontend Configuration (Client SDK)

1. In Firebase Console, click the **"<>"** (Web icon) under "Get started by adding Firebase to your app"
2. App nickname: `solar-frontend`
3. Click **"Register app"**
4. You'll see your config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "solar-ai-optimization-xxxxx.firebaseapp.com",
  projectId: "solar-ai-optimization-xxxxx",
  storageBucket: "solar-ai-optimization-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234...",
};
```

5. **Copy and save this** - you'll need it for `.env.local`

### 2.2 Backend Configuration (Service Account)

1. In Firebase Console, go to **"Project Settings"** (⚙️ icon, top-right)
2. Click the **"Service Accounts"** tab
3. Select **"Python"** as language
4. Click **"Generate New Private Key"**
5. A JSON file will download: `solar-ai-optimization-xxxxx-firebase-adminsdk-xxxxx.json`
6. **Save this securely** - you'll use this for backend authentication

---

## Step 3: Set Up Firestore Database

### 3.1 Create Firestore Database

1. In Firebase Console, left sidebar → **"Build"** → **"Firestore Database"**
2. Click **"Create Database"**
3. **Location**: Choose closest to your users (e.g., `us-central1`)
4. **Security rules**: Start in **"Test mode"** (for development)
   - ⚠️ **Important**: Switch to "Production mode" before going live
5. Click **"Create"** and wait ~1 minute

### 3.2 Enable Firestore Indexes (Auto-generated)

- Firestore will auto-create indexes as you query data
- You can view them in **"Indexes"** tab

---

## Step 4: Set Up Cloud Storage

### 4.1 Create Cloud Storage Bucket

1. In Firebase Console, left sidebar → **"Build"** → **"Storage"**
2. Click **"Get started"**
3. **Security rules**: Start in **"Test mode"** (development)
4. **Location**: Same as Firestore (e.g., `us-central1`)
5. Click **"Done"** and wait ~1 minute

---

## Step 5: Set Up Authentication

### 5.1 Enable Email/Password Auth

1. Left sidebar → **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click **"Email/Password"** provider
4. Toggle **"Enable"** → **"Save"**

### 5.2 Enable Google OAuth (Optional)

1. Click **"Google"** provider
2. Toggle **"Enable"**
3. Enter your project support email
4. Click **"Save"**

---

## Step 6: Configure Backend (.env)

Create or update `/Users/varshithreddy/solar-2/backend/.env`:

```bash
# ── Firebase (Backend - Service Account) ───────────────────────────────────
# Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key
FIREBASE_PROJECT_ID="solar-ai-optimization-xxxxx"
FIREBASE_PRIVATE_KEY_ID="key_id_from_json"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@solar-ai-optimization-xxxxx.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="123456789"
FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
FIREBASE_CLIENT_X509_CERT_URL="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40solar-ai-optimization-xxxxx.iam.gserviceaccount.com"

# ── Application ────────────────────────────────────────────────────────────
APP_NAME="Solar AI Optimization Platform"
DEBUG=False
ENVIRONMENT="development"
SECRET_KEY="your-secret-key-change-this-in-production"

# ── CORS & Hosts ───────────────────────────────────────────────────────────
ALLOWED_ORIGINS_STR="http://localhost:3000,http://localhost:8080"
ALLOWED_HOSTS_STR="localhost,127.0.0.1"

# ── Database ───────────────────────────────────────────────────────────────
DATABASE_URL="postgresql+asyncpg://solar_user:solar_pass@localhost:5432/solar_db"

# ── Redis ──────────────────────────────────────────────────────────────────
REDIS_URL="redis://localhost:6379/0"

# ── File Upload ────────────────────────────────────────────────────────────
MAX_UPLOAD_SIZE_MB=10
ALLOWED_IMAGE_TYPES_STR="image/jpeg,image/png,image/webp"

# ── ML Model Paths ────────────────────────────────────────────────────────
SOLAR_FORECAST_MODEL_PATH="trained-models/solar_forecast_model.pkl"
SAVINGS_MODEL_PATH="trained-models/savings_prediction_model.pkl"
YOLO_MODEL_PATH="trained-models/prediction_yolo.pt"

# ── Logging ────────────────────────────────────────────────────────────────
LOG_LEVEL="INFO"
LOG_FORMAT="json"
```

**How to fill in Firebase values:**

1. Open the downloaded JSON file: `solar-ai-optimization-xxxxx-firebase-adminsdk-xxxxx.json`
2. Copy values directly:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the `\n` newlines)
   - etc.

---

## Step 7: Configure Frontend (.env.local)

Create `/Users/varshithreddy/solar-2/frontend/.env.local`:

```bash
# ── Firebase (Frontend - Web SDK) ──────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="solar-ai-optimization-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="solar-ai-optimization-xxxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="solar-ai-optimization-xxxxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcd1234..."

# ── Backend API ────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"

# ── Environment ────────────────────────────────────────────────────────────
NODE_ENV="development"
```

---

## Step 8: Initialize Backend Firebase Admin SDK

### 8.1 Install Firebase Admin SDK

```bash
cd /Users/varshithreddy/solar-2/backend
pip install firebase-admin
```

### 8.2 Create Firebase Service Module

Create `/Users/varshithreddy/solar-2/backend/app/core/firebase.py`:

```python
"""
Firebase Admin SDK initialization for backend.
Uses service account credentials for secure server-side operations.
"""

import json
import os
from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from pydantic import BaseModel

# Load Firebase credentials from environment variables
def _get_firebase_credentials():
    """Build credentials dict from environment variables."""
    return {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv("FIREBASE_AUTH_URI", "https://accounts.google.com/o/oauth2/auth"),
        "token_uri": os.getenv("FIREBASE_TOKEN_URI", "https://oauth2.googleapis.com/token"),
        "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL", "https://www.googleapis.com/oauth2/v1/certs"),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
    }

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    creds = credentials.Certificate(_get_firebase_credentials())
    firebase_admin.initialize_app(creds)

# Get Firebase services
db = firestore.client()  # Firestore database
auth_client = auth  # Firebase Auth
bucket = storage.bucket()  # Cloud Storage


class FirestorePredictionLog(BaseModel):
    """Prediction log schema for Firestore storage."""
    prediction_type: str  # 'solar_forecast', 'roof_detection', 'savings'
    input_data: dict
    output_data: dict
    confidence: float = 0.0
    created_at: str
    user_id: str = "anonymous"
    model_version: str = "1.0.0"


async def log_prediction_to_firestore(
    prediction_type: str,
    input_data: dict,
    output_data: dict,
    user_id: str = "anonymous",
    confidence: float = 0.0,
):
    """
    Store prediction log to Firestore for audit trail.

    Args:
        prediction_type: Type of prediction (solar_forecast, roof_detection, savings)
        input_data: Input parameters
        output_data: Model output/results
        user_id: User identifier
        confidence: Confidence score (0-1)
    """
    from datetime import datetime

    doc_data = {
        "prediction_type": prediction_type,
        "input_data": input_data,
        "output_data": output_data,
        "confidence": confidence,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
        "model_version": "1.0.0",
    }

    # Add to Firestore collection 'predictions'
    db.collection("predictions").add(doc_data)
```

---

## Step 9: Update Backend API Endpoints

### 9.1 Update Solar Forecast Endpoint

Modify `backend/app/api/v1/solar_forecast.py` to log to Firestore:

```python
from app.core.firebase import log_prediction_to_firestore

@router.post(
    "/forecast",
    response_model=SolarForecastResponse,
    summary="Solar Energy Forecast",
    tags=["Solar Forecasting"],
)
async def forecast_solar_generation(
    request: SolarForecastRequest,
) -> SolarForecastResponse:
    """Predict hourly/daily solar energy generation."""

    try:
        result = await solar_forecast_service.predict(request)

        # Log to Firestore
        await log_prediction_to_firestore(
            prediction_type="solar_forecast",
            input_data=request.model_dump(),
            output_data=result.model_dump(),
            confidence=result.confidence_95_percentile,
        )

        return result
    except Exception as e:
        logger.error(f"Solar forecast failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Forecast failed")
```

---

## Step 10: Update Frontend Firebase Integration

### 10.1 Create Auth Hook

Update `frontend/lib/auth-context.tsx` to use new Firebase project:

```typescript
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## Step 11: Test the Connection

### 11.1 Start Backend

```bash
cd /Users/varshithreddy/solar-2/backend
python run.py
```

### 11.2 Test Health Endpoint

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2026-06-02T10:30:00Z",
  "version": "1.0.0"
}
```

### 11.3 Start Frontend

```bash
cd /Users/varshithreddy/solar-2/frontend
npm run dev
```

### 11.4 Test in Browser

- Open http://localhost:3000
- Try signing up with email
- Check Firebase Console → Authentication → Users to see new user

### 11.5 Verify Firestore

- Go to Firebase Console → Firestore Database
- Make a prediction request
- Check Collections → "predictions" to see the logged data

---

## Step 12: Deploy to Firebase Hosting (Optional)

### 12.1 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 12.2 Initialize Firebase in Project

```bash
cd /Users/varshithreddy/solar-2
firebase init
# Select Firestore, Functions, Hosting, Storage
# Choose your project from the list
```

### 12.3 Deploy Frontend

```bash
cd /Users/varshithreddy/solar-2/frontend
npm run build
firebase deploy --only hosting
```

### 12.4 Deploy Cloud Functions (Optional)

```bash
cd /Users/varshithreddy/solar-2/firebase/functions
npm install
firebase deploy --only functions
```

---

## Firestore Data Structure

Your Firestore will have this structure:

```
firestore
├── predictions/
│   ├── doc1
│   │   ├── prediction_type: "solar_forecast"
│   │   ├── input_data: {...}
│   │   ├── output_data: {...}
│   │   ├── confidence: 0.95
│   │   ├── user_id: "user123"
│   │   └── created_at: "2026-06-02T10:30:00Z"
│   └── doc2
│       └── ...
├── users/
│   ├── user123
│   │   ├── email: "user@example.com"
│   │   ├── name: "John Doe"
│   │   ├── created_at: "2026-06-02T10:00:00Z"
│   │   └── projects: [...]
│   └── ...
└── projects/
    ├── project1
    │   ├── user_id: "user123"
    │   ├── name: "Home Solar Analysis"
    │   ├── address: "123 Main St"
    │   ├── predictions: [...]
    │   └── created_at: "2026-06-02T10:15:00Z"
    └── ...
```

---

## Common Issues & Solutions

| Issue                                     | Solution                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| **"Invalid Firebase credentials"**        | Check `.env` - `FIREBASE_PRIVATE_KEY` must have `\n` instead of actual newlines |
| **"Firestore permission denied"**         | In Firebase Console → Firestore → Rules, ensure test mode is enabled            |
| **"Firebase not initialized"**            | Check `.env` variables are loaded before importing Firebase module              |
| **"CORS error from frontend to backend"** | Add frontend URL to `ALLOWED_ORIGINS_STR` in backend `.env`                     |
| **"Cannot connect to Firestore"**         | Ensure internet connection and Firebase project is active                       |

---

## Security Best Practices

1. **Never commit** `.env` or service account JSON to git
2. **Production Firestore rules**: Switch from "Test mode" to "Production mode"
3. **API Keys**: Use different keys for development and production
4. **CORS**: Restrict `ALLOWED_ORIGINS_STR` to specific domains in production
5. **Database**: Always enable authentication and authorization
6. **Backups**: Enable automated backups in Firebase Console → Firestore

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Configure environment variables
3. ✅ Update backend with Firebase Admin SDK
4. ✅ Test connections
5. ✅ Deploy to production
6. ✅ Monitor Firestore usage and costs

Need help with any step? Let me know!
