"""Chat API routes – POST /api/chat for LLM responses."""
from fastapi import APIRouter, HTTPException

from app.schema.chat import ChatRequest, ChatResponse
from app.services.chat_service import chat as chat_service

router = APIRouter()


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    """Send a user prompt and receive an LLM response from the spending assistant."""
    try:
        response_text = chat_service(payload.prompt)
        return ChatResponse(response=response_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
