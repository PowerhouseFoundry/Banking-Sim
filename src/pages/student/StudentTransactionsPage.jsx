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
      <SectionCard title="All transactions" description="This page helps students practise reading account activity.">
        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Check</th><th>Open</th></tr>
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
                  <td>{transaction.suspicious ? <span className="ph-badge ph-badge-warning">Check this</span> : <span className="ph-badge">Looks normal</span>}</td>
                  <td><Link className="ph-inline-link" to={`/student/transactions/${transaction.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}
