import gradio as gr
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import math
import spaces


CLASS_NAMES = [
    "Amphibia",  # 0
    "Animalia",  # 1
    "Arachnida", # 2
    "Aves",      # 3
    "Fungi",     # 4
    "Insecta",   # 5
    "Mammalia",  # 6
    "Mollusca",  # 7
    "Plantae",   # 8
    "Reptilia"   # 9
]


val_transform = transforms.Compose([
    transforms.Resize([224], interpolation=transforms.InterpolationMode.BICUBIC),
    transforms.CenterCrop([224]),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


def load_single_model(model_name):
    import torch.nn as nn
    
    if model_name in ["ResNet18 V1", "ResNet18 V2"]:
        model = models.resnet18(weights=None, num_classes=10)
    else:
        model = models.resnet34(weights=None, num_classes=10)
    
    model.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1, bias=False)
    model.maxpool = nn.Identity()
    
    if model_name == "ResNet18 V1":
        model.load_state_dict(torch.load("best_resnet18.pth", map_location="cpu"))
    elif model_name == "ResNet18 V2":
        model.load_state_dict(torch.load("best_resnet18_v2_1_clean.pth", map_location="cpu"))
    else:
        model.load_state_dict(torch.load("best_resnet34_clean.pth", map_location="cpu"))
        
    model.eval()
    return model

@spaces.GPU
def predict(image, model_choice):
    img_tensor = val_transform(image).unsqueeze(0)
    
    if model_choice == "Ensemble (All 3 Models - Geometric Mean)":
        model_v1 = load_single_model("ResNet18 V1")
        model_v2 = load_single_model("ResNet18 V2")
        model_v3 = load_single_model("ResNet 34")
        
        with torch.no_grad():
            prob_v1 = torch.nn.functional.softmax(model_v1(img_tensor)[0], dim=0)
            prob_v2 = torch.nn.functional.softmax(model_v2(img_tensor)[0], dim=0)
            prob_v3 = torch.nn.functional.softmax(model_v3(img_tensor)[0], dim=0)
            
            eps = 1e-8
            final_probs = ((prob_v1 + eps) * (prob_v2 + eps) * (prob_v3 + eps)) ** (1.0 / 3.0)
            probabilities = final_probs / final_probs.sum()

    else:
        model = load_single_model(model_choice)
        with torch.no_grad():
            outputs = model(img_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

    confidences = {CLASS_NAMES[i]: float(probabilities[i]) for i in range(10)}
    return confidences


interface = gr.Interface(
    fn=predict,
    inputs=[
        gr.Image(type="pil", label="Upload an Image"),
        gr.Dropdown(
            choices=["ResNet18 V1", "ResNet18 V2", "ResNet 34", "Ensemble (All 3 Models - Geometric Mean)"], 
            value="Ensemble (All 3 Models - Geometric Mean)", 
            label="Select Model Architecture"
        )
    ],
    outputs=gr.Label(num_top_classes=3, label="Predictions"),
    title="Week 9 Biological Image Classifier",
    description="Upload an image (e.g., a plant, insect, or animal) and let the trained ResNet models classify its biological kingdom/class! Try the Geometric Mean Ensemble for maximum accuracy.",
    
    examples=[
        # Amphibia
        ["Amphibia_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Amphibia_image_0010.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Amphibia_image_0017.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Animalia
        ["Animalia_image_0013.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Animalia_image_0014.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Animalia_image_0016.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Arachnida
        ["Arachnida_image_0003.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Arachnida_image_0005.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Arachnida_image_0006.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Aves
        ["Aves_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Aves_image_0008.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Aves_image_0010.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Fungi
        ["Fungi_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Fungi_image_0012.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Fungi_image_0024.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Insecta
        ["Insecta_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Insecta_image_0004.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Insecta_image_0006.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Mammalia
        ["Mammalia_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Mammalia_image_0009.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Mammalia_image_0018.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Mollusca
        ["Mollusca_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Mollusca_image_0010.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Mollusca_image_0025.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Plantae
        ["Plantae_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Plantae_image_0007.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Plantae_image_0020.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        # Reptilia
        ["Reptilia_image_0001.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Reptilia_image_0011.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Reptilia_image_0013.jpg", "Ensemble (All 3 Models - Geometric Mean)"],
        ["Reptilia_image_0014.jpg", "Ensemble (All 3 Models - Geometric Mean)"]
    ]
)

interface.launch()
