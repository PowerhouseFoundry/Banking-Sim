import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

function ShellLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `ph-nav-link${isActive ? " ph-nav-link-active" : ""}`}
    >
      {children}
    </NavLink>
  );
}

function StudentBottomLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `ph-mobile-tab${isActive ? " ph-mobile-tab-active" : ""}`}
    >
      {label}
    </NavLink>
  );
}

export default function AppShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();
  const isStudent = user?.role === "student";

  return (
    <div className={`ph-app ${isStudent ? "ph-app-student" : ""}`}>
      <aside className="ph-sidebar">
        <div className="ph-brand">
          <div className="ph-brand-mark">PH</div>
          <div>
            <h1>PLC Bank</h1>
            <p>Training Bank</p>
          </div>
        </div>

        <nav className="ph-nav" aria-label="Main navigation">
          {isStudent ? (
            <>
              <ShellLink to="/student/dashboard">Home</ShellLink>
              <ShellLink to="/student/my-details">My Details</ShellLink>
              <ShellLink to="/student/payments">Payments</ShellLink>
              <ShellLink to="/student/transactions">Activity</ShellLink>
              <ShellLink to="/student/cards">Cards</ShellLink>
              
            </>
          ) : (
            <>
              <ShellLink to="/teacher/dashboard">Dashboard</ShellLink>
              <ShellLink to="/teacher/students">Students</ShellLink>
              <ShellLink to="/teacher/transactions">Transactions</ShellLink>
              <ShellLink to="/teacher/reports">Fraud reports</ShellLink>
              
            </>
          )}
        </nav>

        <div className="ph-sidebar-footer">
          <div className="ph-user-chip">
            <div className="ph-user-avatar">{user?.name?.[0] || "U"}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{isStudent ? `${user?.classGroup || "Student"} class` : "Staff account"}</p>
            </div>
          </div>
          <Link to="/" onClick={logout} className="ph-button ph-button-secondary ph-button-link">
            Log out
          </Link>
        </div>
      </aside>

      <main className={`ph-main ${isStudent ? "ph-main-student" : ""}`}>
        <header className={`ph-page-header ${isStudent ? "ph-page-header-student" : ""}`}>
          <p className="ph-eyebrow">PLC Bank</p>
          <h2>{title}</h2>
          {subtitle ? <p className="ph-subtitle">{subtitle}</p> : null}
        </header>

        <section className={`ph-page-content ${isStudent ? "ph-page-content-student" : ""}`}>
          {children}
        </section>
      </main>

      {isStudent ? (
        <nav className="ph-mobile-tabs" aria-label="Student mobile navigation">
          <StudentBottomLink to="/student/dashboard" label="Home" />
          <StudentBottomLink to="/student/my-details" label="Details" />
          <StudentBottomLink to="/student/payments" label="Payments" />
          <StudentBottomLink to="/student/transactions" label="Activity" />
          <StudentBottomLink to="/student/cards" label="Cards" />
        </nav>
      ) : null}
    </div>
  );
}