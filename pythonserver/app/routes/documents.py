import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config.settings import UPLOAD_DIR
from app.services.document_service import (
    index_document,
    list_documents,
    remove_document,
)

router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    filename = Path(file.filename or "").name
    extension = Path(filename).suffix.lower()

    if extension not in {".pdf", ".txt"}:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and TXT files are supported.",
        )

    # Read at most 10 MB plus one byte to detect oversized files.
    content = await file.read(MAX_FILE_SIZE + 1)

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must not exceed 10 MB.",
        )

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    # Use a generated name to avoid path traversal and filename collisions.
    temp_path = UPLOAD_DIR / f"{uuid.uuid4()}{extension}"

    try:
        temp_path.write_bytes(content)

        result = index_document(temp_path, filename)

        return {
            "message": "Document uploaded and indexed successfully",
            **result,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Document processing failed: {exc}",
        ) from exc

    finally:
        temp_path.unlink(missing_ok=True)


@router.get("")
def get_documents():
    return {"documents": list_documents()}


@router.delete("/{document_id}")
def delete_document(document_id: str):
    deleted = remove_document(document_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    return {"message": "Document deleted successfully"}