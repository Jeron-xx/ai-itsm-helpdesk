import { useEffect, useState } from "react";

function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchKnowledge = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/knowledge"
      );

      if (!response.ok) {
        throw new Error("Failed to load knowledge base");
      }

      const data = await response.json();

      setDocuments(data.documents || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  if (loading) {
    return (
      <section className="knowledge-page">
        <h2>Knowledge Base</h2>
        <p>Loading knowledge documents...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="knowledge-page">
        <h2>Knowledge Base</h2>
        <p className="error">{error}</p>
      </section>
    );
  }

  return (
    <section className="knowledge-page">

      <div className="knowledge-header">

        <div>
          <h2>Knowledge Base</h2>

          <p>
            IT support knowledge used by the AI assistant.
          </p>
        </div>

      </div>


      <div className="knowledge-layout">

        {/* Document List */}

        <div className="knowledge-list">

          <h3>Knowledge Documents</h3>

          {documents.map((document) => (

            <button
              key={document.id}
              className={
                selectedDocument?.id === document.id
                  ? "knowledge-item active"
                  : "knowledge-item"
              }
              onClick={() =>
                setSelectedDocument(document)
              }
            >

              <strong>
                {document.title}
              </strong>

              <span>
                {document.source}
              </span>

            </button>

          ))}

        </div>


        {/* Document Content */}

        <div className="knowledge-content">

          {selectedDocument ? (

            <>

              <h3>
                {selectedDocument.title}
              </h3>

              <p className="document-source">
                Source: {selectedDocument.source}
              </p>

              <pre>
                {selectedDocument.content}
              </pre>

            </>

          ) : (

            <div className="empty-knowledge">

              <h3>
                Select a document
              </h3>

              <p>
                Choose a knowledge document to view
                its contents.
              </p>

            </div>

          )}

        </div>

      </div>

    </section>
  );
}


export default KnowledgeBase;