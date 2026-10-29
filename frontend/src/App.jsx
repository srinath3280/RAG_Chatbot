import { useCallback, useEffect, useState } from "react";
import { BookOpen, FileText, RefreshCw } from "lucide-react";

import FileUpload from "./components/FileUpload";
import DocumentList from "./components/DocumentList";
import ChatWindow from "./components/ChatWindow";
import { getDocuments, deleteDocument } from "./services/api";

import "./App.css";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const loadDocuments = useCallback(async () => {
    setError("");

    try {
      const result = await getDocuments();
      const list = Array.isArray(result)
        ? result
        : result.documents || [];

      setDocuments(list);

      setSelectedIds((previous) =>
        previous.filter((id) =>
          list.some((doc) => (doc.document_id ?? doc.id) === id)
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load documents. Check whether FastAPI is running."
      );
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const toggleDocument = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Delete this document and its indexed content?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteDocument(id);

      setDocuments((previous) =>
        previous.filter((doc) => (doc.document_id ?? doc.id) !== id)
      );

      setSelectedIds((previous) =>
        previous.filter((item) => item !== id)
      );
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to delete the document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={23} />
          </div>

          <div>
            <h1>DocuMind</h1>
            <p>Document Q&amp;A · Traditional RAG</p>
          </div>
        </div>

        <div className="connection-status">
          <span className="status-dot" />
          AI Document Assistant
        </div>
      </header>

      <main className="workspace">
        <aside className="sidebar">
          <div className="section-heading">
            <div>
              <h2>Your documents</h2>
              <p>Upload and select files to query.</p>
            </div>

            <span className="count-badge">{documents.length}</span>
          </div>

          <FileUpload onUploaded={loadDocuments} />

          <div className="list-heading">
            <span>LIBRARY</span>

            <button
              className="icon-button"
              onClick={loadDocuments}
              title="Refresh documents"
              aria-label="Refresh documents"
              type="button"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          {loadingDocuments ? (
            <div className="loading-documents">
              <RefreshCw className="spin" size={18} />
              Loading documents...
            </div>
          ) : (
            <DocumentList
              documents={documents}
              selectedIds={selectedIds}
              onToggle={toggleDocument}
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          )}

          <div className="sidebar-tip">
            <FileText size={18} />
            <div>
              <strong>Better answers</strong>
              <p>Select the documents that contain the information you need.</p>
            </div>
          </div>
        </aside>

        <ChatWindow selectedIds={selectedIds} />
      </main>
    </div>
  );
}