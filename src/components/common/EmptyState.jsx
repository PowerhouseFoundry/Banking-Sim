import React from "react";

export default function EmptyState({ title, message }) {
  return (
    <div className="ph-empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
