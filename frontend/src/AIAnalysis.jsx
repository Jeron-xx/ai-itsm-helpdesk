import React, { useState } from "react";
import ReactMarkdown from "react-markdown";


function AIAnalysis({ ticket, onBack }) {

  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationResult, setAutomationResult] = useState(null);
  const [automationError, setAutomationError] = useState("");


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


  const ticketId = ticket._id || ticket.id;

  const isPasswordTicket =
    ticket.category === "Access / Password";

  const isAlreadyResolved =
    ticket.status === "Resolved";


  const handlePasswordReset = async () => {

    if (!ticketId) {
      setAutomationError("Ticket ID is not available.");
      return;
    }

    try {

      setAutomationLoading(true);
      setAutomationError("");
      setAutomationResult(null);

      const response = await fetch(
        "http://127.0.0.1:8000/api/automation/password-reset",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            ticket_id: ticketId,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Password reset automation failed."
        );

      }


      setAutomationResult(data);

    } catch (error) {

      console.error(
        "Password reset automation error:",
        error
      );

      setAutomationError(
        error.message ||
        "Unable to complete password reset automation."
      );

    } finally {

      setAutomationLoading(false);

    }
  };


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
              {ticketId}
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
              {automationResult
                ? "Resolved"
                : ticket.status || "N/A"}
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

          {ticket.description ||
            "No description available."}

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



      {/* Password Self-Healing Automation */}

      {isPasswordTicket && !isAlreadyResolved && !automationResult && (

        <div className="analysis-card automation-card">

          <h3>
            Password Self-Healing
          </h3>


          <p>
            This issue is eligible for automated
            password reset.
          </p>


          <button
            className="automation-button"
            onClick={handlePasswordReset}
            disabled={automationLoading}
          >

            {automationLoading
              ? "Resetting Password..."
              : "Reset Password Automatically"}

          </button>


          {automationError && (

            <div className="automation-error">

              {automationError}

            </div>

          )}

        </div>

      )}



      {/* Automation Result */}

      {automationResult && (

        <div className="analysis-card automation-success">

          <h3>
            ✓ Password Reset Completed
          </h3>


          <div className="automation-result-grid">


            <div>

              <span>
                Automation
              </span>

              <strong>
                {automationResult.action}
              </strong>

            </div>


            <div>

              <span>
                Status
              </span>

              <strong>
                {automationResult.status}
              </strong>

            </div>


            <div>

              <span>
                Validation
              </span>

              <strong>
                {automationResult.validation}
              </strong>

            </div>


            <div>

              <span>
                ServiceNow
              </span>

              <strong>
                {automationResult.servicenow_status}
              </strong>

            </div>


          </div>


          <p className="automation-message">

            Password reset automation was executed
            and validated successfully. The corresponding
            ServiceNow incident has been updated.

          </p>

        </div>

      )}



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