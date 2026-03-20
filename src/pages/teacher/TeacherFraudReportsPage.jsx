import React, { useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import {
  getAllFraudReports,
  resolveFraudReport
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function TeacherFraudReportsPage() {
  useBankRefresh();

  const reports = getAllFraudReports();

  const [openResolveId, setOpenResolveId] = useState("");
  const [resolveForm, setResolveForm] = useState({
    refund: true,
    message: ""
  });

  const [filter, setFilter] = useState("open");

  const filteredReports = useMemo(() => {
    if (filter === "resolved") {
      return reports.filter((report) => report.status === "Resolved");
    }
    if (filter === "all") {
      return reports;
    }
    return reports.filter((report) => report.status !== "Resolved");
  }, [reports, filter]);

  function openResolve(report) {
    setOpenResolveId(report.id);
    setResolveForm({
      refund: true,
      message: ""
    });
  }

  function closeResolve() {
    setOpenResolveId("");
    setResolveForm({
      refund: true,
      message: ""
    });
  }

  function handleResolve(report) {
    try {
      resolveFraudReport(report.id, {
        refund: resolveForm.refund,
        message: resolveForm.message
      });

      window.alert("Fraud report resolved.");
      closeResolve();
    } catch (error) {
      window.alert(error.message || "Could not resolve fraud report.");
    }
  }

  return (
    <AppShell
      title="Fraud reports"
      subtitle="Review payment reports, choose whether to refund, and leave feedback for the student."
    >
      <SectionCard
        title="Reports"
        description="Staff can resolve reports with or without a refund."
      >
        <div className="ph-payment-toggle" style={{ marginBottom: "18px" }}>
          <button
            type="button"
            className={filter === "open" ? "ph-payment-toggle-active" : ""}
            onClick={() => setFilter("open")}
          >
            Open
          </button>
          <button
            type="button"
            className={filter === "resolved" ? "ph-payment-toggle-active" : ""}
            onClick={() => setFilter("resolved")}
          >
            Resolved
          </button>
          <button
            type="button"
            className={filter === "all" ? "ph-payment-toggle-active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>

        {filteredReports.length === 0 ? (
          <p className="ph-muted">No fraud reports found.</p>
        ) : (
          <div className="ph-recurring-list">
            {filteredReports.map((report) => {
              const transaction = report.transaction;
              const isResolved = report.status === "Resolved";
              const isOpen = openResolveId === report.id;

              return (
                <div key={report.id} className="ph-recurring-card">
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px" }}>{report.studentName}</h4>

                    <p className="ph-muted" style={{ margin: "4px 0" }}>
                      Reported: {report.submittedAt}
                    </p>

                    <p className="ph-muted" style={{ margin: "4px 0" }}>
                      Payment: {transaction?.description || "Unknown payment"}
                    </p>

                    <p className="ph-muted" style={{ margin: "4px 0" }}>
                      Amount: {transaction?.amount < 0 ? "-£" : "£"}
                      {Math.abs(Number(transaction?.amount || 0)).toFixed(2)}
                    </p>

                    <p className="ph-muted" style={{ margin: "4px 0" }}>
                      Student reason: {report.reason}
                    </p>

                    <p style={{ margin: "10px 0 0", fontWeight: 700 }}>
                      Status: {report.status}
                    </p>

                    {isResolved ? (
                      <div style={{ marginTop: "12px" }}>
                        <p className="ph-muted" style={{ margin: "4px 0" }}>
                          Resolved: {report.resolvedAt || "-"}
                        </p>
                        <p className="ph-muted" style={{ margin: "4px 0" }}>
                          Refund: {report.resolutionRefunded ? "Yes" : "No"}
                        </p>
                        {report.resolutionMessage ? (
                          <p className="ph-muted" style={{ margin: "4px 0" }}>
                            Staff message: {report.resolutionMessage}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    {!isResolved && isOpen ? (
                      <div
                        style={{
                          marginTop: "14px",
                          padding: "14px",
                          border: "1px solid var(--border)",
                          borderRadius: "16px",
                          background: "var(--panel-soft)"
                        }}
                      >
                        <label className="ph-field">
                          <span>Teacher message</span>
                          <textarea
                            className="ph-textarea"
                            value={resolveForm.message}
                            onChange={(event) =>
                              setResolveForm((current) => ({
                                ...current,
                                message: event.target.value
                              }))
                            }
                            placeholder="Example: Report checked today. This was reported after the refund window, so no refund was given."
                          />
                        </label>

                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "12px",
                            fontWeight: 700
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={resolveForm.refund}
                            onChange={(event) =>
                              setResolveForm((current) => ({
                                ...current,
                                refund: event.target.checked
                              }))
                            }
                          />
                          Refund this payment to the student
                        </label>

                        <div
                          className="ph-inline-actions"
                          style={{ marginTop: "14px", display: "flex", gap: "10px", flexWrap: "wrap" }}
                        >
                          <button
                            type="button"
                            className="ph-button ph-button-primary"
                            onClick={() => handleResolve(report)}
                          >
                            Resolve report
                          </button>

                          <button
                            type="button"
                            className="ph-button ph-button-secondary"
                            onClick={closeResolve}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="ph-recurring-actions">
                    <span className={`ph-badge ${isResolved ? "ph-badge-success" : ""}`}>
                      {isResolved ? "Resolved" : "Open"}
                    </span>

                    {!isResolved ? (
                      <button
                        type="button"
                        className="ph-button ph-button-primary ph-button-small"
                        onClick={() => openResolve(report)}
                      >
                        Resolve
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}