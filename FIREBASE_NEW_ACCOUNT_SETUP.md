# 🔥 Complete Firebase Setup Guide - From Start to Finish

Follow this step-by-step guide to set up Firebase for your Solar AI platform with your new account.

---

## Phase 1: Firebase Project Creation (10 minutes)

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Enter project name: **`solar-ai-optimization`** (or your preferred name)
4. Choose your region/country
5. Click **"Continue"**
6. Enable/Disable Google Analytics (optional) → Click **"Create project"**
7. Wait for setup to complete (2-3 minutes)

✅ **You now have a Firebase project!**

---

## Phase 2: Enable Firebase Services (15 minutes)

### Step 2: Set Up Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Select region: **`us-central1`** (or closest to you)
4. Choose mode: **"Production mode"** (we have security rules)
5. Click **"Create"**

✅ **Firestore is ready!**

### Step 3: Set Up Authentication

1. Go to **Build** → **Authentication**
2. Click **"Get started"**
3. Click **"Email/Password"** provider
4. Enable it → Click **"Save"**
5. _Optional:_ Also enable **"Google"** provider:
   - Click the Google provider
   - Enable it
   - Enter your email (as support email)
   - Click **"Save"**

✅ **Authentication is ready!**

### Step 4: Set Up Cloud Storage

1. Go to **Build** → **Storage**
2. Click **"Get started"**
3. Choose default location: **`us-central1`**
4. Choose rules mode: **"Production mode"**
5. Click **"Done"**

✅ **Cloud Storage is ready!**

### Step 5: Set Up Cloud Functions _(Optional but recommended)_

1. Go to **Build** → **Functions**
2. Click **"Get started"**
3. Click **"Deploy your first function"**
4. Region: **`us-central1`**

✅ **Cloud Functions are ready!**

---

## Phase 3: Get Your Credentials (10 minutes)

### Step 6: Get Frontend Web SDK Config

1. In Firebase Console, go to **Project Settings** (⚙️ gear icon, top left)
2. Go to **"Your apps"** tab
3. If no web app exists, click **"<>"** (web icon) to create one
4. App nickname: **`solar-frontend`** → Click **"Register app"**
5. You'll see code like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB0g...",
  authDomain: "solar-ai-optimization-xxxxx.firebaseapp.com",
  projectId: "solar-ai-optimization-xxxxx",
  storageBucket: "solar-ai-optimization-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};
```

6. **Copy these values** - you'll need them for `.env.local`

✅ **Frontend credentials obtained!**

### Step 7: Get Backend Service Account Credentials

1. In **Project Settings**, go to **"Service Accounts"** tab
2. Click **"Generate New Private Key"**
3. A JSON file will download automatically
4. **Save this file securely** - it contains your backend credentials
5. The file will look like:

```json
{
  "type": "service_account",
  "project_id": "solar-ai-optimization-xxxxx",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@solar-ai-optimization-xxxxx.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40solar-ai-optimization-xxxxx.iam.gserviceaccount.com"
}
```

✅ **Backend credentials obtained!**

---

## Phase 4: Configure Your Project (15 minutes)

### Step 8: Create Frontend .env.local

1. In `/Users/varshithreddy/solar-2/frontend/`, create file: `.env.local`
2. Add these values (from Step 6):

```bash
# Firebase Frontend Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB0g...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-optimization-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-optimization-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-optimization-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Environment
NODE_ENV=development
```

✅ **Frontend configured!**

### Step 9: Create Backend .env

1. In `/Users/varshithreddy/solar-2/backend/`, create file: `.env`
2. Copy the values from the JSON file you downloaded (Step 7)
3. Add the following (replace with your actual values):

```bash
# ── Application ───────────────────────────────────────────────────────────
APP_NAME="Solar AI Optimization Platform"
DEBUG=true
ENVIRONMENT="development"
SECRET_KEY=your-super-secret-key-change-this

# ── API & CORS ────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
SECRET_KEY=REPLACE_WITH_A_STRONG_RANDOM_SECRET_KEY_HERE

