"""
Firebase Admin SDK initialization for backend.
Enables server-side operations: Firestore database, Cloud Storage, and auth management.

Module exposes:
- db: Firestore client for database operations
- auth_client: Firebase Auth client for user management
- bucket: Cloud Storage bucket for file uploads
- Functions: log_prediction_to_firestore, upload_file_to_storage, verify_token
"""

import json
import os
from typing import Any, Dict, Optional

import firebase_admin
from firebase_admin import credentials, firestore, storage, auth as firebase_auth
from app.core.logging import logger


def _get_firebase_credentials() -> Dict[str, Any]:
    """
    Build Firebase service account credentials dictionary from environment variables.
    
    Required environment variables:
    - FIREBASE_PROJECT_ID
    - FIREBASE_PRIVATE_KEY_ID
    - FIREBASE_PRIVATE_KEY (must have literal \n, not escaped)
    - FIREBASE_CLIENT_EMAIL
    - FIREBASE_CLIENT_ID
    - FIREBASE_AUTH_URI
    - FIREBASE_TOKEN_URI
    - FIREBASE_AUTH_PROVIDER_X509_CERT_URL
    - FIREBASE_CLIENT_X509_CERT_URL
    
    Returns:
        Dictionary with service account credentials
        
    Raises:
        ValueError: If required environment variables are missing
    """
    required_vars = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_PRIVATE_KEY_ID",
        "FIREBASE_PRIVATE_KEY",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_CLIENT_ID",
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise ValueError(f"Missing required Firebase env vars: {', '.join(missing)}")
    
    # Get private key and handle escaped newlines
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    # Replace escaped newlines \\n with actual newlines
    private_key = private_key.replace("\\n", "\n")
    
    return {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": private_key,
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": os.getenv(
            "FIREBASE_AUTH_URI",
            "https://accounts.google.com/o/oauth2/auth"
        ),
        "token_uri": os.getenv(
            "FIREBASE_TOKEN_URI",
            "https://oauth2.googleapis.com/token"
        ),
        "auth_provider_x509_cert_url": os.getenv(
            "FIREBASE_AUTH_PROVIDER_X509_CERT_URL",
            "https://www.googleapis.com/oauth2/v1/certs"
        ),
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
    }


# Initialize Firebase Admin SDK (singleton pattern)
def _initialize_firebase():
    """Initialize Firebase Admin SDK if not already initialized."""
    try:
        if not firebase_admin._apps:
            creds_dict = _get_firebase_credentials()
            creds = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(creds)
            logger.info("Firebase Admin SDK initialized successfully")
        else:
            logger.info("Firebase Admin SDK already initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {str(e)}")
        raise


# Initialize on module import
_initialize_firebase()

# Get Firebase service instances
db = firestore.client()  # Firestore database
auth_client = firebase_auth  # Firebase Auth
bucket = storage.bucket()  # Cloud Storage


# ────────────────────────────────────────────────────────────────────────────
# PREDICTION LOGGING
# ────────────────────────────────────────────────────────────────────────────

