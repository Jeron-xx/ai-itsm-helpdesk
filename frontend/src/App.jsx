import { useState } from "react";

import ITSMDashboard from "./ITSMDashboard";
import AIAnalysis from "./AIAnalysis";
import KnowledgeBase from "./KnowledgeBase";
import SoftwareRequests from "./SoftwareRequests";
import AuditLogs from "./AuditLogs";
import ServiceNow from "./ServiceNow";

import "./App.css";


function App() {
  // =========================================================
  // USER ROLE
  // =========================================================

  const [userRole, setUserRole] = useState(null);

  // employee | support


  // =========================================================
  // CURRENT PAGE
  // =========================================================

  const [page, setPage] = useState("self-service");


  // =========================================================
  // SELECTED TICKET
  // =========================================================

  const [selectedTicket, setSelectedTicket] = useState(null);


  // =========================================================
  // EMPLOYEE SELF-SERVICE
  // =========================================================

  const [description, setDescription] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin = (userId, password, role) => {

    // Employee credentials
    if (
      role === "employee" &&
      userId === "employee" &&
      password === "employee123"
    ) {
      setUserRole("employee");
      setPage("self-service");
      setError("");
      return;
    }


    // IT Support credentials
    if (
      role === "support" &&
      userId === "itsupport" &&
      password === "support123"
    ) {
      setUserRole("support");
      setPage("dashboard");
      setError("");
      return;
    }


    // Invalid credentials
    setError(
      "Invalid ID or password. Please check your credentials."
    );
  };


  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {

    setUserRole(null);

    setPage("self-service");

    setDescription("");

    setResult(null);

    setSelectedTicket(null);

    setError("");
  };


  // =========================================================
  // ANALYZE EMPLOYEE ISSUE
  // =========================================================

  const analyzeIssue = async () => {

    if (!description.trim()) {
      setError("Please describe your IT issue.");
      return;
    }


    try {

      setLoading(true);

      setError("");

      setResult(null);


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


      if (!response.ok) {

        throw new Error(
          `Server returned ${response.status}`
        );

      }


      const data = await response.json();

      setResult(data);


    } catch (err) {

      console.error(
        "Ticket analysis error:",
        err
      );

      setError(
        "Unable to analyze the issue. Please try again."
      );


    } finally {

      setLoading(false);

    }
  };


  // =========================================================
  // LOGIN SCREEN
  // =========================================================

  if (!userRole) {

    return (
      <LoginScreen
        onLogin={handleLogin}
        error={error}
      />
    );

  }


  // =========================================================
  // EMPLOYEE PORTAL
  // =========================================================

  if (userRole === "employee") {

    return (
      <div className="app">

        <header className="portal-header">

          <div className="brand">

            <h1>AI ITSM</h1>

            <span>
              Employee Helpdesk
            </span>

          </div>


          <div className="portal-user">

            <span>
              Employee Portal
            </span>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </header>


        <main className="employee-main">

          <section className="employee-hero">

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
              rows="5"
            />


            {error && (
              <div className="error">
                {error}
              </div>
            )}


            <button
              className="primary-button"
              onClick={analyzeIssue}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Issue"}
            </button>

          </section>


          {result && (

            <section className="analysis-result">

              <h2>
                AI Analysis
              </h2>


              <div className="result-grid">

                <div className="result-card">

                  <span>
                    Ticket ID
                  </span>

                  <strong>
                    {result.ticket_id}
                  </strong>

                </div>


                <div className="result-card">

                  <span>
                    ServiceNow Incident
                  </span>

                  <strong>
                    {result.servicenow_incident || "-"}
                  </strong>

                </div>


                <div className="result-card">

                  <span>
                    Category
                  </span>

                  <strong>
                    {result.analysis?.category}
                  </strong>

                </div>


                <div className="result-card">

                  <span>
                    Priority
                  </span>

                  <strong>
                    {result.analysis?.priority}
                  </strong>

                </div>


                <div className="result-card">

                  <span>
                    Confidence
                  </span>

                  <strong>
                    {Math.round(
                      (result.confidence || 0) * 100
                    )}
                    %
                  </strong>

                </div>

              </div>


              <div className="result-section">

                <h3>
                  AI Recommendation
                </h3>

                <div className="recommendation">
                  {result.ai_response}
                </div>

              </div>


              <div className="result-section">

                <h3>
                  Knowledge Sources
                </h3>


                {result.knowledge_sources &&
                result.knowledge_sources.length > 0 ? (

                  <div className="source-list">

                    {result.knowledge_sources.map(
                      (source) => (

                        <span
                          className="source-tag"
                          key={source}
                        >
                          {source}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <span className="source-tag">
                    No sources available
                  </span>

                )}

              </div>


              <div className="status-box">

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

        </main>

      </div>
    );
  }


  // =========================================================
  // IT SUPPORT PORTAL
  // =========================================================

  return (

    <div className="app">

      <header className="portal-header">

        <div className="brand">

          <h1>
            AI ITSM
          </h1>

          <span>
            IT Support Portal
          </span>

        </div>


        <nav className="support-navigation">

          <button
            className={
              page === "dashboard"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("dashboard")
            }
          >
            ITSM Dashboard
          </button>


          <button
            className={
              page === "knowledge"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("knowledge")
            }
          >
            Knowledge Base
          </button>


          <button
            className={
              page === "software"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("software")
            }
          >
            Software Requests
          </button>


          <button
            className={
              page === "audit"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("audit")
            }
          >
            Audit Logs
          </button>


          <button
            className={
              page === "servicenow"
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() =>
              setPage("servicenow")
            }
          >
            ServiceNow
          </button>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>

        </nav>

      </header>


      <main className="support-main">

        {page === "dashboard" && (

          <ITSMDashboard
            onSelectTicket={(ticket) => {

              setSelectedTicket(ticket);

              setPage("ai-analysis");

            }}
          />

        )}


        {page === "ai-analysis" && (

          <AIAnalysis
            ticket={selectedTicket}
          />

        )}


        {page === "knowledge" && (

          <KnowledgeBase />

        )}


        {page === "software" && (

          <SoftwareRequests />

        )}


        {page === "audit" && (

          <AuditLogs />

        )}


        {page === "servicenow" && (

          <ServiceNow />

        )}

      </main>

    </div>
  );
}


// =========================================================
// LOGIN SCREEN
// =========================================================

function LoginScreen({
  onLogin,
  error,
}) {

  const [loginType, setLoginType] =
    useState("employee");


  const [userId, setUserId] =
    useState("");


  const [password, setPassword] =
    useState("");


  const handleSubmit = (e) => {

    e.preventDefault();

    onLogin(
      userId,
      password,
      loginType
    );

  };


  const switchLoginType = (type) => {

    setLoginType(type);

    setUserId("");

    setPassword("");

  };


  return (

    <div className="login-page">

      <div className="login-container">


        <div className="login-brand">

          <div className="login-logo">
            AI
          </div>

          <h1>
            AI ITSM Helpdesk
          </h1>

          <p>
            Intelligent IT support for employees
          </p>

        </div>


        {/* LOGIN TYPE */}

        <div className="login-tabs">

          <button
            type="button"
            className={
              loginType === "employee"
                ? "login-tab active"
                : "login-tab"
            }
            onClick={() =>
              switchLoginType("employee")
            }
          >
            Employee
          </button>


          <button
            type="button"
            className={
              loginType === "support"
                ? "login-tab active"
                : "login-tab"
            }
            onClick={() =>
              switchLoginType("support")
            }
          >
            IT Support
          </button>

        </div>


        {/* LOGIN FORM */}

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <h2>

            {loginType === "employee"
              ? "Employee Login"
              : "IT Support Login"}

          </h2>


          <label>
            {loginType === "employee"
              ? "Employee ID"
              : "IT Support ID"}
          </label>


          <input
            type="text"
            value={userId}
            onChange={(e) =>
              setUserId(e.target.value)
            }
            placeholder={
              loginType === "employee"
                ? "Enter employee ID"
                : "Enter IT support ID"
            }
            required
          />


          <label>
            Password
          </label>


          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter password"
            required
          />


          {error && (

            <div className="login-error">
              {error}
            </div>

          )}


          <button
            type="submit"
            className="login-button"
          >
            {loginType === "employee"
              ? "Employee Login"
              : "Support Login"}
          </button>

        </form>


        {/* DEMO CREDENTIALS */}

        <div className="demo-credentials">

          <h4>
            Demo Credentials
          </h4>


          {loginType === "employee" ? (

            <p>
              <strong>ID:</strong> employee
              <br />
              <strong>Password:</strong> employee123
            </p>

          ) : (

            <p>
              <strong>ID:</strong> itsupport
              <br />
              <strong>Password:</strong> support123
            </p>

          )}

        </div>


        <p className="prototype-note">
          Prototype authentication for
          demonstration purposes
        </p>

      </div>

    </div>
  );
}


export default App;