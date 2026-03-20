import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import DiscoverPracticeCard from "../../components/student/DiscoverPracticeCard.jsx";

export default function StudentCardsInfoPage() {
  return (
    <AppShell
      title="Cards"
      subtitle="Learn how bank cards work and how to use them safely."
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
          Cards
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: "30px", lineHeight: 1.1 }}>
          Understand your bank card
        </h3>

        <p style={{ margin: 0, maxWidth: "700px", lineHeight: 1.5, opacity: 0.92 }}>
          Learn what a debit card is, how it is used, and how to keep it safe.
        </p>
      </div>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="What is a debit card?">
          <p>
            A debit card lets you spend money from <strong>your own bank account</strong>.
          </p>

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "#eef2ff",
              border: "1px solid #dbe4ff",
              fontWeight: 600
            }}
          >
            In this training bank, students use a debit-style card system.
          </div>
        </SectionCard>

        <SectionCard title="What is a credit card?">
          <p>
            A credit card uses <strong>borrowed money</strong>. You must pay it back later.
          </p>

          <div
            style={{
              marginTop: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "#fff7ed",
              border: "1px solid #fed7aa"
            }}
          >
            This is different from a debit card, which uses money already in your account.
          </div>
        </SectionCard>
      </div>

      <SectionCard title="What can a card be used for?">
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            "Paying in shops",
            "Paying online",
            "Checking card details in your app",
            "Managing a lost or blocked card"
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#f8fafc",
                border: "1px solid var(--border)",
                fontWeight: 600
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="How to keep your card safe">
          <ul className="ph-simple-list">
            <li>Keep your card in a safe place</li>
            <li>Do not lend it to other people</li>
            <li>Cover your PIN when typing it</li>
            <li>Tell staff if your card is lost</li>
          </ul>
        </SectionCard>

        <SectionCard title="Warning signs">
          <ul className="ph-simple-list">
            <li>A payment you do not recognise</li>
            <li>Your card is missing</li>
            <li>Someone asks for your PIN</li>
            <li>A website does not feel safe</li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="What should I do if something is wrong?">
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            "Stop using the card",
            "Check your transactions",
            "Tell a teacher or staff member",
            "Report the payment if needed"
          ].map((step, i) => (
            <div
              key={step}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#ecfdf5",
                border: "1px solid #bbf7d0",
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
          title="Card check"
          question="Your friend asks to borrow your bank card for a quick payment and promises to give it straight back. What should you do?"
          choices={[
            "Let them borrow it",
            "Say no and keep your card safe",
            "Give them the card but not the PIN"
          ]}
          correctIndex={1}
          explanation="That is the safest choice. Your bank card should only be used by you."
        />
      </SectionCard>
    </AppShell>
  );
}