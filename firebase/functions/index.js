/**
 * Firebase Cloud Functions - Solar AI Platform
 *
 * Main entry point for serverless backend API
 *
 * Functions:
 * - solarForecast: Predict solar generation (POST)
 * - roofAnalysis: Analyze roof from image (POST)
 * - savingsPrediction: Calculate ROI (POST)
 * - healthCheck: System health status (GET)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Express app for HTTP functions
const app = express();

// ========== Middleware ==========

// Enable CORS for all routes
app.use(cors({ origin: true }));

// Parse JSON
app.use(express.json());

// ========== Authentication Middleware ==========

const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      next();
    })
    .catch((error) => {
      console.error("Auth error:", error);
      res.status(401).json({ error: "Invalid token" });
    });
};

// ========== Health Check Endpoint ==========

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ========== Solar Forecast Endpoint ==========

app.post("/solar-forecast", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const {
      latitude,
      longitude,
      month,
      day_of_year,
      hour,
      temperature_celsius,
      cloud_cover_pct,
      humidity_pct,
      wind_speed_ms,
      ghi,
      panel_capacity_kw,
      panel_efficiency_pct,
      panel_tilt_degrees,
      panel_azimuth_degrees,
    } = req.body;

    // Input validation
    const requiredFields = [
      "latitude",
      "longitude",
      "month",
      "day_of_year",
      "hour",
      "temperature_celsius",
      "ghi",
      "panel_capacity_kw",
    ];

    for (const field of requiredFields) {
      if (!(field in req.body)) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }

    // Call ML model (placeholder - integrate with Python backend or TensorFlow.js)
    const prediction = {
      total_predicted_kwh: 18.5,
      hourly_predictions: [
        { hour: 12, kwh: 2.3, ci_lower: 2.1, ci_upper: 2.5 },
      ],
      confidence_intervals: {
        lower: 16.2,
        upper: 20.8,
      },
      efficiency_factor: 0.85,
      advisory_notes: ["Optimal production expected"],
    };

    // Save prediction to Firestore
    const predictionRef = await admin
      .firestore()
      .collection("predictions")
      .add({
        uid,
        endpoint: "solar_forecast",
        model_version: "1.0.0",
        input_data: req.body,
        output_data: prediction,
        latency_ms: 150,
        status: "success",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        correlation_id: req.headers["x-correlation-id"] || "unknown",
      });

    // Log usage for analytics
    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .update({
        last_forecast: admin.firestore.FieldValue.serverTimestamp(),
        forecast_count: admin.firestore.FieldValue.increment(1),
      });

    res.json({
      success: true,
      data: prediction,
      predictionId: predictionRef.id,
    });
  } catch (error) {
    console.error("Solar forecast error:", error);
    res.status(500).json({
      error: "Solar forecast prediction failed",
      message: error.message,
    });
  }
});

// ========== Roof Analysis Endpoint ==========

app.post("/roof-analysis", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { image_url, project_id } = req.body;

    if (!image_url || !project_id) {
      return res.status(400).json({
        error: "Missing required fields: image_url, project_id",
      });
    }

    // Call YOLO model (placeholder)
    const analysis = {
      total_segments_detected: 3,
      detected_segments: [
        {
          segment_id: "1",
          confidence: 0.95,
          area_m2: 45.2,
          usable_area_m2: 40.1,
          orientation: "south",
          tilt_degrees: 25,
          shading_level: "low",
          suitability: "excellent",
        },
      ],
      total_usable_area_m2: 120.5,
      total_capacity_kw: 20.1,
      estimated_annual_kwh: 28300,
      installation_suitability: "excellent",
      recommendations: [
        "Clear obstructions on south-facing section",
        "Optimal tilt angle: 25-30 degrees",
      ],
    };

    // Save analysis to Firestore
    const analysisRef = await admin
      .firestore()
      .collection("roof_analysis")
      .add({
        uid,
        image_url,
        project_id,
        ...analysis,
        processing_time_ms: 3200,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update project
    if (project_id) {
      await admin.firestore().collection("projects").doc(project_id).update({
        total_usable_area_m2: analysis.total_usable_area_m2,
        estimated_capacity_kw: analysis.total_capacity_kw,
        status: "complete",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({
      success: true,
      data: analysis,
      analysisId: analysisRef.id,
    });
  } catch (error) {
    console.error("Roof analysis error:", error);
    res.status(500).json({
      error: "Roof analysis failed",
      message: error.message,
    });
  }
});

// ========== Savings Prediction Endpoint ==========

app.post("/savings-prediction", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const {
      panel_capacity_kw,
      annual_solar_kwh,
      electricity_rate_per_kwh,
      export_rate_per_kwh,
      installation_cost,
    } = req.body;

    // Calculate savings (placeholder logic)
    const year1_savings = annual_solar_kwh * electricity_rate_per_kwh * 0.8;
    const payback_period = installation_cost / year1_savings;

    const prediction = {
      year_1_savings: year1_savings,
      lifetime_savings: year1_savings * 25 * 1.02, // 2% annual increase
      net_present_value: 15000,
      payback_period_years: payback_period,
      roi_percentage: (year1_savings / installation_cost) * 100,
      monthly_breakdown: [],
      yearly_projection: [],
      co2_offset_tonnes: (annual_solar_kwh * 0.475) / 1000,
    };

    // Save prediction
    const predictionRef = await admin
      .firestore()
      .collection("predictions")
      .add({
        uid,
        endpoint: "savings_prediction",
        model_version: "1.0.0",
        input_data: req.body,
        output_data: prediction,
        status: "success",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      success: true,
      data: prediction,
      predictionId: predictionRef.id,
    });
  } catch (error) {
    console.error("Savings prediction error:", error);
    res.status(500).json({
      error: "Savings prediction failed",
      message: error.message,
    });
  }
});

// ========== Export HTTP Functions ==========

exports.api = functions.https.onRequest(app);

// ========== Scheduled Functions ==========

/**
 * Daily cleanup function - remove old predictions
 * Runs at 2 AM UTC daily
 */
exports.cleanupOldData = functions.pubsub
  .schedule("0 2 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const oldPredictions = await admin
      .firestore()
      .collection("predictions")
      .where("created_at", "<", thirtyDaysAgo)
      .get();

    const batch = admin.firestore().batch();
    oldPredictions.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${oldPredictions.docs.length} old predictions`);
  });

// ========== Firestore Triggers ==========

/**
 * Trigger when new project is created
 * Initialize project metadata
 */
exports.onProjectCreated = functions.firestore
  .document("projects/{projectId}")
  .onCreate(async (snapshot) => {
    const projectId = snapshot.id;
    const projectData = snapshot.data();

    // Initialize project subcollections
    await admin
      .firestore()
      .collection("projects")
      .doc(projectId)
      .collection("analysis_history")
      .doc("_metadata")
      .set({
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        analysis_count: 0,
      });

    console.log(`Initialized project: ${projectId}`);
  });

/**
 * Trigger when new prediction is created
 * Update user stats
 */
exports.onPredictionCreated = functions.firestore
  .document("predictions/{predictionId}")
  .onCreate(async (snapshot) => {
    const prediction = snapshot.data();
    const uid = prediction.uid;

    // Update user prediction count
    await admin
      .firestore()
      .collection("users")
      .doc(uid)
      .update({
        prediction_count: admin.firestore.FieldValue.increment(1),
        last_prediction: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`New prediction for user: ${uid}`);
  });
