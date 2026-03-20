import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="ph-simple-page">
      <div className="ph-simple-card">
        <h1>Page not found</h1>
        <p>The page you are looking for could not be found.</p>
        <Link className="ph-button ph-button-primary ph-button-link" to="/">Go to sign in</Link>
      </div>
    </div>
  );
}
