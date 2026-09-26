import { useEffect, useState } from "react";

function ServiceNow() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/servicenow"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load ServiceNow records"
        );
      }

      setRecords(data.records || []);
    } catch (error) {
      console.error("ServiceNow error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="servicenow-page">

      <section className="servicenow-header">
        <h2>Mock ServiceNow</h2>

        <p>
          ITSM incidents synchronized with the ServiceNow system.
        </p>

        <button
          className="refresh-button"
          onClick={fetchRecords}
        >
          Refresh
        </button>
      </section>

      {loading ? (
        <p>Loading ServiceNow records...</p>
      ) : records.length === 0 ? (
        <p>No ServiceNow records found.</p>
      ) : (
        <div className="servicenow-table-container">

          <table className="servicenow-table">

            <thead>
              <tr>
                <th>Incident</th>
                <th>Ticket ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Assignment Group</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {records.map((record) => (
                <tr key={record._id}>

                  <td>
                    <strong>
                      {record.incident_number}
                    </strong>
                  </td>

                  <td>
                    {record.ticket_id}
                  </td>

                  <td>
                    {record.description}
                  </td>

                  <td>
                    {record.category}
                  </td>

                  <td>
                    <span
                      className={`priority ${record.priority
                        ?.toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {record.priority}
                    </span>
                  </td>

                  <td>
                    {record.assignment_group}
                  </td>

                  <td>
                    <span className="ticket-status">
                      {record.status}
                    </span>
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

export default ServiceNow;