"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { predictSolarForecast, predictSavings } from "@/lib/firebase-functions";
import { useCreatePrediction } from "@/lib/useFirestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, TrendingUp, DollarSign } from "lucide-react";

export default function SolarEstimationExample() {
  const { user } = useAuth();
  const { createPrediction } = useCreatePrediction();

  const [formData, setFormData] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    month: new Date().getMonth() + 1,
    systemSize: 8,
    roofArea: 200,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecastResult, setForecastResult] = useState<any>(null);
  const [savingsResult, setSavingsResult] = useState<any>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Please sign in to use solar estimation</p>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: typeof value === "string" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleEstimate = async () => {
    setError("");
    setForecastResult(null);
    setSavingsResult(null);
    setIsLoading(true);

    try {
      // Step 1: Get solar forecast
      const forecast = await predictSolarForecast({
        latitude: formData.latitude,
        longitude: formData.longitude,
        month: formData.month,
      });

      setForecastResult(forecast);

      // Step 2: Get savings prediction
      const savings = await predictSavings({
        systemSize: formData.systemSize,
        latitude: formData.latitude,
        roofArea: formData.roofArea,
      });

      setSavingsResult(savings);

      // Step 3: Log both to Firestore
      await createPrediction({
        userId: user.uid,
        endpoint: "solar_forecast",
        input: {
          latitude: formData.latitude,
          longitude: formData.longitude,
          month: formData.month,
        },
        result: forecast,
        metadata: {
          model_version: "v1.0",
          timestamp: new Date().toISOString(),
        },
      });

      await createPrediction({
        userId: user.uid,
        endpoint: "savings_prediction",
        input: {
          systemSize: formData.systemSize,
          latitude: formData.latitude,
          roofArea: formData.roofArea,
        },
        result: savings,
        metadata: {
          model_version: "v1.0",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error("Estimation error:", err);
      setError(err.message || "Estimation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Solar Estimation
          </h1>
          <p className="text-gray-400">
            Estimate solar potential and financial savings for your property
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Form */}
          <Card className="p-6 bg-gray-900 border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">
              Property Details
            </h2>

            <div className="space-y-4">
              {/* Latitude */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
                  step="0.0001"
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Range: -90 to 90</p>
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Longitude
                </label>
                <Input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                  step="0.0001"
                  className="bg-gray-800 border-gray-700 text-white"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">Range: -180 to 180</p>
              </div>

              {/* Month */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Month
                </label>
                <select
                  value={formData.month}
                  onChange={(e) => handleInputChange("month", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded disabled:opacity-50"
                  disabled={isLoading}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2024, i, 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <p className="text-sm font-semibold text-white mb-4">
                  System Details
                </p>

                {/* System Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    System Size (kW)
                  </label>
                  <Input
                    type="number"
                    value={formData.systemSize}
                    onChange={(e) =>
                      handleInputChange("systemSize", e.target.value)
                    }
                    step="0.1"
                    min="1"
                    max="100"
                    className="bg-gray-800 border-gray-700 text-white"
                    disabled={isLoading}
                  />
                </div>

                {/* Roof Area */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Roof Area (m²)
                  </label>
                  <Input
                    type="number"
                    value={formData.roofArea}
                    onChange={(e) =>
                      handleInputChange("roofArea", e.target.value)
                    }
                    step="1"
                    min="10"
                    max="10000"
                    className="bg-gray-800 border-gray-700 text-white"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Quick Fill Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      latitude: 37.7749,
                      longitude: -122.4194,
                    });
                  }}
                  variant="outline"
                  className="flex-1 border-gray-700 text-white text-sm"
                  disabled={isLoading}
                >
                  San Francisco
                </Button>
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      latitude: 40.7128,
                      longitude: -74.006,
                    });
                  }}
                  variant="outline"
                  className="flex-1 border-gray-700 text-white text-sm"
                  disabled={isLoading}
                >
                  New York
                </Button>
              </div>

              {/* Estimate Button */}
              <Button
                onClick={handleEstimate}
                disabled={isLoading}
                className="w-full mt-6 bg-neon-green hover:bg-neon-green/90 text-black font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Get Estimation
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-8">
            {/* Solar Forecast Card */}
            {forecastResult && (
              <Card className="p-6 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-neon-blue" />
                  <h3 className="text-lg font-bold text-white">
                    Solar Forecast
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Main Forecast */}
                  <div>
                    <p className="text-gray-400 text-sm">Monthly Generation</p>
                    <p className="text-3xl font-bold text-neon-blue">
                      {forecastResult.forecast_value?.toFixed(1) || "-"} kWh
                    </p>
                  </div>

                  {/* Confidence Interval */}
                  {forecastResult.confidence_interval && (
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-gray-400 text-sm mb-2">
                        95% Confidence Range
                      </p>
                      <div className="flex gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Low</p>
                          <p className="text-lg font-semibold text-white">
                            {forecastResult.confidence_interval[0]?.toFixed(1)}{" "}
                            kWh
                          </p>
                        </div>
                        <div className="flex-1 flex items-end">
                          <div className="w-full h-8 bg-gray-800 rounded relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-neon-blue to-neon-green"
                              style={{
                                width: `${
                                  ((forecastResult.forecast_value -
                                    forecastResult.confidence_interval[0]) /
                                    (forecastResult.confidence_interval[1] -
                                      forecastResult.confidence_interval[0])) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">High</p>
                          <p className="text-lg font-semibold text-white">
                            {forecastResult.confidence_interval[1]?.toFixed(1)}{" "}
                            kWh
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Info */}
                  {forecastResult.metadata && (
                    <div className="pt-3 text-xs text-gray-500">
                      Model: {forecastResult.metadata.model_version} |
                      Processing: {forecastResult.metadata.processing_time_ms}ms
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Savings Card */}
            {savingsResult && (
              <Card className="p-6 bg-gray-900 border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="h-6 w-6 text-neon-green" />
                  <h3 className="text-lg font-bold text-white">
                    Financial Projection
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Annual Savings */}
                  {savingsResult.annual_savings !== undefined && (
                    <div>
                      <p className="text-gray-400 text-sm">Annual Savings</p>
                      <p className="text-3xl font-bold text-neon-green">
                        ${savingsResult.annual_savings.toFixed(0)}
                      </p>
                    </div>
                  )}

                  {/* 25-Year NPV */}
                  {savingsResult.npv_25_years !== undefined && (
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">
                        25-Year Net Present Value
                      </p>
                      <p className="text-2xl font-semibold text-white">
                        ${savingsResult.npv_25_years.toFixed(0)}
                      </p>
                    </div>
                  )}

                  {/* Payback Period */}
                  {savingsResult.payback_period_years !== undefined && (
                    <div className="pt-3">
                      <p className="text-gray-400 text-sm mb-1">
                        Payback Period
                      </p>
                      <p className="text-xl font-semibold text-white">
                        {savingsResult.payback_period_years.toFixed(1)} years
                      </p>
                    </div>
                  )}

                  {/* CO2 Offset */}
                  {savingsResult.co2_offset_tons !== undefined && (
                    <div className="pt-3 border-t border-gray-800">
                      <p className="text-gray-400 text-sm mb-1">
                        Annual CO₂ Offset
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {savingsResult.co2_offset_tons.toFixed(1)} metric tons
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!forecastResult && !savingsResult && !isLoading && (
              <Card className="p-12 bg-gray-900 border-gray-800 text-center">
                <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Fill in your details and click</p>
                <p className="text-gray-400">"Get Estimation" to see results</p>
              </Card>
            )}
          </div>
        </div>

        {/* Information Section */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h3 className="text-lg font-bold text-white mb-4">
            How the Estimation Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neon-blue font-semibold mb-2">
                1. Location Data
              </p>
              <p className="text-gray-400">
                Your latitude and longitude determine solar irradiance and
                weather patterns
              </p>
            </div>
            <div>
              <p className="text-neon-green font-semibold mb-2">
                2. System Analysis
              </p>
              <p className="text-gray-400">
                We calculate potential generation based on system size and roof
                area
              </p>
            </div>
            <div>
              <p className="text-neon-purple font-semibold mb-2">
                3. Financial Model
              </p>
              <p className="text-gray-400">
                25-year projections account for energy escalation and system
                degradation
              </p>
            </div>
            <div>
              <p className="text-yellow-500 font-semibold mb-2">
                4. Confidence Range
              </p>
              <p className="text-gray-400">
                95% confidence intervals show realistic variability in
                predictions
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
