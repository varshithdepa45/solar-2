"use client";

// ════════════════════════════════════════════════════════════════════════════
// Firebase Cloud Functions Client
// ════════════════════════════════════════════════════════════════════════════

import { httpsCallable, HttpsCallableResult } from "firebase/functions";
import { app } from "./firebase";
import { getFunctions } from "firebase/functions";

const functions = getFunctions(app);

// Type-safe callable function wrapper
export interface CallableOptions {
  timeout?: number;
}

export const callFunction = async <T = any, R = any>(
  functionName: string,
  data?: T,
  options?: CallableOptions,
): Promise<R> => {
  try {
    const callable = httpsCallable<T, R>(functions, functionName, {
      timeout: options?.timeout || 60000, // 60s default timeout
    });
    const result: HttpsCallableResult<R> = await callable(data);
    return result.data;
  } catch (error: any) {
    if (error.code === "functions/invalid-argument") {
      throw new Error(`Invalid argument for ${functionName}: ${error.message}`);
    }
    if (error.code === "functions/permission-denied") {
      throw new Error(`Permission denied for ${functionName}`);
    }
    if (error.code === "functions/internal") {
      throw new Error(`Internal server error in ${functionName}`);
    }
    throw new Error(`Failed to call ${functionName}: ${error.message}`);
  }
};

// Specific function helpers
export const predictSolar = async (input: {
  latitude: number;
  longitude: number;
  roofArea: number;
  sunExposure: number;
}): Promise<{ prediction: number; confidence: number }> => {
  return callFunction("predictSolar", input);
};

export const calculateSavings = async (input: {
  systemSize: number;
  location: string;
  electricityRate: number;
}): Promise<{ annualSavings: number; paybackPeriod: number }> => {
  return callFunction("calculateSavings", input);
};

export const analyzeRoof = async (input: {
  imageUrl: string;
  location: string;
}): Promise<{ suitability: number; recommendations: string[] }> => {
  return callFunction("analyzeRoof", input);
};

// Generic batch operation
export const batchCall = async <T = any>(
  functionName: string,
  items: T[],
  batchSize: number = 10,
): Promise<any[]> => {
  const results: any[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => callFunction(functionName, item)),
    );
    results.push(...batchResults);
  }
  return results;
};
