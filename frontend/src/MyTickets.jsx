import { useEffect, useState } from "react";

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/api/tickets/my-tickets?employee_id=employee"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();

      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return <p>Loading your tickets...</p>;
  }

  if (error) {
    return (
      <section className="my-tickets">
        <h2>My Tickets</h2>
        <p>{error}</p>
        <button onClick={fetchTickets}>Retry</button>
      </section>
    );
  }

  return (
    <section className="my-tickets">
      <div className="my-tickets-header">
        <h2>My Tickets</h2>
        <button onClick={fetchTickets}>Refresh</button>
      </div>

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket, index) => (
            <div
              className="ticket-card"
              key={ticket._id || ticket.id || index}
            >
              <h3>{ticket.description || ticket.title || "Helpdesk Ticket"}</h3>

              <p>
                <strong>Category:</strong> {ticket.category || "N/A"}
              </p>

              <p>
                <strong>Priority:</strong> {ticket.priority || "N/A"}
              </p>

              <p>
                <strong>Status:</strong> {ticket.status || "New"}
              </p>

              <p>
                <strong>Assignment Group:</strong>{" "}
                {ticket.assignment_group || ticket.assignmentGroup || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MyTickets;