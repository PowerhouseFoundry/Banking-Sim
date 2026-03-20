import React, { useState } from "react";

export default function DiscoverPracticeCard({
  title,
  question,
  choices,
  correctIndex,
  explanation
}) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selectedIndex === correctIndex;

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "20px",
        background: "white",
        padding: "18px",
        boxShadow: "0 6px 16px rgba(20, 33, 61, 0.06)"
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "20px", marginBottom: "8px" }}>
        {title}
      </div>

      <div
        style={{
          fontSize: "15px",
          lineHeight: 1.5,
          color: "#334155",
          marginBottom: "14px"
        }}
      >
        {question}
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        {choices.map((choice, index) => {
          const isChosen = selectedIndex === index;

          return (
            <button
              key={choice}
              type="button"
              onClick={() => {
                setSelectedIndex(index);
                setSubmitted(false);
              }}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "14px",
                border: isChosen ? "2px solid #1d4ed8" : "1px solid var(--border)",
                background: isChosen ? "#eef2ff" : "#f8fafc",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="ph-button ph-button-primary"
          onClick={() => setSubmitted(true)}
          disabled={selectedIndex === null}
        >
          Check answer
        </button>

        <button
          type="button"
          className="ph-button ph-button-secondary"
          onClick={() => {
            setSelectedIndex(null);
            setSubmitted(false);
          }}
        >
          Reset
        </button>
      </div>

      {submitted ? (
        <div
          style={{
            marginTop: "14px",
            padding: "14px",
            borderRadius: "16px",
            background: isCorrect ? "#ecfdf5" : "#fff7ed",
            border: isCorrect ? "1px solid #bbf7d0" : "1px solid #fed7aa"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
            {isCorrect ? "Correct" : "Try again"}
          </div>
          <div style={{ lineHeight: 1.5 }}>{explanation}</div>
        </div>
      ) : null}
    </div>
  );
}