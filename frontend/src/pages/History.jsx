import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("auth")) || "";

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(response.data.history);
    } catch (err) {
      toast.error("Failed to fetch history");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await axios.delete(
        `http://localhost:3000/api/v1/history/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Deleted!");
      setHistory(history.filter(item => item._id !== id));
      if (selected && selected._id === id) setSelected(null);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Analysis History</h2>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>Back</button>
      {selected && (
        <div style={{ marginBottom: 30, border: "2px solid #333", padding: 20, background: "#fafafa" }}>
          <h3>Details</h3>
          <strong>URL:</strong> {selected.url}<br />
          <strong>Tags:</strong>
          <pre style={{ background: "#f4f4f4", padding: 10 }}>{JSON.stringify(selected.tags, null, 2)}</pre>
          <strong>Suggestion:</strong>
          <pre style={{ background: "#e8f5e9", padding: 10 }}>{selected.suggestion}</pre>
          <small>{new Date(selected.createdAt).toLocaleString()}</small>
          <div>
            <button onClick={() => setSelected(null)} style={{ marginTop: 10 }}>Close</button>
          </div>
        </div>
      )}
      {history.length === 0 && <p>No history found.</p>}
      {history.map((item, idx) => (
        <div key={item._id || idx} style={{ marginBottom: 20, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setSelected(item)}>
            <strong>URL:</strong> {item.url}<br />
            <small>{new Date(item.createdAt).toLocaleString()}</small>
          </div>
          <button onClick={() => handleDelete(item._id)} style={{ marginLeft: 20, color: "white", background: "red", border: "none", padding: "8px 16px", borderRadius: 5 }}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default History;