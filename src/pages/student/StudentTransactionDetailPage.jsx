import React from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { getTransactionById, getStudentFraudReports } from "../../services/bankService.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentTransactionDetailPage() {
  useBankRefresh();
  const { user } = useAuth();
  const { transactionId } = useParams();
  const transaction = getTransactionById(transactionId);
  const reports = getStudentFraudReports(user.studentId).filter((item) => item.transactionId === transactionId);

  if (!transaction || transaction.studentId !== user.studentId) {
    return (
      <AppShell title="Transaction details" subtitle="Read each payment carefully.">
        <EmptyState title="Payment not found" message="This payment could not be found in your account." />
      </AppShell>
    );
  }

  return (
    <AppShell title="Transaction details" subtitle="Use this page to practise checking one payment at a time.">
      <div className="ph-grid ph-grid-2">
        <SectionCard title="Payment summary" description="Key details for this payment.">
          <ul className="ph-simple-list">
            <li>Description: <strong>{transaction.description}</strong></li>
            <li>Date: <strong>{transaction.date}</strong></li>
            <li>Category: <strong>{transaction.category}</strong></li>
            <li>Amount: <strong className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>{transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}</strong></li>
            <li>Status: {transaction.suspicious ? <span className="ph-badge ph-badge-warning">Check this payment</span> : <span className="ph-badge">Looks normal</span>}</li>
          </ul>
          <div className="ph-inline-actions">
            <Link className="ph-button ph-button-primary ph-button-link" to={`/student/report?transactionId=${transaction.id}`}>Report this payment</Link>
            <Link className="ph-button ph-button-secondary ph-button-link" to="/student/transactions">Back to all transactions</Link>
          </div>
        </SectionCard>

        <SectionCard title="What should I do?" description="A simple reminder for students.">
          <div className="ph-callout ph-callout-soft">
            <strong>Good checking questions</strong>
            <ul className="ph-simple-list">
              <li>Do I remember buying this?</li>
              <li>Does the amount look right?</li>
              <li>Should this payment be on my account?</li>
            </ul>
          </div>
          {transaction.suspicious ? (
            <div className="ph-callout ph-callout-warning">
              <strong>This payment has been marked for checking.</strong>
              <p className="ph-muted">Open the report page if you want staff to review it with you.</p>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard title="Reports for this payment" description="Any reports already sent about this transaction.">
        {reports.length === 0 ? (
          <EmptyState title="No report sent yet" message="You have not sent a check request for this payment yet." />
        ) : (
          <div className="ph-tile-grid">
        {reports.map((report) => (
  <div className="ph-tile" key={report.id} style={{ textAlign: "left" }}>
    
    <h4>{report.status}</h4>

    <div style={{ display: "grid", gap: "10px", marginTop: "8px" }}>
      
      {/* Student message */}
      <div
        style={{
          padding: "10px",
          borderRadius: "10px",
          background: "#ffffff",
          border: "1px solid var(--border)"
        }}
      >
        <strong>What you said</strong>
        <div style={{ marginTop: "4px" }}>{report.reason}</div>
      </div>

      {/* Staff response */}
      {report.status === "Resolved" ? (
        <div
          style={{
            padding: "10px",
            borderRadius: "10px",
            background: "#eef2ff",
            border: "1px solid #dbe4ff"
          }}
        >
          <strong>Message from staff</strong>

          <div style={{ marginTop: "4px" }}>
            {report.resolutionMessage || "Your report has been reviewed."}
          </div>

          <div style={{ marginTop: "8px", fontSize: "14px" }}>
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
            padding: "10px",
            borderRadius: "10px",
            background: "#fff7ed",
            border: "1px solid #fed7aa"
          }}
        >
          <strong>Waiting for staff</strong>
          <div style={{ marginTop: "4px" }}>
            Staff have not reviewed this report yet.
          </div>
        </div>
      )}

      <div className="ph-muted" style={{ fontSize: "12px" }}>
        Sent: {report.submittedAt}
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
