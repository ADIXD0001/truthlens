import { useCallback, useState } from "react";
import { Upload, Link, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isProcessing: boolean;
}

const UploadArea = ({ onFileSelect, onUrlSubmit, isProcessing }: UploadAreaProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [url, setUrl] = useState("");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4 justify-center">
        <Button
          variant={mode === "upload" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("upload")}
          disabled={isProcessing}
        >
          <Upload className="w-4 h-4 mr-1.5" /> Upload File
        </Button>
        <Button
          variant={mode === "url" ? "default" : "secondary"}
          size="sm"
          onClick={() => setMode("url")}
          disabled={isProcessing}
        >
          <Link className="w-4 h-4 mr-1.5" /> Paste URL
        </Button>
      </div>

      {mode === "upload" ? (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`glass-card gradient-border flex flex-col items-center justify-center gap-4 p-12 cursor-pointer transition-all duration-300 ${
            dragOver ? "scale-[1.02] border-primary/50" : "hover:scale-[1.01]"
          } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileVideo className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              Drop your video here or <span className="gradient-text font-semibold">browse</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports MP4, AVI, MOV, WebM • Max 500MB
            </p>
          </div>
          <input
            type="file"
            accept=".mp4,.avi,.mov,.webm,video/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      ) : (
        <div className="glass-card gradient-border p-8">
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
              disabled={isProcessing}
            />
            <Button
              onClick={() => url && onUrlSubmit(url)}
              disabled={!url || isProcessing}
              className="px-6"
            >
              Analyze
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Paste a direct link to a video file or supported platform URL
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
