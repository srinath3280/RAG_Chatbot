import re
import uuid
from pathlib import Path

import chromadb
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

from app.config.settings import CHROMA_DIR

# Local embedding model
# Downloads the model on first use.
embedding_model = SentenceTransformer(
    "sentence-transformers/all-MiniLM-L6-v2"
)

# Persistent ChromaDB database
chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = chroma_client.get_or_create_collection(
    name="document_chunks"
)


def extract_pages(file_path: Path):
    """Extract text and page metadata from PDF or TXT files."""

    if file_path.suffix.lower() == ".pdf":
        reader = PdfReader(str(file_path))
        pages = []

        for page_number, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ""

            if text.strip():
                pages.append({
                    "text": text,
                    "page": page_number,
                })

        return pages

    if file_path.suffix.lower() == ".txt":
        text = file_path.read_text(encoding="utf-8-sig")

        return [{"text": text, "page": 1}]

    raise ValueError("Only PDF and TXT files are supported.")


def split_text(text: str, chunk_size=2500, overlap=300):
    """Split text into overlapping character-based chunks."""

    text = re.sub(r"\s+", " ", text).strip()

    if not text:
        return []

    chunks = []
    start = 0

    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])

        if end == len(text):
            break

        start = end - overlap

    return chunks


def create_embeddings(texts: list[str]):
    """Generate local embeddings using Sentence Transformers."""

    vectors = embedding_model.encode(
        texts,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    return vectors.tolist()


def index_document(file_path: Path, filename: str):
    """Extract, chunk, embed, and store a document."""

    pages = extract_pages(file_path)
    chunk_records = []

    for page in pages:
        for chunk in split_text(page["text"]):
            chunk_records.append({
                "text": chunk,
                "page": page["page"],
            })

    if not chunk_records:
        raise ValueError(
            "No readable text found. Scanned PDFs may require OCR."
        )

    document_id = str(uuid.uuid4())
    batch_size = 64

    for start in range(0, len(chunk_records), batch_size):
        batch = chunk_records[start:start + batch_size]

        embeddings = create_embeddings([
            record["text"] for record in batch
        ])

        collection.add(
            ids=[
                f"{document_id}_{start + i}"
                for i in range(len(batch))
            ],
            documents=[
                record["text"] for record in batch
            ],
            embeddings=embeddings,
            metadatas=[
                {
                    "document_id": document_id,
                    "filename": filename,
                    "page": record["page"],
                }
                for record in batch
            ],
        )

    return {
        "document_id": document_id,
        "filename": filename,
        "chunks": len(chunk_records),
    }


def list_documents():
    """List indexed documents."""

    result = collection.get(include=["metadatas"])
    documents = {}

    for metadata in result["metadatas"]:
        if not metadata:
            continue

        document_id = metadata["document_id"]

        if document_id not in documents:
            documents[document_id] = {
                "document_id": document_id,
                "filename": metadata["filename"],
            }

    return list(documents.values())


def remove_document(document_id: str):
    """Remove all indexed chunks for a document."""

    existing = collection.get(
        where={"document_id": document_id},
        include=["metadatas"],
    )

    if not existing["ids"]:
        return False

    collection.delete(
        where={"document_id": document_id}
    )

    return True


def retrieve_chunks(
    question: str,
    document_ids: list[str],
    limit=5,
):
    """Retrieve relevant chunks from selected documents."""

    if not document_ids or collection.count() == 0:
        return []

    query_embedding = create_embeddings([question])[0]

    result = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(limit, collection.count()),
        where={
            "document_id": {
                "$in": document_ids
            }
        },
        include=["documents", "metadatas", "distances"],
    )

    chunks = []

    if not result["documents"] or not result["documents"][0]:
        return []

    for text, metadata in zip(
        result["documents"][0],
        result["metadatas"][0],
    ):
        chunks.append({
            "text": text,
            "filename": metadata["filename"],
            "page": metadata["page"],
        })

    return chunks