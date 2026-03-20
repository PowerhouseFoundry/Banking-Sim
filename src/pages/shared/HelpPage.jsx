import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";

export default function HelpPage() {
  return (
    <AppShell title="Help" subtitle="Simple guidance for using Powerhouse Banking.">
      <div className="ph-grid ph-grid-2">
        <SectionCard title="Students" description="Use the app to practise safe checking.">
          <ul className="ph-simple-list">
            <li>Read every payment carefully.</li>
            <li>Check direct debits before they are due.</li>
            <li>Report anything you do not recognise.</li>
          </ul>
        </SectionCard>

        <SectionCard title="Staff" description="Use the app to set up realistic teaching situations.">
          <ul className="ph-simple-list">
            <li>Review student balances and transactions.</li>
            <li>Discuss unusual or suspicious example payments.</li>
            <li>Use reports to teach safe banking behaviour.</li>
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
