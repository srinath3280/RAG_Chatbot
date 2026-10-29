from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import documents, chat

app = FastAPI(
    title="Document Q&A Chatbot API",
    description="Traditional RAG backend for PDF and TXT documents",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    documents.router,
    prefix="/api/documents",
    tags=["Documents"],
)

app.include_router(
    chat.router,
    prefix="/api/chat",
    tags=["Chat"],
)


@app.get("/")
def root():
    return {
        "message": "Document Q&A Chatbot API is running"
    }


@app.get("/health")
def health():
    return {"status": "ok"}