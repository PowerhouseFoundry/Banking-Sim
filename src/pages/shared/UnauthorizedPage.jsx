import React from "react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="ph-simple-page">
      <div className="ph-simple-card">
        <h1>Access denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link className="ph-button ph-button-primary ph-button-link" to="/">Return to sign in</Link>
      </div>
    </div>
  );
}
