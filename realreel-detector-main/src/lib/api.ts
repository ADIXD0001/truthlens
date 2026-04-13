const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface DetectionResult {
  analysis_id: string;
  verdict: "ai-generated" | "real";
  confidence: number;
  processingTime: number;
  findings: {
    category: string;
    description: string;
    severity: "high" | "medium" | "low";
    score: number;
  }[];
  metadata: {
    framesAnalyzed: number;
    resolution: string;
    duration: string;
    model: string;
  };
}

export async function runDetection(
  input: string | File,
  onProgress: (p: number) => void
): Promise<DetectionResult> {
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress > 90) progress = 90;
    onProgress(progress);
  }, 300);

  try {
    const formData = new FormData();
    if (input instanceof File) {
      formData.append("file", input);
    } else {
      formData.append("url", input);
    }

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Analyze API failed`);
    }

    const data = await response.json();
    clearInterval(progressInterval);
    onProgress(100);
    return data as DetectionResult;
  } catch (error) {
    clearInterval(progressInterval);
    onProgress(100);
    throw error;
  }
}

export async function sendFeedback(analysisId: string, userVerdict: "ai-generated" | "real") {
  const formData = new FormData();
  formData.append("analysis_id", analysisId);
  formData.append("user_verdict", userVerdict);

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Feedback API error`);
  }

  return response.json();
}
