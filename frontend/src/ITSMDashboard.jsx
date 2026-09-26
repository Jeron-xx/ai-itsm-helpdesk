import { useEffect, useState } from "react";

function ITSMDashboard({ onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/tickets"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load tickets");
      }

      setTickets(data.tickets || []);
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const totalTickets = tickets.length;

  const highPriorityTickets = tickets.filter(
    (ticket) => ticket.priority === "High"
  ).length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status !== "Completed" &&
      ticket.status !== "Closed"
  ).length;

  const escalatedTickets = tickets.filter(
    (ticket) => ticket.escalated === true
  ).length;

  return (
    <div className="dashboard-page">

      <section className="dashboard-header">
        <div>
          <h2>ITSM Dashboard</h2>
          <p>
            Monitor incidents, service requests and AI-assisted resolutions.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchTickets}
        >
          Refresh
        </button>
      </section>

      {/* STATISTICS */}

      <section className="dashboard-stats">

        <div className="stat-card">
          <span>Total Tickets</span>
          <strong>{totalTickets}</strong>
        </div>

        <div className="stat-card">
          <span>High Priority</span>
          <strong>{highPriorityTickets}</strong>
        </div>

        <div className="stat-card">
          <span>Open Tickets</span>
          <strong>{openTickets}</strong>
        </div>

        <div className="stat-card">
          <span>Escalated</span>
          <strong>{escalatedTickets}</strong>
        </div>

      </section>

      {/* TICKET TABLE */}

      <section className="ticket-section">

        <div className="section-title">
          <h3>Recent Tickets</h3>
        </div>

        {loading ? (
          <p>Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <div className="ticket-table-container">

            <table className="ticket-table">

              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignment Group</th>
                </tr>
              </thead>

              <tbody>

                {tickets.map((ticket) => (

                  <tr
                    key={ticket._id}
                    onClick={() => onSelectTicket(ticket)}
                    className="ticket-row"
                  >

                    <td>
                      <strong>
                        {ticket._id.slice(-6)}
                      </strong>
                    </td>

                    <td>
                      {ticket.description}
                    </td>

                    <td>
                      {ticket.type}
                    </td>

                    <td>
                      {ticket.category}
                    </td>

                    <td>
                      <span
                        className={`priority ${ticket.priority
                          ?.toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>

                    <td>
                      <span className="ticket-status">
                        {ticket.status}
                      </span>
                    </td>

                    <td>
                      {ticket.assignment_group}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      <p className="dashboard-hint">
        Click a ticket to view its AI analysis and knowledge sources.
      </p>

    </div>
  );
}

export default ITSMDashboard;