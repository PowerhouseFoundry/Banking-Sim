import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentAccount, getStudentTransactions } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentSavingsAccountPage() {
  useBankRefresh();
  const { user } = useAuth();

  const account = getStudentAccount(user.studentId);
  const allTransactions = getStudentTransactions(user.studentId);
  const savingsTransactions = allTransactions.filter(
    (item) => item.category === "Savings"
  );

  return (
    <AppShell title="Savings Account" subtitle="View your savings balance and activity">
      <SectionCard title="ISA Savings Account" description="Your savings account earns 2% interest per month.">
        <div className="ph-mobile-savings-card">
          <div className="ph-mobile-balance-label">Savings balance</div>
          <div className="ph-mobile-balance-value">£{Number(account?.savingsBalance || 0).toFixed(2)}</div>
          <div className="ph-mobile-balance-meta">Monthly interest rate: 2%</div>
        </div>
      </SectionCard>

      <SectionCard title="Savings statement" description="Transfers and interest added to savings.">
        {savingsTransactions.length === 0 ? (
          <p className="ph-muted">No savings activity yet.</p>
        ) : (
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {savingsTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>
                      {transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}