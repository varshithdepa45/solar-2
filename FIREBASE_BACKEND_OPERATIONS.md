# Firebase Backend Operations Guide

Quick reference for using Firebase in your Solar AI backend.

---

## 📚 Available Firebase Functions

All these functions are in `backend/app/core/firebase.py`

### 1. Log Predictions to Firestore

**Purpose**: Store prediction results for audit trail and analytics

```python
from app.core.firebase import log_prediction_to_firestore

# In your API endpoint
await log_prediction_to_firestore(
    prediction_type="solar_forecast",  # or "roof_detection", "savings_prediction"
    input_data={
        "latitude": 37.77,
        "longitude": -122.41,
        "capacity_kw": 5.0,
    },
    output_data={
        "daily_kwh": 18.5,
        "monthly_kwh": 555.0,
        "annual_kwh": 6660.0,
    },
    user_id="user123",  # optional, defaults to "anonymous"
    confidence=0.92,     # optional, prediction confidence (0-1)
)
```

**Returns**: Document ID in Firestore

**Stored in**: `db.collection("predictions")`

---

### 2. Upload Files to Cloud Storage

**Purpose**: Store images (roof photos) and other files

```python
from app.core.firebase import upload_file_to_storage

url = await upload_file_to_storage(
    file_path="/tmp/roof.jpg",
    destination_path="roof-images/user123/house_roof.jpg",
    user_id="user123",
)

# Returns: https://storage.googleapis.com/.../roof.jpg
print(f"File available at: {url}")
```

---

### 3. Get User Predictions

**Purpose**: Retrieve a user's prediction history

```python
from app.core.firebase import get_user_predictions

predictions = await get_user_predictions(
    user_id="user123",
    limit=10,  # Last 10 predictions
)

# Returns: List of predictions with document IDs
for pred in predictions:
    print(f"{pred['id']}: {pred['prediction_type']}")
```

---

### 4. Save Projects to Firestore

**Purpose**: Store user solar analysis projects

```python
from app.core.firebase import save_project

project_id = await save_project(
    user_id="user123",
    project_name="Home Solar Analysis",
    address="123 Main St, San Francisco, CA",
    latitude=37.77,
    longitude=-122.41,
)

# Returns: Project ID
print(f"Project saved: {project_id}")
```

---

### 5. Verify Firebase ID Tokens

**Purpose**: Authenticate requests from frontend using Firebase tokens

```python
from app.core.firebase import verify_token

# Get token from request header
token = request.headers.get("Authorization")

try:
    claims = verify_token(token)
    user_id = claims['uid']
    email = claims['email']
    print(f"Authenticated as: {email}")
except Exception as e:
    print(f"Auth failed: {e}")
    # Return 401 Unauthorized
```

---

### 6. Create Custom Tokens

**Purpose**: Create backend tokens for backend-to-client communication

```python
from app.core.firebase import create_custom_token

token = create_custom_token(
    uid="user123",
    additional_claims={"role": "admin", "plan": "premium"},
)

# Returns: Token string
# Client can use this to authenticate
```

---

### 7. Manage Users

**Purpose**: Get, create, or delete Firebase users

```python
from app.core.firebase import get_user, delete_user

# Get user info
user = get_user("user123")
print(f"User: {user['email']}, Verified: {user['email_verified']}")

# Delete user
delete_user("user123")
```

---

### 8. Check Firebase Health

**Purpose**: Verify Firebase services are online

```python
from app.core.firebase import check_firebase_health

health = await check_firebase_health()
# Returns: {"firestore": True, "storage": True, "auth": True}

if health["firestore"]:
    print("✓ Firestore is working")
else:
    print("✗ Firestore is down!")
```

---

## 🔧 Examples: Adding Firebase to Your Endpoints

### Example 1: Update Solar Forecast Endpoint

**File**: `backend/app/api/v1/solar_forecast.py`

```python
from app.core.firebase import log_prediction_to_firestore

@router.post("/forecast")
async def forecast_solar_generation(request: SolarForecastRequest):
    """Predict solar energy generation."""

    # Get prediction from model
    result = await solar_forecast_service.predict(request)

    # Log to Firestore
    await log_prediction_to_firestore(
        prediction_type="solar_forecast",
        input_data=request.model_dump(),
        output_data=result.model_dump(),
        user_id="anonymous",  # TODO: Get from auth token
        confidence=result.confidence_95_percentile,
    )

    return result
```

### Example 2: Update Roof Detection Endpoint

**File**: `backend/app/api/v1/roof_detection.py`

```python
from app.core.firebase import log_prediction_to_firestore, upload_file_to_storage

@router.post("/analyze")
async def analyze_roof(file: UploadFile = File(...)):
    """Analyze roof for solar suitability."""

    # Save uploaded image temporarily
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Analyze roof
    result = await roof_detection_service.analyze(temp_path)

    # Upload image to Cloud Storage
    storage_url = await upload_file_to_storage(
        file_path=temp_path,
        destination_path=f"roof-images/{result.image_id}.jpg",
    )

    # Log analysis to Firestore
    await log_prediction_to_firestore(
        prediction_type="roof_detection",
        input_data={"image_name": file.filename, "size_mb": file.size / 1_000_000},
        output_data={
            "solar_area_m2": result.solar_area_m2,
            "orientation": result.orientation,
            "shading_level": result.shading_level,
            "storage_url": storage_url,
        },
        user_id="anonymous",
    )

    return result
```

