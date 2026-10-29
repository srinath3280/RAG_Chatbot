# Document Q&A Chatbot Using Traditional RAG

A web-based chatbot that allows users to upload PDF and TXT documents and ask questions about their contents. The application uses Traditional Retrieval-Augmented Generation (RAG) to retrieve relevant document chunks and generate context-based answers using the Groq API.

## 1. Project Overview

### Objective

Build a document question-answering application that enables users to upload documents, retrieve relevant information, and receive answers grounded in the uploaded content.

### Key Features

- Upload PDF and TXT documents.
- Extract text from uploaded documents.
- Split text into smaller, overlapping chunks.
- Generate local embeddings using Sentence Transformers.
- Store and retrieve embeddings using ChromaDB.
- Generate answers using the Groq API.
- Display document sources, filenames, and page numbers.
- Select multiple documents for question answering.
- Delete uploaded documents and their indexed chunks.
- Responsive React user interface.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend build tool | Vite |
| Frontend HTTP client | Axios |
| Backend | Python |
| Backend framework | FastAPI |
| API server | Uvicorn |
| Document extraction | PyPDF |
| Text chunking | Python |
| Embedding model | Sentence Transformers |
| Vector database | ChromaDB |
| LLM provider | Groq API |
| Configuration | Environment variables using python-dotenv |

## 3. Project Structure

```text
RagAssignment/
│
├── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── Message.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
└── pythonserver/
    ├── app/
    │   ├── main.py
    │   ├── routes/
    │   │   ├── documents.py
    │   │   └── chat.py
    │   ├── services/
    │   │   └── document_service.py
    │   └── config/
    │       └── settings.py
    ├── uploads/
    ├── chroma_db/
    ├── venv/
    ├── .env
    └── requirements.txt
```

**Note:** The `venv/`, `.env`, `uploads/`, and `chroma_db/` directories may be created locally during setup. Do not commit virtual environments, API keys, or sensitive uploaded documents to Git.

## 4. Prerequisites

Install the following software before running the project:

- Node.js and npm
- Python 3.10 or a compatible Python version
- Git (optional)
- A Groq API key

Verify the installations:

```bash
node -v
npm -v
python --version
```

## 5. Frontend Setup — React.js

### Step 1: Navigate to the frontend

Open Command Prompt:

```cmd
cd /d D:\ProStackAcademy\RagAssignment\frontend
```

### Step 2: Install dependencies

```cmd
npm install
```

### Step 3: Configure the frontend environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

This URL points to the local FastAPI backend.

### Step 4: Start the frontend

```cmd
npm run dev
```

Open the application:

http://localhost:5173

## 6. Backend Setup — Python FastAPI

### Step 1: Navigate to the pythonserver

```cmd
cd /d D:\ProStackAcademy\RagAssignment\pythonserver
```

### Step 2: Create a virtual environment

If the virtual environment already exists, skip this step.

```cmd
python -m venv venv
```

### Step 3: Activate the virtual environment

```cmd
venv\Scripts\activate
```

### Step 4: Install dependencies

```cmd
pip install -r requirements.txt
```

If dependencies have not yet been added to `requirements.txt`, the following packages are required:

```text
fastapi
uvicorn[standard]
python-multipart
pypdf
chromadb
groq
sentence-transformers
python-dotenv
```

### Step 5: Configure the backend environment

Create `pythonserver/.env`:

```env
GROQ_API_KEY=your_groq_api_key
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
```

Replace the example API key with your actual Groq API key.

Get your key from:

https://console.groq.com/keys

Keep the API key private. Never expose it through React environment variables or commit it to version control.

### Step 6: Start the python server

```cmd
uvicorn app.main:app --reload
```

The backend will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

## 7. Running the Full Application

Run the frontend and backend in separate terminals.

### Terminal 1 — React frontend

```cmd
cd /d D:\ProStackAcademy\RagAssignment\frontend
npm run dev
```

### Terminal 2 — Python backend

```cmd
cd /d D:\ProStackAcademy\RagAssignment\pythonserver
venv\Scripts\activate
uvicorn app.main:app --reload
```

Open http://localhost:5173 in your browser.

## 8. Traditional RAG Workflow

The application follows two primary workflows.

### A. Document Ingestion

1. The user uploads a PDF or TXT document.
2. FastAPI validates the file and extracts its text.
3. Extracted text is split into overlapping chunks.
4. Sentence Transformers generates embeddings locally.
5. ChromaDB stores the embeddings, text chunks, document IDs, filenames, and page numbers.

### B. Question Answering

1. The user selects one or more uploaded documents.
2. The frontend sends the question and selected document IDs to FastAPI.
3. Sentence Transformers generates an embedding for the question.
4. ChromaDB retrieves the most relevant chunks from the selected documents.
5. The retrieved context is sent to the Groq chat completion API.
6. Groq generates an answer based on the supplied context.
7. FastAPI returns the answer and source references.
8. React displays the answer and supporting document excerpts.

