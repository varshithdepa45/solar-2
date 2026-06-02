# Firebase Architecture & Data Flow

Visual guide to how Firebase connects your frontend, backend, and data.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET / CLOUD                              │
└─────────────────────────────────────────────────────────────────────┘
                             △
                             │
                    ┌────────┼────────┐
                    │        │        │
                    ▼        ▼        ▼
              ┌──────┐   ┌──────┐   ┌──────┐
              │Auth  │   │Firestore   │Storage│
              │🔐    │   │📊    │   │🖼️    │
              └──────┘   └──────┘   └──────┘
                ▲          ▲          ▲
                │          │          │
    ┌───────────┼──────────┼──────────┼──────────┐
    │           │          │          │          │
    │   ┌───────▼────┐     │    ┌──────▼─────┐   │
    │   │   Backend  │     │    │  Frontend  │   │
    │   │  (FastAPI) │     │    │ (Next.js)  │   │
    │   │   🐍 Py    │     │    │   🔵 TS    │   │
    │   └────────────┘     │    └────────────┘   │
    │                      │                     │
    │   Services:          │   Features:        │
    │   • Predictions      │   • UI Components  │
    │   • ML Models        │   • User Login     │
    │   • API Endpoints    │   • Real-time data │
    │                      │   • File upload    │
    └──────────────────────┼─────────────────────┘
                           │
                 ┌─────────▼──────────┐
                 │  PostgreSQL DB     │
                 │  💾 Audit Trail    │
                 │  (Optional)        │
                 └────────────────────┘


DATA DIRECTION:
Backend → Firebase: Send predictions, store files
Frontend → Firebase: Login, fetch data, upload images
Firebase → Frontend: Real-time updates via listeners
Backend → PostgreSQL: Log audit trail (optional)
```

---

## 🔄 Data Flow: Making a Prediction

### Step 1: User Fills Form (Frontend)

```
User Input (location, system size, etc.)
              ↓
            (Form)
              ↓
         Frontend collects data
```

### Step 2: Send to Backend (API Call)

```
Frontend sends HTTP POST
    ↓
http://localhost:8000/api/v1/solar/forecast
    ↓
Backend receives request
```

### Step 3: Backend Processes (FastAPI)

```
Backend processes request
    ↓
  ML Model predicts
    ↓
Generate results
```

### Step 4: Backend Stores Data (Firebase)

```
Backend → Firestore
  Store prediction:
  {
    "prediction_type": "solar_forecast",
    "input_data": {...},
    "output_data": {...},
    "user_id": "user123",
    "created_at": "2026-06-02T10:30:00Z"
  }
    ↓
  Firestore stores in collection "predictions"
```

### Step 5: Frontend Receives Response

```
Backend returns JSON response
    ↓
Frontend receives results
    ↓
Display on screen
```

### Step 6: User Can View History (Real-time)

```
Frontend listens to Firestore
    ↓
Firestore sends updates in real-time
    ↓
User sees history on dashboard
```

---

## 📦 Firebase Services Used

### 1. Authentication (🔐)

```
User → Login/Signup
  ↓
Firebase Auth
  ↓
Verifies credentials
  ↓
Returns ID Token
  ↓
Frontend stores token
  ↓
Used for all future requests
```

**Key Features**:

- Email/password login
- Google OAuth
- Automatic session management
- Token refresh

---

### 2. Firestore Database (📊)

```
Backend writes:
  Predictions → Collection: "predictions"
  Projects → Collection: "projects"
  User data → Collection: "users"

Frontend reads:
  fetch predictions
  listen for real-time updates
  display on dashboard

Query example:
  db.collection("predictions")
    .where("user_id", "==", "user123")
    .orderBy("created_at", "desc")
    .limit(10)
    .get()
```

**Key Features**:

- Real-time database
- NoSQL (JSON-like documents)
- Automatic indexing
- Offline support (on frontend)

---

### 3. Cloud Storage (🖼️)

```
User uploads image →
  Frontend uploads to Storage
    ↓
  Stored at: gs://bucket/roof-images/user123/image.jpg
    ↓
  Returned URL: https://storage.googleapis.com/...
    ↓
  Backend uses URL to download and analyze
    ↓
  Results stored in Firestore
```

**Key Features**:

- File uploads (images, documents)
- Automatic resizing
- CDN distribution
- Security rules per file

---

## 🔐 Security Model

### Authentication Flow

```
┌─────────────┐
│   Backend   │
│  (Python)   │
│             │
│ Uses:       │
│ • Service   │
│   Account   │
│   Key       │
│ • Can do    │
│   anything  │
└────┬────────┘
     │
     ▼
