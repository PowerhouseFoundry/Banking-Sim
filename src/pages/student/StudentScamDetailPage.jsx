import React from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";

const scamDetails = {
  "hi-mum": {
    title: "“Hi Mum” text scam",
    icon: "📱",
    level: "High risk",
    intro: "A scammer pretends to be your child and asks for money urgently.",
    example: "Hi Mum, I have lost my phone. Can you send me money to this new bank account?",
    warningSigns: [
      "It comes from a new number",
      "The message feels urgent",
      "They ask for money quickly"
    ],
    whatToDo: [
      "Do not send money",
      "Call the real person another way",
      "Tell staff or a trusted adult"
    ]
  },
  delivery: {
    title: "Fake delivery text",
    icon: "📦",
    level: "Common",
    intro: "You get a message saying you missed a parcel and need to click a link.",
    example: "Royal Mail: your parcel could not be delivered. Pay a small fee here.",
    warningSigns: [
      "You were not expecting a parcel",
      "The link looks strange",
      "It asks for payment or bank details"
    ],
    whatToDo: [
      "Do not click the link",
      "Delete the message",
      "Check the company website yourself if needed"
    ]
  },
  bank: {
    title: "Bank impersonation",
    icon: "🏦",
    level: "High risk",
    intro: "A scammer pretends to be your bank by phone, text, or email.",
    example: "Your account is at risk. Move your money now to keep it safe.",
    warningSigns: [
      "They sound urgent",
      "They ask for your PIN or password",
      "They tell you to move money"
    ],
    whatToDo: [
      "Stop the call or message",
      "Do not share details",
      "Contact your bank in the normal way"
    ]
  },
  job: {
    title: "Fake job scam",
    icon: "💼",
    level: "Common",
    intro: "A fake employer offers you work but asks for money first.",
    example: "You got the job. Pay a training fee now to start tomorrow.",
    warningSigns: [
      "They ask for money up front",
      "The offer sounds too easy",
      "There is pressure to act fast"
    ],
    whatToDo: [
      "Do not pay anything",
      "Check if the company is real",
      "Ask staff to help you check"
    ]
  },
  social: {
    title: "Social media scam",
    icon: "💬",
    level: "Common",
    intro: "A seller advertises something online, takes your money, and never sends it.",
    example: "A phone or trainer deal online that disappears after payment.",
    warningSigns: [
      "The price is too good",
      "The seller wants bank transfer only",
      "There is no trusted payment method"
    ],
    whatToDo: [
      "Be careful with online sellers",
      "Use trusted payment methods",
      "Tell staff if something feels wrong"
    ]
  },
  ai: {
    title: "AI voice scam",
    icon: "🎤",
    level: "Newer scam",
    intro: "A fake voice message sounds like someone you know and asks for help or money.",
    example: "A voice note says a family member is in trouble and needs money now.",
    warningSigns: [
      "Urgent request for money",
      "Something feels slightly off",
      "They want you to act before checking"
    ],
    whatToDo: [
      "Pause and check first",
      "Contact the real person another way",
      "Do not send money until you are sure"
    ]
  }
};

export default function StudentScamDetailPage() {
  const { id } = useParams();
  const scam = scamDetails[id];

  if (!scam) {
    return (
      <AppShell title="Scam not found" subtitle="Go back and choose another topic.">
        <SectionCard title="Scam not found">
          <Link className="ph-button ph-button-secondary ph-button-link" to="/student/scams">
            Back to scams
          </Link>
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell title={scam.title} subtitle="Learn how this scam works.">
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
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "14px"
          }}
        >
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "20px",
              background: "rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
              fontSize: "34px"
            }}
          >
            {scam.icon}
          </div>

          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: 0.82,
                marginBottom: "6px"
              }}
            >
              Scam alert
            </div>

            <div style={{ fontSize: "30px", fontWeight: 700, lineHeight: 1.1 }}>
              {scam.title}
            </div>
          </div>
        </div>

        <span
          style={{
            display: "inline-block",
            padding: "7px 12px",
            borderRadius: "999px",
            background: scam.level === "High risk" ? "#fee2e2" : "#eef2ff",
            color: scam.level === "High risk" ? "#b91c1c" : "#1d4ed8",
            fontSize: "12px",
            fontWeight: 700
          }}
        >
          {scam.level}
        </span>

        <p style={{ margin: "16px 0 0", maxWidth: "760px", lineHeight: 1.5, opacity: 0.95 }}>
          {scam.intro}
        </p>
      </div>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Example message" description="This is the kind of message a scammer might send.">
          <div
            style={{
              padding: "16px",
              borderRadius: "16px",
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              fontWeight: 600,
              lineHeight: 1.5
            }}
          >
            {scam.example}
          </div>
        </SectionCard>

        <SectionCard title="Quick safety check" description="Pause and ask yourself these questions.">
          <div
            style={{
              display: "grid",
              gap: "10px"
            }}
          >
            {[
              "Was I expecting this message?",
              "Is someone rushing me?",
              "Are they asking for money or bank details?",
              "Can I check another way first?"
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
      </div>

      <div className="ph-grid ph-grid-2">
        <SectionCard title="Warning signs" description="Things that should make you stop and think.">
          <div style={{ display: "grid", gap: "10px" }}>
            {scam.warningSigns.map((item) => (
              <div
                key={item}
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#fff1f2",
                  border: "1px solid #fecdd3"
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="What should I do?" description="Safe next steps if you think a message might be a scam.">
          <div style={{ display: "grid", gap: "10px" }}>
            {scam.whatToDo.map((item) => (
              <div
                key={item}
                style={{
                  padding: "12px 14px",
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  border: "1px solid #bbf7d0"
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Keep your money safe" description="Simple rule to remember.">
        <div
          style={{
            padding: "16px",
            borderRadius: "18px",
            background: "#eef2ff",
            border: "1px solid #dbe4ff",
            fontWeight: 700,
            fontSize: "18px",
            lineHeight: 1.4
          }}
        >
          Stop. Think. Check.  
          Never send money or share details until you are sure.
        </div>

        <div className="ph-inline-actions" style={{ marginTop: "16px" }}>
          <Link className="ph-button ph-button-secondary ph-button-link" to="/student/scams">
            Back to scams
          </Link>
        </div>
      </SectionCard>
    </AppShell>
  );
}