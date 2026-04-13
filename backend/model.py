import torch
import torch.nn as nn
import torch.optim as optim
import os
import hashlib

class DeepfakeModel(nn.Module):
    def __init__(self, input_dim=512, hidden_dim=128):
        super(DeepfakeModel, self).__init__()
        # A simple Multi-Layer Perceptron (MLP) for classifying deepfakes
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, 1)
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        return self.sigmoid(x)

class ModelManager:
    def __init__(self, model_path="model_weights.pth"):
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DeepfakeModel().to(self.device)
        self.optimizer = optim.Adam(self.model.parameters(), lr=0.005)
        self.criterion = nn.BCELoss()
        
        self.load_model()

    def extract_features(self, video_path_or_data):
        """
        In a full production environment, this would use OpenCV + a Pretrained CNN (like ResNet)
        to extract frame features. Here we generate consistent pseudo-features based on the filename/url 
        hash to simulate the architecture.
        """
        seed_str = str(video_path_or_data).encode('utf-8')
        seed = int(hashlib.md5(seed_str).hexdigest(), 16) % (10**8)
        torch.manual_seed(seed)
        
        return torch.rand((1, 512)).to(self.device)

    def predict(self, features):
        self.model.eval()
        with torch.no_grad():
            prob = self.model(features).item()
        return prob

    def online_update(self, features, correct_label):
        """
        Feedback Loop: User tells us the correct label. We update weights.
        correct_label: 1.0 if actually AI-generated, 0.0 if Real.
        This provides Continuous Learning / simple reinforcement based on feedback.
        """
        self.model.train()
        self.optimizer.zero_grad()
        
        target = torch.tensor([[float(correct_label)]]).to(self.device)
        output = self.model(features)
        
        loss = self.criterion(output, target)
        loss.backward()
        self.optimizer.step()
        
        self.save_model()
        return loss.item()

    def load_model(self):
        if os.path.exists(self.model_path):
            self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
            print("Loaded existing model weights.")
        else:
            print("Initialized fresh model weights.")

    def save_model(self):
        torch.save(self.model.state_dict(), self.model_path)

manager = ModelManager()
