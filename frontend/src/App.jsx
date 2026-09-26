import { useState } from "react";
import "./App.css";

import ITSMDashboard from "./ITSMDashboard";
import AIAnalysis from "./AIAnalysis";
import KnowledgeBase from "./KnowledgeBase";
import SoftwareRequests from "./SoftwareRequests";
import AuditLogs from "./AuditLogs";
import ServiceNow from "./ServiceNow";

function App() {
  const [page, setPage] = useState("self-service");

  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const analyzeTicket = async () => {
    if (!description.trim()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/tickets/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Something went wrong"
        );
      }

      setResult(data);

    } catch (error) {
      setResult({
        error: error.message,
      });

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="app">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div>
          <h1>AI ITSM Helpdesk</h1>

          <p>
            Intelligent IT support for employees
          </p>
        </div>


        <nav>

          <button
            onClick={() =>
              setPage("self-service")
            }
          >
            Employee Self-Service
          </button>


          <button
            onClick={() =>
              setPage("dashboard")
            }
          >
            ITSM Dashboard
          </button>


          <button
            onClick={() =>
              setPage("knowledge")
            }
          >
            Knowledge Base
          </button>


          <button
            onClick={() =>
              setPage("software")
            }
          >
            Software Requests
          </button>

          <button onClick={() => setPage("audit")}>
           Audit Logs
          </button>

          <button onClick={() => setPage("servicenow")}>
           ServiceNow
          </button>

        </nav>

      </header>


      {/* ================= MAIN ================= */}

      <main className="container">


        {/* =========================================
            EMPLOYEE SELF SERVICE
        ========================================= */}
        {page === "servicenow" && <ServiceNow />}
        {page === "self-service" && (

          <>

            <section className="hero">

              <h2>
                How can we help you?
              </h2>


              <p>
                Describe your IT issue and our AI
                assistant will analyze it.
              </p>


              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Example: My VPN is not connecting..."
              />


              <button
                onClick={analyzeTicket}
                disabled={loading}
              >

                {loading
                  ? "Analyzing..."
                  : "Analyze Issue"}

              </button>

            </section>


            {/* ================= AI RESULT ================= */}

            {result && !result.error && (

              <section className="result">

                <h2>
                  AI Analysis
                </h2>


                <div className="info-grid">

  <div className="info-card">
    <span>Ticket ID</span>
    <strong>{result.ticket_id}</strong>
  </div>

  <div className="info-card">
    <span>ServiceNow Incident</span>
    <strong>
      {result.servicenow_incident || "N/A"}
    </strong>
  </div>

  <div className="info-card">
    <span>Category</span>
    <strong>{result.analysis.category}</strong>
  </div>

  <div className="info-card">
    <span>Priority</span>
    <strong>{result.analysis.priority}</strong>
  </div>

  <div className="info-card">
    <span>Confidence</span>
    <strong>
      {typeof result.confidence === "number"
        ? `${Math.round(result.confidence * 100)}%`
        : "N/A"}
    </strong>
  </div>

</div>


                {/* ================= AI RESPONSE ================= */}

                <div className="response-card">

                  <h3>
                    AI Recommendation
                  </h3>

                  <p>
                    {result.ai_response}
                  </p>

                </div>


                {/* ================= SOURCES ================= */}

                <div className="source-card">

                  <h3>
                    Knowledge Sources
                  </h3>


                  {result.knowledge_sources &&
                  result.knowledge_sources.length > 0 ? (

                    result.knowledge_sources.map(
                      (source, index) => (

                        <span key={index}>
                          {source}
                        </span>

                      )
                    )

                  ) : (

                    <span>
                      No sources available
                    </span>

                  )}

                </div>


                {/* ================= STATUS ================= */}

                <div className="status-card">

                  <strong>
                    Status:
                  </strong>{" "}

                  {result.status}


                  {result.escalated && (

                    <p>
                      This issue has been escalated
                      to IT Support.
                    </p>

                  )}

                </div>

              </section>

            )}


            {/* ================= ERROR ================= */}

            {result?.error && (

              <div className="error">

                {result.error}

              </div>

            )}

          </>

        )}


        {/* =========================================
            ITSM DASHBOARD
        ========================================= */}

        {page === "dashboard" && (

          <ITSMDashboard
            onSelectTicket={(ticket) => {

              setSelectedTicket(ticket);

              setPage("analysis");

            }}
          />

        )}


        {/* =========================================
            AI ANALYSIS
        ========================================= */}

        {page === "analysis" && (

          <AIAnalysis
            ticket={selectedTicket}
            onBack={() =>
              setPage("dashboard")
            }
          />

        )}


        {/* =========================================
            KNOWLEDGE BASE
        ========================================= */}

        {page === "knowledge" && (

          <KnowledgeBase />

        )}


        {/* =========================================
            SOFTWARE REQUESTS
        ========================================= */}

        {page === "software" && (

          <SoftwareRequests />

        )}

        {page === "audit" && (<AuditLogs />)}

      </main>

    </div>
  );
}

export default App;