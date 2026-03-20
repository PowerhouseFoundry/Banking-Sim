import React from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import DiscoverPracticeCard from "../../components/student/DiscoverPracticeCard.jsx";

const scams = [
  {
    id: "hi-mum",
    title: "“Hi Mum” text scam",
    summary: "A message pretending to be your child asking for money.",
    level: "High risk",
    icon: "📱"
  },
  {
    id: "delivery",
    title: "Fake delivery text",
    summary: "Messages about missed parcels asking you to click a link.",
    level: "Common",
    icon: "📦"
  },
  {
    id: "bank",
    title: "Bank impersonation",
    summary: "Calls or texts pretending to be your bank.",
    level: "High risk",
    icon: "🏦"
  },
  {
    id: "job",
    title: "Fake job scam",
    summary: "Online job offers that ask for money first.",
    level: "Common",
    icon: "💼"
  },
  {
    id: "social",
    title: "Social media scam",
    summary: "Buying items online that never arrive.",
    level: "Common",
    icon: "💬"
  },
  {
    id: "ai",
    title: "AI voice scam",
    summary: "Fake voices pretending to be someone you know.",
    level: "Newer scam",
    icon: "🎤"
  }
];

export default function StudentScamsPage() {
  return (
    <AppShell
      title="Scams & Fraud"
      subtitle="Learn about common scams and how to stay safe."
    >
      <div
        style={{
          borderRadius: "24px",
          padding: "24px",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 100%)",
          color: "white",
          marginBottom: "20px",
          boxShadow: "0 12px 28px rgba(15, 23, 42, 0.18)"
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginBottom: "10px"
          }}
        >
          Fraud and security
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: "30px", lineHeight: 1.1 }}>
          Latest scam alerts
        </h3>

        <p style={{ margin: 0, maxWidth: "700px", lineHeight: 1.5, opacity: 0.92 }}>
          Real banking apps often highlight current scams in one place. Tap a topic
          below to learn what it looks like, warning signs, and what action to take.
        </p>
      </div>

      <SectionCard
        title="Scam library"
        description="Choose a scam to read more."
      >
        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
          }}
        >
          {scams.map((scam) => (
            <Link
              key={scam.id}
              to={`/student/scams/${scam.id}`}
              style={{
                display: "block",
                textDecoration: "none",
                color: "inherit",
                border: "1px solid var(--border)",
                borderRadius: "22px",
                background: "white",
                padding: "18px",
                boxShadow: "0 8px 20px rgba(20, 33, 61, 0.07)",
                minHeight: "180px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "18px",
                    background: "#eef2ff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "26px",
                    flexShrink: 0
                  }}
                >
                  {scam.icon}
                </div>

                <span
                  style={{
                    flexShrink: 0,
                    padding: "6px 10px",
                    borderRadius: "999px",
                    background: scam.level === "High risk" ? "#fee2e2" : "#eef2ff",
                    color: scam.level === "High risk" ? "#b91c1c" : "#1d4ed8",
                    fontSize: "12px",
                    fontWeight: 700
                  }}
                >
                  {scam.level}
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: "19px", marginBottom: "8px" }}>
                {scam.title}
              </div>

              <div
                className="ph-muted"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.45,
                  marginBottom: "14px"
                }}
              >
                {scam.summary}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1d4ed8"
                }}
              >
                Read more →
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Try it yourself"
        description="Read the message and decide what the safest action is."
      >
        <DiscoverPracticeCard
          title="Scam check"
          question="You get a text saying: ‘Hi Mum, I lost my phone. Please send money to this new bank account now.’ What should you do first?"
          choices={[
            "Send the money quickly",
            "Reply and ask for bank details",
            "Call the real person another way and check first"
          ]}
          correctIndex={2}
          explanation="That is the safest choice. Stop and check using a trusted number before sending any money."
        />
      </SectionCard>
    </AppShell>
  );
}