import React from "react";

export default function StatCard({ label, value, detail }) {
  return (
    <section className="ph-card">
      <p className="ph-card-label">{label}</p>
      <h3 className="ph-stat-value">{value}</h3>
      {detail ? <p className="ph-muted">{detail}</p> : null}
    </section>
  );
}
