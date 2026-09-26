import { useEffect, useState } from "react";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/audit-logs"
      );

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      setLogs(data.audit_logs || []);
    } catch (err) {
      console.error("Audit log error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="audit-page">

      <section className="audit-header">
        <h2>Audit Logs</h2>

        <p>
          Track important actions performed in the ITSM system.
        </p>

        <button
          className="refresh-button"
          onClick={fetchLogs}
        >
          Refresh
        </button>
      </section>

      {loading && (
        <p>Loading audit logs...</p>
      )}

      {error && (
        <div className="error">
          Failed to load audit logs: {error}
        </div>
      )}

      {!loading && !error && logs.length === 0 && (
        <p>No audit logs found.</p>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="audit-table-container">

          <table className="audit-table">

            <thead>
              <tr>
                <th>Action</th>
                <th>Description</th>
                <th>Ticket ID</th>
                <th>User</th>
                <th>Created At</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>

                  <td>
                    <strong>{log.action}</strong>
                  </td>

                  <td>
                    {log.description}
                  </td>

                  <td>
                    {log.ticket_id || "-"}
                  </td>

                  <td>
                    {log.user}
                  </td>

                  <td>
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default AuditLogs;