/**
 * mockDetection.ts — DEPRECATED
 *
 * This file is kept only for backward compatibility.
 * All types are now in detectionTypes.ts
 * All real inference logic is in hooks/useDetectionEngine.ts
 *
 * @deprecated Use detectionTypes.ts for types and useDetectionEngine for inference
 */

// Re-export types so any remaining imports don't break
export type { DetectionResult } from "./detectionTypes";
