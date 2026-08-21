# Biological Image Classification with ResNet Ensembles 🧬

[![Open in Spaces](https://huggingface.co/datasets/huggingface/badges/resolve/main/open-in-hf-spaces-sm.svg)](https://divyanshgitmax-dlp-week9-image-classifier.hf.space/)

An end-to-end deep learning project for classifying biological organisms into 10 distinct classes/kingdoms. This repository contains the custom-trained ResNet architectures (ResNet18 and ResNet34) and the deployment code for the live interactive web application.

## 🚀 Live Interactive Demo
You can test the models directly in your browser without downloading any code or weights. 
👉 **[Click here to try the Live Web App](https://divyanshgitmax-dlp-week9-image-classifier.hf.space/)**

*(The web app includes 30 built-in sample images for one-click testing across all biological classes).*

## 📊 Dataset & Classes
The models were trained to categorize images into the following 10 biological classifications:
* `Amphibia`, `Animalia`, `Arachnida`, `Aves`, `Fungi`
* `Insecta`, `Mammalia`, `Mollusca`, `Plantae`, `Reptilia`

## 🧠 Model Architecture & Optimizations

Rather than using standard off-the-shelf architectures, the ResNet models were heavily customized to optimize feature extraction for this specific image domain:

1. **Custom Convolutional Layer:** The standard `7x7` stride-2 convolution in `conv1` was replaced with a `3x3` stride-1 convolution (`nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)`). This prevents aggressive spatial downsampling early in the network, preserving critical high-frequency details needed to distinguish similar biological textures (e.g., insect wings vs. plant leaves).
2. **Max Pooling Bypass:** The initial max-pooling layer was replaced with an `nn.Identity()` mapping to further preserve spatial resolution in the early feature maps.
3. **Data Augmentation:** Heavy augmentation was applied during training (Vertical/Horizontal Flips, Random Rotations, Color Jittering) to ensure robust generalization across different lighting conditions and environments.

## ⚖️ Geometric Mean Ensembling
To achieve maximum accuracy and robustness, three models were trained independently:
* Model 1: Custom `ResNet18` (Version 1)
* Model 2: Custom `ResNet18` (Version 2)
* Model 3: Custom `ResNet34`

During inference, a **Geometric Mean Ensemble** strategy is employed. By taking the geometric mean of the softmax probabilities outputted by all three models `((p1 * p2 * p3) ^ (1/3))`, the ensemble effectively smooths out the weaknesses of individual models and severely penalizes confident but incorrect outlier predictions.

## 📂 Repository Structure
* `*.ipynb`: The core training notebook detailing data loading, the custom architecture modifications, the PyTorch training loop, and the Geometric Mean ensembling logic.
* `app.py`: The Gradio application script used to host the interactive Hugging Face Space.
* `requirements.txt`: Environment dependencies.

*(Note: Model `.pth` weight files are hosted externally via Hugging Face Git LFS to bypass standard GitHub storage constraints).*
