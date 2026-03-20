import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  getStudentAccount,
  getStudentDirectDebits,
  getStudentTransactions
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

function buildRunningBalanceRows(accountBalance, transactions) {
  let runningBalance = Number(accountBalance || 0);

  const newestFirst = [...transactions];
  const oldestFirst = [...newestFirst].reverse();

  const withBalances = oldestFirst.map((transaction) => {
    runningBalance = Number((runningBalance - Number(transaction.amount)).toFixed(2));

    return {
      ...transaction,
      balanceAfter: Number((runningBalance + Number(transaction.amount)).toFixed(2))
    };
  });

  return withBalances.reverse();
}

export default function StudentMainAccountPage() {
  useBankRefresh();
  const { user } = useAuth();

  const account = getStudentAccount(user.studentId);
  const transactions = getStudentTransactions(user.studentId);
  const directDebits = getStudentDirectDebits(user.studentId);

  const rows = buildRunningBalanceRows(account?.balance || 0, transactions);

  return (
    <AppShell title="Main Account" subtitle="View your full bank statement">
      <SectionCard title="Everyday Account" description="Your current account balance and details.">
        <div className="ph-mobile-balance-card">
          <div className="ph-mobile-balance-label">Current balance</div>
          <div className="ph-mobile-balance-value">£{account?.balance?.toFixed(2) || "0.00"}</div>
          <div className="ph-mobile-balance-meta">
            Sort code {account?.sortCode || "11-22-33"} · Account number {account?.accountNumber || "12345678"}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Upcoming payments" description="Payments due soon from your account.">
        {directDebits.length === 0 ? (
          <p className="ph-muted">No upcoming payments yet.</p>
        ) : (
          <div className="ph-upcoming-payment-list">
            {directDebits.map((item) => (
              <div className="ph-upcoming-payment-row" key={item.id}>
                <div>
                  <strong>{item.merchant}</strong>
                  <p>{item.nextDate}</p>
                </div>
                <div className="ph-amount-out">£{item.amount.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Statement" description="A full list of your account activity.">
        {rows.length === 0 ? (
          <p className="ph-muted">No transactions yet.</p>
        ) : (
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>
                      {transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td>£{transaction.balanceAfter.toFixed(2)}</td>
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