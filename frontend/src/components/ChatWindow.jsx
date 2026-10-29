import { useEffect, useRef, useState } from "react";
import {
  Send,
  Bot,
  Sparkles,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import { askQuestion } from "../services/api";
import Message from "./Message";

const initialMessage = {
  role: "assistant",
  content:
    "Hello! Upload a PDF or TXT document, select it from the sidebar, and ask me anything about its contents.",
  sources: [],
};

export default function ChatWindow({ selectedIds }) {
  const [messages, setMessages] = useState([initialMessage]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    if (!selectedIds.length) {
      setError("Select at least one document before asking a question.");
      return;
    }

    setError("");
    setQuestion("");

    setMessages((previous) => [
      ...previous,
      { role: "user", content: text },
    ]);

    setLoading(true);

    try {
      const result = await askQuestion(text, selectedIds);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            result.answer || "No answer was returned by the server.",
          sources: result.sources || [],
        },
      ]);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Unable to get an answer. Please try again.";

      setError(detail);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const resetChat = () => {
    if (loading) return;

    setMessages([initialMessage]);
    setQuestion("");
    setError("");
  };

  return (
    <section className="chat-panel">
      <header className="chat-header">
        <div className="chat-title">
          <span className="chat-title-icon">
            <Bot size={22} />
          </span>

          <div>
            <h2>Document Assistant</h2>
            <p>
              <span className="status-dot" />
              Traditional RAG · Context-based answers
            </p>
          </div>
        </div>

        <button
          className="icon-button"
          onClick={resetChat}
          disabled={loading}
          title="Clear conversation"
          aria-label="Clear conversation"
          type="button"
        >
          <RotateCcw size={17} />
        </button>
      </header>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}

        {loading && (
          <div className="typing-indicator">
            <LoaderCircle className="spin" size={18} />
            Searching documents and generating an answer...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="chat-footer">
        {error && (
          <div className="error-banner" role="alert">
            {error}
            <button onClick={() => setError("")} type="button">
              Dismiss
            </button>
          </div>
        )}

        <div className="selected-count">
          <Sparkles size={14} />
          {selectedIds.length} document(s) selected
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask a question about your documents..."
            rows={2}
            maxLength={4000}
            disabled={loading}
          />

          <button
            className="send-button"
            type="submit"
            disabled={loading || !question.trim()}
            aria-label="Send question"
          >
            {loading ? (
              <LoaderCircle className="spin" size={19} />
            ) : (
              <Send size={19} />
            )}
          </button>
        </form>

        <p className="footer-note">
          Answers are generated from retrieved document context. Verify important details against the original source.
        </p>
      </div>
    </section>
  );
}