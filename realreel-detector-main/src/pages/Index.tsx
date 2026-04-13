import { useState } from "react";
import { Shield, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import UploadArea from "@/components/UploadArea";
import ResultsPanel from "@/components/ResultsPanel";
import HowItWorks from "@/components/HowItWorks";
import { runDetection, type DetectionResult } from "@/lib/api";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState("");

  const startAnalysis = async (input: string | File, name: string) => {
    setFileName(name);
    setResult(null);
    setIsProcessing(true);
    setProgress(0);

    const steps = ["Extracting frames...", "Analyzing temporal patterns...", "Running artifact detection...", "Facial analysis...", "Computing confidence...", "Finalizing..."];
    let lastStep = 0;

    try {
      const res = await runDetection(input, (p) => {
      setProgress(p);
      const idx = Math.min(Math.floor(p / 17), steps.length - 1);
      if (idx !== lastStep) {
        lastStep = idx;
        setStep(steps[idx]);
      }
    });

      setResult(res);
    } catch(e) {
      console.error(e);
      // Fallback or error state handling could go here
    }
    setIsProcessing(false);
  };

  const handleFile = (file: File) => startAnalysis(file, file.name);
  const handleUrl = (url: string) => startAnalysis(url, url.split("/").pop() || "video");

  const reset = () => {
    setResult(null);
    setProgress(0);
    setFileName("");
    setStep("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center gap-3 pt-10 pb-2">
        <Shield className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Truth Lens</h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 pb-8">
        {!isProcessing && !result && (
          <div className="text-center mt-6 mb-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Detect <span className="gradient-text">Deepfakes</span> &<br />
              AI-Generated Videos with Truth Lens
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Upload any video to instantly analyze it for AI manipulation. Our deep learning models identify synthetic content with high accuracy.
            </p>
          </div>
        )}

        {!isProcessing && !result && <UploadArea onFileSelect={handleFile} onUrlSubmit={handleUrl} isProcessing={false} />}

        {isProcessing && (
          <div className="w-full max-w-lg mx-auto mt-16 animate-fade-in">
            <div className="glass-card p-8 text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-primary animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse-glow" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Analyzing: <span className="text-foreground font-mono text-xs">{fileName}</span></p>
              <p className="text-xs text-primary font-medium mb-4">{step}</p>
              <Progress value={progress} className="h-2 bg-muted" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(progress)}% complete</p>
            </div>
          </div>
        )}

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

        {!isProcessing && !result && <HowItWorks />}
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
