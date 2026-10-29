import { Bot, User, FileText } from "lucide-react";

export default function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "user-row" : "bot-row"}`}>
      <div className={`avatar ${isUser ? "user-avatar" : "bot-avatar"}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="message-content">
        <div className="message-author">
          {isUser ? "You" : "Document Assistant"}
        </div>

        <div className={`message-bubble ${isUser ? "user-bubble" : ""}`}>
          <p className="answer-text">{message.content}</p>
        </div>

        {message.sources?.length > 0 && (
          <div className="sources-section">
            <div className="sources-heading">
              <FileText size={15} />
              Sources
            </div>

            {message.sources.map((source, index) => (
              <div className="source-item" key={`${source.filename}-${index}`}>
                <strong>
                  {source.filename || "Document"}
                </strong>

                {source.page != null && (
                  <span> · Page {source.page}</span>
                )}

                {source.excerpt && (
                  <p>{source.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}