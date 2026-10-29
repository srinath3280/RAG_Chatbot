import { useRef, useState } from "react";
import { FileUp, FileText, LoaderCircle } from "lucide-react";
import { uploadDocument } from "../services/api";

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["pdf", "txt"].includes(extension)) {
      setError("Please upload a PDF or TXT file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await uploadDocument(file);
      await onUploaded();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Upload failed. Please check your backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        hidden
        onChange={handleUpload}
      />

      <button
        className="upload-button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <LoaderCircle className="spin" size={19} />
        ) : (
          <FileUp size={19} />
        )}

        {loading ? "Uploading..." : "Upload document"}
      </button>

      <p className="helper-text">
        <FileText size={14} />
        PDF or TXT · Maximum 10 MB
      </p>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}