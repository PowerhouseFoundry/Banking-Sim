import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  createFraudReport,
  getStudentTransactions,
  getStudentFraudReports
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

const starterReasons = [
  "I do not recognise this payment.",
  "I did not buy this.",
  "I want staff to check this with me."
];

export default function StudentReportPage() {
  useBankRefresh();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const transactions = getStudentTransactions(user.studentId);
  const reports = getStudentFraudReports(user.studentId);

  const queryTransactionId = searchParams.get("transactionId") || "";

  const [selectedId, setSelectedId] = useState(
    queryTransactionId ||
      transactions.find((item) => item.suspicious)?.id ||
      transactions[0]?.id ||
      ""
  );

  const [message, setMessage] = useState(starterReasons[0]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (queryTransactionId) {
      setSelectedId(queryTransactionId);
    }
  }, [queryTransactionId]);

  const selectedTransaction = useMemo(
    () => transactions.find((transaction) => transaction.id === selectedId),
    [selectedId, transactions]
  );

  function handleSubmit(event) {
    event.preventDefault();
    if (!selectedId) return;

    createFraudReport({
      studentId: user.studentId,
      transactionId: selectedId,
      reason: message
    });

    setSubmitted(true);
  }

  return (
    <AppShell title="Report a payment" subtitle="Tell staff if a payment looks unusual.">
      <SectionCard
        title="Suspicious payment report"
        description="Choose the payment and explain why you want staff to check it."
      >
        <form className="ph-form" onSubmit={handleSubmit}>
          <label className="ph-field">
            <span>Which payment are you checking?</span>
            <select
              className="ph-select"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {transactions.map((transaction) => (
                <option key={transaction.id} value={transaction.id}>
                  {transaction.date} - {transaction.description} (
                  {transaction.amount < 0 ? "-" : "+"}£
                  {Math.abs(transaction.amount).toFixed(2)})
                </option>
              ))}
            </select>
          </label>

          {selectedTransaction ? (
            <div className="ph-callout ph-callout-soft">
              <strong>Selected payment:</strong> {selectedTransaction.description} ·{" "}
              {selectedTransaction.category} ·{" "}
              {selectedTransaction.amount < 0 ? "-" : "+"}£
              {Math.abs(selectedTransaction.amount).toFixed(2)}
            </div>
          ) : null}

          <label className="ph-field">
            <span>Why are you worried about this payment?</span>
            <select
              className="ph-select"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            >
              {starterReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </label>

          <button className="ph-button ph-button-primary" type="submit">
            Send report
          </button>
        </form>

        {submitted ? (
          <div className="ph-success-box">
            Your report has been saved and sent to staff.
          </div>
        ) : null}
      </SectionCard>

      <SectionCard
        title="Your reports"
        description="See your message and the staff response for each report."
      >
        {reports.length === 0 ? (
          <p className="ph-muted">You have not submitted any reports yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {reports.map((report) => (
              <div
                key={report.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "16px",
                  background: "var(--panel-soft)"
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: "6px" }}>
                  {report.transaction?.description || "Payment"}
                </div>

                <div className="ph-muted" style={{ fontSize: "14px", marginBottom: "10px" }}>
                  {report.transaction?.date || report.submittedAt} ·{" "}
                  {report.transaction?.amount < 0 ? "-£" : "£"}
                  {Math.abs(Number(report.transaction?.amount || 0)).toFixed(2)}
                </div>

                <div style={{ marginBottom: "10px" }}>
                  Status: <strong>{report.status === "Resolved" ? "Resolved" : "Pending"}</strong>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "10px"
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <strong>What you said</strong>
                    <div style={{ marginTop: "4px" }}>{report.reason}</div>
                  </div>

                  {report.status === "Resolved" ? (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        background: "#eef2ff",
                        border: "1px solid #dbe4ff"
                      }}
                    >
                      <strong>Message from staff</strong>
                      <div style={{ marginTop: "4px" }}>
                        {report.resolutionMessage || "Your report has been reviewed."}
                      </div>

                      <div style={{ marginTop: "10px", fontSize: "14px" }}>
                        Refund: <strong>{report.resolutionRefunded ? "Yes" : "No"}</strong>
                      </div>

                      {report.resolvedAt ? (
                        <div style={{ marginTop: "4px", fontSize: "14px" }}>
                          Resolved on: <strong>{report.resolvedAt}</strong>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        background: "#fff7ed",
                        border: "1px solid #fed7aa"
                      }}
                    >
                      <strong>Waiting for staff</strong>
                      <div style={{ marginTop: "4px" }}>
                        Staff have not resolved this report yet.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}