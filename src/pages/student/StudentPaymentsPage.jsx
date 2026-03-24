import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  getBusinessAccount,
  getStudentAccount,
  moveMoneyFromSavings,
  moveMoneyToSavings,
  transferMoney
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentPaymentsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const account = getStudentAccount(user.studentId);
  const businessAccount = getBusinessAccount();

  const sortCode = account?.sortCode || "11-22-33";
  const accountNumber = account?.accountNumber || "12345678";

  const businessName = businessAccount?.name || "Powerhouse Rewards Shop";
  const businessSortCode = businessAccount?.sortCode || "";
  const businessAccountNumber = businessAccount?.accountNumber || "";

  const requestedMode = searchParams.get("mode") || "person";

  const [paymentType, setPaymentType] = useState(
    requestedMode === "business" ? "business" : "person"
  );
  const [stage, setStage] = useState(
    requestedMode === "savings" ? "savings" : "form"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savingsMessage, setSavingsMessage] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");

  const [form, setForm] = useState({
    recipientName: requestedMode === "business" ? businessName : "",
    sortCode: requestedMode === "business" ? businessSortCode : "",
    accountNumber: requestedMode === "business" ? businessAccountNumber : "",
    amount: "",
    reference: ""
  });

  useEffect(() => {
    setError("");
    setSuccess("");

    if (requestedMode === "business") {
      setPaymentType("business");
      setStage("form");
      setForm((current) => ({
        ...current,
        recipientName: businessName,
        sortCode: businessSortCode,
        accountNumber: businessAccountNumber
      }));
      return;
    }

    if (requestedMode === "savings") {
      setPaymentType("person");
      setStage("savings");
      return;
    }

    setPaymentType("person");
    setStage("form");
    setForm((current) => ({
      ...current,
      recipientName: "",
      sortCode: "",
      accountNumber: ""
    }));
  }, [requestedMode, businessName, businessSortCode, businessAccountNumber]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleToggle(nextType) {
    setPaymentType(nextType);
    setError("");
    setSuccess("");
    setStage("form");

    if (nextType === "business") {
      setForm((current) => ({
        ...current,
        recipientName: businessName,
        sortCode: businessSortCode,
        accountNumber: businessAccountNumber
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      recipientName: "",
      sortCode: "",
      accountNumber: ""
    }));
  }

  function handleContinue(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const numericAmount = Number(form.amount);

    if (!form.recipientName.trim()) {
      setError("Enter the name of the person or business.");
      return;
    }

    if (!/^\d{2}-\d{2}-\d{2}$/.test(form.sortCode.trim())) {
      setError("Sort code must be in the format 12-34-56.");
      return;
    }

    if (!/^\d{8}$/.test(form.accountNumber.trim())) {
      setError("Account number must be 8 digits.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      return;
    }

    setStage("confirm");
  }

  function handleConfirmPayment() {
    setError("");
    setSuccess("");

    try {
      const result = transferMoney({
        fromStudentId: user.studentId,
        paymentType,
        sortCode: form.sortCode,
        accountNumber: form.accountNumber,
        amount: Number(form.amount),
        reference: form.reference
      });

      setSuccess(`Payment sent successfully to ${result.recipientName}.`);
      setStage("done");
      setForm({
        recipientName: paymentType === "business" ? businessName : "",
        sortCode: paymentType === "business" ? businessSortCode : "",
        accountNumber: paymentType === "business" ? businessAccountNumber : "",
        amount: "",
        reference: ""
      });
    } catch (err) {
      setError(err.message || "Payment failed.");
      setStage("form");
    }
  }

  function handleMoveToSavings() {
    setSavingsMessage("");
    setError("");

    try {
      moveMoneyToSavings(user.studentId, Number(savingsAmount));
      setSavingsMessage("Money moved to savings.");
      setSavingsAmount("");
    } catch (err) {
      setError(err.message || "Could not move money.");
    }
  }

  function handleMoveFromSavings() {
    setSavingsMessage("");
    setError("");

    try {
      moveMoneyFromSavings(user.studentId, Number(savingsAmount));
      setSavingsMessage("Money moved to your main account.");
      setSavingsAmount("");
    } catch (err) {
      setError(err.message || "Could not move money.");
    }
  }

  return (
    <AppShell title="Payments" subtitle="Send money and move money between accounts.">
      <div className="ph-student-home-split">
        <SectionCard title="Your account details" description="Check these carefully before making a transfer.">
          <div className="ph-account-details-card">
            <div className="ph-account-detail-row">
              <span>Account name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Sort code</span>
              <strong>{sortCode}</strong>
            </div>
            <div className="ph-account-detail-row">
              <span>Account number</span>
              <strong>{accountNumber}</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Transfer between your accounts" description="Move money between your main account and savings.">
          <label className="ph-field">
            <span>Amount</span>
            <input
              type="number"
              step="0.01"
              value={savingsAmount}
              onChange={(event) => setSavingsAmount(event.target.value)}
              placeholder="10.00"
            />
          </label>

          <div className="ph-mobile-action-grid">
            <button className="ph-mobile-action-button" type="button" onClick={handleMoveToSavings}>
              Main to savings
            </button>
            <button className="ph-mobile-action-button" type="button" onClick={handleMoveFromSavings}>
              Savings to main
            </button>
          </div>

          {savingsMessage ? (
            <p className="ph-success-inline">{savingsMessage}</p>
          ) : null}
        </SectionCard>
      </div>

      <SectionCard title="Make a payment" description="Choose who you want to pay.">
        <div className="ph-payment-toggle">
          <button
            type="button"
            className={paymentType === "person" ? "ph-payment-toggle-active" : ""}
            onClick={() => handleToggle("person")}
          >
            Pay a person
          </button>
          <button
            type="button"
            className={paymentType === "business" ? "ph-payment-toggle-active" : ""}
            onClick={() => handleToggle("business")}
          >
            Pay a business
          </button>
        </div>

        {requestedMode === "savings" && stage === "savings" ? (
          <div className="ph-check-payment-card">
            <h3>Transfer between your accounts</h3>
            <p className="ph-muted">
              Use the section above to move money between your main account and savings account.
            </p>
          </div>
        ) : null}

        {error ? <div className="ph-error-box" style={{ marginBottom: "14px" }}>{error}</div> : null}
        {success ? <div className="ph-success-box">{success}</div> : null}

        {stage === "form" ? (
          <form className="ph-form" onSubmit={handleContinue}>
            <label className="ph-field">
              <span>{paymentType === "business" ? "Business name" : "Recipient name"}</span>
              <input
                value={form.recipientName}
                onChange={(event) => updateField("recipientName", event.target.value)}
                placeholder={paymentType === "business" ? "Powerhouse Rewards Shop" : "Alex Smith"}
                readOnly={paymentType === "business"}
              />
            </label>

            <label className="ph-field">
              <span>Sort code</span>
              <input
                value={form.sortCode}
                onChange={(event) => updateField("sortCode", event.target.value)}
                placeholder="11-22-33"
                readOnly={paymentType === "business"}
              />
            </label>

            <label className="ph-field">
              <span>Account number</span>
              <input
                value={form.accountNumber}
                onChange={(event) => updateField("accountNumber", event.target.value)}
                placeholder="12345678"
                readOnly={paymentType === "business"}
              />
            </label>

            <label className="ph-field">
              <span>Amount</span>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="5.00"
              />
            </label>

            <label className="ph-field">
              <span>Reference</span>
              <input
                value={form.reference}
                onChange={(event) => updateField("reference", event.target.value)}
                placeholder="Lunch"
              />
            </label>
<label className="ph-field">
  <span>Reference</span>
  <input
    value={form.reference}
    onChange={(event) => updateField("reference", event.target.value)}
    placeholder="Lunch"
  />
</label>

{/* 🔽 ADD THIS HERE */}
<div className="ph-standing-order">
  <label className="ph-toggle">
    <input
      type="checkbox"
      checked={isStandingOrder}
      onChange={(e) => setIsStandingOrder(e.target.checked)}
    />
    <span>Create standing order</span>
  </label>

  {isStandingOrder && (
    <div className="ph-standing-order-fields">

      <label>
        Start date
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </label>

      <label>
        Frequency
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="weekly">Every week</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
          <option value="fourweekly">Every 4 weeks</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>

      <label>
        Repeat
        <select
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value)}
        >
          <option value="until">Until further notice</option>
          <option value="count">For a number of payments</option>
          <option value="date">Until end date</option>
        </select>
      </label>

      {repeatType === "count" && (
        <label>
          Number of payments
          <input
            type="number"
            value={numberOfPayments}
            onChange={(e) => setNumberOfPayments(e.target.value)}
          />
        </label>
      )}

      {repeatType === "date" && (
        <label>
          End date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      )}

    </div>
  )}
</div>

{/* existing button */}
<button className="ph-button ph-button-primary" type="submit">
  Continue
</button>
            <button className="ph-button ph-button-primary" type="submit">
              Continue
            </button>
          </form>
        ) : null}

        {stage === "confirm" ? (
          <div className="ph-check-payment-card">
            <h3>Check your payment</h3>

            <div className="ph-account-details-card">
              <div className="ph-account-detail-row">
                <span>{paymentType === "business" ? "Business" : "Recipient"}</span>
                <strong>{form.recipientName}</strong>
              </div>
              <div className="ph-account-detail-row">
                <span>Sort code</span>
                <strong>{form.sortCode}</strong>
              </div>
              <div className="ph-account-detail-row">
                <span>Account number</span>
                <strong>{form.accountNumber}</strong>
              </div>
              <div className="ph-account-detail-row">
                <span>Amount</span>
                <strong>£{Number(form.amount || 0).toFixed(2)}</strong>
              </div>
              <div className="ph-account-detail-row">
                <span>Reference</span>
                <strong>{form.reference || "-"}</strong>
              </div>
            </div>

            <div className="ph-inline-actions" style={{ marginTop: "16px" }}>
              <button className="ph-button ph-button-secondary" type="button" onClick={() => setStage("form")}>
                Cancel
              </button>
              <button className="ph-button ph-button-primary" type="button" onClick={handleConfirmPayment}>
                Confirm payment
              </button>
            </div>
          </div>
        ) : null}

        {stage === "done" ? (
          <div className="ph-check-payment-card">
            <h3>Payment complete</h3>
            <p className="ph-muted">Your payment has been processed.</p>
            <div className="ph-inline-actions" style={{ marginTop: "16px" }}>
              <button className="ph-button ph-button-primary" type="button" onClick={() => setStage("form")}>
                Make another payment
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>
    </AppShell>
  );
}