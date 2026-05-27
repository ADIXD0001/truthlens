/**
 * frameExtractor.ts
 * Extracts N evenly-spaced frames from a video File using the HTML5
 * <video> + <canvas> trick (no OpenCV / server required).
 */

export interface ExtractedFrame {
  canvas: HTMLCanvasElement;
  timestamp: number; // seconds
}

export const extractFrames = (
  videoFile: File,
  maxFrames: number = 10,
  targetSize: number = 224
): Promise<ExtractedFrame[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(videoFile);
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";

    const frames: ExtractedFrame[] = [];
    let currentFrame = 0;
    let timestamps: number[] = [];

    const captureFrame = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(video, 0, 0, targetSize, targetSize);
        frames.push({ canvas, timestamp: video.currentTime });
      }

      currentFrame++;
      if (currentFrame < timestamps.length) {
        video.currentTime = timestamps[currentFrame];
      } else {
        URL.revokeObjectURL(video.src);
        resolve(frames);
      }
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;

      if (!isFinite(duration) || duration <= 0) {
        reject(new Error("Could not determine video duration."));
        return;
      }

      // Distribute timestamps evenly, skipping first/last 5% to avoid blank frames
      const start = duration * 0.05;
      const end = duration * 0.95;
      const span = end - start;
      const count = Math.min(maxFrames, Math.floor(duration));

      timestamps = Array.from({ length: count }, (_, i) =>
        start + (span / (count - 1 || 1)) * i
      );

      video.onseeked = captureFrame;
      video.currentTime = timestamps[0];
    };

    video.onerror = () =>
      reject(new Error("Failed to load video for frame extraction."));
  });
};
