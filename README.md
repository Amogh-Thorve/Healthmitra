🏥 HealthMitra Scan
Offline Multilingual AI Health Assistant

⚠️ Informational tool only — not a medical device. Always consult a healthcare professional.

✨ Overview

HealthMitra Scan is a privacy-first, offline AI health platform that combines medical AI models, rule-based systems, and local LLMs to deliver intelligent healthcare insights.

🚀 Core Capabilities
🩻 X-Ray Sequential AI Agent
Upload chest X-ray → multi-stage analysis pipeline:
View validation (AP/PA detection)
Pneumonia detection (YOLOv8)
Fracture detection (ChexFract + fallback models)
Bilingual report generation (EN + HI)
Multi-provider LLM fallback:
GPT-4o → Claude → Llama → Ollama → Static template
📄 Clinical Report Intelligence
Upload PDFs/images
OCR + structured lab extraction
Deterministic classification:
Normal / Borderline / High / Low
Cardiovascular risk scoring
Optional AI explanations (local LLM)
❤️ Vitals Risk Predictor
Input: age, BMI, BP, sugar, cholesterol, etc.
Output:
Diabetes risk (% + level)
Heart disease risk (% + level)
Emergency alerts for critical values
🤖 Medical Chatbot (Offline RAG)
Uses:
ChromaDB (local vector DB)
Sentence Transformers embeddings
Ollama LLM
Supports:
Streaming responses (SSE)
Context-aware medical answers
🌐 Gemini AI Assistant (Online, JWT Protected)
Authenticated chat endpoint
Multi-model fallback
Safe fallback responses on quota limits
🧑‍⚕️ Patient & Health Management
Patient registry (SQLite)
Timeline tracking
Dashboard analytics
AI-generated “Health Twin”
🧱 Architecture
Frontend (React + Vite)
        ↓
FastAPI Backend
        ↓
├── AI Models (YOLOv8, ChexFract)
├── OCR (Tesseract)
├── Rule Engines
├── Local LLM (Ollama)
└── SQLite Database
🛠️ Tech Stack
Layer	Tech
Frontend	React 18 + Vite
Backend	FastAPI + SQLAlchemy
AI/LLM	Ollama (Phi-3, Llama 3), GPT-4o, Claude
OCR	Tesseract + pdfplumber
ML Models	YOLOv8, ChexFract
Database	SQLite
⚡ Quick Start
✅ Prerequisites
Python 3.10+
Node.js 18+
(Optional) Ollama
(Optional) API keys (OpenAI / Anthropic)
▶️ One-Command Setup (Recommended)
cd "C:\Users\amogh\Downloads\Healthmitra-main"
.\run.bat

👉 Includes:

Backend setup (venv + dependencies)
Frontend setup (npm install)
Optional model downloads
Server launch
📦 With Model Download
.\run.bat --download-models
🌐 Access URLs
Service	URL
Backend API	http://localhost:8000

API Docs	http://localhost:8000/docs

Frontend	http://localhost:5173
🧠 AI Models Overview
Model	Purpose	Location
YOLOv8 Chest X-ray	Pneumonia detection	backend/models/yolov8-chest-xray/
YOLOv8 Fracture	Backup fracture detection	backend/models/yolov8-fracture/
ChexFract MAIRA-2	Primary fracture model	backend/models/chexfract-maira2/

⚠️ ChexFract size ≈ 3.8GB

🔐 Configuration

Set environment variables:

GEMINI_API_KEY=your_key
JWT_SECRET=your_secret
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
📡 Key API Endpoints
🔑 Auth
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
🩻 X-Ray Agent
POST /api/xray-agent/analyze
GET /api/xray-agent/status
📄 Reports
POST /api/reports/upload
GET /api/reports/history
❤️ Risk Prediction
POST /api/risk/predict
🤖 Chatbot
POST /api/chatbot/ask
POST /api/chatbot/ask/stream
🧬 Unique Features
✅ Fully offline-capable
🌍 Bilingual (Hindi + English)
🔒 Privacy-first (local processing)
🧠 Hybrid AI (ML + LLM + rules)
🏥 Rural healthcare ready (ASHA mode)
📊 End-to-end health lifecycle tracking
🧪 Demo Flow
Dashboard → overview
Upload report → OCR + explanation
Upload X-ray → AI pipeline
Enter vitals → risk prediction
View history → timeline
Health Twin → AI insights
Rural Mode → multi-patient system
⚠️ Limitations
AI predictions may be inaccurate
Model availability affects results
Not a substitute for medical diagnosis
📂 Project Structure

(Condensed view)

backend/
  ├── agents/
  ├── services/
  ├── routers/
  ├── models/
frontend/
  ├── pages/
  ├── components/
🧩 Developer Notes

Key files:

xray_sequential_agent.py
clinical_engine.py
medical_chatbot.py
ocr_service.py
🏁 Final Thoughts

HealthMitra Scan is designed as a scalable, offline-first healthcare intelligence system, combining:

deterministic medical logic
deep learning models
modern LLMs

—all into a single cohesive platform.