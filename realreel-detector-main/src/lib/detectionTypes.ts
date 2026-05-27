/**
 * detectionTypes.ts
 * Shared type definitions for TruthLens detection results.
 * The mock simulation has been replaced by real ONNX inference
 * in src/hooks/useDetectionEngine.ts
 */

export interface DetectionResult {
  verdict: "ai-generated" | "real";
  confidence: number; // 0–100
  processingTime: number; // seconds
  findings: {
    category: string;
    description: string;
    severity: "high" | "medium" | "low";
    score: number; // 0–1
  }[];
  metadata: {
    framesAnalyzed: number;
    resolution: string;
    duration: string;
    model: string;
  };
}
