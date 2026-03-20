import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentDirectDebits } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentDirectDebitsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const directDebits = getStudentDirectDebits(user.studentId);

  return (
    <AppShell title="Direct debits" subtitle="Regular payments that leave your account automatically.">
      <SectionCard title="Recurring payments" description="Students can practise checking what is due and when.">
        {directDebits.length === 0 ? (
          <EmptyState title="No direct debits" message="There are no regular payments set up for this account." />
        ) : (
          <div className="ph-tile-grid">
            {directDebits.map((item) => (
              <div className="ph-tile" key={item.id}>
                <h4>{item.merchant}</h4>
                <p>Amount: <strong>£{item.amount.toFixed(2)}</strong></p>
                <p>Frequency: <strong>{item.frequency}</strong></p>
                <p>Next payment: <strong>{item.nextDate}</strong></p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
