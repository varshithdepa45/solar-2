# 🔥 Firebase Connection Quick Start Guide

## Complete Firebase Setup - 5 Minutes to Production

This guide shows you exactly how to connect Firebase to your Solar-2 project.

---

## ⚡ Quick Summary

| Step | Action                    | Time  |
| ---- | ------------------------- | ----- |
| 1️⃣   | Install Firebase CLI      | 1 min |
| 2️⃣   | Create Firebase project   | 2 min |
| 3️⃣   | Initialize Firebase       | 1 min |
| 4️⃣   | Add environment variables | 2 min |
| 5️⃣   | Deploy rules              | 2 min |
| 6️⃣   | Test & verify             | 2 min |

---

## 📝 Step-by-Step Instructions

### Step 1️⃣: Install Firebase CLI (1 min)

```bash
# Install globally
npm install -g firebase-tools

# Verify
firebase --version

# Login
firebase login
```

✅ A browser window will open - click "Allow" to authenticate

---

### Step 2️⃣: Create Firebase Project (2 min)

**Option A: Web Console (Easiest)**

1. Go to https://console.firebase.google.com
2. Click **"Add Project"**
3. Enter: `solar-ai-prod`
4. Uncheck "Enable Google Analytics"
5. Click **"Create Project"**
6. Wait ~30 seconds for setup

**Option B: CLI**

```bash
firebase projects:create solar-ai-prod --display-name "Solar AI Platform"
```

✅ Project created: `solar-ai-prod`

---

### Step 3️⃣: Initialize Firebase (1 min)

```bash
# Navigate to your project root
cd ~/Downloads/solar-2-main

# Run setup wizard
firebase init

# When prompted, SELECT THESE (use arrow keys):
# ✓ Firestore Database
# ✓ Cloud Functions
# ✓ Hosting
# ✓ Cloud Storage
# ✓ Emulators (optional, for local testing)

# Then answer:
# - Which Firebase project? → solar-ai-prod
# - Firestore location? → us-central1
# - Functions language? → JavaScript
# - Overwrite existing files? → No
```

✅ Firebase initialized

---

### Step 4️⃣: Add Environment Variables (2 min)

**A. Get Firebase Credentials:**

1. Go to https://console.firebase.google.com
2. Select `solar-ai-prod` project
3. Click ⚙️ **"Project Settings"** (top left)
4. Click **"Your apps"** tab
5. Click **"</>"** icon to create web app (or find existing)
6. Copy the config object

**B. Create `.env.local` in frontend:**

```bash
# frontend/.env.local

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB0g...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

**Example values location:**

```javascript
// This is the config you'll find in Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "solar-ai-prod.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "solar-ai-prod", // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "solar-ai-prod.appspot.com", // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012", // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abc123def", // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

✅ Environment variables configured

---

### Step 5️⃣: Deploy Firebase Rules (2 min)

```bash
# From project root
cd ~/Downloads/solar-2-main

# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Cloud Storage security rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes
```

✅ Security rules deployed

---

### Step 6️⃣: Deploy Cloud Functions (Optional but Recommended)

```bash
# Navigate to functions
cd firebase/functions

# Install dependencies
npm install

# Go back to root and deploy
cd ../..

# Deploy functions
firebase deploy --only functions

# View logs
firebase functions:log
```

✅ Cloud Functions deployed

---

## 🧪 Test Your Setup

### Test 1: Enable Authentication

```bash
# In Firebase Console:
# 1. Go to Authentication
# 2. Click "Sign-in method"
# 3. Enable "Email/Password"
# 4. Save
```

### Test 2: Create Firestore Database

```bash
# In Firebase Console:
# 1. Click "Firestore Database"
# 2. Click "Create Database"
# 3. Mode: Production
# 4. Location: us-central1
# 5. Create
```

### Test 3: Enable Cloud Storage

```bash
# In Firebase Console:
# 1. Click "Storage"
# 2. Click "Get Started"
# 3. Mode: Production Rules
# 4. Location: us-central1
# 5. Done
```

### Test 4: Run Emulators Locally

```bash
# Start all emulators
firebase emulators:start

# You'll see:
# Firestore Emulator running at http://localhost:8080
# Functions Emulator running at http://localhost:5001
# Auth Emulator running at http://localhost:9099
# Storage Emulator running at http://localhost:9199

# Frontend will auto-connect when running at localhost:3000
cd frontend
npm run dev
```

✅ Everything working locally!

---

## 🚀 Deploy to Production

### A. Deploy Frontend to Firebase Hosting

```bash
# Build frontend
cd frontend
npm run build

# Go to root and deploy
cd ..
firebase deploy --only hosting

# Your site is live at:
# https://solar-ai-prod.web.app
```

### B. Deploy Backend (Cloud Functions)

