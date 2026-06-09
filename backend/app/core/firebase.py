# ════════════════════════════════════════════════════════════════════════════
# Firebase Backend Configuration (Admin SDK)
# ════════════════════════════════════════════════════════════════════════════

import os
import json
from typing import Optional
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from google.cloud.firestore import Client
from google.cloud.storage import Client as StorageClient
from fastapi import HTTPException

# Initialize Firebase Admin SDK
_db: Optional[Client] = None
_storage_client: Optional[StorageClient] = None
_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK from environment variables."""
    global _firebase_app, _db, _storage_client

    try:
        # Build service account credentials from environment variables
        service_account_info = {
            "type": "service_account",
            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
            "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
            "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
            "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
            "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
            "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
        }

        # Validate required fields
        required_fields = [
            "project_id",
            "private_key_id",
            "private_key",
            "client_email",
            "client_id",
        ]
        for field in required_fields:
            if not service_account_info.get(field):
                raise ValueError(f"Missing Firebase credential: {field}")

        # Initialize Firebase app
        cred = credentials.Certificate(service_account_info)
        _firebase_app = firebase_admin.initialize_app(cred)

        # Get Firestore database client
        _db = firestore.client()

        # Get Storage client
        _storage_client = storage.bucket(service_account_info.get("project_id"))

        print("✓ Firebase Admin SDK initialized successfully")
        return True

    except Exception as e:
        print(f"✗ Failed to initialize Firebase: {str(e)}")
        raise


def get_firestore_client() -> Client:
    """Get Firestore database client."""
    if _db is None:
        initialize_firebase()
    return _db


def get_storage_client() -> StorageClient:
    """Get Firebase Storage client."""
    if _storage_client is None:
        initialize_firebase()
    return _storage_client


# ────────────────────────────────────────────────────────────────────────────
# Firestore Operations
# ────────────────────────────────────────────────────────────────────────────


async def set_document(collection: str, document_id: str, data: dict) -> bool:
    """Set/create a document in Firestore."""
    try:
        db = get_firestore_client()
        db.collection(collection).document(document_id).set(data, merge=False)
        return True
    except Exception as e:
        print(f"Error setting document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save document")


async def update_document(collection: str, document_id: str, data: dict) -> bool:
    """Update an existing document in Firestore."""
    try:
        db = get_firestore_client()
        db.collection(collection).document(document_id).update(data)
        return True
    except Exception as e:
        print(f"Error updating document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update document")


async def get_document(collection: str, document_id: str) -> Optional[dict]:
    """Retrieve a single document from Firestore."""
    try:
        db = get_firestore_client()
        doc = db.collection(collection).document(document_id).get()
        if doc.exists:
            return {**doc.to_dict(), "id": doc.id}
        return None
    except Exception as e:
        print(f"Error getting document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve document")


async def delete_document(collection: str, document_id: str) -> bool:
    """Delete a document from Firestore."""
    try:
        db = get_firestore_client()
        db.collection(collection).document(document_id).delete()
        return True
    except Exception as e:
        print(f"Error deleting document: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete document")


async def query_documents(
    collection: str, field: str, operator: str, value: any
) -> list:
    """Query documents from Firestore with a condition."""
    try:
        db = get_firestore_client()
        query = db.collection(collection)

        if operator == "==":
            query = query.where(field, "==", value)
        elif operator == "<":
            query = query.where(field, "<", value)
        elif operator == "<=":
            query = query.where(field, "<=", value)
        elif operator == ">":
            query = query.where(field, ">", value)
        elif operator == ">=":
            query = query.where(field, ">=", value)
        elif operator == "in":
            query = query.where(field, "in", value)
        else:
            raise ValueError(f"Unsupported operator: {operator}")

        docs = query.stream()
        return [
            {**doc.to_dict(), "id": doc.id} for doc in docs
        ]
    except Exception as e:
        print(f"Error querying documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to query documents")


async def get_all_documents(collection: str) -> list:
    """Retrieve all documents from a collection."""
    try:
        db = get_firestore_client()
        docs = db.collection(collection).stream()
        return [
            {**doc.to_dict(), "id": doc.id} for doc in docs
        ]
    except Exception as e:
        print(f"Error getting all documents: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve documents")


# ────────────────────────────────────────────────────────────────────────────
# Firebase Authentication
# ────────────────────────────────────────────────────────────────────────────


async def verify_id_token(token: str) -> dict:
    """Verify Firebase ID token and return user info."""
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_user(uid: str) -> dict:
    """Get user information from Firebase Auth."""
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "email_verified": user.email_verified,
        }
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        raise HTTPException(status_code=404, detail="User not found")


async def disable_user(uid: str) -> bool:
    """Disable a user account."""
    try:
        auth.update_user(uid, disabled=True)
        return True
    except Exception as e:
        print(f"Error disabling user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to disable user")


async def enable_user(uid: str) -> bool:
    """Enable a user account."""
    try:
        auth.update_user(uid, disabled=False)
        return True
    except Exception as e:
        print(f"Error enabling user: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to enable user")


# ────────────────────────────────────────────────────────────────────────────
# Firebase Storage
# ────────────────────────────────────────────────────────────────────────────


async def upload_blob(bucket_path: str, file_content: bytes, content_type: str = "application/octet-stream") -> str:
    """Upload a file to Firebase Storage."""
    try:
        bucket = get_storage_client()
        blob = bucket.blob(bucket_path)
        blob.upload_from_string(file_content, content_type=content_type)
        blob.make_public()
        return blob.public_url
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


async def delete_blob(bucket_path: str) -> bool:
    """Delete a file from Firebase Storage."""
    try:
        bucket = get_storage_client()
        blob = bucket.blob(bucket_path)
        blob.delete()
        return True
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete file")


# Initialize Firebase on module import
try:
    initialize_firebase()
except Exception as e:
    print(f"Warning: Firebase not initialized. Some features may not work: {str(e)}")
