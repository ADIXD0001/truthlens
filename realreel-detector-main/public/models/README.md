# TruthLens — ONNX Models Directory

Place your exported ONNX model file here if you have a custom fine-tuned model.

## Using a custom model

1. Export your PyTorch model to ONNX format:
   ```python
   # In your Python environment:
   import torch
   from your_model import YourModel

   model = YourModel()
   model.load_state_dict(torch.load("your_weights.pth"))
   model.eval()

   dummy_input = torch.randn(1, 3, 224, 224)
   torch.onnx.export(
       model, dummy_input,
       "truthlens_model.onnx",
       export_params=True,
       opset_version=14,
       input_names=["input"],
       output_names=["output"]
   )
   ```

2. Drop `truthlens_model.onnx` into this directory.

3. Update `MODEL_URL` in `src/hooks/useDetectionEngine.ts`:
   ```ts
   const MODEL_URL = "/models/truthlens_model.onnx";
   ```

## Default model

Without a custom model, TruthLens loads MobileNetV2 from the Hugging Face
ONNX hub (~14MB, Apache-2.0 license) on first use. The browser caches it
automatically, so subsequent analyses are instant.
