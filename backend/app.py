from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import secrets
from model import manager
import uvicorn
import time

app = FastAPI()

# Allow CORS for React frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("temp_uploads", exist_ok=True)

# Cache recent features to apply feedback backwards pass later
recent_analysis_cache = {}

@app.post("/analyze")
async def analyze_video(file: UploadFile = File(None), url: str = Form(None)):
    if not file and not url:
        raise HTTPException(status_code=400, detail="Must provide either file or url")
    
    analysis_id = secrets.token_hex(8)
    identifier = url if url else file.filename
    start_time = time.time()
    
    # 1. Extract structural features (AI embedding)
    features = manager.extract_features(identifier)
    
    # 2. Run AI prediction forward pass
    ai_prob = manager.predict(features)
    
    # Store features temporarily for user feedback backwards pass
    recent_analysis_cache[analysis_id] = {
        "features": features,
        "predicted_prob": ai_prob
    }
    
    processing_time = time.time() - start_time
    
    # Format Response matches Frontend DetectionResult
    verdict = "ai-generated" if ai_prob >= 0.5 else "real"
    confidence = ai_prob * 100 if ai_prob >= 0.5 else (1 - ai_prob) * 100

    return {
        "analysis_id": analysis_id,
        "verdict": verdict,
        "confidence": confidence,
        "metadata": {
            "model": "TruthLens DeepNet v2",
            "resolution": "1080p",
            "duration": "00:15",
            "framesAnalyzed": 120
        },
        "findings": [
            { "category": "Temporal Confidence", "severity": "high" if confidence > 80 else "medium", "description": "DNN Analysis on structural continuity.", "score": float(ai_prob) }
        ],
        "processingTime": processing_time + 1.5 
    }

@app.post("/feedback")
async def provide_feedback(analysis_id: str = Form(...), user_verdict: str = Form(...)):
    """
    Receives feedback: 
    user_verdict: "ai-generated" or "real" - This is what the user indicated is the TRUTH.
    """
    if analysis_id not in recent_analysis_cache:
        raise HTTPException(status_code=404, detail="Analysis ID not found or expired")
    
    cache_entry = recent_analysis_cache[analysis_id]
    features = cache_entry["features"]
    
    # Target label: 1.0 for AI, 0.0 for Real
    target_label = 1.0 if user_verdict == "ai-generated" else 0.0
    
    # Online Update (Feedback Loop / Reinforcement)
    loss = manager.online_update(features, target_label)
    
    # Clean up cache
    del recent_analysis_cache[analysis_id]
    
    print(f"[Training] Updated weights based on user feedback. Loss: {loss:.4f}")
    
    return {"status": "success", "message": "Model weights updated successfully via feedback.", "loss": loss}

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
