import React, { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [tweet, setTweet] = useState("");
  const [classification, setClassification] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");

  

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const typeEffect = async (text) => {
    setTyping("");
    for (let i = 0; i < text.length; i++) {
      await delay(30);
      setTyping((prev) => prev + text[i]);
    }
  };

  const analyzeTweet = async () => {
    if (!tweet.trim()) {
      alert("Please enter a valid tweet!");
      return;
    }
    setLoading(true);
    setClassification("");
    setJustification("");
    setTyping("");

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/analyze/`, {
        text: tweet });

      console.log("DEBUG: Response Data ->", response.data); // Debugging Output

      const explanation = response.data.justification || "No proper explanation provided.";

      setClassification(response.data.classification);
      setJustification(explanation);
      typeEffect(explanation);
    } catch (error) {
      alert("Error analyzing tweet.");
    }
    setLoading(false);
  };

  const fetchRedditPost = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/fetch_reddit/`);

      setTweet(response.data.post);
    } catch (error) {
      alert("Error fetching Reddit post.");
    }
    setLoading(false);
  };

  const clearText = () => {
    setTweet("");
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="container">
      <h1>🔍 Explainable DualLexiCaps + Mistral AI</h1>

      <textarea
        placeholder="Enter a tweet..."
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
      ></textarea>

      <div className="buttons">
        <button className="blue" onClick={analyzeTweet} disabled={loading}>
          Analyze Tweet
        </button>
        <button className="orange" onClick={fetchRedditPost} disabled={loading}>
          Fetch from Reddit
        </button>
        <button className="gray" onClick={clearText}>Clear</button>
        <button className="red" onClick={refreshPage}>Refresh</button>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="progress-bar"></div>
          <p className="loading-text">Analyzing tweet, please wait...</p>
        </div>
      )}

      {classification && (
        <div className={`result ${classification === "Hate" ? "hate" : "non-hate"}`}>
          <h2>{classification === "Hate" ? "🚨 Hate Speech Detected!" : "✅ Non-Hate Speech Detected!"}</h2>
          <p className="typing-effect">{typing}</p>
        </div>
      )}
    </div>
  );
}