```bash
firebase deploy --only functions

# Functions are live at:
# https://us-central1-solar-ai-prod.cloudfunctions.net/api
```

### C. Deploy Everything

```bash
# One command to deploy all
firebase deploy

# This deploys:
# ✓ Functions
# ✓ Firestore rules
# ✓ Storage rules
# ✓ Hosting
# ✓ Indexes
```

---

## 🎯 Verify Everything Works

### Checklist

```bash
# 1. Firebase Project Exists
firebase projects:list | grep solar-ai-prod

# 2. Functions Deployed
firebase functions:list

# 3. Firestore Active
firebase firestore:databases:list

# 4. Storage Active
firebase storage:bucket:list

# 5. Website Live
curl https://solar-ai-prod.web.app
```

---

## 🐛 Troubleshooting

### "Not authenticated to Firebase"

```bash
# Login again
firebase logout
firebase login
```

### "Project not found"

```bash
# Select project
firebase use solar-ai-prod
```

### "Permission denied on Firestore"

```bash
# Redeploy security rules
firebase deploy --only firestore:rules

# Check rules in Console:
# https://console.firebase.google.com → Firestore → Rules
```

### "Emulator already running"

```bash
# Kill the process
pkill -f firebase

# Or find port
lsof -i :8080
kill -9 <PID>
```

### "Environment variables not loading"

```bash
# Restart your dev server
npm run dev

# Make sure file is named: .env.local (not .env)
# And it's in the frontend/ directory
```

---

## 📊 Monitor Your Project

### Firebase Console Dashboard

**Go to:** https://console.firebase.google.com/project/solar-ai-prod

**Monitor:**

- 📈 Firestore reads/writes
- ⚡ Cloud Function execution time
- 💾 Storage bandwidth
- 👥 User authentication events
- 🔴 Error logs and alerts

### View Logs

```bash
# Firestore logs
firebase logging:list

# Function logs
firebase functions:log --limit 50

# Real-time logs
firebase functions:log
```

---

## 🔄 Common Workflows

### Add New User to Firestore

```typescript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const newUser = await addDoc(collection(db, "users"), {
  email: "user@example.com",
  displayName: "John Doe",
  created_at: serverTimestamp(),
  role: "user",
});
```

### Query Predictions

```typescript
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const q = query(
  collection(db, "predictions"),
  where("uid", "==", currentUser.uid),
);

const predictions = await getDocs(q);
```

### Upload File to Storage

```typescript
import { ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase";

const fileRef = ref(storage, `uploads/${userId}/${file.name}`);
await uploadBytes(fileRef, file);
```

### Subscribe to Real-time Updates

```typescript
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const unsubscribe = onSnapshot(doc(db, "projects", projectId), (doc) => {
  console.log("Updated:", doc.data());
});
```

---

## 💰 Pricing Breakdown

### Free Tier (Perfect for Starting)

| Service         | Free Limit                           |
| --------------- | ------------------------------------ |
| Firestore       | 1 GB storage + 50K reads/day         |
| Cloud Functions | 2M invocations/month                 |
| Hosting         | 1 GB storage + 10 GB/month bandwidth |
| Storage         | 5 GB                                 |
| Auth            | Unlimited users                      |

### Pay-As-You-Go (When you scale)

| Service         | Price                    |
| --------------- | ------------------------ |
| Firestore       | $0.06 per 100K reads     |
| Cloud Functions | $0.40 per 1M invocations |
| Hosting         | $0.18 per GB             |
| Storage         | $0.020 per GB            |

**Estimate for 1000 users:** $50-150/month

---

## 🔗 GitHub Pages (.io) Setup

### Deploy Frontend to `.io` Domain

```bash
# 1. Go to GitHub repo settings
# https://github.com/varshithdepa45/solar-2/settings/pages

# 2. Under "Source", select:
#    - Branch: main
#    - Folder: / (root)

# 3. Build frontend statically
cd frontend
npm run build

# 4. Push to GitHub
git add .
git commit -m "Deploy frontend"
git push origin main

# 5. Access at:
# https://varshithdepa45.github.io/solar-2/
```

---

## 📚 Documentation Links

- **Firebase Docs:** https://firebase.google.com/docs
- **Firestore Guide:** https://firebase.google.com/docs/firestore
- **Cloud Functions:** https://firebase.google.com/docs/functions
- **Next.js Firebase:** https://nextjs.org/docs
- **GitHub Pages:** https://pages.github.com

---

## ✅ You're Done!

Your Solar AI Platform is now connected to Firebase! 🎉

**Next Steps:**

1. ✅ Test the emulator
2. ✅ Deploy to production
3. ✅ Add more Cloud Functions
4. ✅ Setup monitoring alerts
5. ✅ Scale with confidence!

**Questions?** Check the main README.md or firebase/README.md for detailed info.

---

**Happy deploying! ☀️**
