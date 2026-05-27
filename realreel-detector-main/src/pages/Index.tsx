import { useState, useRef } from "react";
import { Shield, Lock, Cpu } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import UploadArea from "@/components/UploadArea";
import ResultsPanel from "@/components/ResultsPanel";
import HowItWorks from "@/components/HowItWorks";
import { Button } from "@/components/ui/button";
import { useDetectionEngine } from "@/hooks/useDetectionEngine";
import type { DetectionResult } from "@/lib/detectionTypes";

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<File | null>(null);

  const { modelStatus, analyzeVideo } = useDetectionEngine();

  const startAnalysis = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStep("Initializing...");

    try {
      const res = await analyzeVideo(file, (pct, stepLabel) => {
        setProgress(pct);
        setStep(stepLabel);
      });
      setResult(res);
    } catch (err) {
      console.error("[TruthLens] Analysis failed:", err);
      setError(
        err instanceof Error ? err.message : "Analysis failed. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = (file: File) => {
    fileRef.current = file;
    startAnalysis(file);
  };

  // URL mode: we can't run local ONNX on a remote URL directly,
  // so we treat it as unsupported and show a clear message.
  const handleUrl = (_url: string) => {
    setError(
      "URL analysis is not supported in local edge mode. Please upload a video file."
    );
  };

  const reset = () => {
    setResult(null);
    setProgress(0);
    setFileName("");
    setStep("");
    setError(null);
    fileRef.current = null;
  };

  // ── Model status badge ──────────────────────────────────────────────────────
  const modelBadge = {
    idle:    { label: "Model: Starting…",   color: "text-muted-foreground" },
    loading: { label: "Model: Loading…",    color: "text-amber-400 animate-pulse" },
    ready:   { label: "Model: Ready ✓",     color: "text-emerald-400" },
    error:   { label: "Model: Load failed", color: "text-destructive" },
  }[modelStatus];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex flex-col items-center pt-10 pb-2 gap-1">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Truth Lens</h1>
        </div>
        {/* Model status indicator */}
        <div className={`flex items-center gap-1.5 text-xs font-mono mt-1 ${modelBadge.color}`}>
          <Cpu className="w-3 h-3" />
          <span>{modelBadge.label}</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        {!isProcessing && !result && !error && (
          <div className="text-center mt-6 mb-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Detect <span className="gradient-text">Deepfakes</span> &<br />
              AI-Generated Videos with Truth Lens
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Upload any video to instantly analyze it for AI manipulation using real
              on-device neural inference — no data leaves your browser.
            </p>
          </div>
        )}

        {/* Error state */}
        {error && !isProcessing && (
          <div className="w-full max-w-lg mx-auto mt-8 animate-fade-in">
            <div className="glass-card p-6 text-center border-destructive/30">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="secondary" onClick={reset}>Try Again</Button>
            </div>
          </div>
        )}

        {/* Upload area — only when idle */}
        {!isProcessing && !result && !error && (
          <UploadArea
            onFileSelect={handleFile}
            onUrlSubmit={handleUrl}
            isProcessing={modelStatus !== "ready"}
          />
        )}

        {/* Processing spinner */}
        {isProcessing && (
          <div className="w-full max-w-lg mx-auto mt-16 animate-fade-in">
            <div className="glass-card p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse-glow" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                Analyzing: <span className="text-foreground font-mono text-xs">{fileName}</span>
              </p>
              <p className="text-xs text-primary font-medium mb-4">{step}</p>
              <Progress value={progress} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isProcessing && (
          <div className="mt-8 w-full">
            <ResultsPanel result={result} />
            <div className="flex justify-center mt-6">
              <Button variant="secondary" onClick={reset}>
                Analyze Another Video
              </Button>
            </div>
          </div>
        )}

        {!isProcessing && !result && !error && <HowItWorks />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-muted-foreground max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Videos are processed locally — never stored on our servers</span>
          </div>
          <span className="hidden md:inline">•</span>
          <span>© 2026 Truth Lens. For research and educational purposes.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
