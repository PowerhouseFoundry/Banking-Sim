import React, { useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentAccount, setCardStatus } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentCardsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const account = getStudentAccount(user.studentId);
  const [showBack, setShowBack] = useState(false);

  const isFrozen = account?.cardStatus === "frozen";

  function handleFreeze() {
    setCardStatus(user.studentId, "frozen");
  }

  function handleUnfreeze() {
    setCardStatus(user.studentId, "active");
  }

  function handleFlip() {
    setShowBack((current) => !current);
  }

  return (
    <AppShell title="Cards" subtitle="Manage your training bank card.">
      <div className="ph-student-home-split">
        <SectionCard title="Debit card" description="Current card status.">
          <div className="ph-mobile-card-panel">
            <button
              type="button"
              onClick={handleFlip}
              style={{
                width: "100%",
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                textAlign: "left"
              }}
              aria-label={showBack ? "Show front of card" : "Show back of card"}
            >
              <div
                style={{
                  perspective: "1200px"
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    minHeight: "190px",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s ease",
                    transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  {/* FRONT */}
                  <div
                    className="ph-mobile-card-visual"
                    style={{
                      position: "absolute",
                      inset: 0,
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden"
                    }}
                  >
                    <div className="ph-mobile-card-brand">Powerhouse Banking</div>

                    <div className="ph-mobile-card-number">1234 5678 9012 3456</div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        gap: "12px"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "10px", opacity: 0.7, letterSpacing: "0.06em" }}>
                          VALID THRU
                        </div>
                        <div style={{ fontWeight: 700 }}>12/28</div>
                      </div>

                      <div style={{ fontSize: "12px", opacity: 0.8 }}>
                        Tap card to flip
                      </div>
                    </div>

                    <div className="ph-mobile-card-name">{user.name}</div>
                  </div>

                  {/* BACK */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "22px",
                      background: "linear-gradient(135deg, #0b1630, #19335f)",
                      color: "white",
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      overflow: "hidden"
                    }}
                  >
                    <div style={{ height: "42px", background: "#0a0a0a", marginTop: "18px" }} />

                    <div style={{ padding: "18px" }}>
                      <div
                        style={{
                          background: "#e5e7eb",
                          height: "38px",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          paddingRight: "12px",
                          color: "#111827",
                          fontWeight: 800,
                          letterSpacing: "0.08em"
                        }}
                      >
                       5143 323
                      </div>

                      <div
                        style={{
                          marginTop: "6px",
                          fontSize: "11px",
                          opacity: 0.8
                        }}
                      >
                        CVC
                      </div>

                      <div
                        style={{
                          marginTop: "14px",
                          fontSize: "11px",
                          lineHeight: 1.4,
                          opacity: 0.72
                        }}
                      >
                        Training card only · Not a real bank card
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "0 18px 16px",
                        fontSize: "12px",
                        opacity: 0.8
                      }}
                    >
                      Tap card to flip back
                    </div>
                  </div>
                </div>
              </div>
            </button>

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