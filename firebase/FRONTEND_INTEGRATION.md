# Firebase Integration Guide for Frontend

This guide walks through integrating Firebase into the Solar AI Next.js frontend.

## Installation

```bash
cd frontend

# Install Firebase SDK
npm install firebase @react-oauth/google

# Install Firebase emulator (development only)
npm install -D firebase-tools
```

## Environment Configuration

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB0...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456
```

## Firebase Client Setup

Create `frontend/lib/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

// Connect to emulators in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  if (window.location.hostname === "localhost") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });
      connectFirestoreEmulator(db, "localhost", 8080);
      connectStorageEmulator(storage, "localhost", 9199);
    } catch (e) {
      // Emulator already connected
    }
  }
}

export default app;
```

## Authentication

Create `frontend/lib/auth-context.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
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

## API Integration

Create `frontend/lib/firebase-api.ts`:

```typescript
import { functions } from "firebase/app";
import { httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";

const auth = getAuth();

// Initialize functions reference
const functionsRegion = "us-central1";
const functions = httpsCallable(app, "api", { region: functionsRegion });

// Connect to emulator in development
if (process.env.NODE_ENV === "development") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

// API Functions

export async function callSolarForecast(data: SolarForecastInput) {
  const idToken = await auth.currentUser?.getIdToken();

  const response = await fetch(
    "http://localhost:5001/solar-ai-prod/us-central1/api/solar-forecast",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Solar forecast failed");
  }

  return response.json();
}

export async function callRoofAnalysis(imageUrl: string, projectId: string) {
  const idToken = await auth.currentUser?.getIdToken();

  const response = await fetch(
    "http://localhost:5001/solar-ai-prod/us-central1/api/roof-analysis",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageUrl, project_id: projectId }),
    },
  );

  if (!response.ok) {
    throw new Error("Roof analysis failed");
  }

  return response.json();
}

export async function callSavingsPrediction(data: SavingsInput) {
  const idToken = await auth.currentUser?.getIdToken();

  const response = await fetch(
    "http://localhost:5001/solar-ai-prod/us-central1/api/savings-prediction",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    throw new Error("Savings prediction failed");
  }

  return response.json();
}
```

## Update API Client

Update `frontend/lib/api.ts` to use Firebase:

```typescript
import {
  callSolarForecast,
  callRoofAnalysis,
  callSavingsPrediction,
} from "./firebase-api";

export async function getSolarForecast(payload: SolarForecastInput) {
  return callSolarForecast(payload);
}

export async function analyzeRoof(file: File) {
  // Upload to Firebase Storage
  const storageRef = ref(storage, `uploads/${user.uid}/${file.name}`);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  // Call Cloud Function
  return callRoofAnalysis(imageUrl, "project-id");
}

export async function getSavingsPrediction(payload: SavingsInput) {
  return callSavingsPrediction(payload);
}
```

## Firestore Queries

Example queries for Firestore:

```typescript
import { query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Get user's predictions
export async function getUserPredictions(uid: string) {
  const q = query(
    collection(db, "predictions"),
    where("uid", "==", uid),
    orderBy("created_at", "desc"),
    limit(10),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Get user's projects
export async function getUserProjects(uid: string) {
  const q = query(
    collection(db, "projects"),
    where("uid", "==", uid),
    orderBy("updated_at", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Real-time subscription
export function subscribeToProject(
  projectId: string,
  callback: (data: any) => void,
) {
  return onSnapshot(doc(db, "projects", projectId), callback);
}
```

## File Upload to Storage

```typescript
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadRoofImage(
  userId: string,
  file: File,
  onProgress: (progress: number) => void,
) {
  const storageRef = ref(
    storage,
    `roof_analysis/${userId}/${Date.now()}-${file.name}`,
  );

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      },
    );
  });
}
```

## Error Handling

```typescript
export function handleFirebaseError(error: any): string {
  switch (error.code) {
    case "auth/user-not-found":
      return "User not found. Please sign up first.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "Email already registered.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "permission-denied":
      return "You do not have permission to access this resource.";
    case "not-found":
      return "The requested resource was not found.";
    case "deadline-exceeded":
      return "Request timed out. Please try again.";
    default:
      return error.message || "An error occurred. Please try again.";
  }
}
```

## Using in Components

Example React component:

```typescript
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getSolarForecast } from '@/lib/api';
import { handleFirebaseError } from '@/lib/firebase-api';

export default function SolarEstimation() {
  const { user, loading } = useAuth();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in</div>;

  async function handleForecast() {
    try {
      setIsLoading(true);
      const data = await getSolarForecast({
        latitude: 40.7128,
        longitude: -74.0060,
        month: 6,
        panel_capacity_kw: 5,
        // ... other fields
      });
      setResult(data);
      setError('');
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleForecast} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Get Forecast'}
      </button>
      {error && <div className="error">{error}</div>}
      {result && <div className="result">{JSON.stringify(result)}</div>}
    </div>
  );
}
```

## Local Development with Emulator

Start the emulator:

```bash
firebase emulators:start
```

This runs:

- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Storage: http://localhost:9199

## Deployment

Deploy frontend to Firebase Hosting:

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at: `https://solar-ai-prod.web.app`

## Resources

- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web/setup)
- [Firestore Web Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Cloud Functions with Web SDK](https://firebase.google.com/docs/functions/callable)
- [Cloud Storage Web Guide](https://firebase.google.com/docs/storage/web/start)
