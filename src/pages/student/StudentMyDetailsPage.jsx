import React, { useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  changeStudentOwnPassword,
  getStudentAccount,
  getStudentById,
  getStudentLoginDetails
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentMyDetailsPage() {
  useBankRefresh();
  const { user } = useAuth();

  const student = getStudentById(user.studentId);
  const account = getStudentAccount(user.studentId);
  const login = getStudentLoginDetails(user.studentId);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      changeStudentOwnPassword({
        loginId: user.loginId,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword
      });

      setSuccess("Your password has been changed.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (err) {
      setError(err.message || "Could not change password.");
    }
  }

  return (
    <AppShell
      title="My Details"
      subtitle="View your training bank details and manage your password."
    >
      <div className="ph-grid ph-grid-2">
        <SectionCard
          title="Personal details"
          description="These are your details for the mock training bank."
        >
          <div className="ph-account-details-card">
            <div className="ph-account-detail-row">
              <span>Name</span>
              <strong>{student?.name || user.name}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Username</span>
              <strong>{login?.username || user.username || "-"}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Class group</span>
              <strong>{student?.classGroup || user.classGroup || "-"}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Account type</span>
              <strong>Training current account</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Account details"
          description="These details are for learning and practice only."
        >
          <div className="ph-account-details-card">
            <div className="ph-account-detail-row">
              <span>Account name</span>
              <strong>{student?.name || user.name}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Sort code</span>
              <strong>{account?.sortCode || "-"}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Account number</span>
              <strong>{account?.accountNumber || "-"}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Card status</span>
              <strong>{account?.cardStatus || "active"}</strong>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Change password"
        description="Enter your current password first, then choose a new one."
      >
        {error ? <div className="ph-error-box" style={{ marginBottom: "14px" }}>{error}</div> : null}
        {success ? <div className="ph-success-box" style={{ marginBottom: "14px" }}>{success}</div> : null}

        <form className="ph-form" onSubmit={handleSubmit}>
          <label className="ph-field">
            <span>Current password</span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(event) => updateField("currentPassword", event.target.value)}
              required
            />
          </label>

          <label className="ph-field">
            <span>New password</span>
            <input
              type="password"
              value={form.newPassword}
              onChange={(event) => updateField("newPassword", event.target.value)}
              required
            />
          </label>

          <label className="ph-field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              required
            />
          </label>

          <button className="ph-button ph-button-primary" type="submit">
            Change password
          </button>
        </form>
      </SectionCard>
    </AppShell>
  );
}