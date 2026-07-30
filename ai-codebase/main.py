# Import FastAPI framework
from fastapi import FastAPI,Request
from datetime import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

from app.orchestrator.agent_runner import run_agent
from app.core.logger import logger


# --------------------------------------------------
# Request Model (Production Standard)
# --------------------------------------------------
class ChatRequest(BaseModel):
    user_query: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None  # ✅ Added for multi-user support


# Create FastAPI app
app = FastAPI()


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"[INCOMING] {request.method} {request.url}")

    try:
        response = await call_next(request)
        logger.info(f"[OUTGOING] status={response.status_code}")
        return response

    except Exception as e:
        logger.error(f"[MIDDLEWARE ERROR] {str(e)}", exc_info=True)
        raise


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------
@app.get("/")
def root():
    logger.info("[ROOT] Health check hit")
    return {"message": "AI Agent Service Running"}


# --------------------------------------------------
# AI Chat Endpoint
# --------------------------------------------------
@app.post(
    "/chat",
    summary="AI Chat Endpoint",
    description="""
AI chat endpoint with memory + LLM pipeline
"""
)
def chat(request: ChatRequest):

    try:
        # --------------------------------------------------
        # Extract Request Data
        # --------------------------------------------------
        user_query = request.user_query
        conversation_id = request.conversation_id
        user_id = request.user_id or "anonymous-user"  # ✅ FIX

        logger.info(f"[CHAT REQUEST] user_id={user_id}, query={user_query}")

        # --------------------------------------------------
        # Generate Conversation ID
        # --------------------------------------------------
        if not conversation_id:
            conversation_id = f"conv_{uuid.uuid4().hex[:10]}"
            logger.debug(f"[CONVERSATION] Generated ID={conversation_id}")

        # --------------------------------------------------
        # Run AI Orchestrator
        # --------------------------------------------------
        logger.info("[AGENT] Running agent...")
        result = run_agent(user_query, user_id=user_id)
        logger.info("[AGENT] Completed")

        # --------------------------------------------------
        # Extract Data from Orchestrator
        # --------------------------------------------------
        ai_response = result.get("reply")
        memory_info = result.get("memory", {})
        usage_info = result.get("usage", {})
        model_info = result.get("model", "unknown")

        # --------------------------------------------------
        # Handle orchestrator failure
        # --------------------------------------------------
        if result.get("error"):
            logger.error("[AGENT ERROR] Orchestrator failed")
            return {
                "success": False,
                "error": "AI processing failed",
                "meta": {
                    "conversation_id": conversation_id,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }

        # --------------------------------------------------
        # Return API Response (Improved but compatible)
        # --------------------------------------------------
        logger.info("[CHAT SUCCESS] Response generated")
        return {
            "success": True,
            "message": "AI response generated successfully",
            "data": {
                "conversation_id": conversation_id,
                "role": "ASSISTANT",
                "user_query": user_query,  # optional (keep for now)
                "content": ai_response,
                "agent": {
                    "agent_name": "sales_agent"
                },
                "memory": memory_info,
                "usage": usage_info,
                "timestamp": datetime.utcnow().isoformat()
            },
            "meta": {
                "model": model_info
            }
        }

    except Exception as e:
        logger.error(f"API error: {str(e)}", exc_info=True)

        return {
            "success": False,
            "error": "Internal server error",
            "meta": {
                "timestamp": datetime.utcnow().isoformat()
            }
        } 