### Architecture

```text
React Frontend
      |
      | REST API
      v
Python FastAPI
      |
      v
Document Extraction
      |
      v
Text Chunking
      |
      v
Sentence Transformers
      |
      v
ChromaDB Vector Search
      |
      v
Retrieved Document Context
      |
      v
Groq Chat Completion API
      |
      v
Answer + Source References
      |
      v
React Chat Interface
```

## 9. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Check whether the API is running |
| GET | `/health` | Health check |
| POST | `/api/documents/upload` | Upload and index a PDF or TXT file |
| GET | `/api/documents` | List indexed documents |
| DELETE | `/api/documents/{document_id}` | Delete a document and its indexed chunks |
| POST | `/api/chat/ask` | Ask a question about selected documents |

### Example: Upload a document

**Endpoint**

```http
POST /api/documents/upload
```

Content type: `multipart/form-data`

Form field:

```text
file: your-document.pdf
```

Example response:

```json
{
  "message": "Document uploaded and indexed successfully",
  "document_id": "generated-document-id",
  "filename": "your-document.pdf",
  "chunks": 12
}
```

### Example: Ask a question

**Endpoint**

```http
POST /api/chat/ask
```

Request:

```json
{
  "question": "What are the main objectives of this document?",
  "document_ids": [
    "generated-document-id"
  ]
}
```

Example response:

```json
{
  "answer": "The document describes its main objectives...",
  "sources": [
    {
      "filename": "your-document.pdf",
      "page": 2,
      "excerpt": "The main objectives include..."
    }
  ]
}
```

The IDs and response content above are illustrative examples.

## 10. Environment Configuration

### Frontend

File: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend

File: `pythonserver/.env`

```env
GROQ_API_KEY=your_groq_api_key
GROQ_CHAT_MODEL=llama-3.3-70b-versatile
```

The embedding model is downloaded and loaded by Sentence Transformers. It does not require an OpenAI API key.

The first model download requires internet access. The model can then be reused from the local cache.

## 11. Troubleshooting

### Issue 1: Frontend cannot connect to the backend

Check that FastAPI is running on port 8000 and that the frontend `.env` contains:

```env
VITE_API_BASE_URL=http://localhost:8000
```

Verify the CORS configuration in `app/main.py` permits:

```text
http://localhost:5173
```

Restart Vite after modifying its environment variables.

### Issue 2: Groq API errors

Check that `GROQ_API_KEY` is configured correctly and that the selected model is available to your Groq account.

Consult the official documentation:

https://console.groq.com/docs

### Issue 3: Sentence Transformers downloads a model

The first execution may download the embedding model. An internet connection is required unless the model is already cached locally.

### Issue 4: ChromaDB embedding dimension mismatch

Use the same embedding model for document indexing and question retrieval.

If you migrate from a different embedding model, back up the existing vector database and re-index the documents into a fresh collection. Never mix vectors generated by incompatible embedding models.

### Issue 5: PDF contains no extracted text

Some PDFs contain scanned images instead of selectable text. These documents require an OCR step before they can be indexed.

### Issue 6: Document upload fails

Check the backend logs, file size, file extension, PDF readability, and API connectivity. The application should reject unsupported file types.

## 12. Security and Limitations

- Keep Groq API keys in backend environment variables.
- Validate uploaded files and enforce file-size limits.
- Add authentication and authorization before deploying for multiple users.
- Ensure users can retrieve only documents they are authorized to access.
- Treat document contents as untrusted input when constructing LLM prompts.
- Avoid exposing internal exception details or sensitive data to API clients.
- Scanned PDFs require OCR, which is not included in the current implementation.
- The current implementation uses synchronous processing and local ChromaDB storage; production workloads may require background jobs and managed storage.

## 13. Future Enhancements

- User authentication and document-level access control.
- Persistent chat history.
- OCR support for scanned PDFs.
- Improved chunking and retrieval quality.
- Hybrid search and reranking.
- Streaming chatbot responses.
- Document previews and download support.
- Deployment using Docker and a cloud hosting platform.
- Automated testing and monitoring.

## 14. Useful Links

- React: https://react.dev/
- Vite: https://vite.dev/
- FastAPI: https://fastapi.tiangolo.com/
- Groq API: https://console.groq.com/docs
- ChromaDB: https://docs.trychroma.com/
- Sentence Transformers: https://sbert.net/
- PyPDF: https://pypdf.readthedocs.io/

---

**Project:** Document Q&A Chatbot Using Traditional RAG

**Frontend:** React.js + Vite

**Backend:** Python + FastAPI

**Vector Database:** ChromaDB

**Embeddings:** Sentence Transformers

**LLM Provider:** Groq API
