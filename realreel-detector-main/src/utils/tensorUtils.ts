/**
 * tensorUtils.ts
 * Converts an HTMLCanvasElement into an ONNX Runtime Float32 Tensor
 * with standard ImageNet normalization applied per channel.
 *
 * Format expected by most vision models:
 *   Shape: [1, 3, H, W]  (NCHW — planar channels)
 *   Range: normalized float32 via ImageNet mean/std
 */

declare const ort: any;

// ImageNet normalization constants
const MEAN = [0.485, 0.456, 0.406];
const STD  = [0.229, 0.224, 0.225];

export const preprocessCanvasToTensor = (
  canvas: HTMLCanvasElement
): ort.Tensor => {
  const size = canvas.width; // assumed square (224×224)
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not acquire 2D context from canvas.");

  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data; // flat RGBA array: [R,G,B,A, R,G,B,A, ...]

  const pixels = size * size;
  const floatData = new Float32Array(3 * pixels);

  for (let i = 0; i < pixels; i++) {
    const r = data[i * 4]     / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;

    // Planar layout: R-plane, then G-plane, then B-plane
    floatData[i]               = (r - MEAN[0]) / STD[0]; // R
    floatData[i + pixels]      = (g - MEAN[1]) / STD[1]; // G
    floatData[i + 2 * pixels]  = (b - MEAN[2]) / STD[2]; // B
  }

  return new ort.Tensor("float32", floatData, [1, 3, size, size]);
};

/**
 * Applies softmax to a raw logit array.
 */
export const softmax = (logits: Float32Array): Float32Array => {
  const max = Math.max(...Array.from(logits));
  const exps = logits.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((v) => v / sum) as unknown as Float32Array;
};

/**
 * Applies sigmoid to a single logit (for binary classifier outputs).
 */
export const sigmoid = (logit: number): number =>
  1 / (1 + Math.exp(-logit));
