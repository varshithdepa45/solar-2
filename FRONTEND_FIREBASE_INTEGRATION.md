# Frontend Firebase Integration Guide

This guide walks you through integrating Firebase into your Next.js frontend application.

## Quick Overview

The frontend Firebase integration provides:

- **Authentication** - Email/password and Google OAuth
- **Firestore** - Real-time database with React hooks
- **Cloud Functions** - Serverless API endpoints
- **Cloud Storage** - File uploads with progress tracking
- **Real-time Updates** - Live data synchronization

## Files Overview

### `lib/firebase.ts`

Firebase app initialization and service references.

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Services are exported and ready to use
export { auth, db, storage, functions };
```

**Auto-emulator detection:** If running on localhost, automatically connects to Firebase emulators.

---

### `lib/auth-context.tsx`

React context for authentication state management.

**Exports:**

- `AuthProvider` - Wrapper component
- `useAuth()` - Hook to access auth state

**Usage:**

```typescript
import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, login, signup, logout } = useAuth();

  return (
    <>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <p>Please sign in</p>
      )}
    </>
  );
}
```

**Available Methods:**

```typescript
interface AuthContext {
  user: User | null; // Current user object
  loading: boolean; // Auth state loading
  error: string | null; // Auth error message
  login(email, password); // Email/password login
  signup(email, password); // Create new account
  loginWithGoogle(); // Google OAuth login
  logout(); // Sign out user
}
```

---

### `lib/useFirestore.ts`

Custom React hooks for Firestore database operations.

#### `usePredictions()`

Get all predictions for current user in real-time.

```typescript
const { predictions, loading, error } = usePredictions();

// predictions is an array of prediction documents
predictions.forEach((pred) => {
  console.log(pred.endpoint, pred.result);
});
```

#### `useProjects()`

Get all projects for current user in real-time.

```typescript
const { projects, loading, error } = useProjects();
```

#### `useProject(projectId)`

Subscribe to a single project's real-time updates.

```typescript
const { project, loading, error } = useProject("project-123");
```

#### `useCreatePrediction()`

Create a new prediction document.

```typescript
const { createPrediction } = useCreatePrediction();

await createPrediction({
  userId: user.uid,
  endpoint: "solar_forecast",
  input: { latitude: 37.7749, longitude: -122.4194 },
  result: { forecast_value: 150.5 },
  metadata: { model_version: "v1.0" },
});
```

#### `useCreateProject()`

Create a new project.

```typescript
const { createProject } = useCreateProject();

await createProject({
  userId: user.uid,
  name: "My Solar Project",
  description: "Residential solar analysis",
  address: "123 Main St, San Francisco, CA",
  estimatedCost: 15000,
});
```

#### `useUpdateProject(projectId)`

Update existing project.

```typescript
const { updateProject } = useUpdateProject("project-123");

await updateProject({
  status: "completed",
  estimatedROI: 8.5,
});
```

#### `useDeleteProject()`

Delete a project.

```typescript
const { deleteProject } = useDeleteProject();

await deleteProject("project-123");
```

---

### `lib/firebase-functions.ts`

Callable wrappers for Cloud Functions.

```typescript
import {
  predictSolarForecast,
  analyzeRoof,
  predictSavings,
  checkHealth,
} from "@/lib/firebase-functions";

// Call solar forecast function
const forecast = await predictSolarForecast({
  latitude: 37.7749,
  longitude: -122.4194,
  month: 6,
});

// Call roof analysis
const roofAnalysis = await analyzeRoof({
  imageUrl: "https://...",
  latitude: 37.7749,
  longitude: -122.4194,
});

// Call savings prediction
const savings = await predictSavings({
  systemSize: 8, // kW
  latitude: 37.7749,
  roofArea: 200,
});

// Check API health
const health = await checkHealth();
```

**Error Handling:**

```typescript
try {
  const result = await predictSolarForecast(data);
} catch (error: any) {
  console.error("Function error:", error.message);
  // error.message contains user-friendly error description
}
```

---

### `lib/firebase-storage.ts`

File upload and download utilities.

#### `uploadRoofImage()`

Upload roof image with progress tracking.

```typescript
import { uploadRoofImage, UploadProgress } from "@/lib/firebase-storage";