┌──────────────────┐
│  Firebase Admin  │
│     Services     │
│                  │
│ • Read/write     │
│   any data       │
│ • Admin access   │
└──────────────────┘

┌─────────────┐
│  Frontend   │
│(TypeScript) │
│             │
│ Uses:       │
│ • Web SDK   │
│ • User     │
│   ID Token │
│ • Limited  │
│   access   │
└────┬────────┘
     │
     ▼
┌──────────────────┐
│  Firebase SDK    │
│  (Browser)       │
│                  │
│ • Only access    │
│   allowed by     │
│   security       │
│   rules          │
└──────────────────┘
```

---

## 🗂️ Firestore Collection Structure

```
firestore/
│
├── predictions/                    [All predictions]
│   ├── pred_001/
│   │   ├── prediction_type: "solar_forecast"
│   │   ├── input_data: {...}
│   │   ├── output_data: {...}
│   │   ├── user_id: "user123"
│   │   ├── confidence: 0.92
│   │   └── created_at: "2026-06-02T10:30:00Z"
│   │
│   └── pred_002/
│       └── ...
│
├── projects/                       [User projects]
│   ├── proj_001/
│   │   ├── user_id: "user123"
│   │   ├── project_name: "Home Solar"
│   │   ├── address: "123 Main St"
│   │   ├── latitude: 37.77
│   │   ├── longitude: -122.41
│   │   ├── predictions: ["pred_001", "pred_002"]
│   │   └── created_at: "2026-06-02T09:00:00Z"
│   │
│   └── proj_002/
│       └── ...
│
└── users/                          [User profiles]
    ├── user123/
    │   ├── email: "user@example.com"
    │   ├── name: "John Doe"
    │   ├── profile_pic_url: "https://..."
    │   └── created_at: "2026-06-02T08:00:00Z"
    │
    └── user456/
        └── ...
```

---

## 🔄 Complete Request-Response Cycle

### Scenario: User gets solar forecast

```
1. FRONTEND (User)
   ┌────────────────────────────────┐
   │ User enters:                   │
   │ • Latitude: 37.77              │
   │ • Longitude: -122.41           │
   │ • System size: 5 kW            │
   │ Clicks "Calculate"             │
   └───────────┬────────────────────┘
               │
2. FRONTEND → BACKEND
   ┌────────────────────────────────┐
   │ HTTP POST                      │
   │ /api/v1/solar/forecast         │
   │ Body: {                        │
   │   "latitude": 37.77,           │
   │   "longitude": -122.41,        │
   │   "capacity_kw": 5.0,          │
   │   ...                          │
   │ }                              │
   └───────────┬────────────────────┘
               │
3. BACKEND (Process)
   ┌────────────────────────────────┐
   │ • Parse request                │
   │ • Validate inputs              │
   │ • Load ML model                │
   │ • Generate features            │
   │ • Make prediction              │
   │ • Get results (18.5 kWh/day)   │
   └───────────┬────────────────────┘
               │
4. BACKEND → FIRESTORE (Store)
   ┌────────────────────────────────┐
   │ db.collection("predictions")   │
   │   .add({                       │
   │     "prediction_type": "solar",│
   │     "input_data": {...},       │
   │     "output_data": {           │
   │       "daily_kwh": 18.5        │
   │     },                         │
   │     "user_id": "user123",      │
   │     "created_at": "2026-06-02" │
   │   })                           │
   └───────────┬────────────────────┘
               │
5. FIRESTORE (Stores)
   ┌────────────────────────────────┐
   │ Document created:              │
   │ Collection: predictions        │
   │ Doc ID: pred_12345             │
   │ Data: {...}                    │
   └───────────┬────────────────────┘
               │
6. BACKEND → FRONTEND (Response)
   ┌────────────────────────────────┐
   │ HTTP 200 OK                    │
   │ {                              │
   │   "daily_kwh": 18.5,           │
   │   "monthly_kwh": 555.0,        │
   │   "annual_kwh": 6660.0         │
   │ }                              │
   └───────────┬────────────────────┘
               │
7. FRONTEND (Display)
   ┌────────────────────────────────┐
   │ Show results to user:          │
   │ • Daily: 18.5 kWh              │
   │ • Monthly: 555.0 kWh           │
   │ • Annual: 6660.0 kWh           │
   │ • Save to Firestore            │
   └────────────────────────────────┘
