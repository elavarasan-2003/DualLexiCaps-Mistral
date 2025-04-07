import React, { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [tweet, setTweet] = useState("");
  const [classification, setClassification] = useState("");
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Technology");

    const categories = [
    "HatePolitics",
    "Racism",
    "Sexism",
    "Homophobia",
    "ReligiousIntolerance",
    "Xenophobia",
    "Ableism",
    "HateSpeechMisinformation",
    "Technology",
    "Science",
    "Space",
    "CyberSecurity",
    "Gadgets",
    "Education",
    "Health",
    "Philosophy",
    "Culture",
    "HumanRights",
  ];

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
    if (!selectedCategory) {
      alert("Please select a category!");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/fetch_reddit/${selectedCategory}`);
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
    <div className={`container ${classification === "Hate" ? "hate" : classification ? "non-hate" : ""}`}>

      <h1>AI Powered Tweet Moderation</h1>

      <textarea
        placeholder="Enter a tweet..."
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
      ></textarea>

      <div className="buttons">
        <button className="blue" onClick={analyzeTweet} disabled={loading}>
          Analyze Tweet
        </button>

        <select
          className="dropdown"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

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

//<footer>
//  <p>© 2025 All Rights Reserved.</p>
 // <p>Developed by Elavarasan | Ashwin Kumar | Thillai Prabakar</p>
//</footer>

    </div>
  );
}
