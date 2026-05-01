"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { uploadRoofImage } from "@/lib/firebase-storage";
import { analyzeRoof } from "@/lib/firebase-functions";
import { useCreatePrediction } from "@/lib/useFirestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Upload, Zap } from "lucide-react";

export default function RoofDetectionExample() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPrediction } = useCreatePrediction();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [result, setResult] = useState<any>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please sign in to use roof detection</p>
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");
    setResult(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) {
      setError("Please select a file first");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Step 1: Upload image to Cloud Storage
      setUploadProgress(0);
      const imageUrl = await uploadRoofImage(
        user.uid,
        selectedFile,
        (progress) => {
          setUploadProgress(
            Math.round((progress.bytesTransferred / progress.totalBytes) * 100),
          );
        },
      );

      setSuccess(`Image uploaded successfully (${uploadProgress}%)`);

      // Step 2: Get geolocation (or use hardcoded for demo)
      // In production, you'd get this from the user
      const latitude = 37.7749;
      const longitude = -122.4194;

      // Step 3: Call roof analysis Cloud Function
      const analysisResult = await analyzeRoof({
        imageUrl,
        latitude,
        longitude,
      });

      setResult(analysisResult);
      setSuccess("Roof analysis completed!");

      // Step 4: Log prediction to Firestore
      await createPrediction({
        userId: user.uid,
        endpoint: "roof_detection",
        input: {
          imageUrl,
          latitude,
          longitude,
        },
        result: analysisResult,
        metadata: {
          model_version: "v1.0",
          timestamp: new Date().toISOString(),
        },
      });

      setSuccess("Analysis saved to your projects!");
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Roof Detection</h1>
          <p className="text-gray-400">
            Upload a roof image to analyze its solar potential
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Upload Image</h2>

            {/* File Input */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-neon-blue hover:bg-gray-800/50 transition"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-48 w-auto mx-auto mb-4 rounded"
                  />
                  <p className="text-gray-400 text-sm">{selectedFile?.name}</p>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-white font-semibold">
                    Click to select image
                  </p>
                  <p className="text-gray-500 text-sm">or drag and drop</p>
                  <p className="text-gray-600 text-xs mt-2">
                    Supports JPEG, PNG, WebP
                  </p>
                </div>
              )}
            </div>

            {/* Errors and Messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-green-900/20 border border-green-500 rounded flex gap-2">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Progress Bar */}
            {isLoading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-400">Uploading...</p>
                  <p className="text-sm text-gray-400">{uploadProgress}%</p>
                </div>
                <div className="h-2 bg-gray-800 rounded overflow-hidden">
                  <div
                    className="h-full bg-neon-blue transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || isLoading}
              className="w-full mt-6 bg-neon-green hover:bg-neon-green/90 text-black font-semibold disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Roof
                </>
              )}
            </Button>
          </Card>

          {/* Results Section */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">
              Analysis Results
            </h2>

            {result ? (
              <div className="space-y-4">
                {/* Suitability */}
                {result.suitability && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Roof Suitability
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          result.suitability > 0.8
                            ? "bg-neon-green"
                            : result.suitability > 0.6
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      ></div>
                      <p className="text-white text-lg font-semibold">
                        {Math.round(result.suitability * 100)}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Bounding Boxes */}
                {result.bounding_boxes && result.bounding_boxes.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Detected Roof Areas
                    </p>
                    <div className="space-y-2">
                      {result.bounding_boxes.map((box: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-800 rounded text-sm"
                        >
                          <p className="text-white">
                            Area {idx + 1}: {box.area?.toFixed(2)} m²
                          </p>
                          <p className="text-gray-400 text-xs">
                            Confidence: {(box.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Orientation */}
                {result.orientation && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Roof Orientation
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {result.orientation}
                    </p>
                  </div>
                )}

                {/* Average Pitch */}
                {result.average_pitch !== undefined && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">
                      Average Roof Pitch
                    </p>
                    <p className="text-white text-lg font-semibold">
                      {result.average_pitch.toFixed(1)}°
                    </p>
                  </div>
                )}

                {/* Metadata */}
                {result.metadata && (
                  <div className="pt-4 border-t border-gray-800">
                    <p className="text-gray-400 text-xs mb-2">Metadata</p>
                    <p className="text-gray-500 text-xs">
                      Model: {result.metadata.model_version}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Processing: {result.metadata.processing_time_ms}ms
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <Zap className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400">
                    Upload and analyze a roof image
                  </p>
                  <p className="text-gray-600 text-sm">
                    Results will appear here
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Information Card */}
        <Card className="mt-8 p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-bold text-white mb-3">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neon-blue font-semibold mb-1">
                1. Upload Image
              </p>
              <p className="text-gray-400">
                Select a clear image of your roof from directly above or at an
                angle
              </p>
            </div>
            <div>
              <p className="text-neon-green font-semibold mb-1">
                2. AI Analysis
              </p>
              <p className="text-gray-400">
                Our YOLOv8 model detects roof areas, orientation, and calculates
                suitability
              </p>
            </div>
            <div>
              <p className="text-neon-purple font-semibold mb-1">
                3. Get Results
              </p>
              <p className="text-gray-400">
                View detailed metrics and save to your projects for solar
                estimation
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
