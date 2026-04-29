from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from services.medical_chatbot import MedicalChatbot

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Initialize chatbot service
chatbot_service = MedicalChatbot()

class QuestionRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

@router.post("/ask", response_model=ChatResponse)
async def ask_question(request: QuestionRequest):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    result = chatbot_service.ask(request.question)
    return result

@router.post("/ask/stream")
async def stream_question(request: QuestionRequest):
    if not request.question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    return StreamingResponse(
        chatbot_service.stream_ask(request.question),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@router.get("/status")
async def get_status():
    return chatbot_service.get_status()
