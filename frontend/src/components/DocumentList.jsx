import { FileText, File, Trash2 } from "lucide-react";

export default function DocumentList({
  documents,
  selectedIds,
  onToggle,
  onDelete,
  deletingId,
}) {
  if (!documents.length) {
    return (
      <div className="empty-documents">
        <FileText size={30} />
        <p>No documents uploaded yet.</p>
        <span>Upload a document to start asking questions.</span>
      </div>
    );
  }

  return (
    <div className="document-list">
      {documents.map((doc) => {
        const id = doc.document_id ?? doc.id;
        const name = doc.filename ?? doc.name ?? "Untitled document";
        const selected = selectedIds.includes(id);

        return (
          <div
            className={`document-item ${selected ? "selected" : ""}`}
            key={id}
          >
            <label className="document-select">
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(id)}
              />

              <span className="document-icon">
                <File size={19} />
              </span>

              <span className="document-name" title={name}>
                {name}
              </span>
            </label>

            <button
              className="icon-button delete-button"
              title={`Delete ${name}`}
              aria-label={`Delete ${name}`}
              disabled={deletingId === id}
              onClick={() => onDelete(id)}
              type="button"
            >
              <Trash2 size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}