```

---

## 🔗 Environment Variables

### Backend (.env)

```
FIREBASE_PROJECT_ID=solar-ai-optimization-abc123
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
... (9 fields total)
```

### Frontend (.env.local)

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-optimization-abc123
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-optimization-abc123.firebaseapp.com
... (6 fields total)
```

---

## 📊 API Endpoints

### Backend API (FastAPI)

```
POST /api/v1/solar/forecast
  ↓ Calls: solar_forecast_service.predict()
  ↓ Logs to: firestore.collection("predictions")
  ↓ Returns: { daily_kwh, monthly_kwh, annual_kwh }

POST /api/v1/roof/analyze
  ↓ Accepts: Image upload (JPG/PNG)
  ↓ Calls: roof_detection_service.analyze()
  ↓ Stores: Image in Firebase Cloud Storage
  ↓ Logs to: firestore.collection("predictions")
  ↓ Returns: { solar_area_m2, orientation, shading }

POST /api/v1/savings/predict
  ↓ Calls: savings_service.predict()
  ↓ Logs to: firestore.collection("predictions")
  ↓ Returns: { annual_savings, payback_period, roi }

GET /api/v1/health
  ↓ Checks: Firebase connectivity
  ↓ Returns: { status, firestore, storage, auth }
```

---

## 🔄 Real-time Updates (Frontend)

```typescript
// Listen to user's predictions in real-time
const [predictions, setPredictions] = useState([]);

useEffect(() => {
  // Set up listener
  const unsubscribe = db
    .collection("predictions")
    .where("user_id", "==", "user123")
    .onSnapshot((snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPredictions(data); // Updates instantly!
    });

  return () => unsubscribe(); // Cleanup
}, []);

// Whenever backend writes to Firestore,
// this listener fires and updates the UI instantly!
```

---

## 💾 Data Storage

```
REALTIME (Firestore) ← Live data for users
        ↑
        │
   Backend ← ML predictions
        │
        ↓
    DURABLE (PostgreSQL - optional) ← Audit trail
```

---

## 🎯 Why This Architecture?

| Component              | Why                                |
| ---------------------- | ---------------------------------- |
| **Firebase**           | Scalable, serverless, real-time    |
| **Backend (FastAPI)**  | Process ML models, complex logic   |
| **Frontend (Next.js)** | Beautiful UI, React components     |
| **Firestore**          | Real-time database, automatic sync |
| **Cloud Storage**      | Store images, large files          |
| **PostgreSQL**         | Optional audit trail, backup       |

---

## 📈 Scaling Example

```
TODAY (Single user):
User → Frontend → Backend → Firebase

TOMORROW (100 users):
User1 ┐
User2 ├→ Frontend (CDN) → Backend (scaled) → Firebase (scales auto)
...   ┤
User100┘

NEXT YEAR (1M users):
Backend runs in containers (Kubernetes)
Firebase handles millions of reads/writes
Frontend served from global CDN
Database sharded by geography
```

---

## 🔐 Security Layers

```
Layer 1: AUTHENTICATION
  ↓
  Only authenticated users can access Firebase

Layer 2: SECURITY RULES (Firestore)
  ↓
  Users can only see their own data

Layer 3: RATE LIMITING (Backend)
  ↓
  Max 30 predictions per minute per user

Layer 4: INPUT VALIDATION (Backend)
  ↓
  All inputs sanitized before processing

Layer 5: HTTPS/TLS (Transit)
  ↓
  All data encrypted in transit
```

---

## 🚀 Deployment Flow

```
DEVELOPMENT:
Local machine → Local backend → Local Firebase (emulator)
         ↓
   Frontend (localhost:3000)
   Backend (localhost:8000)
   Firestore (localhost:8080)

STAGING:
GitHub → GitHub Actions → Cloud Build → Cloud Run
                                    ↓
                            Firebase Project
                            (staging env)

PRODUCTION:
GitHub → GitHub Actions → Cloud Build → Cloud Run
                                    ↓
                            Firebase Project
                            (production env)
                                    ↓
                         https://yourdomain.com
```

---

**This architecture is:**

- ✅ Scalable to millions of users
- ✅ Real-time and responsive
- ✅ Secure and authenticated
- ✅ Easy to maintain
- ✅ Cost-effective
- ✅ Cloud-native

Ready to build! 🚀
