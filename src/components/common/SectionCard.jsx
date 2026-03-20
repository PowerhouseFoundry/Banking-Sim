import React from "react";

export default function SectionCard({ title, description, action, children }) {
  return (
    <section className="ph-card">
      <div className="ph-section-heading ph-section-heading-flex">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