# ── Database ──────────────────────────────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://solar_user:solar_pass@localhost:5432/solar_db

# ── File Uploads ──────────────────────────────────────────────────────────
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10

# ── Logging ───────────────────────────────────────────────────────────────
LOG_LEVEL=INFO
LOG_FORMAT=text

# ── Firebase (Backend - Service Account) ───────────────────────────────────
# Copy from the JSON file you downloaded:
FIREBASE_PROJECT_ID=solar-ai-optimization-xxxxx
FIREBASE_PRIVATE_KEY_ID=abc123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@solar-ai-optimization-xxxxx.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40solar-ai-optimization-xxxxx.iam.gserviceaccount.com
```

✅ **Backend configured!**

---

## Phase 5: Install Dependencies (5 minutes)

### Step 10: Install Frontend Firebase SDK

```bash
cd /Users/varshithreddy/solar-2/frontend

# Install Firebase SDK
npm install firebase @react-oauth/google

# Or with pnpm if that's your package manager
pnpm install firebase @react-oauth/google
```

### Step 11: Install Backend Firebase Admin SDK

```bash
cd /Users/varshithreddy/solar-2/backend

# Add firebase-admin to requirements.txt
echo "firebase-admin>=6.5.0" >> requirements.txt

# Install the package
pip install firebase-admin
```

✅ **Dependencies installed!**

---

## Phase 6: Create Firebase Integration Code (20 minutes)

### Step 12: Create Frontend Firebase Module

Create file: `/Users/varshithreddy/solar-2/frontend/lib/firebase.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, "us-central1");

// Connect to emulators in development (local testing)
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

✅ **Firebase initialization created!**

### Step 13: Create Auth Context (React)

Create file: `/Users/varshithreddy/solar-2/frontend/lib/auth-context.tsx`

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

    return unsubscribe;
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

✅ **Auth context created!**

### Step 14: Create Firestore Hook

Create file: `/Users/varshithreddy/solar-2/frontend/lib/useFirestore.ts`

```typescript
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";

export function useFirestore<T>(
  collectionName: string,
  constraints?: QueryConstraint[],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...(constraints || []));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as T,
        );
        setData(docs);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  }, [collectionName, constraints]);

  return { data, loading, error };
}
```

✅ **Firestore hook created!**

### Step 15: Create Cloud Functions Wrapper

Create file: `/Users/varshithreddy/solar-2/frontend/lib/firebase-functions.ts`

```typescript
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

export const predictSolarForecast = httpsCallable(
  functions,
  "predictSolarForecast",
);
export const analyzeRoof = httpsCallable(functions, "analyzeRoof");
export const predictSavings = httpsCallable(functions, "predictSavings");
export const checkHealth = httpsCallable(functions, "checkHealth");

// Usage example:
// const result = await predictSolarForecast({ lat, lng, systemSize });
```

✅ **Cloud Functions wrapper created!**

### Step 16: Create Storage Utilities

Create file: `/Users/varshithreddy/solar-2/frontend/lib/firebase-storage.ts`

```typescript
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "./firebase";

export async function uploadRoofImage(
  file: File,
  userId: string,
): Promise<string> {
  const storageRef = ref(storage, `roof-images/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function uploadProjectImage(
  file: File,
  projectId: string,
): Promise<string> {
  const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const fileRef = ref(storage, path);
  await deleteObject(fileRef);
}

export function getStorageRef(path: string) {
  return ref(storage, path);
}
```

✅ **Storage utilities created!**

### Step 17: Update Frontend Layout with AuthProvider

Edit: `/Users/varshithreddy/solar-2/frontend/app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'SolarAI — AI-Powered Solar Analysis Platform',
  description: 'Harness the power of AI to analyze rooftops, estimate solar potential, and maximize your energy savings.',
  generator: 'v0.app',
  keywords: ['solar energy', 'AI analysis', 'roof detection', 'solar estimation', 'renewable energy'],
}

