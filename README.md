# 🏥 HealthMitra Scan  
### *Offline AI-Powered Healthcare Assistant*

<p align="center">
  <img src="https://img.shields.io/badge/Status-Working_Prototype-brightgreen"/>
  <img src="https://img.shields.io/badge/Mode-100%25_Offline-success"/>
  <img src="https://img.shields.io/badge/AI-LLM%20%2B%20Computer%20Vision-blue"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688"/>
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow"/>
</p>

---

## 🎬 Demo

<p align="center">
  <img src="https://via.placeholder.com/900x500.gif?text=HealthMitra+Demo" alt="Demo"/>
</p>

> Replace this with your actual demo GIF (recommended: `/assets/demo.gif`)

---

## ✨ Overview

**HealthMitra Scan** is an **offline-first AI healthcare assistant** designed to make medical insights accessible anywhere — especially in rural and low-resource environments.

It combines:
- 🧠 AI models (Computer Vision + LLMs)  
- 📄 OCR-based report analysis  
- ❤️ Risk prediction systems  
- 🤖 Offline chatbot  
- 🧑‍⚕️ Patient management  

> ⚠️ Not a medical device. Always consult a professional.

---

## 🚀 Features

### 🩻 X-Ray Sequential AI Agent
- View validation (AP/PA)
- Pneumonia detection (YOLOv8)
- Fracture detection (ChexFract + fallback)
- Bilingual report generation (English + Hindi)

---

### 📄 Medical Report Explainer
- Upload PDFs/images  
- OCR extraction (Tesseract)  
- Guideline-based classification (ADA, AHA, WHO)  
- Risk scoring + explanations  

---

### ❤️ Future Risk Predictor
- Inputs: BP, sugar, BMI, cholesterol  
- Outputs:
  - Diabetes risk  
  - Heart disease risk  
  - Emergency alerts  

---

### 🤖 Offline Medical Chatbot (RAG)
- Local LLM (Ollama)  
- ChromaDB vector search  
- Context-aware, grounded answers  
- Works without internet  

---

### 🧑‍⚕️ Patient Management
- SQLite-based registry  
- Timeline tracking  
- Dashboard analytics  

---

### 🧬 AI Health Twin
- Digital health profile  
- Tracks trends + insights  

---

### 🏥 Rural ASHA Worker Mode
- Multi-patient management  
- Village clustering  
- Risk prioritization  
- Visit scheduler  
- Offline-first design  

---

## 🧠 Highlights

- ✅ Fully Offline  
- 🔒 Privacy-first (local data)  
- 🌍 Bilingual (English + Hindi)  
- ⚡ Fast local inference  
- 🏥 Rural healthcare ready  

---

## 🛠️ Tech Stack

### Frontend
- React 18  
- Vite  

### Backend
- FastAPI  
- SQLAlchemy  
- SQLite  

### AI / ML
- YOLOv8  
- ChexFract (MAIRA-2)  
- torchxrayvision  
- Rule-based models  

### LLM
- Ollama (Phi-3 / Llama 3)  
- OpenAI GPT-4o (optional)  
- Claude / Together AI  

### Data Processing
- Tesseract OCR  
- pdfplumber  
- ChromaDB  

---

## 🧱 Architecture

```mermaid
flowchart TD
    A[React Frontend] --> B[FastAPI Backend]
    B --> C[AI Models]
    B --> D[OCR Engine]
    B --> E[LLM Services]
    B --> F[SQLite Database]


Run
git clone https://github.com/your-username/healthmitra-scan.git
cd healthmitra-scan
.\run.bat


📂 Structure
backend/
  ├── agents/
  ├── services/
  ├── routers/
  ├── models/
frontend/
  ├── src/
  ├── pages/
🎯 Use Cases
Rural healthcare
Clinics without internet
Report understanding
Risk prediction
AI-assisted diagnostics
🏆 Roadmap
 Mobile app
 Voice assistant
 Edge AI optimization
 More languages
🤝 Contributing
Fork the repo
Create a branch
Submit a PR
📜 License

MIT License

👨‍💻 Team

Amogh
Team: Core 4 Codeers

⭐ Support

If you like this project:

⭐ Star the repo
🔗 Share it
🚀 Build on it
💡 Summary

HealthMitra Scan is a fully offline AI healthcare platform combining computer vision, OCR, and LLMs to deliver intelligent medical insights anywhere.
