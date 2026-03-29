import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentAccount, setCardStatus } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentCardsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const account = getStudentAccount(user.studentId);

  const isFrozen = account?.cardStatus === "frozen";

  function handleFreeze() {
    setCardStatus(user.studentId, "frozen");
  }

  function handleUnfreeze() {
    setCardStatus(user.studentId, "active");
  }

  return (
    <AppShell title="Cards" subtitle="Manage your training bank card.">
      <div className="ph-student-home-split">
        <SectionCard title="Debit card" description="Current card status.">
          <div className="ph-mobile-card-panel">
<div className="ph-mobile-card-wrapper">
  
  {/* FRONT OF CARD */}
  <div className="ph-mobile-card-visual">
    <div className="ph-mobile-card-brand">Powerhouse Banking</div>

    <div className="ph-mobile-card-number">1234 5678 9012 3456</div>

    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
      <div>
        <div style={{ fontSize: "10px", opacity: 0.7 }}>VALID THRU</div>
        <div style={{ fontWeight: 600 }}>12/28</div>
      </div>
    </div>

    <div className="ph-mobile-card-name">{user.name}</div>
  </div>

  {/* BACK OF CARD */}
  <div
    style={{
      marginTop: "12px",
      borderRadius: "16px",
      overflow: "hidden",
      background: "#0f172a",
      color: "white"
    }}
  >
    {/* Magnetic strip */}
    <div style={{ height: "40px", background: "#111", marginTop: "16px" }} />

    {/* Signature + CVC */}
    <div style={{ padding: "16px" }}>
      <div
        style={{
          background: "#e5e7eb",
          height: "36px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: "10px",
          color: "#111",
          fontWeight: 700
        }}
      >
        123
      </div>

      <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.8 }}>
        CVC
      </div>

      <div style={{ fontSize: "11px", marginTop: "10px", opacity: 0.6 }}>
        Training card only · Not a real bank card
      </div>
    </div>
  </div>

</div>

            <div className="ph-account-detail-row" style={{ marginTop: "16px" }}>
              <span>Status</span>
              <strong>{account?.cardStatus || "active"}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Card controls" description="Used in real banking apps if a card is lost or suspicious.">
          <div className="ph-mobile-action-grid">
            <button
              className="ph-mobile-action-button"
              type="button"
              onClick={handleFreeze}
            >
              Freeze card
            </button>
            <button
              className="ph-mobile-action-button"
              type="button"
              onClick={handleUnfreeze}
            >
              Unfreeze card
            </button>
          </div>

          <p className="ph-muted" style={{ marginTop: "12px" }}>
            {isFrozen
              ? "Your card is frozen. Payments will be blocked until you unfreeze it."
              : "Your card is active and ready to use."}
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}