import React from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentTransactions } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentTransactionsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const transactions = getStudentTransactions(user.studentId);

  return (
    <AppShell title="Transactions" subtitle="Check each payment carefully.">
      <SectionCard
        title="All transactions"
        description="This page helps students practise reading account activity."
      >
        {/* Desktop table */}
        <div className="ph-transactions-desktop">
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Check</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>
                      {transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td>
                      {transaction.suspicious ? (
                        <span className="ph-badge ph-badge-warning">Check this</span>
                      ) : (
                        <span className="ph-badge">Looks normal</span>
                      )}
                    </td>
                    <td>
                      <Link
                        className="ph-inline-link"
                        to={`/student/transactions/${transaction.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="ph-transactions-mobile">
          <div style={{ display: "grid", gap: "12px" }}>
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="ph-tile"
                style={{ display: "grid", gap: "10px", textAlign: "left" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <strong>{transaction.description}</strong>
                  <strong className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>
                    {transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}
                  </strong>
                </div>

                <div className="ph-muted" style={{ fontSize: "14px" }}>
                  {transaction.date} • {transaction.category}
                </div>

                <div>
                  {transaction.suspicious ? (
                    <span className="ph-badge ph-badge-warning">Check this</span>
                  ) : (
                    <span className="ph-badge">Looks normal</span>
                  )}
                </div>

                <div className="ph-inline-actions">
                  <Link
                    className="ph-button ph-button-primary ph-button-link ph-button-small"
                    to={`/student/transactions/${transaction.id}`}
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <style>{`
        .ph-transactions-mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .ph-transactions-desktop {
            display: none;
          }

          .ph-transactions-mobile {
            display: block;
          }
        }
      `}</style>
    </AppShell>
  );
}