export const viewport = {
  themeColor: '#0a0e1a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background dark">
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

✅ **Layout updated with Auth!**

### Step 18: Create Backend Firebase Module

Create file: `/Users/varshithreddy/solar-2/backend/app/core/firebase.py`

```python
"""
Firebase Admin SDK integration for backend services.
Handles Firestore, Cloud Storage, and Firebase Authentication.
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth
from app.core.config import settings

def _get_firebase_credentials():
    """Build Firebase credentials from environment variables."""
    return {
        "type": "service_account",
        "project_id": settings.FIREBASE_PROJECT_ID,
        "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
        "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
        "client_email": settings.FIREBASE_CLIENT_EMAIL,
        "client_id": settings.FIREBASE_CLIENT_ID,
        "auth_uri": settings.FIREBASE_AUTH_URI,
        "token_uri": settings.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL,
    }

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    creds = credentials.Certificate(_get_firebase_credentials())
    firebase_admin.initialize_app(creds)

# Get Firebase services
db = firestore.client()
auth_client = auth
bucket = storage.bucket()

async def save_prediction_to_firestore(
    user_id: str,
    prediction_type: str,
    input_data: dict,
    output_data: dict,
) -> str:
    """Save prediction to Firestore."""
    doc = db.collection("predictions").document()
    doc.set({
        "user_id": user_id,
        "prediction_type": prediction_type,
        "input_data": input_data,
        "output_data": output_data,
        "created_at": firestore.SERVER_TIMESTAMP,
    })
    return doc.id

async def get_user_predictions(user_id: str) -> list:
    """Get all predictions for a user."""
    docs = db.collection("predictions").where("user_id", "==", user_id).stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

async def upload_file_to_storage(file_path: str, destination_blob_name: str) -> str:
    """Upload file to Firebase Cloud Storage."""
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_filename(file_path)
    blob.make_public()
    return blob.public_url

async def delete_file_from_storage(blob_name: str) -> None:
    """Delete file from Firebase Cloud Storage."""
    blob = bucket.blob(blob_name)
    blob.delete()

async def verify_firebase_token(token: str) -> dict:
    """Verify Firebase ID token."""
    decoded_token = auth_client.verify_id_token(token)
    return decoded_token
```

✅ **Backend Firebase module created!**

### Step 19: Update Backend Config

Edit: `/Users/varshithreddy/solar-2/backend/app/core/config.py`

Add these fields to the `Settings` class (around line 87):

```python
    # ── Firebase (Backend - Service Account) ───────────────────────────────────
    FIREBASE_PROJECT_ID: str = ""
    FIREBASE_PRIVATE_KEY_ID: str = ""
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_CLIENT_ID: str = ""
    FIREBASE_AUTH_URI: str = "https://accounts.google.com/o/oauth2/auth"
    FIREBASE_TOKEN_URI: str = "https://oauth2.googleapis.com/token"
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: str = "https://www.googleapis.com/oauth2/v1/certs"
    FIREBASE_CLIENT_X509_CERT_URL: str = ""
```

✅ **Backend config updated!**

---

## Phase 7: Set Up Firestore Security Rules (10 minutes)

### Step 20: Create Firestore Rules

1. In Firebase Console, go to **Firestore Database**
2. Click **"Rules"** tab
3. Replace the content with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /predictions/{document=**} {
      allow read: if request.auth != null && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.user_id;
    }

    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

4. Click **"Publish"**

✅ **Firestore security rules deployed!**

### Step 21: Create Cloud Storage Rules

1. In Firebase Console, go to **Storage**
2. Click **"Rules"** tab
3. Replace with:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /roof-images/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024;
    }

    match /projects/{projectId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **"Publish"**

✅ **Storage security rules deployed!**

---

## Phase 8: Initialize Firebase CLI & Deploy (Optional) (10 minutes)

### Step 22: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# This will open a browser for authentication
```

### Step 23: Initialize Firebase Project

```bash
cd /Users/varshithreddy/solar-2

# Initialize Firebase
firebase init

# When prompted, select:
# ✓ Firestore
# ✓ Cloud Functions
# ✓ Hosting
# ✓ Storage
# ✓ Emulators

# Choose your Firebase project: solar-ai-optimization
```

### Step 24: Deploy to Firebase _(Optional for production)_

```bash
# Deploy all services
firebase deploy

# Or deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase deploy --only hosting
```

---

## Phase 9: Testing & Verification (10 minutes)

### Step 25: Test Frontend Firebase Connection

Create a test page: `/Users/varshithreddy/solar-2/frontend/app/firebase-test/page.tsx`

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useFirestore } from '@/lib/useFirestore';
import { useState } from 'react';

export default function FirebaseTestPage() {
  const { user, login, signup, logout, loading } = useAuth();
  const { data: predictions } = useFirestore('predictions');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1>Firebase Connection Test</h1>

      {!user ? (
        <div className="mt-4 space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2"
          />
          <button
            onClick={() => signup(email, password)}
            className="bg-blue-500 text-white p-2 mr-2"
          >
            Sign Up
          </button>
          <button
            onClick={() => login(email, password)}
            className="bg-green-500 text-white p-2"
          >
            Login
          </button>
        </div>
      ) : (
        <div>
          <p>✅ Logged in as: {user.email}</p>
          <button
            onClick={() => logout()}
            className="bg-red-500 text-white p-2 mt-4"
          >
            Logout
          </button>
        </div>
      )}

      <div className="mt-8">
        <h2>Predictions in Firestore:</h2>
        <pre>{JSON.stringify(predictions, null, 2)}</pre>
      </div>
    </div>
  );
}
```

### Step 26: Test Backend Firebase Connection

```bash
cd /Users/varshithreddy/solar-2/backend

# Start the backend server
python run.py

# In another terminal, test if it's working
curl http://localhost:8000/api/v1/health

# You should see a 200 OK response with health data
```

---

## Phase 10: Deploy to Production (20 minutes)

### Step 27: Deploy Frontend to Firebase Hosting

```bash
cd /Users/varshithreddy/solar-2/frontend

# Build the Next.js app
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

### Step 28: Deploy Backend (Choose One)

**Option A: Google Cloud Run** (Recommended)

```bash
# Ensure you have gcloud CLI installed
gcloud init

# Build and deploy
gcloud run deploy solar-ai-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --memory 2Gi \
  --timeout 3600s
```

**Option B: Heroku**

```bash
# Install Heroku CLI
# Login: heroku login
# Create app: heroku create solar-ai-backend
# Deploy: git push heroku main
```

---

## ✅ Checklist - Your Setup is Complete When You Have:

- [ ] Created Firebase project
- [ ] Enabled Firestore, Auth, Storage, Cloud Functions
- [ ] Downloaded service account JSON
- [ ] Created `.env.local` in frontend with 6 Firebase values
- [ ] Created `.env` in backend with 9 Firebase values
- [ ] Installed firebase & firebase-admin packages
- [ ] Created all 6 Firebase integration files (firebase.ts, auth-context.tsx, useFirestore.ts, firebase-functions.ts, firebase-storage.ts, firebase.py)
- [ ] Updated backend config.py with Firebase fields
- [ ] Updated frontend layout.tsx with AuthProvider
- [ ] Deployed Firestore & Storage security rules
- [ ] Tested login/signup on test page
- [ ] Backend connects to Firestore successfully
- [ ] Deployed to Firebase Hosting (frontend)
- [ ] Deployed backend to Cloud Run or Heroku

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Web SDK Docs](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK (Python)](https://firebase.google.com/docs/admin/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Storage Security](https://firebase.google.com/docs/storage/security)

---

## 🆘 Troubleshooting

### "Module not found: firebase"

→ Run: `npm install firebase @react-oauth/google`

### "Firebase app not initialized"

→ Make sure AuthProvider wraps your app in layout.tsx

### "Permission denied" errors in Firestore

→ Check your security rules and verify user is authenticated

### "Cannot find service account credentials"

→ Ensure all FIREBASE\_\* variables are in `.env` file

### Emulators not connecting

→ Run `firebase emulators:start` in a separate terminal

---

**You're all set! Your Firebase integration is complete and ready to use.** 🎉
