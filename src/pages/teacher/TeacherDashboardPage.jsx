import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import {
  addTransactionToStudents,
  getAllStudents,
  getClassGroups,
  getAllTransactions,
  getPendingShopOrders,
  resetMockBankingState,
  createRecurringPayment
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function TeacherDashboardPage() {
  useBankRefresh();

  const navigate = useNavigate();

  const students = getAllStudents();
  const classes = getClassGroups();
  const transactions = getAllTransactions();
  const pendingShopOrders = getPendingShopOrders();

  const [selectedClass, setSelectedClass] = useState(classes[0] || "");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formError, setFormError] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    statementName: "",
    amount: "",
    type: "add",
    date: new Date().toISOString().slice(0, 10),
    repeat: "one-off"
  });

  const classStudents = useMemo(() => {
    return students
      .filter((student) => student.classGroup === selectedClass)
      .filter((student) =>
        student.name.toLowerCase().includes(searchText.toLowerCase().trim())
      );
  }, [students, selectedClass, searchText]);

  const suspiciousCount = useMemo(() => {
    return transactions.filter((item) => item.suspicious).length;
  }, [transactions]);

  const allVisibleSelected =
    classStudents.length > 0 &&
    classStudents.every((student) => selectedStudentIds.includes(student.id));

  function toggleStudent(studentId) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      const visibleIds = classStudents.map((student) => student.id);
      setSelectedStudentIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    const visibleIds = classStudents.map((student) => student.id);
    setSelectedStudentIds((current) => [...new Set([...current, ...visibleIds])]);
  }

  function clearSelection() {
    setSelectedStudentIds([]);
  }

  function openPaymentModal() {
    if (selectedStudentIds.length === 0) {
      window.alert("Select at least one student first.");
      return;
    }

    setFormError("");
    setPaymentForm({
      statementName: "",
      amount: "",
      type: "add",
      date: new Date().toISOString().slice(0, 10),
      repeat: "one-off"
    });
    setShowPaymentModal(true);
  }

  function closePaymentModal() {
    setShowPaymentModal(false);
    setFormError("");
  }

 function handlePaymentSubmit(event) {
  event.preventDefault();
  setFormError("");

  if (!paymentForm.statementName.trim()) {
    setFormError("Enter a statement name.");
    return;
  }

  const numericAmount = Number(paymentForm.amount);
  if (!numericAmount || numericAmount <= 0) {
    setFormError("Enter an amount greater than 0.");
    return;
  }

  const finalAmount =
    paymentForm.type === "take"
      ? -Math.abs(numericAmount)
      : Math.abs(numericAmount);

  if (paymentForm.repeat === "one-off") {
    addTransactionToStudents(selectedStudentIds, {
      description: paymentForm.statementName,
      category: paymentForm.type === "take" ? "Deduction" : "Pay",
      amount: finalAmount,
      date: paymentForm.date,
      suspicious: false
    });

    window.alert(
      `${paymentForm.type === "take" ? "Deduction" : "Payment"} added for ${selectedStudentIds.length} student${selectedStudentIds.length === 1 ? "" : "s"}.`
    );

    closePaymentModal();
    return;
  }

  if (paymentForm.repeat === "weekly") {
    createRecurringPayment({
      studentIds: selectedStudentIds,
      statementName: paymentForm.statementName,
      amount: numericAmount,
      type: paymentForm.type,
      startDate: paymentForm.date,
      frequency: "weekly"
    });

    window.alert(
      `Weekly ${paymentForm.type === "take" ? "deduction" : "payment"} set up for ${selectedStudentIds.length} student${selectedStudentIds.length === 1 ? "" : "s"}.`
    );

    closePaymentModal();
    return;
  }
}

  return (
    <AppShell
      title="Teacher dashboard"
      subtitle="Select students and make quick account changes."
    >
      <div className="ph-dashboard-top-grid">
        <SectionCard
          title="Classes"
          description="Choose a class to view and select students."
        >
          <div className="ph-class-toggle-bar">
            {classes.map((className) => (
              <button
                key={className}
                type="button"
                className={
                  selectedClass === className
                    ? "ph-button ph-button-primary"
                    : "ph-button ph-button-secondary"
                }
                onClick={() => {
                  setSelectedClass(className);
                  setSearchText("");
                }}
              >
                {className}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Flagged payments"
          description="Transactions marked as unusual or suspicious."
          action={
            <button
              className="ph-button ph-button-secondary ph-button-small"
              type="button"
              onClick={() => navigate("/teacher/reports")}
            >
              View fraud reports
            </button>
          }
        >
          <div className="ph-flagged-panel">
            <div className="ph-flagged-icon">!</div>
            <div>
              <div className="ph-flagged-count">
                Flagged payments: {suspiciousCount}
              </div>
              <p className="ph-muted">
                {suspiciousCount === 0
                  ? "No transactions marked for checking."
                  : "Review unusual payments and teaching scenarios."}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Rewards Shop Orders"
        description="Student purchases waiting for approval."
        action={
          <button
            className="ph-button ph-button-secondary ph-button-small"
            type="button"
            onClick={() => navigate("/teacher/rewards-orders")}
          >
            Open orders
          </button>
        }
      >
        {pendingShopOrders.length === 0 ? (
          <p className="ph-muted">No pending rewards shop orders.</p>
        ) : (
          <div className="ph-rewards-alert-list">
            {pendingShopOrders.slice(0, 3).map((order) => (
              <button
                key={order.id}
                type="button"
                className="ph-rewards-alert-card"
                onClick={() => navigate("/teacher/rewards-orders")}
              >
                <div>
                  <strong>{order.studentName}</strong>
                  <p>{order.reference}</p>
                </div>
                <div className="ph-amount-out">£{Number(order.amount).toFixed(2)}</div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Students"
        description={
          selectedClass
            ? `Showing students in ${selectedClass}`
            : "Select a class to view students"
        }
        action={
          <button
            className="ph-button ph-button-secondary ph-button-small"
            type="button"
            onClick={resetMockBankingState}
          >
            Reset demo data
          </button>
        }
      >
        <div className="ph-teacher-toolbar">
          <label className="ph-teacher-select-all">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAllVisible}
            />
            <span>Select all shown</span>
          </label>

          <input
            className="ph-teacher-search"
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search student name"
          />
        </div>

        {classStudents.length === 0 ? (
          <p className="ph-muted">No students found in this class yet.</p>
        ) : (
          <div className="ph-student-balance-board">
            <div className="ph-student-balance-header ph-student-balance-header-teacher">
              <span>Select</span>
              <span>Student</span>
              <span>Balance</span>
              <span></span>
            </div>

            {classStudents.map((student) => {
              const balance = student.account?.balance ?? 0;
              const isSelected = selectedStudentIds.includes(student.id);

              return (
                <div key={student.id} className="ph-student-balance-row ph-student-balance-row-teacher">
                  <div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleStudent(student.id)}
                    />
                  </div>

                  <div className="ph-student-balance-left">
                    <div className="ph-student-avatar">
                      {student.name?.charAt(0) || "S"}
                    </div>
                    <span className="ph-student-name">{student.name}</span>
                  </div>

                  <div className="ph-student-balance-right">
                    <span
                      className={
                        balance < 0
                          ? "ph-student-balance-value ph-student-balance-negative"
                          : "ph-student-balance-value"
                      }
                    >
                      {balance < 0 ? "-£" : "£"}
                      {Math.abs(balance).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <button
                      className="ph-button ph-button-secondary ph-button-small"
                      type="button"
                      onClick={() => navigate(`/teacher/students/${student.id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {selectedStudentIds.length > 0 ? (
        <div className="ph-teacher-sticky-actions">
          <div className="ph-teacher-sticky-summary">
            {selectedStudentIds.length} selected
          </div>

          <div className="ph-inline-actions">
            <button
              className="ph-button ph-button-primary"
              type="button"
              onClick={openPaymentModal}
            >
              Add Payment
            </button>

            <button
              className="ph-button ph-button-secondary"
              type="button"
              onClick={clearSelection}
            >
              Clear selection
            </button>
          </div>
        </div>
      ) : null}

      {showPaymentModal ? (
        <div className="ph-modal-backdrop" onClick={closePaymentModal}>
          <div className="ph-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="ph-section-heading">
              <h3>Add Payment</h3>
              <p>
                Apply a one-off payment or deduction to {selectedStudentIds.length} selected student
                {selectedStudentIds.length === 1 ? "" : "s"}.
              </p>
            </div>

            {formError ? (
              <div className="ph-error-box" style={{ marginBottom: "14px" }}>
                {formError}
              </div>
            ) : null}

            <form className="ph-form" onSubmit={handlePaymentSubmit}>
              <label className="ph-field">
                <span>Statement name</span>
                <input
                  value={paymentForm.statementName}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, statementName: event.target.value })
                  }
                  placeholder="WORK EXPERIENCE PAY"
                />
              </label>

              <label className="ph-field">
                <span>Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, amount: event.target.value })
                  }
                  placeholder="35.00"
                />
              </label>

              <label className="ph-field">
                <span>Type</span>
                <select
                  className="ph-select"
                  value={paymentForm.type}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, type: event.target.value })
                  }
                >
                  <option value="add">Add money</option>
                  <option value="take">Take money away</option>
                </select>
              </label>

              <label className="ph-field">
                <span>Date</span>
                <input
                  type="date"
                  value={paymentForm.date}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, date: event.target.value })
                  }
                />
              </label>

              <label className="ph-field">
                <span>Repeat</span>
                <select
                  className="ph-select"
                  value={paymentForm.repeat}
                  onChange={(event) =>
                    setPaymentForm({ ...paymentForm, repeat: event.target.value })
                  }
                >
                  <option value="one-off">One-off</option>
<option value="weekly">Weekly</option>
                </select>
              </label>

              <div className="ph-inline-actions">
                <button className="ph-button ph-button-primary" type="submit">
                  Save
                </button>
                <button
                  className="ph-button ph-button-secondary"
                  type="button"
                  onClick={closePaymentModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}