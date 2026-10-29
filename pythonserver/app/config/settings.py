import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")

UPLOAD_DIR = BASE_DIR / "uploads"
CHROMA_DIR = BASE_DIR / "chroma_db"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CHROMA_DIR.mkdir(parents=True, exist_ok=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
CHAT_MODEL = os.getenv(
    "GROQ_CHAT_MODEL",
    "llama-3.3-70b-versatile",
)

if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY is not configured.")