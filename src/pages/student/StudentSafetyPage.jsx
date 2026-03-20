import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import DiscoverPracticeCard from "../../components/student/DiscoverPracticeCard.jsx";

export default function StudentSafetyPage() {
  return (
    <AppShell
      title="Banking Safety"
      subtitle="Learn how to keep your money and account safe."
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
          Security
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: "30px", lineHeight: 1.1 }}>
          Keep your money safe
        </h3>

        <p style={{ margin: 0, maxWidth: "700px", lineHeight: 1.5, opacity: 0.92 }}>
          Real banking apps help you stay safe. Learn the simple rules to protect
          your account and avoid scams.
        </p>
      </div>

      <SectionCard title="Simple rule" description="Always remember this when using your bank.">
        <div
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: "#eef2ff",
            border: "1px solid #dbe4ff",
            fontWeight: 800,
            fontSize: "20px",
            textAlign: "center"
          }}
        >
          Stop • Think • Check
        </div>
      </SectionCard>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Keep your details private">
          <ul className="ph-simple-list">
            <li>Never share your PIN</li>
            <li>Never share your password</li>
            <li>Never share your bank login</li>
            <li>Never share your card details</li>
          </ul>

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              fontWeight: 600
            }}
          >
            Even if someone says they are the bank — do NOT tell them.
          </div>
        </SectionCard>

        <SectionCard title="Be careful on your phone">
          <ul className="ph-simple-list">
            <li>Texts asking for money</li>
            <li>Unknown phone calls</li>
            <li>Messages on social media</li>
          </ul>

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "#fff7ed",
              border: "1px solid #fed7aa"
            }}
          >
            If it feels urgent — stop and check first.
          </div>
        </SectionCard>
      </div>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Look after your card">
          <ul className="ph-simple-list">
            <li>Keep your card safe</li>
            <li>Do not lend it to anyone</li>
            <li>Cover your PIN at machines</li>
            <li>Report it if lost</li>
          </ul>
        </SectionCard>

        <SectionCard title="Stay safe online">
          <ul className="ph-simple-list">
            <li>Use trusted websites</li>
            <li>Look for the padlock symbol</li>
            <li>Check the website name</li>
            <li>Avoid unknown links</li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Never send money to strangers">
        <div style={{ display: "grid", gap: "12px" }}>
          {[
            "Banks will never ask for your PIN",
            "Banks will never ask you to move money",
            "Banks will never rush you",
            "Always check before sending money"
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
                fontWeight: 600
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="What to do if something feels wrong">
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            "Stop what you are doing",
            "Do NOT send money",
            "Tell a teacher or staff member",
            "Report the issue"
          ].map((step, i) => (
            <div
              key={step}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: "1px solid var(--border)",
                fontWeight: 600
              }}
            >
              {i + 1}. {step}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Try it yourself"
        description="Choose the safest action."
      >
        <DiscoverPracticeCard
          title="Safety check"
          question="Someone phones and says they are from the bank. They ask for your PIN to keep your account safe. What should you do?"
          choices={[
            "Tell them the PIN",
            "Hang up and tell staff",
            "Send them a message with your details later"
          ]}
          correctIndex={1}
          explanation="That is the safest choice. Banks do not ask for your PIN. Stop the call and tell a trusted adult or staff member."
        />
      </SectionCard>
    </AppShell>
  );
}