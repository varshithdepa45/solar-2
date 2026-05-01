import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// Solar Forecast Function
export const callSolarForecast = httpsCallable(functions, "solarForecast");

export async function predictSolarForecast(data: {
  latitude: number;
  longitude: number;
  month: number;
  day_of_year: number;
  hour: number;
  temperature_celsius: number;
  cloud_cover_pct?: number;
  humidity_pct?: number;
  wind_speed_ms?: number;
  ghi: number;
  panel_capacity_kw: number;
  panel_efficiency_pct?: number;
  panel_tilt_degrees?: number;
  panel_azimuth_degrees?: number;
}) {
  try {
    const response = await callSolarForecast(data);
    return response.data;
  } catch (error: any) {
    console.error("Solar forecast error:", error);
    throw new Error(error.message || "Failed to generate solar forecast");
  }
}

// Roof Analysis Function
export const callRoofAnalysis = httpsCallable(functions, "roofAnalysis");

export async function analyzeRoof(data: {
  image_url: string;
  project_id: string;
}) {
  try {
    const response = await callRoofAnalysis(data);
    return response.data;
  } catch (error: any) {
    console.error("Roof analysis error:", error);
    throw new Error(error.message || "Failed to analyze roof");
  }
}

// Savings Prediction Function
export const callSavingsPrediction = httpsCallable(
  functions,
  "savingsPrediction",
);

export async function predictSavings(data: {
  panel_capacity_kw: number;
  annual_solar_kwh: number;
  electricity_rate_per_kwh: number;
  export_rate_per_kwh?: number;
  installation_cost: number;
  annual_tariff_increase_pct?: number;
  panel_degradation_pct?: number;
  system_lifetime_years?: number;
}) {
  try {
    const response = await callSavingsPrediction(data);
    return response.data;
  } catch (error: any) {
    console.error("Savings prediction error:", error);
    throw new Error(error.message || "Failed to predict savings");
  }
}

// Health Check Function
export const callHealthCheck = httpsCallable(functions, "healthCheck");

export async function checkHealth() {
  try {
    const response = await callHealthCheck({});
    return response.data;
  } catch (error: any) {
    console.error("Health check error:", error);
    throw new Error(error.message || "Failed to check health");
  }
}