async def log_prediction_to_firestore(
    prediction_type: str,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any],
    user_id: str = "anonymous",
    confidence: float = 0.0,
    model_version: str = "1.0.0",
) -> str:
    """
    Store prediction result to Firestore for audit trail and analytics.
    
    Args:
        prediction_type: Type of prediction
            - 'solar_forecast': Solar energy generation forecast
            - 'roof_detection': Roof analysis and solar suitability
            - 'savings_prediction': Financial projection
        input_data: Input parameters sent to the model
        output_data: Model output/predictions
        user_id: User identifier (default: 'anonymous' for unauthenticated requests)
        confidence: Model confidence score (0-1)
        model_version: Version of the model used
        
    Returns:
        Firestore document ID
        
    Example:
        >>> await log_prediction_to_firestore(
        ...     prediction_type='solar_forecast',
        ...     input_data={'lat': 37.77, 'lon': -122.41, 'capacity_kw': 5.0},
        ...     output_data={'daily_kwh': 18.5, 'monthly_kwh': 555.0},
        ...     user_id='user_123',
        ...     confidence=0.92
        ... )
        'prediction_doc_123'
    """
    from datetime import datetime
    
    try:
        doc_data = {
            "prediction_type": prediction_type,
            "input_data": input_data,
            "output_data": output_data,
            "confidence": confidence,
            "user_id": user_id,
            "model_version": model_version,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "timestamp": firestore.SERVER_TIMESTAMP,  # Auto-set server timestamp
        }
        
        # Add to Firestore 'predictions' collection
        doc_ref = db.collection("predictions").add(doc_data)
        doc_id = doc_ref[1].id
        
        logger.info(
            f"Prediction logged",
            extra={
                "prediction_type": prediction_type,
                "user_id": user_id,
                "doc_id": doc_id,
                "confidence": confidence,
            }
        )
        
        return doc_id
        
    except Exception as e:
        logger.error(
            f"Failed to log prediction: {str(e)}",
            extra={"prediction_type": prediction_type, "user_id": user_id}
        )
        raise


# ────────────────────────────────────────────────────────────────────────────
# CLOUD STORAGE
# ────────────────────────────────────────────────────────────────────────────

async def upload_file_to_storage(
    file_path: str,
    destination_path: str,
    user_id: str = "anonymous",
) -> str:
    """
    Upload a file to Firebase Cloud Storage.
    
    Args:
        file_path: Local file path to upload
        destination_path: Path in Cloud Storage (e.g., 'roof-images/user123/image.jpg')
        user_id: User identifier for tracking
        
    Returns:
        Public URL of the uploaded file
        
    Example:
        >>> url = await upload_file_to_storage(
        ...     file_path='/tmp/roof.jpg',
        ...     destination_path='roof-images/user123/roof.jpg'
        ... )
        'https://storage.googleapis.com/...'
    """
    try:
        blob = bucket.blob(destination_path)
        blob.upload_from_filename(file_path)
        
        # Make the blob publicly readable (optional)
        # blob.make_public()
        
        public_url = blob.public_url
        
        logger.info(
            f"File uploaded to Cloud Storage",
            extra={
                "user_id": user_id,
                "destination": destination_path,
                "url": public_url,
            }
        )
        
        return public_url
        
    except Exception as e:
        logger.error(
            f"Failed to upload file: {str(e)}",
            extra={"destination": destination_path, "user_id": user_id}
        )
        raise


# ────────────────────────────────────────────────────────────────────────────
# AUTHENTICATION
# ────────────────────────────────────────────────────────────────────────────

def verify_token(id_token: str) -> Dict[str, Any]:
    """
    Verify a Firebase ID token and return user claims.
    
    Args:
        id_token: Firebase ID token from client
        
    Returns:
        Dictionary with user claims (uid, email, etc.)
        
    Raises:
        firebase_admin.auth.InvalidIdTokenError: If token is invalid
        
    Example:
        >>> claims = verify_token(id_token)
        >>> user_id = claims['uid']
        >>> email = claims['email']
    """
    try:
        decoded_token = auth_client.verify_id_token(id_token)
        logger.info(
            f"Token verified",
            extra={"uid": decoded_token.get('uid')}
        )
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise


def create_custom_token(uid: str, additional_claims: Optional[Dict] = None) -> str:
    """
    Create a Firebase custom token for backend-to-client authentication.
    
    Args:
        uid: User ID
        additional_claims: Optional custom claims to include in token
        
    Returns:
        Custom token string
        
    Example:
        >>> token = create_custom_token('user123', {'role': 'admin'})
    """
    try:
        custom_token = auth_client.create_custom_token(uid, additional_claims)
        logger.info(f"Custom token created", extra={"uid": uid})
        return custom_token.decode()  # Convert bytes to string
    except Exception as e:
        logger.error(f"Failed to create custom token: {str(e)}")
        raise


