import { useEffect, useState } from "react";

function SoftwareRequests() {
  const [requests, setRequests] = useState([]);

  const [software, setSoftware] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/software-requests"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load software requests");
      }

      setRequests(data.software_requests || []);
    } catch (error) {
      console.error("Error loading software requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const createRequest = async (e) => {
    e.preventDefault();

    if (!software.trim() || !description.trim()) {
      alert("Please enter both software and description.");
      return;
    }

    try {
      setCreating(true);

      const response = await fetch(
        "http://127.0.0.1:8000/api/software-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            software: software,
            description: description,
            requested_by: "Employee",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create request");
      }

      alert("Software request created successfully!");

      setSoftware("");
      setDescription("");

      fetchRequests();
    } catch (error) {
      alert(error.message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (requestId, action) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/software-requests/${requestId}/${action}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update request");
      }

      fetchRequests();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="software-page">

      <section className="software-header">
        <h2>Software Requests</h2>

        <p>
          Manage employee software requests and provisioning.
        </p>
      </section>

      {/* CREATE SOFTWARE REQUEST */}

      <section className="request-form-card">

        <h3>Create Software Request</h3>

        <form onSubmit={createRequest}>

          <div className="form-group">
            <label>Software</label>

            <input
              type="text"
              value={software}
              onChange={(e) => setSoftware(e.target.value)}
              placeholder="Example: Visual Studio Code"
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Example: Install Visual Studio Code on company computer"
              rows="4"
            />
          </div>

          <button
            type="submit"
            className="create-request-button"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create Request"}
          </button>

        </form>

      </section>

      {/* REQUEST LIST */}

      <section className="software-list">

        <div className="software-list-header">

          <h3>Software Requests</h3>

          <button
            className="refresh-button"
            onClick={fetchRequests}
          >
            Refresh
          </button>

        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <p>No software requests found.</p>
        ) : (
          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>Software</th>
                  <th>Description</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {requests.map((request) => (

                  <tr key={request._id}>

                    <td>
                      <strong>{request.software}</strong>
                    </td>

                    <td>
                      {request.description}
                    </td>

                    <td>
                      {request.requested_by}
                    </td>

                    <td>
                      <span className="status">
                        {request.status}
                      </span>
                    </td>

                    <td>

                      {request.status === "Pending Approval" && (
                        <button
                          className="action-button"
                          onClick={() =>
                            updateStatus(request._id, "approve")
                          }
                        >
                          Approve
                        </button>
                      )}

                      {request.status === "Approved" && (
                        <button
                          className="action-button"
                          onClick={() =>
                            updateStatus(request._id, "provision")
                          }
                        >
                          Provision
                        </button>
                      )}

                      {request.status === "Provisioning" && (
                        <button
                          className="action-button"
                          onClick={() =>
                            updateStatus(request._id, "complete")
                          }
                        >
                          Complete
                        </button>
                      )}

                      {request.status === "Completed" && (
                        <span className="completed">
                          ✓ Completed
                        </span>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}

export default SoftwareRequests;