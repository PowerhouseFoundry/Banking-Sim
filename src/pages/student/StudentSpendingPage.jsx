import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import DiscoverPracticeCard from "../../components/student/DiscoverPracticeCard.jsx";

export default function StudentSpendingPage() {
  return (
    <AppShell
      title="Spending & Budgeting"
      subtitle="Learn how to manage your money well."
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
          Money skills
        </div>

        <h3 style={{ margin: "0 0 10px", fontSize: "30px", lineHeight: 1.1 }}>
          Spend carefully and plan ahead
        </h3>

        <p style={{ margin: 0, maxWidth: "700px", lineHeight: 1.5, opacity: 0.92 }}>
          Real banking apps help you track your money. Learning how to budget means
          thinking before you spend and keeping enough money for what you need.
        </p>
      </div>

      <SectionCard title="What is budgeting?" description="A simple way to understand it.">
        <div
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: "#eef2ff",
            border: "1px solid #dbe4ff",
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: 1.5
          }}
        >
          Budgeting means planning how you use your money.
        </div>
      </SectionCard>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Questions to ask before spending">
          <div style={{ display: "grid", gap: "10px" }}>
            {[
              "Do I need this?",
              "Can I afford this?",
              "How much money will I have left?",
              "Should I save some instead?"
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

        <SectionCard title="Good habits">
          <ul className="ph-simple-list">
            <li>Check your balance often</li>
            <li>Do not spend everything at once</li>
            <li>Save some money if you can</li>
            <li>Think before tapping your card</li>
          </ul>
        </SectionCard>
      </div>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Needs and wants">
          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              marginBottom: "12px"
            }}
          >
            <strong>Needs</strong>
            <div style={{ marginTop: "4px" }}>
              Things you need, like food, travel, or bills.
            </div>
          </div>

          <div
            style={{
              padding: "12px",
              borderRadius: "14px",
              background: "#fff7ed",
              border: "1px solid #fed7aa"
            }}
          >
            <strong>Wants</strong>
            <div style={{ marginTop: "4px" }}>
              Things you would like, like treats or extra shopping.
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Simple example">
          <div style={{ display: "grid", gap: "10px" }}>
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#ffffff",
                border: "1px solid var(--border)"
              }}
            >
              Money in: <strong>£50</strong>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#ffffff",
                border: "1px solid var(--border)"
              }}
            >
              Save: <strong>£20</strong>
            </div>

            <div
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#ffffff",
                border: "1px solid var(--border)"
              }}
            >
              Spend: <strong>£30</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="If you are not sure">
        <div style={{ display: "grid", gap: "10px" }}>
          {[
            "Pause before paying",
            "Check your balance",
            "Ask staff to help you think about it",
            "Make a safe choice"
          ].map((step, i) => (
            <div
              key={step}
              style={{
                padding: "12px 14px",
                borderRadius: "14px",
                background: "#fff1f2",
                border: "1px solid #fecdd3",
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
        description="Choose the best budgeting choice."
      >
        <DiscoverPracticeCard
          title="Budget check"
          question="You have £50. You want to buy something for £45, but you also need £20 later in the week. What is the safest choice?"
          choices={[
            "Spend the £45 now",
            "Wait and keep enough money for what you need later",
            "Spend all of it and worry later"
          ]}
          correctIndex={1}
          explanation="That is the best choice. A good budget means keeping enough money for the important things you still need."
        />
      </SectionCard>
    </AppShell>
  );
}