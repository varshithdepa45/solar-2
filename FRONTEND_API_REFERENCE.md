# Frontend API Reference

Complete reference for all Firebase services and Cloud Functions available in the frontend.

## Table of Contents

1. [Authentication](#authentication)
2. [Firestore Database](#firestore-database)
3. [Cloud Functions](#cloud-functions)
4. [Cloud Storage](#cloud-storage)

---

## Authentication

### `useAuth()`

Access authentication state and functions.

```typescript
const {
  user, // Current user object or null
  loading, // Auth state loading
  error, // Error message or null
  login, // Function: (email, password) => Promise<void>
  signup, // Function: (email, password) => Promise<void>
  loginWithGoogle, // Function: () => Promise<void>
  logout, // Function: () => Promise<void>
} = useAuth();
```

### `login(email, password)`

Sign in with email and password.

```typescript
const { login } = useAuth();

try {
  await login("user@example.com", "password123");
} catch (error) {
  console.error("Login failed:", error.message);
}
```

**Error Codes:**

- `user-not-found` - User doesn't exist
- `wrong-password` - Incorrect password
- `too-many-requests` - Too many failed attempts
- `user-disabled` - Account disabled

---

### `signup(email, password)`

Create new account with email and password.

```typescript
const { signup } = useAuth();

try {
  await signup("newuser@example.com", "password123");
} catch (error) {
  console.error("Signup failed:", error.message);
}
```

**Error Codes:**

- `email-already-in-use` - Account exists
- `weak-password` - Password too weak
- `invalid-email` - Invalid email format

---

### `loginWithGoogle()`

Sign in with Google OAuth.

```typescript
const { loginWithGoogle } = useAuth();

try {
  await loginWithGoogle();
  // User is authenticated
} catch (error) {
  console.error("Google login failed:", error.message);
}
```

**Requires:**

- Google sign-in enabled in Firebase Console
- `@react-oauth/google` package installed

---

### `logout()`

Sign out current user.

```typescript
const { logout } = useAuth();

try {
  await logout();
} catch (error) {
  console.error("Logout failed:", error.message);
}
```

---

## Firestore Database

### `usePredictions()`

Get all predictions for current user in real-time.

```typescript
const {
  predictions, // Array of prediction documents
  loading, // Boolean
  error, // Error object or null
} = usePredictions();
```

**Returns:**

```typescript
interface Prediction {
  id: string;
  userId: string;
  endpoint: "solar_forecast" | "roof_detection" | "savings_prediction";
  input: Record<string, any>;
  result: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Example:**

```typescript
const { predictions, loading } = usePredictions();

useEffect(() => {
  predictions.forEach((pred) => {
    console.log(`${pred.endpoint}: ${pred.result}`);
  });
}, [predictions]);
```

---

### `useProjects()`

Get all projects for current user in real-time.

```typescript
const {
  projects, // Array of project documents
  loading, // Boolean
  error, // Error object or null
} = useProjects();
```

**Returns:**

```typescript
interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  address: string;
  roofArea?: number;
  estimatedCost?: number;
  estimatedROI?: number;
  status: "active" | "completed" | "archived";
  images?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

### `useProject(projectId)`

Subscribe to a single project's real-time updates.

```typescript
const {
  project, // Single project object or null
  loading, // Boolean
  error, // Error object or null
} = useProject("project-id-123");
```

---

### `useCreatePrediction()`

Create a new prediction document.

```typescript
const { createPrediction, loading, error } = useCreatePrediction();

const predictionId = await createPrediction({
  userId: user.uid,
  endpoint: "solar_forecast",
  input: {
    latitude: 37.7749,
    longitude: -122.4194,
    month: 6,
  },
  result: {
    forecast_value: 150.5,
    confidence_interval: [120.3, 180.7],
  },
  metadata: {
    model_version: "v1.0",
    processing_time_ms: 45,
  },
});
```

**Parameters:**

```typescript
interface CreatePredictionInput {
  userId: string; // Required
  endpoint: string; // Required: 'solar_forecast', 'roof_detection', 'savings_prediction'
  input: Record<string>; // Required: Input parameters
  result: Record<string>; // Required: Prediction results
  metadata?: Record<string>; // Optional: Additional metadata
}
```

---

### `useCreateProject()`

Create a new project.

```typescript
const { createProject, loading, error } = useCreateProject();

const projectId = await createProject({
  userId: user.uid,
  name: "My Solar Project",
  description: "Residential solar analysis",
  address: "123 Main St, San Francisco, CA",
  roofArea: 250,
  estimatedCost: 15000,
});
```

**Parameters:**

```typescript
interface CreateProjectInput {
  userId: string; // Required
  name: string; // Required
  description?: string; // Optional
  address: string; // Required
  roofArea?: number; // Optional: m²
  estimatedCost?: number; // Optional: USD
  estimatedROI?: number; // Optional: percentage
  images?: string[]; // Optional: Storage URLs
}
```

---

### `useUpdateProject(projectId)`

Update an existing project.

```typescript
const { updateProject, loading, error } = useUpdateProject("project-id-123");

await updateProject({
  status: "completed",
  estimatedROI: 8.5,
  description: "Updated description",
});
```

**Parameters:**

```typescript
interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: "active" | "completed" | "archived";
  estimatedROI?: number;
  images?: string[];
  // Any other fields
}
```

---

### `useDeleteProject()`

Delete a project and all associated data.

```typescript
const { deleteProject, loading, error } = useDeleteProject();

await deleteProject("project-id-123");
```

---

## Cloud Functions

### `predictSolarForecast(input)`

Get solar generation forecast for a location.

```typescript
import { predictSolarForecast } from '@/lib/firebase-functions';

const forecast = await predictSolarForecast({
  latitude: 37.7749,
  longitude: -122.4194,
  month: 6
});

// Response
{
  forecast_value: 150.5,
  confidence_interval: [120.3, 180.7],
  unit: 'kWh/month',
  metadata: {
    model_version: 'v1.0',
    processing_time_ms: 45
  }
}
```

**Parameters:**

- `latitude` (number): -90 to 90
- `longitude` (number): -180 to 180
- `month` (number): 1-12

**Returns:**

```typescript
interface SolarForecastOutput {
  forecast_value: number; // kWh/month
  confidence_interval: [number, number]; // 95% confidence range
  unit: string; // 'kWh/month'
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}
```

---

### `analyzeRoof(input)`

Analyze roof image for solar suitability.

```typescript
import { analyzeRoof } from '@/lib/firebase-functions';

const analysis = await analyzeRoof({
  imageUrl: 'https://storage.googleapis.com/...',
  latitude: 37.7749,
  longitude: -122.4194
});

// Response
{
  suitability: 0.85,
  bounding_boxes: [
    {
      x: 100,
      y: 150,
      width: 200,
      height: 180,
      area: 36,
      confidence: 0.92
    }
  ],
  orientation: 'South',
  average_pitch: 25,
  total_area: 36,
  metadata: {...}
}
```

**Parameters:**

- `imageUrl` (string): URL to roof image in Cloud Storage
- `latitude` (number): Property latitude
- `longitude` (number): Property longitude

**Returns:**

```typescript
interface RoofAnalysisOutput {
  suitability: number; // 0-1 score
  bounding_boxes: BoundingBox[]; // Detected roof areas
  orientation: string; // 'North', 'South', 'East', 'West', etc
  average_pitch: number; // Degrees
  total_area: number; // m²
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}
```

---

### `predictSavings(input)`

Calculate 25-year financial projection.

```typescript
import { predictSavings } from '@/lib/firebase-functions';

const savings = await predictSavings({
  systemSize: 8,      // kW
  latitude: 37.7749,
  roofArea: 200       // m²
});

// Response
{
  annual_savings: 1250.50,
  payback_period_years: 6.5,
  npv_25_years: 18750.00,
  co2_offset_tons: 12.5,
  monthly_breakdown: [
    {
      month: 1,
      generation_kwh: 850,
      savings_usd: 102.50,
      cumulative_savings_usd: 102.50
    },
    // ... 11 more months
  ],
  metadata: {...}
}
```

**Parameters:**

- `systemSize` (number): System size in kW
- `latitude` (number): Property latitude
- `roofArea` (number): Available roof area in m²

**Returns:**

```typescript
interface SavingsPredictionOutput {
  annual_savings: number; // First year savings in USD
  payback_period_years: number; // Years until break-even
  npv_25_years: number; // Net present value over 25 years
  co2_offset_tons: number; // Annual CO₂ offset
  monthly_breakdown: MonthlyProjection[]; // Month-by-month breakdown
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}
```

---

### `checkHealth()`

Check API health and service status.

```typescript
import { checkHealth } from '@/lib/firebase-functions';

const health = await checkHealth();

// Response
{
  status: 'healthy',
  timestamp: '2024-01-15T10:30:00Z',
  services: {
    firestore: true,
    storage: true,
    models: true
  }
}
```

**Returns:**

```typescript
{
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    firestore: boolean;
    storage: boolean;
    models: boolean;
  }
}
```

---

## Cloud Storage

### `uploadRoofImage(userId, file, onProgress)`

Upload roof image to Cloud Storage.

```typescript
import { uploadRoofImage } from "@/lib/firebase-storage";

const url = await uploadRoofImage(user.uid, file, (progress) => {
  console.log(`${progress.progress}% uploaded`);
});

// Use url immediately
console.log("Image URL:", url);
```

**Parameters:**

- `userId` (string): User ID
- `file` (File): Image file (JPEG, PNG, WebP, max 10MB)
- `onProgress` (optional): Progress callback function

**Progress Object:**

```typescript
interface UploadProgress {
  bytesTransferred: number; // Bytes uploaded
  totalBytes: number; // Total file size
  progress: number; // 0-100 percentage
}
```

**Returns:**

- Download URL (string) - immediately accessible

---

### `uploadProjectImage(userId, projectId, file, onProgress)`

Upload project-scoped image to Cloud Storage.

```typescript
import { uploadProjectImage } from "@/lib/firebase-storage";

const url = await uploadProjectImage(user.uid, projectId, file, (progress) => {
  progressBar.style.width = `${progress.progress}%`;
});
```

**Parameters:**

- `userId` (string): User ID
- `projectId` (string): Project ID
- `file` (File): Image file
- `onProgress` (optional): Progress callback

---

### `deleteFile(filePath)`

Delete file from Cloud Storage.

```typescript
import { deleteFile } from "@/lib/firebase-storage";

await deleteFile("roof_analysis/user-123/image.jpg");
```

**Parameters:**

- `filePath` (string): Full path to file in storage

---

### `getStorageRef(path)`

Get Firebase Storage reference.

```typescript
import { getStorageRef } from "firebase/storage";
import { getBytes, getDownloadURL } from "firebase/storage";

const ref = getStorageRef("roof_analysis/user-123/image.jpg");

// Get file bytes
const bytes = await getBytes(ref);

// Get download URL
const url = await getDownloadURL(ref);
```

---

## Error Handling

All functions throw errors that can be caught and handled:

```typescript
try {
  const result = await predictSolarForecast(data);
} catch (error: any) {
  // error.message contains user-friendly error description
  console.error("Error:", error.message);

  // Handle specific errors
  if (error.message.includes("Permission denied")) {
    // Handle auth error
  } else if (error.message.includes("invalid")) {
    // Handle validation error
  }
}
```

**Common Error Messages:**

- `"Permission denied"` - User not authenticated
- `"Invalid input: latitude must be between -90 and 90"` - Validation error
- `"Model not loaded"` - ML model unavailable
- `"Storage quota exceeded"` - Cloud Storage limit reached
- `"Function timeout"` - Processing took too long

---

## Rate Limiting

API requests are rate-limited:

- **Authenticated users**: 100 requests/minute
- **Unauthenticated**: 10 requests/minute

When rate limited, you'll receive:

```typescript
{
  error: 'Too many requests',
  retryAfter: 60 // seconds
}
```

---

## Response Caching

Cloud Functions responses are cached for:

- Solar forecast: 24 hours
- Roof analysis: 7 days (per image)
- Savings prediction: 24 hours

---

## Firestore Limits

- **Document size**: 1 MB max
- **Write operations**: 1,000 writes per second
- **Read operations**: 100,000 reads per second
- **Queries**: 10,000 documents max per query

---

## Storage Limits

- **File size**: 10 MB per file
- **Bucket size**: Configurable (default 100 GB)
- **File types**: JPEG, PNG, WebP only

---

## See Also

- [Frontend Quick Start](FRONTEND_QUICK_START.md)
- [Frontend Integration Guide](FRONTEND_FIREBASE_INTEGRATION.md)
- [Types Reference](frontend/lib/types.ts)
- [Firebase Documentation](https://firebase.google.com/docs)
