# Firebase Frontend Integration - Quick Start

## 5-Minute Setup

### 1. Install Dependencies (1 min)

```bash
cd frontend
npm install firebase @react-oauth/google
```

### 2. Create Environment File (1 min)

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Get Firebase credentials from [Firebase Console](https://console.firebase.google.com):

- Project Settings → Your apps → Copy Web config
- Paste into `.env.local`

### 3. Wrap App with Auth Provider (1 min)

In `app/layout.tsx`:

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

### 4. Use in Components (2 min)

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { usePredictions } from '@/lib/useFirestore';

export function MyComponent() {
  const { user, logout } = useAuth();
  const { predictions } = usePredictions();

  return (
    <div>
      <p>{user?.email}</p>
      <p>Predictions: {predictions.length}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

---

## Available Features

### Authentication

```typescript
const { user, login, signup, loginWithGoogle, logout, loading, error } =
  useAuth();

// Login
await login(email, password);

// Signup
await signup(email, password);

// Google OAuth
await loginWithGoogle();

// Logout
await logout();
```

### Firestore (Real-time Database)

```typescript
// Get user's predictions
const { predictions, loading } = usePredictions();

// Get user's projects
const { projects, loading } = useProjects();

// Get single project
const { project, loading } = useProject(projectId);

// Create prediction
const { createPrediction } = useCreatePrediction();
await createPrediction({ userId, endpoint, input, result, metadata });

// Create project
const { createProject } = useCreateProject();
await createProject({ userId, name, address, ... });

// Update project
const { updateProject } = useUpdateProject(projectId);
await updateProject({ status: 'completed', ... });

// Delete project
const { deleteProject } = useDeleteProject();
await deleteProject(projectId);
```

### Cloud Functions

```typescript
import {
  predictSolarForecast,
  analyzeRoof,
  predictSavings,
  checkHealth,
} from "@/lib/firebase-functions";

const forecast = await predictSolarForecast({ latitude, longitude, month });
const roof = await analyzeRoof({ imageUrl, latitude, longitude });
const savings = await predictSavings({ systemSize, latitude, roofArea });
const health = await checkHealth();
```

### Cloud Storage

```typescript
import {
  uploadRoofImage,
  uploadProjectImage,
  deleteFile,
  getStorageRef,
} from "@/lib/firebase-storage";

// Upload with progress
const url = await uploadRoofImage(userId, file, (progress) => {
  console.log(`${progress.progress}% uploaded`);
});

// Delete
await deleteFile("path/to/file");
```

---

## Example Pages

### Login Page

`app/login/page.tsx` - Email/password and Google OAuth

### Signup Page

`app/signup/page.tsx` - Create new account

### Dashboard

`app/dashboard-example/page.tsx` - Real-time predictions and projects

### Roof Detection

`app/roof-detection-example/page.tsx` - Upload and analyze roof images

### Solar Estimation

`app/solar-estimation-example/page.tsx` - Get solar forecast and financial projections

---

## Testing with Emulators

### Start Emulators

```bash
firebase emulators:start
```

Frontend automatically connects when running on `localhost:3000`.

### Test Features

```typescript
// Create test user
const { signup } = useAuth();
await signup("test@example.com", "password123");

// Check Firestore in emulator UI
// http://localhost:4000 (default port)
```

---

## Deployment

### Deploy to Firebase Hosting

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

---

## Troubleshooting

| Problem                        | Solution                                                  |
| ------------------------------ | --------------------------------------------------------- |
| "Firebase app not initialized" | Ensure AuthProvider wraps your app in layout.tsx          |
| "Permission denied"            | Check Firestore security rules (firebase/firestore.rules) |
| "Module not found"             | Run `npm install firebase @react-oauth/google`            |
| Changes not syncing            | Check you're using the hook (usePredictions, useProjects) |
| Emulator not connecting        | Ensure `firebase emulators:start` is running on localhost |

---

## File Structure

```
frontend/
├── lib/
│   ├── firebase.ts                 # Firebase initialization
│   ├── auth-context.tsx            # Auth provider
│   ├── useFirestore.ts            # Firestore hooks
│   ├── firebase-functions.ts      # Cloud Functions wrappers
│   └── firebase-storage.ts        # Storage utilities
├── app/
│   ├── login/page.tsx              # Login example
│   ├── signup/page.tsx             # Signup example
│   ├── dashboard-example/page.tsx   # Dashboard example
│   ├── roof-detection-example/page.tsx # Roof analysis
│   └── solar-estimation-example/page.tsx # Solar forecast
└── .env.local                      # Firebase credentials
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Add environment variables
3. ✅ Wrap app with AuthProvider
4. ✅ Review example pages
5. ✅ Test with emulators (optional)
6. ✅ Deploy to Firebase Hosting

See [FRONTEND_FIREBASE_INTEGRATION.md](FRONTEND_FIREBASE_INTEGRATION.md) for detailed documentation.