const handleFileUpload = async (file: File) => {
  try {
    const url = await uploadRoofImage(
      user.uid,
      file,
      (progress: UploadProgress) => {
        console.log(`Progress: ${progress.progress}%`);
        console.log(
          `${progress.bytesTransferred} / ${progress.totalBytes} bytes`,
        );
      },
    );

    console.log("File uploaded:", url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
```

#### `uploadProjectImage()`

Upload project-scoped image.

```typescript
const url = await uploadProjectImage(user.uid, projectId, file, onProgress);
```

#### `deleteFile()`

Delete file from storage.

```typescript
await deleteFile("roof_analysis/user-123/image.jpg");
```

#### `getStorageRef()`

Get Firebase Storage reference.

```typescript
import { getBytes } from "firebase/storage";

const ref = getStorageRef("roof_analysis/user-123/image.jpg");
const bytes = await getBytes(ref);
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install firebase @react-oauth/google
```

### 2. Environment Variables

Create `.env.local` in the frontend directory:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

Get these values from [Firebase Console](https://console.firebase.google.com):

1. Select your project
2. Go to Settings → Project settings
3. Scroll to "Your apps"
4. Click the web app to view config

### 3. Wrap App with AuthProvider

In `app/layout.tsx`:

```typescript
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Use Hooks in Your Components

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { usePredictions } from '@/lib/useFirestore';

export function MyPage() {
  const { user, logout } = useAuth();
  const { predictions, loading } = usePredictions();

  return (
    <div>
      <p>User: {user?.email}</p>
      <p>Predictions: {predictions.length}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}
```

---

## Example Pages

### Login Page

See `app/login/page.tsx` for complete implementation.

Features:

- Email/password login
- Google OAuth integration
- Error handling
- Loading states
- Redirect to dashboard on success

### Signup Page

See `app/signup/page.tsx` for complete implementation.

Features:

- Email/password signup
- Password validation
- Google OAuth registration
- Existing account link

### Dashboard Page

See `app/dashboard-example/page.tsx` for complete implementation.

Features:

- User authentication check
- Real-time predictions display
- Real-time projects display
- Create new prediction
- Sign out button

---

## Firestore Data Schema

### Collections

#### `users/{uid}`

User profiles and metadata.

```typescript
{
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  credits?: number;  // For paid features
}
```

#### `users/{uid}/predictions/{predId}`

ML prediction history.

```typescript
{
  endpoint: string; // 'solar_forecast', 'roof_detection', etc
  input: Record<string, any>; // Input parameters
  result: Record<string, any>; // Prediction results
  metadata: {
    model_version: string;
    processing_time_ms: number;
  }
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `users/{uid}/projects/{projectId}`

Solar projects.

```typescript
{
  name: string;
  description?: string;
  address: string;
  roofArea?: number;
  estimatedCost?: number;
  estimatedROI?: number;
  status: 'active' | 'completed' | 'archived';
  images: string[];  // Storage URLs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Cloud Functions Integration

### Making Calls

```typescript
import { predictSolarForecast } from "@/lib/firebase-functions";

try {
  const result = await predictSolarForecast({
    latitude: 37.7749,
    longitude: -122.4194,
    month: 6,
  });

  console.log("Solar forecast:", result);
  // Result structure from Cloud Function
} catch (error) {
  console.error("Error:", error.message);
}
```

### Function Responses

All Cloud Functions return standardized responses:

```typescript
{
  success: boolean;
  data: any;              // Function-specific data
  error?: string;         // Error message if success=false
  timestamp: string;      // ISO timestamp
}
```

---

## Cloud Storage Integration

### Upload with Progress

```typescript
import { uploadRoofImage } from "@/lib/firebase-storage";

const fileInput = document.querySelector('input[type="file"]');

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];

  const url = await uploadRoofImage(user.uid, file, (progress) => {
    const percent = Math.round(progress.progress * 100);
    console.log(`${percent}% uploaded`);

    // Update progress bar
    progressBar.style.width = `${percent}%`;
  });

  console.log("Uploaded to:", url);
});
```

### Storage Structure

```
uploads/
  users/
    {uid}/
      {timestamp}-{filename}

projects/
  {uid}/
    {projectId}/
      {timestamp}-{filename}

roof_analysis/
  {uid}/
    {timestamp}-{filename}

models/
  prediction_yolo.pt
  savings_model.pkl
  solar_forecast_rf.pkl
```

---

## Authentication

### Email/Password

```typescript
const { user, login, signup } = useAuth();

// Login
await login("user@example.com", "password123");

// Signup
await signup("newuser@example.com", "password123");
```

### Google OAuth

```typescript
const { user, loginWithGoogle } = useAuth();

// Sign in with Google (opens Google consent screen)
await loginWithGoogle();
```

---

## Real-time Subscriptions

### Listening to Predictions

```typescript
const { predictions, loading, error } = usePredictions();

// Component automatically updates when predictions change
useEffect(() => {
  if (predictions.length > 0) {
    console.log("New predictions available:", predictions);
  }
}, [predictions]);
```

### Listening to Single Project

```typescript
const { project, loading, error } = useProject(projectId);

useEffect(() => {
  if (project) {
    console.log("Project updated:", project);
  }
}, [project]);
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  await createPrediction(data);
} catch (error: any) {
  // Firebase errors are caught and converted to user-friendly messages
  console.error("Error:", error.message);

  // Display to user
  setErrorMessage(error.message);
}
```

### Auth Errors

```typescript
try {
  await login(email, password);
} catch (error: any) {
  // Common errors:
  // "user-not-found" → User doesn't exist
  // "wrong-password" → Incorrect password
  // "user-disabled" → Account disabled

  const message =
    error.code === "user-not-found"
      ? "User not found"
      : error.code === "wrong-password"
        ? "Incorrect password"
        : "Login failed";
}
```

---

## Testing with Firebase Emulator

### Start Emulators

```bash
firebase emulators:start
```

### Automatic Connection

Frontend automatically connects to emulators when running on `localhost:3000`.

### Test with Demo Data

```typescript
// Create demo user
const { signup } = useAuth();
await signup("test@example.com", "password123");

// Create demo prediction
const { createPrediction } = useCreatePrediction();
await createPrediction({
  userId: user.uid,
  endpoint: "solar_forecast",
  input: { latitude: 37.7749, longitude: -122.4194 },
  result: { forecast_value: 150.5 },
  metadata: { model_version: "v1.0" },
});
```

---

## Performance Tips

### 1. Use Real-time Subscriptions Carefully

```typescript
// ✅ GOOD - Subscribe only when needed
const { predictions } = usePredictions();

// ❌ BAD - Multiple subscriptions to same data
for (let i = 0; i < 10; i++) {
  usePredictions(); // Creates 10 listeners!
}
```

### 2. Batch Operations

```typescript
// ✅ GOOD - Batch writes
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);
batch.set(doc1Ref, data1);
batch.set(doc2Ref, data2);
await batch.commit();

