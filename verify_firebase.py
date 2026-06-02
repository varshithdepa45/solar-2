#!/usr/bin/env python3
"""
Firebase Connection Verification Script
──────────────────────────────────────────────────────────────────────────

Verify that your Firebase configuration is correct and all services are accessible.

Usage:
    python verify_firebase.py

This script will test:
    ✓ Firebase credentials are valid
    ✓ Firestore database is accessible
    ✓ Cloud Storage is accessible
    ✓ Authentication is working
    ✓ Can write to Firestore
    ✓ Can read from Firestore
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from dotenv import load_dotenv
import asyncio

# Load environment variables
env_file = Path(__file__).parent / "backend" / ".env"
if env_file.exists():
    load_dotenv(env_file)
else:
    print(f"❌ ERROR: {env_file} not found!")
    print("   Please create backend/.env with your Firebase credentials")
    print("   See backend/.env.example for template")
    sys.exit(1)


def test_imports():
    """Test that all required packages are installed."""
    print("\n📦 Testing imports...")
    try:
        import firebase_admin
        print("  ✓ firebase_admin")
        import pydantic_settings
        print("  ✓ pydantic_settings")
        import fastapi
        print("  ✓ fastapi")
        return True
    except ImportError as e:
        print(f"  ❌ Missing package: {e}")
        print("     Run: pip install -r backend/requirements.txt")
        return False


def test_env_variables():
    """Test that all required environment variables are set."""
    print("\n🔐 Testing environment variables...")
    
    required_vars = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_PRIVATE_KEY_ID",
        "FIREBASE_PRIVATE_KEY",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_CLIENT_ID",
    ]
    
    missing = []
    for var in required_vars:
        value = os.getenv(var)
        if not value:
            missing.append(var)
            print(f"  ❌ {var}: NOT SET")
        else:
            # Show truncated value for security
            if len(value) > 50:
                display_value = value[:30] + "..." + value[-10:]
            else:
                display_value = value
            print(f"  ✓ {var}: {display_value}")
    
    if missing:
        print(f"\n⚠️  Missing {len(missing)} environment variable(s)")
        print("   Please fill in backend/.env with your Firebase credentials")
        return False
    
    return True


def test_firebase_credentials():
    """Test that Firebase credentials are valid."""
    print("\n🔑 Testing Firebase credentials...")
    
    try:
        from app.core.config import get_settings
        settings = get_settings()
        print("  ✓ Settings loaded successfully")
        print(f"  ✓ Project ID: {settings.FIREBASE_PROJECT_ID}")
        print(f"  ✓ Client Email: {settings.FIREBASE_CLIENT_EMAIL}")
        return True
    except Exception as e:
        print(f"  ❌ Failed to load settings: {e}")
        return False


async def test_firebase_connection():
    """Test that we can connect to Firebase services."""
    print("\n🔗 Testing Firebase connection...")
    
    try:
        from app.core.firebase import check_firebase_health
        health = await check_firebase_health()
        
        for service, is_healthy in health.items():
            status = "✓" if is_healthy else "❌"
            print(f"  {status} {service.capitalize()}")
        
        if all(health.values()):
            print("\n✅ All Firebase services are accessible!")
            return True
        else:
            print("\n⚠️  Some Firebase services are not accessible")
            print("   Check your Firebase Console and security rules")
            return False
            
    except Exception as e:
        print(f"  ❌ Connection test failed: {e}")
        print("   Make sure Firebase Admin SDK is initialized correctly")
        return False


async def test_firestore_write_read():
    """Test that we can write and read from Firestore."""
    print("\n📝 Testing Firestore write/read...")
    
    try:
        from app.core.firebase import db, log_prediction_to_firestore
        
        # Write test data
        test_doc_id = await log_prediction_to_firestore(
            prediction_type="verification_test",
            input_data={"test": True, "timestamp": str(__import__('datetime').datetime.now())},
            output_data={"status": "test_successful"},
            user_id="verification_bot",
            confidence=1.0,
        )
        print(f"  ✓ Write successful. Document ID: {test_doc_id}")
        
        # Read test data
        doc = db.collection("predictions").document(test_doc_id).get()
        if doc.exists:
            print(f"  ✓ Read successful. Document data: {doc.to_dict()}")
            return True
        else:
            print(f"  ❌ Could not read written document")
            return False
            
    except Exception as e:
        print(f"  ❌ Firestore operation failed: {e}")
        print("   Check Firestore security rules (should be in Test mode for development)")
        return False


def main():
    """Run all verification tests."""
    print("╔════════════════════════════════════════════════════════════════╗")
    print("║      Firebase Connection Verification Script                   ║")
    print("╚════════════════════════════════════════════════════════════════╝")
    
    # Test 1: Imports
    if not test_imports():
        sys.exit(1)
    
    # Test 2: Environment variables
    if not test_env_variables():
        sys.exit(1)
    
    # Test 3: Firebase credentials
    if not test_firebase_credentials():
        sys.exit(1)
    
    # Test 4: Firebase connection
    try:
        from app.core.firebase import check_firebase_health
        success = asyncio.run(test_firebase_connection())
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"  ❌ Could not test Firebase connection: {e}")
        sys.exit(1)
    
    # Test 5: Firestore operations
    try:
        success = asyncio.run(test_firestore_write_read())
        if not success:
            sys.exit(1)
    except Exception as e:
        print(f"  ❌ Firestore test failed: {e}")
        sys.exit(1)
    
    # All tests passed
    print("\n" + "="*64)
    print("✅ ALL TESTS PASSED!")
    print("="*64)
    print("\n🎉 Your Firebase configuration is correct and working!")
    print("\nYou can now:")
    print("  1. Run the backend: python backend/run.py")
    print("  2. Run the frontend: cd frontend && npm run dev")
    print("  3. Visit http://localhost:3000")
    print("\nFor more details, see: FIREBASE_SETUP_NEW_ACCOUNT.md")
    sys.exit(0)


if __name__ == "__main__":
    main()
