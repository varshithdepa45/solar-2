# Firebase Integration Complete Setup Guide

Master checklist for setting up Firebase integration from start to finish.

---

## Phase 1: Initial Setup (10 minutes)

### Step 1: Create Firebase Project

- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Click "Add Project"
- [ ] Enter project name: `solar-ai-prod`
- [ ] Uncheck "Enable Google Analytics"
- [ ] Click "Create Project"
- [ ] Wait for project creation (2-3 minutes)

### Step 2: Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Verify installation
firebase --version

# Login to Firebase
firebase login
```

### Step 3: Initialize Firebase in Project

From project root:

```bash
firebase init
```

When prompted:

- Select: Firestore, Functions, Hosting, Storage
- Use existing project: `solar-ai-prod`
- Accept defaults for most questions
- When asked about functions: Choose JavaScript/TypeScript

### Step 4: Set Firebase Project ID

```bash
firebase use solar-ai-prod
```

---

## Phase 2: Backend Setup (15 minutes)

### Step 1: Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules
```

**Verify:** Go to Firebase Console → Firestore → Rules tab

### Step 2: Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**Verify:** Go to Firebase Console → Firestore → Indexes tab

### Step 3: Install Cloud Functions Dependencies

```bash
cd firebase/functions
npm install
cd ../..
```

### Step 4: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

**Verify:** Go to Firebase Console → Functions → All functions

This deploys:

- `predictSolarForecast` - Solar generation prediction
- `analyzeRoof` - Roof analysis endpoint
- `predictSavings` - Financial projection
- `checkHealth` - Health check endpoint

---

## Phase 3: Frontend Setup (15 minutes)

### Step 1: Install Dependencies

```bash
cd frontend
npm install firebase @react-oauth/google
cd ..
```

### Step 2: Get Firebase Credentials

1. Go to Firebase Console
2. Click Project Settings (gear icon)
3. Scroll to "Your apps"
4. Click the web app (if none exists, click "Add app" → Web)
5. Copy the config object

### Step 3: Create Environment File

```bash
# Copy example file
cp frontend/.env.example frontend/.env.local
```

Edit `frontend/.env.local` and paste your credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

### Step 4: Verify Files Are Created

Check that these files exist:

```bash
ls -la frontend/lib/
# Should show:
# - firebase.ts
# - auth-context.tsx
# - useFirestore.ts
# - firebase-functions.ts
# - firebase-storage.ts
# - types.ts
```

### Step 5: Wrap App with AuthProvider

Edit `frontend/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }) {
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

---

## Phase 4: Testing Setup (Optional, but Recommended)

### Step 1: Start Firebase Emulators

```bash
firebase emulators:start
```

Opens emulator UI at: http://localhost:4000

### Step 2: Start Frontend Dev Server

In new terminal:

```bash
cd frontend
npm run dev
```

Frontend will auto-connect to emulators (localhost detection)

### Step 3: Test Authentication

Visit: http://localhost:3000/login

- Click "Sign in with Google"
- Or enter email/password to create account

**Verify in Emulator UI:**

1. Go to http://localhost:4000
2. Click "Authentication" tab
3. You should see the test user

### Step 4: Test Firestore

Visit: http://localhost:3000/dashboard-example

- Create a new prediction
- Check Firestore tab in emulator UI

**Verify:**

1. Go to Firestore tab in emulator
2. You should see `users` collection with your data

### Step 5: Test Cloud Functions

Visit: http://localhost:3000/solar-estimation-example

- Fill in coordinates and click "Get Estimation"
- Should see results in seconds

---

## Phase 5: Verification Checklist

### Authentication

- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] Logout works
- [ ] Auth state persists on refresh

### Firestore

- [ ] Can create predictions
- [ ] Can create projects
- [ ] Can update projects
- [ ] Can delete projects
- [ ] Real-time updates work (multiple tabs)

### Cloud Functions

- [ ] Solar forecast returns data
- [ ] Roof analysis returns data
- [ ] Savings prediction returns data
- [ ] Health check works
- [ ] Error handling works (invalid inputs)

### Cloud Storage

- [ ] Can upload images
- [ ] Progress tracking works
- [ ] Can delete images
- [ ] Uploaded files accessible

### Security

- [ ] Unauthenticated users cannot access Firestore
- [ ] Users can only see their own data
- [ ] Users cannot upload files > 10MB
- [ ] Only image files allowed in storage

---

## Phase 6: Example Pages

### Available Pages

```
/login              - Login page
/signup             - Signup page
/dashboard-example  - Dashboard with predictions
/roof-detection-example - Roof analysis demo
/solar-estimation-example - Solar forecast demo
```

### Recommended Walkthrough

1. Visit `/signup` and create test account
2. Visit `/solar-estimation-example` and get forecast
3. Visit `/roof-detection-example` and upload test image
4. Visit `/dashboard-example` and see all predictions
5. Check Firebase Console to see stored data

---

## Phase 7: Deployment (Optional)

### Deploy Frontend to Firebase Hosting

```bash
# Build
cd frontend
npm run build

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://solar-ai-prod.web.app`

