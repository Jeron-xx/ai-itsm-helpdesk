import ReactMarkdown from "react-markdown";


function AIAnalysis({ ticket, onBack }) {

  if (!ticket) {
    return (
      <section className="analysis-page">

        <h2>AI Analysis</h2>

        <p>
          Select a ticket from the ITSM Dashboard
          to view its analysis.
        </p>

      </section>
    );
  }


  return (

    <section className="analysis-page">


      {/* Header */}

      <div className="analysis-header">

        <div>

          <h2>
            AI Analysis
          </h2>

          <p>
            Detailed AI analysis for the selected IT ticket.
          </p>

        </div>


        <button onClick={onBack}>
          Back to Dashboard
        </button>

      </div>



      {/* Ticket Information */}

      <div className="analysis-card">

        <h3>
          Ticket Information
        </h3>


        <div className="analysis-grid">


          <div>
            <span>Ticket ID</span>

            <strong>
              {ticket._id || ticket.id}
            </strong>
          </div>


          <div>
            <span>Type</span>

            <strong>
              {ticket.type || "N/A"}
            </strong>
          </div>


          <div>
            <span>Category</span>

            <strong>
              {ticket.category || "N/A"}
            </strong>
          </div>


          <div>
            <span>Priority</span>

            <strong>
              {ticket.priority || "N/A"}
            </strong>
          </div>


          <div>
            <span>Impact</span>

            <strong>
              {ticket.impact || "N/A"}
            </strong>
          </div>


          <div>
            <span>Urgency</span>

            <strong>
              {ticket.urgency || "N/A"}
            </strong>
          </div>


          <div>
            <span>Assignment Group</span>

            <strong>
              {ticket.assignment_group || "N/A"}
            </strong>
          </div>


          <div>
            <span>Status</span>

            <strong>
              {ticket.status || "N/A"}
            </strong>
          </div>


        </div>

      </div>



      {/* User Description */}

      <div className="analysis-card">

        <h3>
          User Description
        </h3>


        <p className="ticket-description">

          {ticket.description || "No description available."}

        </p>

      </div>



      {/* AI Recommendation */}

      <div className="analysis-card">

        <h3>
          AI Recommendation
        </h3>


        <div className="ai-response">

          {ticket.ai_response ? (

            <ReactMarkdown>
              {ticket.ai_response}
            </ReactMarkdown>

          ) : (

            <p>
              No AI response available.
            </p>

          )}

        </div>

      </div>



      {/* RAG Information */}

      <div className="analysis-card">

        <h3>
          RAG Information
        </h3>


        <div className="rag-info">


          {/* Confidence */}

          <div>

            <span>
              Confidence
            </span>


            <strong>

              {typeof ticket.confidence === "number"

                ? `${Math.round(
                    ticket.confidence * 100
                  )}%`

                : "N/A"}

            </strong>

          </div>



          {/* Knowledge Sources */}

          <div>

            <span>
              Knowledge Sources
            </span>


            <div className="sources">

              {ticket.knowledge_sources?.length > 0

                ? ticket.knowledge_sources.map(
                    (source, index) => (

                      <span
                        className="source-tag"
                        key={index}
                      >
                        {source}
                      </span>

                    )
                  )

                : "No sources available"}

            </div>

          </div>


        </div>

      </div>



      {/* Escalation */}

      <div

        className={
          ticket.escalated
            ? "escalation-card escalated"
            : "escalation-card"
        }

      >

        <h3>

          {ticket.escalated

            ? "⚠ Escalation Required"

            : "✓ Escalation Status"}

        </h3>


        <p>

          {ticket.escalated

            ? "The AI could not confidently resolve this issue. The ticket has been escalated to IT Support."

            : "The AI found relevant knowledge and the ticket does not currently require escalation."}

        </p>

      </div>


    </section>

  );
}


export default AIAnalysis;