// ❌ BAD - Individual writes
await setDoc(doc1Ref, data1);
await setDoc(doc2Ref, data2);
```

### 3. Index Queries

Firestore automatically suggests composite indexes when needed. Watch console for:

```
"Firestore index suggestion"
```

---

## Security Best Practices

### 1. Use Environment Variables

```bash
# ✅ GOOD - Never commit secrets
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...

# ❌ BAD - Hard-coded API key
const config = {
  apiKey: "AIzaSyB..."
};
```

### 2. Validate on Client

```typescript
if (email && password.length >= 6) {
  await signup(email, password);
}
```

### 3. Check Firestore Rules

All data access is controlled by security rules defined in `firebase/firestore.rules`.

---

## Troubleshooting

### "Firebase app not initialized"

```
✅ Solution: Ensure AuthProvider wraps your app in layout.tsx
```

### "Permission denied" errors

```
✅ Solution: Check Firestore security rules in firebase/firestore.rules
✅ Solution: Ensure user is authenticated (check Auth tab in Emulator)
```

### "Module not found" errors

```bash
✅ Solution: Install dependencies
npm install firebase @react-oauth/google
```

### Changes not syncing in real-time

```
✅ Solution: Ensure you're using the hook (usePredictions, useProjects)
✅ Solution: Check Firestore database tab in Emulator
```

---

## Next Steps

1. ✅ Install dependencies
2. ✅ Add environment variables
3. ✅ Wrap app with AuthProvider
4. ✅ Use login/signup pages
5. ✅ Build dashboard with hooks
6. ✅ Test with emulators
7. ✅ Deploy to Firebase Hosting

See README.md for deployment instructions.