### Deploy to GitHub Pages (Alternative)

```bash
# Set up GitHub Actions workflow (see .github/workflows/deploy.yml)
git add .
git commit -m "Add deployment"
git push origin main
```

Your app will be live at: `https://YOUR_USERNAME.github.io/solar-2`

---

## Phase 8: Production Readiness

### Before Going Live

- [ ] Set up custom domain
- [ ] Enable HTTPS (automatic on Firebase/Vercel)
- [ ] Configure monitoring and alerts
- [ ] Set up backups
- [ ] Enable Cloud Audit Logs
- [ ] Review Firestore security rules
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Set up error tracking (Sentry)
- [ ] Configure rate limiting

### Set Up Monitoring

```bash
# Enable Cloud Monitoring
firebase monitoring:enable

# View metrics
firebase monitoring:metrics
```

---

## Troubleshooting

### "Firebase app not initialized"

**Solution:**

```bash
# Check .env.local exists and has values
cat frontend/.env.local

# Check AuthProvider wraps app
# Edit frontend/app/layout.tsx
```

### "Permission denied" errors

**Solution:**

```bash
# Check Firestore rules
cat firebase/firestore.rules

# Deploy rules
firebase deploy --only firestore:rules
```

### "Module not found: firebase"

**Solution:**

```bash
cd frontend
npm install firebase @react-oauth/google
```

### "Function not deployed"

**Solution:**

```bash
# Check functions exist
ls firebase/functions/index.js

# Deploy
firebase deploy --only functions

# Check logs
firebase functions:log
```

### "Emulator not connecting"

**Solution:**

```bash
# Start emulators
firebase emulators:start

# Check they're running
lsof -i :8080  # Firestore
lsof -i :9099  # Auth
lsof -i :9199  # Storage
```

### "Images not uploading"

**Solution:**

```bash
# Check Storage rules
cat firebase/storage.rules

# Verify file size < 10MB
# Verify file type is image (JPEG/PNG/WebP)

# Check Cloud Storage quota
firebase storage:quota
```

---

## File Structure Reference

```
project/
├── firebase/
│   ├── firestore.rules          # Firestore security rules
│   ├── storage.rules            # Cloud Storage security
│   ├── firestore.indexes.json   # Firestore query indexes
│   └── functions/
│       ├── index.js             # Cloud Functions code
│       └── package.json         # Functions dependencies
│
├── frontend/
│   ├── lib/
│   │   ├── firebase.ts          # Firebase initialization
│   │   ├── auth-context.tsx     # Auth context provider
│   │   ├── useFirestore.ts      # Firestore hooks
│   │   ├── firebase-functions.ts # Cloud Functions wrappers
│   │   ├── firebase-storage.ts  # Storage utilities
│   │   └── types.ts             # TypeScript types
│   ├── app/
│   │   ├── login/page.tsx       # Login example
│   │   ├── signup/page.tsx      # Signup example
│   │   ├── dashboard-example/page.tsx
│   │   ├── roof-detection-example/page.tsx
│   │   └── solar-estimation-example/page.tsx
│   ├── .env.local               # Firebase credentials (create this)
│   └── .env.example             # Credentials template
│
├── .firebaserc                  # Firebase project config
└── firebase.json                # Firebase services config
```

---

## Documentation Reference

| Document                                                             | Purpose                    |
| -------------------------------------------------------------------- | -------------------------- |
| [README.md](README.md)                                               | Project overview           |
| [FRONTEND_QUICK_START.md](FRONTEND_QUICK_START.md)                   | 5-minute setup             |
| [FRONTEND_FIREBASE_INTEGRATION.md](FRONTEND_FIREBASE_INTEGRATION.md) | Detailed integration guide |
| [FRONTEND_API_REFERENCE.md](FRONTEND_API_REFERENCE.md)               | API documentation          |
| [DEPLOYMENT.md](DEPLOYMENT.md)                                       | Deployment guide           |
| [FRONTEND_TESTING.md](FRONTEND_TESTING.md)                           | Testing guide              |

---

## Next Steps

1. ✅ Complete Phase 1 (Initial Setup)
2. ✅ Complete Phase 2 (Backend Setup)
3. ✅ Complete Phase 3 (Frontend Setup)
4. ✅ Complete Phase 4 (Testing Setup - Optional)
5. ✅ Verify Phase 5 (Verification Checklist)
6. ✅ Walkthrough Phase 6 (Example Pages)
7. ✅ Deploy Phase 7 (Deployment - Optional)
8. ✅ Prepare Phase 8 (Production Readiness)

---

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Firebase Hooks](https://github.com/csfrequency/react-firebase-hooks)
- [Next.js Firebase Integration](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [GitHub Issues](https://github.com/varshithdepa45/solar-2/issues)

---

## Version Info

- Firebase: Latest (v10+)
- Next.js: 16.2.4+
- React: 19+
- Node.js: 18+

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Check specific documentation guides
3. Open GitHub issue with details
4. Check Firebase documentation

Good luck with your Solar AI project! 🚀
