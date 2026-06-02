# Firebase Setup Checklist & Implementation Guide

Complete checklist to set up Firebase with your Solar AI project.

---

## ✅ PHASE 1: Firebase Project Creation (10 minutes)

### Step 1: Create Firebase Project

- [ ] Go to https://console.firebase.google.com
- [ ] Click **"Add project"** or **"+"**
- [ ] Project name: `solar-ai-optimization`
- [ ] Choose location closest to your users
- [ ] Optional: Enable Google Analytics
- [ ] Click **"Create project"** and wait ~1 minute
- [ ] ✅ Bookmark the Firebase Console URL

### Step 2: Create Web App (Frontend)

- [ ] In Firebase Console, click the **"<>"** (Web icon)
- [ ] App nickname: `solar-frontend`
- [ ] Click **"Register app"**
- [ ] Copy the configuration shown:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
};
```

- [ ] Save this somewhere safe (you'll need it soon)

### Step 3: Create Service Account (Backend)

- [ ] In Firebase Console, go **"Project Settings"** (⚙️ top-right)
- [ ] Click **"Service Accounts"** tab
- [ ] Select **"Python"** as the language
- [ ] Click **"Generate New Private Key"**
- [ ] A JSON file will download (e.g., `solar-ai-xxx-firebase-adminsdk-xxx.json`)
- [ ] **Keep this file safe** - it contains your backend secrets
- [ ] Open the JSON file and view its contents

---

## ✅ PHASE 2: Backend Configuration (10 minutes)

### Step 4: Create Backend .env File

```bash
cd /Users/varshithreddy/solar-2/backend

# Copy the example to actual file
cp .env.example .env

# Open the file
nano .env  # or your favorite editor
```

### Step 5: Fill in Backend .env with Firebase Credentials

Open the JSON file you downloaded and copy these values:

```bash
# From the JSON file, fill these:
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY_ID="your-private-key-id"
FIREBASE_PRIVATE_KEY="your-private-key-with-\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@project.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="your-client-id"
FIREBASE_AUTH_URI="https://accounts.google.com/o/oauth2/auth"
FIREBASE_TOKEN_URI="https://oauth2.googleapis.com/token"
FIREBASE_AUTH_PROVIDER_X509_CERT_URL="https://www.googleapis.com/oauth2/v1/certs"
FIREBASE_CLIENT_X509_CERT_URL="your-cert-url"
```

**Important Notes:**

- The `FIREBASE_PRIVATE_KEY` will have `\n` in it (literal backslash-n, not actual newlines)
- Keep all the backslashes as they are
- Don't change the file format

- [ ] Fill in all 9 Firebase variables
- [ ] Save the file (Ctrl+S or Cmd+S)
- [ ] Verify it's saved: `cat .env | grep FIREBASE`

### Step 6: Install Firebase Admin SDK

```bash
cd /Users/varshithreddy/solar-2/backend

# Install the package
pip install firebase-admin

# Verify installation
python -c "import firebase_admin; print('✓ firebase_admin installed')"
```

- [ ] Firebase Admin SDK installed successfully

---

## ✅ PHASE 3: Frontend Configuration (10 minutes)

### Step 7: Create Frontend .env.local File

```bash
cd /Users/varshithreddy/solar-2/frontend

# Copy the example to actual file
cp .env.local.example .env.local

# Open the file
nano .env.local  # or your favorite editor
```

### Step 8: Fill in Frontend .env.local

Using the Web SDK config you saved earlier from Firebase Console:

```bash
# From Firebase Console Web SDK config, fill these:
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Backend API configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"

# Environment
NODE_ENV="development"
```

- [ ] Fill in all 6 Firebase Web variables
- [ ] Set API_BASE_URL to local development URL
- [ ] Save the file

### Step 9: Verify Frontend Setup

```bash
# Check if env file exists
cat /Users/varshithreddy/solar-2/frontend/.env.local

# Should show your Firebase config
```

- [ ] .env.local file created with Firebase credentials

---

## ✅ PHASE 4: Firebase Services Setup (15 minutes)

### Step 10: Create Firestore Database

- [ ] In Firebase Console, go to **"Build"** → **"Firestore Database"**
- [ ] Click **"Create Database"**
- [ ] **Location**: Choose `us-central1` (or closest to you)
- [ ] **Security Rules**: Select **"Start in test mode"**
- [ ] Click **"Create"** and wait ~2 minutes
- [ ] ✅ Firestore Database is now ready

### Step 11: Create Cloud Storage Bucket

- [ ] In Firebase Console, go to **"Build"** → **"Storage"**
- [ ] Click **"Get started"**
- [ ] **Security Rules**: Select **"Start in test mode"**
- [ ] **Location**: Same as Firestore (e.g., `us-central1`)
- [ ] Click **"Done"** and wait ~1 minute
- [ ] ✅ Cloud Storage Bucket is ready

### Step 12: Enable Authentication

- [ ] In Firebase Console, go to **"Build"** → **"Authentication"**
- [ ] Click **"Get started"**
- [ ] Click **"Email/Password"** provider
- [ ] Toggle **"Enable"** → Click **"Save"**
- [ ] ✅ Email/Password authentication enabled

### Step 13: Enable Google OAuth (Optional)

- [ ] Still in Authentication tab, click **"Google"** provider
- [ ] Toggle **"Enable"**
- [ ] Enter your project support email
- [ ] Click **"Save"**
- [ ] ✅ Google OAuth enabled (optional)

---

## ✅ PHASE 5: Testing & Verification (10 minutes)

### Step 14: Install Backend Dependencies

```bash
cd /Users/varshithreddy/solar-2/backend