# ────────────────────────────────────────────────────────────────────────────
# USER MANAGEMENT
# ────────────────────────────────────────────────────────────────────────────

def get_user(uid: str) -> Dict[str, Any]:
    """
    Get user record by UID.
    
    Args:
        uid: Firebase user ID
        
    Returns:
        User record dictionary
    """
    try:
        user = auth_client.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "disabled": user.disabled,
            "email_verified": user.email_verified,
        }
    except Exception as e:
        logger.error(f"Failed to get user: {str(e)}")
        raise


def delete_user(uid: str) -> None:
    """
    Delete a user by UID.
    
    Args:
        uid: Firebase user ID
    """
    try:
        auth_client.delete_user(uid)
        logger.info(f"User deleted", extra={"uid": uid})
    except Exception as e:
        logger.error(f"Failed to delete user: {str(e)}")
        raise


# ────────────────────────────────────────────────────────────────────────────
# FIRESTORE OPERATIONS
# ────────────────────────────────────────────────────────────────────────────

async def get_user_predictions(user_id: str, limit: int = 10) -> list:
    """
    Get recent predictions for a user from Firestore.
    
    Args:
        user_id: User identifier
        limit: Maximum number of predictions to return
        
    Returns:
        List of prediction documents
    """
    try:
        docs = db.collection("predictions").where(
            "user_id", "==", user_id
        ).order_by(
            "created_at", direction=firestore.Query.DESCENDING
        ).limit(limit).stream()
        
        predictions = []
        for doc in docs:
            predictions.append({"id": doc.id, **doc.to_dict()})
        
        return predictions
        
    except Exception as e:
        logger.error(
            f"Failed to get user predictions: {str(e)}",
            extra={"user_id": user_id}
        )
        raise


async def save_project(
    user_id: str,
    project_name: str,
    address: str,
    latitude: float,
    longitude: float,
) -> str:
    """
    Save a solar analysis project to Firestore.
    
    Args:
        user_id: User identifier
        project_name: Project name
        address: Address of the property
        latitude: Property latitude
        longitude: Property longitude
        
    Returns:
        Project ID
    """
    from datetime import datetime
    
    try:
        project_data = {
            "user_id": user_id,
            "project_name": project_name,
            "address": address,
            "latitude": latitude,
            "longitude": longitude,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "timestamp": firestore.SERVER_TIMESTAMP,
            "predictions": [],  # Will be populated with prediction IDs
        }
        
        doc_ref = db.collection("projects").add(project_data)
        project_id = doc_ref[1].id
        
        logger.info(
            f"Project saved",
            extra={
                "user_id": user_id,
                "project_id": project_id,
                "project_name": project_name,
            }
        )
        
        return project_id
        
    except Exception as e:
        logger.error(
            f"Failed to save project: {str(e)}",
            extra={"user_id": user_id}
        )
        raise


# ────────────────────────────────────────────────────────────────────────────
# HEALTH CHECK
# ────────────────────────────────────────────────────────────────────────────

async def check_firebase_health() -> Dict[str, bool]:
    """
    Check if Firebase services are accessible.
    
    Returns:
        Dictionary with status of each service
        
    Example:
        >>> health = await check_firebase_health()
        >>> health['firestore']  # True if accessible, False otherwise
    """
    health_status = {
        "firestore": False,
        "storage": False,
        "auth": False,
    }
    
    try:
        # Test Firestore
        db.collection("_health_check").limit(1).stream()
        health_status["firestore"] = True
    except Exception as e:
        logger.warning(f"Firestore health check failed: {str(e)}")
    
    try:
        # Test Storage
        bucket.list_blobs(max_results=1)
        health_status["storage"] = True
    except Exception as e:
        logger.warning(f"Storage health check failed: {str(e)}")
    
    try:
        # Test Auth
        auth_client.list_users(page_size=1)
        health_status["auth"] = True
    except Exception as e:
        logger.warning(f"Auth health check failed: {str(e)}")
    
    return health_status
