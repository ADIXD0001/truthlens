import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, Monitor, Film, Cpu, ThumbsUp, ThumbsDown, Lock } from "lucide-react";
import ConfidenceGauge from "./ConfidenceGauge";
import { type DetectionResult, sendFeedback } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface ResultsPanelProps {
  result: DetectionResult;
}

const severityColors = {
  high: "text-destructive bg-destructive/10 border-destructive/20",
  medium: "text-warning bg-warning/10 border-warning/20",
  low: "text-success bg-success/10 border-success/20",
};

const ResultsPanel = ({ result }: ResultsPanelProps) => {
  const isAI = result.verdict === "ai-generated";
  const [feedbackState, setFeedbackState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

  const handleFeedback = async (userSaysAI: boolean) => {
    setFeedbackState("loading");
    try {
      await sendFeedback(result.analysis_id, userSaysAI ? "ai-generated" : "real");
      setFeedbackState("success");
    } catch (e) {
      setFeedbackState("error");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Verdict */}
      <div className={`glass-card p-8 text-center ${isAI ? "border-destructive/30" : "border-success/30"}`}>
        <div className="flex justify-center mb-4">
          {isAI ? (
            <div className="w-16 h-16 rounded-full bg-destructive/15 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          {isAI ? "AI-Generated Video Detected" : "Real Video — Authentic"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isAI
            ? "Our analysis indicates this video was likely created using AI generation tools."
            : "Our analysis indicates this video appears to be authentic footage."}
        </p>

        <div className="mt-6">
          <ConfidenceGauge value={result.confidence} verdict={result.verdict} />
        </div>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Film, label: "Frames Analyzed", value: result.metadata.framesAnalyzed.toLocaleString() },
          { icon: Monitor, label: "Resolution", value: result.metadata.resolution },
          { icon: Clock, label: "Duration", value: result.metadata.duration },
          { icon: Cpu, label: "Model", value: result.metadata.model.split(" + ")[0] },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="glass-card p-4 text-center">
            <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Findings (Premium Locked) */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Detection Breakdown</h3>
        </div>
        
        <div className={`space-y-3 transition-all duration-500 ${!isPremiumUnlocked ? "blur-sm opacity-60 select-none pointer-events-none" : ""}`}>
          {result.findings.map((f, i) => (
            <div key={i} className={`rounded-lg border p-4 ${severityColors[f.severity]}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{f.category}</span>
                <span className="text-xs font-mono opacity-80">
                  Score: {(f.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs opacity-80">{f.description}</p>
            </div>
          ))}
          {result.findings.length < 3 && !isPremiumUnlocked && (
             <>
               <div className="rounded-lg border p-4 bg-muted/20 border-border">
                 <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2"></div>
                 <div className="h-3 w-3/4 bg-muted/60 rounded animate-pulse"></div>
               </div>
               <div className="rounded-lg border p-4 bg-muted/20 border-border">
                 <div className="h-4 w-28 bg-muted rounded animate-pulse mb-2"></div>
                 <div className="h-3 w-2/3 bg-muted/60 rounded animate-pulse"></div>
               </div>
             </>
          )}
        </div>

        {!isPremiumUnlocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-2xl">
            <div className="p-3 bg-primary/10 rounded-full mb-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-semibold text-foreground mb-1">Premium Feature</h4>
            <p className="text-xs text-muted-foreground text-center max-w-[220px] mb-4">
              Unlock the deep forensic parameter report to see exactly what triggered the AI detection.
            </p>
            <Button 
              onClick={() => setIsPremiumUnlocked(true)} 
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold"
            >
              Upgrade to Unlock
            </Button>
          </div>
        )}
      </div>

      {/* Processing time */}
      <p className="text-center text-xs text-muted-foreground mb-4">
        Analysis completed in {result.processingTime.toFixed(1)}s using {result.metadata.model}
      </p>

      {/* Online Learning Feedback Loop */}
      {feedbackState !== "success" ? (
        <div className="glass-card p-6 mt-4 flex flex-col items-center border-primary/20">
          <p className="text-sm font-medium mb-3 text-foreground">Help train our model. Was this prediction correct?</p>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => handleFeedback(isAI)} disabled={feedbackState === "loading"}>
              <ThumbsUp className="w-4 h-4 mr-2 text-success" /> Yes, it's {isAI ? "AI" : "Real"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleFeedback(!isAI)} disabled={feedbackState === "loading"}>
              <ThumbsDown className="w-4 h-4 mr-2 text-destructive" /> No, it's {!isAI ? "AI" : "Real"}
            </Button>
          </div>
          {feedbackState === "error" && <p className="text-xs text-destructive mt-3">Failed to send feedback.</p>}
        </div>
      ) : (
        <div className="glass-card p-6 mt-4 flex flex-col items-center border-success/30 bg-success/5 animate-fade-in">
          <p className="text-sm font-medium text-success">Thanks for your feedback!</p>
          <p className="text-xs text-muted-foreground mt-1">Our AI's neural weights have been actively updated.</p>
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