# Install all Python packages
pip install -r requirements.txt

# Wait for installation to complete
```

- [ ] All backend dependencies installed

### Step 15: Verify Firebase Configuration

```bash
cd /Users/varshithreddy/solar-2

# Run verification script
python verify_firebase.py
```

Expected output:

```
✅ ALL TESTS PASSED!
   ✓ Environment variables loaded
   ✓ Firestore accessible
   ✓ Storage accessible
   ✓ Auth working
```

- [ ] Verification script passes all tests

### Step 16: Start Backend Server

```bash
cd /Users/varshithreddy/solar-2/backend

# Start the backend
python run.py
```

Should see output like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

- [ ] Backend running on http://localhost:8000

### Step 17: Test Health Endpoint (in new terminal)

```bash
# Test the API
curl http://localhost:8000/api/v1/health

# Should return something like:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}
```

- [ ] Health endpoint responds successfully

### Step 18: Start Frontend Server

```bash
cd /Users/varshithreddy/solar-2/frontend

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Should see:

```
▲ Next.js 16.2.4
- Local:        http://localhost:3000
```

- [ ] Frontend running on http://localhost:3000

### Step 19: Test Frontend in Browser

- [ ] Open http://localhost:3000
- [ ] You should see the landing page
- [ ] Click "Sign Up"
- [ ] Create an account with a test email
- [ ] You should be logged in

### Step 20: Verify in Firebase Console

- [ ] Go to Firebase Console → **Authentication** → **Users**
- [ ] You should see your test user in the list
- [ ] Click on the user to see details
- [ ] ✅ Authentication working!

### Step 21: Verify Firestore

- [ ] Go to Firebase Console → **Firestore Database**
- [ ] You should see a `predictions` collection (if you made any API calls)
- [ ] Click on the collection to see documents
- [ ] ✅ Firestore working!

---

## ✅ PHASE 6: Integration Testing (10 minutes)

### Step 22: Test Solar Forecast API

```bash
# Make a test prediction request
curl -X POST http://localhost:8000/api/v1/solar/forecast \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 37.77,
    "longitude": -122.41,
    "system_capacity_kw": 5.0,
    "panel_efficiency": 0.20,
    "inverter_efficiency": 0.97,
    "azimuth_degrees": 180,
    "tilt_degrees": 30,
    "temperature_celsius": 25,
    "ghi_w_m2": 800,
    "cloud_cover_percent": 10
  }'
```

Expected: Returns prediction with solar generation forecast

- [ ] Solar Forecast API working

### Step 23: Test Roof Detection API

- [ ] Go to Frontend → http://localhost:3000/roof-detection
- [ ] Upload a roof image (JPG, PNG, or WebP, <10MB)
- [ ] Click "Analyze"
- [ ] Should see analysis results
- [ ] Check Firestore Console for logged prediction
- [ ] ✅ Roof Detection API working!

### Step 24: Test Savings Prediction API

- [ ] Go to Frontend → http://localhost:3000/solar-estimation
- [ ] Fill in the form with test data
- [ ] Click "Calculate Savings"
- [ ] Should see financial projections
- [ ] ✅ Savings Prediction API working!

---

## ✅ PHASE 7: Production Preparation (Optional)

### Step 25: Switch Firestore to Production Mode

- [ ] Go to Firebase Console → **Firestore Database** → **Rules**
- [ ] Change from "Test mode" to appropriate production rules
- [ ] Apply security rules that require authentication
- [ ] ✅ Firestore secured

### Step 26: Switch Storage to Production Mode

- [ ] Go to Firebase Console → **Storage** → **Rules**
- [ ] Change from "Test mode" to appropriate production rules
- [ ] ✅ Storage secured

### Step 27: Document Your Setup

- [ ] Save your Firebase project ID: `_______________________`
- [ ] Save your Firebase console URL: `_______________________`
- [ ] Keep `.env` file backed up securely (NOT in git)
- [ ] Keep `.env.local` backed up securely (NOT in git)

---

## ✅ FINAL VERIFICATION

Run this final checklist:

- [ ] `backend/.env` exists with Firebase credentials
- [ ] `frontend/.env.local` exists with Firebase config
- [ ] Backend starts without errors: `python run.py`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Backend health check returns: `{"status":"healthy"}`
- [ ] Frontend loads at http://localhost:3000
- [ ] Can sign up and see user in Firebase Auth
- [ ] Can make API calls and see predictions in Firestore
- [ ] Firestore Database exists
- [ ] Cloud Storage Bucket exists
- [ ] Authentication enabled

---

## 🎉 SUCCESS!

If you've checked all boxes, your Firebase integration is complete!

### Next Steps:

1. Explore the Firebase Console
2. Read [FIREBASE_SETUP_NEW_ACCOUNT.md](FIREBASE_SETUP_NEW_ACCOUNT.md) for detailed docs
3. Review [backend/app/core/firebase.py](backend/app/core/firebase.py) to understand available functions
4. Start building features!

### Troubleshooting:

- ❌ Backend won't start? Check `backend/.env` for Firebase credentials
- ❌ Frontend blank? Check browser console for errors
- ❌ "Permission denied" errors? Firestore might still be in Test mode - check Firebase Console
- ❌ API calls fail? Verify backend is running and check logs

---

## 📞 Support Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Firebase Admin SDK (Python)**: https://firebase.google.com/docs/database/admin/start

---

**Last Updated**: June 2, 2026
**Status**: ✅ Ready for Implementation