### Example 3: Protected Endpoint with Auth

**File**: `backend/app/api/v1/user_predictions.py`

```python
from fastapi import Depends, Header
from app.core.firebase import verify_token, get_user_predictions

@router.get("/my-predictions")
async def get_my_predictions(
    authorization: str = Header(None),
):
    """Get current user's prediction history."""

    # Verify auth token
    try:
        claims = verify_token(authorization)
        user_id = claims['uid']
    except Exception as e:
        return {"error": "Unauthorized", "detail": str(e)}, 401

    # Get predictions
    predictions = await get_user_predictions(user_id, limit=20)

    return {
        "user_id": user_id,
        "predictions": predictions,
        "total": len(predictions),
    }
```

---

## 📊 Firestore Collections Structure

Your Firebase will organize data like this:

```
firestore/
├── predictions/
│   ├── doc1 → {
│   │     "prediction_type": "solar_forecast",
│   │     "input_data": {...},
│   │     "output_data": {...},
│   │     "user_id": "user123",
│   │     "confidence": 0.92,
│   │     "created_at": "2026-06-02T10:30:00Z",
│   │   }
│   └── doc2 → {...}
│
├── projects/
│   ├── project1 → {
│   │     "user_id": "user123",
│   │     "project_name": "Home Solar",
│   │     "address": "123 Main St",
│   │     "latitude": 37.77,
│   │     "longitude": -122.41,
│   │     "predictions": ["doc1", "doc2"],
│   │   }
│   └── project2 → {...}
│
└── users/
    ├── user123 → {
          "email": "user@example.com",
          "name": "John Doe",
          "created_at": "2026-06-02T09:00:00Z",
        }
    └── user456 → {...}
```

---

## 🔐 Security Rules (Firestore)

Default test mode rules allow all reads/writes. For production, use:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /predictions/{document=**} {
      allow read, write: if request.auth != null;
    }

    match /projects/{projectId} {
      allow read, write: if request.auth.uid == resource.data.user_id;
    }

    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 🔐 Security Rules (Cloud Storage)

For production, secure file uploads:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can upload
    match /roof-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }

    // Allow public read of all images
    match /roof-images/{allPaths=**} {
      allow read: if request.auth != null;
    }
  }
}
```

---

## 📈 Analytics: Query Firestore

Common queries you might use:

```python
from app.core.firebase import db

# Get all predictions by a user
user_preds = db.collection("predictions").where(
    "user_id", "==", "user123"
).stream()

# Get recent predictions (last 24 hours)
from datetime import datetime, timedelta
yesterday = (datetime.now() - timedelta(days=1)).isoformat()

recent = db.collection("predictions").where(
    "created_at", ">", yesterday
).stream()

# Get average confidence
all_preds = db.collection("predictions").stream()
confidences = [doc.get("confidence") for doc in all_preds]
avg_confidence = sum(confidences) / len(confidences)
```

---

## ⚠️ Error Handling

Always handle Firebase errors gracefully:

```python
from app.core.firebase import log_prediction_to_firestore

try:
    doc_id = await log_prediction_to_firestore(
        prediction_type="solar_forecast",
        input_data={...},
        output_data={...},
    )
    logger.info(f"Prediction logged: {doc_id}")

except Exception as e:
    logger.error(f"Failed to log prediction: {e}")
    # Continue anyway - prediction was successful even if logging failed
    # Don't fail the API request because Firestore is down
```

---

## 🚀 Deploy to Production

When deploying to production:

1. **Update .env**: Use production Firebase project credentials
2. **Firestore Rules**: Switch from test mode to production rules
3. **Storage Rules**: Switch from test mode to production rules
4. **API Key Restrictions**: In Firebase Console, restrict API keys to your domains
5. **Monitoring**: Set up alerts for errors and quota warnings

---

## 📚 Full API Reference

See `backend/app/core/firebase.py` for complete function signatures and docstrings.

```python
# Import the module
from app.core.firebase import (
    log_prediction_to_firestore,
    upload_file_to_storage,
    verify_token,
    create_custom_token,
    get_user,
    delete_user,
    get_user_predictions,
    save_project,
    check_firebase_health,
)
```

---

## ✅ Checklist: Adding Firebase to an Endpoint

To add Firebase logging to any endpoint:

- [ ] Import the Firebase function you need
- [ ] Call the function in your endpoint (before returning)
- [ ] Handle exceptions gracefully
- [ ] Test locally that data appears in Firestore Console
- [ ] Update security rules if needed
- [ ] Deploy to production

---

**For more information, see:**

- [FIREBASE_SETUP_NEW_ACCOUNT.md](FIREBASE_SETUP_NEW_ACCOUNT.md) - Detailed setup guide
- [FIREBASE_IMPLEMENTATION_CHECKLIST.md](FIREBASE_IMPLEMENTATION_CHECKLIST.md) - Step-by-step checklist
- [backend/app/core/firebase.py](backend/app/core/firebase.py) - Full source code
