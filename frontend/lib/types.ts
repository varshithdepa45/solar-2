/**
 * Firebase Integration TypeScript Types
 * Provides type safety for all Firebase operations
 */

import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

// ============================================================================
// Authentication Types
// ============================================================================

export interface User extends FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// ============================================================================
// Firestore Document Types
// ============================================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  credits?: number;
}

export interface Prediction {
  id?: string;
  userId: string;
  endpoint: "solar_forecast" | "roof_detection" | "savings_prediction";
  input: Record<string, any>;
  result: Record<string, any>;
  metadata?: {
    model_version?: string;
    processing_time_ms?: number;
    timestamp?: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Project {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  address: string;
  roofArea?: number;
  estimatedCost?: number;
  estimatedROI?: number;
  status?: "active" | "completed" | "archived";
  images?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface RoofAnalysis {
  id?: string;
  userId: string;
  projectId?: string;
  imageUrl: string;
  suitability: number;
  bounding_boxes?: BoundingBox[];
  orientation?: string;
  average_pitch?: number;
  metadata?: Record<string, any>;
  createdAt?: Timestamp;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  area?: number;
  confidence: number;
}

// ============================================================================
// Cloud Functions Request/Response Types
// ============================================================================

export interface SolarForecastInput {
  latitude: number;
  longitude: number;
  month: number;
}

export interface SolarForecastOutput {
  forecast_value: number;
  confidence_interval: [number, number];
  unit: string;
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}

export interface RoofAnalysisInput {
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export interface RoofAnalysisOutput {
  suitability: number;
  bounding_boxes: BoundingBox[];
  orientation: string;
  average_pitch: number;
  total_area: number;
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}

export interface SavingsPredictionInput {
  systemSize: number; // kW
  latitude: number;
  roofArea: number; // m²
}

export interface SavingsPredictionOutput {
  annual_savings: number;
  payback_period_years: number;
  npv_25_years: number;
  co2_offset_tons: number;
  monthly_breakdown: MonthlyProjection[];
  metadata: {
    model_version: string;
    processing_time_ms: number;
  };
}

export interface MonthlyProjection {
  month: number;
  generation_kwh: number;
  savings_usd: number;
  cumulative_savings_usd: number;
}

export interface CloudFunctionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ============================================================================
// Cloud Storage Types
// ============================================================================

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface StorageFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  timestamp: string;
}

// ============================================================================
// Firestore Hook Types
// ============================================================================

export interface UsePredictionsResult {
  predictions: Prediction[];
  loading: boolean;
  error: Error | null;
}

export interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: Error | null;
}

export interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: Error | null;
}

export interface UseCreatePredictionResult {
  createPrediction: (prediction: Prediction) => Promise<string>;
  loading: boolean;
  error: Error | null;
}

export interface UseCreateProjectResult {
  createProject: (project: Project) => Promise<string>;
  loading: boolean;
  error: Error | null;
}

export interface UseUpdateProjectResult {
  updateProject: (updates: Partial<Project>) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export interface UseDeleteProjectResult {
  deleteProject: (projectId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// Firestore Query Types
// ============================================================================

export interface QueryFilters {
  limit?: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
  where?: Array<[string, string, any]>;
}

// ============================================================================
// Error Types
// ============================================================================

export interface FirebaseError extends Error {
  code?: string;
  message: string;
}

export interface ValidationError extends FirebaseError {
  field: string;
  value: any;
}

// ============================================================================
// Config Types
// ============================================================================

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseEmulatorConfig {
  authUrl: string;
  firestoreUrl: string;
  storageUrl: string;
  functionsUrl: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type AsyncFunction<T> = () => Promise<T>;
export type OptionalAsync<T> = T | Promise<T>;
