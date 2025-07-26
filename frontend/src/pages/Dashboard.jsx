import React, { useEffect, useState, useRef } from 'react'
import "../styles/Dashboard.css";
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Dashboard = () => {
  const [token, setToken] = useState(JSON.parse(localStorage.getItem("auth")) || "");
  const [data, setData] = useState({});
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const linkRef = useRef();
  const navigate = useNavigate();

  const fetchLuckyNumber = async () => {

    let axiosConfig = {
      headers: {
        'Authorization': `Bearer ${token}`
    }
    };

    try {
      const response = await axios.get("http://localhost:3000/api/v1/dashboard", axiosConfig);
      setData({ msg: response.data.msg, luckyNumber: response.data.secret });
    } catch (error) {
      toast.error(error.message);
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(response.data.history);
      setShowHistory(true);
    } catch (err) {
      toast.error("Failed to fetch history");
    }
  };

  useEffect(() => {
    fetchLuckyNumber();
    if(token === ""){
      navigate("/login");
      toast.warn("Please login first to access dashboard");
    }
  }, [token]);

  const handleAnalyzeLink = async (e) => {
    e.preventDefault();
    const url = linkRef.current.value;
    if (!url) {
      toast.error("Please enter a link");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/analyze",
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalyzeResult(response.data.result);
      toast.success("Analysis complete!");
    } catch (err) {
      toast.error("Failed to analyze link");
    }
    setLoading(false);
  };

  const handleGetSuggestion = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/v1/suggest",
        {
          tags: analyzeResult,
          url: linkRef.current.value
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestion(response.data.suggestion);
      toast.success("Suggestion received!");
    } catch (err) {
      toast.error("Failed to get suggestion");
    }
    setLoading(false);
  };

  return (
    <div className='dashboard-main'>
      <h1>Dashboard</h1>
      <p>Hi {data.msg}! {data.luckyNumber}</p>
      <form onSubmit={handleAnalyzeLink} style={{ margin: "20px 0" }}>
        <input type="text" ref={linkRef} placeholder="Enter a URL to analyze" style={{ padding: 8, width: 300 }} />
        <button type="submit" style={{ marginLeft: 10, padding: 8 }}>Analyze Link</button>
      </form>
      {loading && <div className="spinner"></div>}
      {analyzeResult && (
        <div style={{ marginTop: 20 }}>
          <h3>Analysis Result:</h3>
          <button onClick={handleGetSuggestion} style={{ marginBottom: 10, padding: 8 }}>Get OpenAI Suggestions</button>
          <div
            style={{
              maxHeight: 200,
              overflowY: "auto",
              background: "#f4f4f4",
              padding: 10,
              borderRadius: 8,
              marginLeft: 20,
              marginRight: 20,
              maxWidth: "95vw",
              overflowX: "auto"
            }}
          >
            <pre style={{ textAlign: "left", margin: 0, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(analyzeResult, null, 2)}
            </pre>
          </div>
          {suggestion && (
            <div style={{ marginTop: 20 }}>
              <h3>OpenAI Suggestions:</h3>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  background: "#e8f5e9",
                  padding: 10,
                  borderRadius: 8,
                  marginLeft: 20,
                  marginRight: 20,
                  maxWidth: "95vw",
                  overflowX: "auto"
                }}
              >
                <pre style={{ textAlign: "left", margin: 0, whiteSpace: "pre-wrap" }}>
                  {suggestion}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={() => navigate("/history")} style={{ margin: 20, padding: 8 }}>History</button>
      </div>
      {showHistory && (
        <div style={{ background: "#fff", border: "1px solid #ccc", padding: 20, maxHeight: 400, overflowY: "auto" }}>
          <h3>Analysis History</h3>
          <button onClick={() => setShowHistory(false)} style={{ float: "right" }}>Close</button>
          {history.length === 0 && <p>No history found.</p>}
          {history.map((item, idx) => (
            <div key={item._id || idx} style={{ marginBottom: 20, borderBottom: "1px solid #eee" }}>
              <strong>URL:</strong> {item.url}<br />
              <strong>Tags:</strong>
              <pre style={{ background: "#f4f4f4", padding: 10 }}>{JSON.stringify(item.tags, null, 2)}</pre>
              <strong>Suggestion:</strong>
              <pre style={{ background: "#e8f5e9", padding: 10 }}>{item.suggestion}</pre>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
      <Link to="/logout" className="logout-button">Logout</Link>
    </div>
  );
};

export default Dashboard;