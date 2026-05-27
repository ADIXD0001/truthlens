import { Shield, AlertTriangle, CheckCircle, Clock, Monitor, Film, Cpu } from "lucide-react";
import ConfidenceGauge from "./ConfidenceGauge";
import type { DetectionResult } from "@/lib/detectionTypes";

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

      {/* Findings */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Detection Breakdown</h3>
        </div>
        <div className="space-y-3">
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
        </div>
      </div>

      {/* Processing time */}
      <p className="text-center text-xs text-muted-foreground">
        Analysis completed in {result.processingTime.toFixed(1)}s using {result.metadata.model}
      </p>
    </div>
  );
};

export default ResultsPanel;
