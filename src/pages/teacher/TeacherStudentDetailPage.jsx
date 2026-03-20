import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import {
  addDirectDebit,
  addTransaction,
  deleteDirectDebit,
  deleteTransaction,
  getStudentAccount,
  getStudentById,
  getStudentDirectDebits,
  getStudentFraudReports,
  getStudentLoginDetails,
  getStudentTransactions,
  updateStudent,
  updateStudentLogin
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function TeacherStudentDetailPage() {
  useBankRefresh();

  const { studentId } = useParams();
  const student = getStudentById(studentId);
  const login = getStudentLoginDetails(studentId);

  const [studentForm, setStudentForm] = useState({
    name: student?.name || "",
    classGroup: student?.classGroup || "",
    yearLabel: student?.yearLabel || ""
  });

  const [transactionForm, setTransactionForm] = useState({
    description: "",
    category: "Income",
    amount: "0",
    date: new Date().toISOString().slice(0, 10),
    suspicious: false
  });

  const [directDebitForm, setDirectDebitForm] = useState({
    merchant: "",
    amount: "0",
    frequency: "Monthly",
    nextDate: new Date().toISOString().slice(0, 10)
  });

  if (!student) {
    return (
      <AppShell title="Student not found" subtitle="The selected student could not be found.">
        <EmptyState title="No student found" message="Go back to the students page and choose another profile." />
      </AppShell>
    );
  }

  const account = getStudentAccount(studentId);
  const transactions = getStudentTransactions(studentId);
  const directDebits = getStudentDirectDebits(studentId);
  const reports = getStudentFraudReports(studentId);

  const suspiciousCount = useMemo(
    () => transactions.filter((item) => item.suspicious).length,
    [transactions]
  );

  function handleStudentSave(event) {
    event.preventDefault();
    updateStudent(studentId, studentForm);
    window.alert("Student details saved.");
  }

  function handleTransactionAdd(event) {
    event.preventDefault();

    addTransaction({
      studentId,
      description: transactionForm.description,
      category: transactionForm.category,
      amount: Number(transactionForm.amount),
      date: transactionForm.date,
      suspicious: transactionForm.suspicious
    });

    setTransactionForm({
      description: "",
      category: "Income",
      amount: "0",
      date: new Date().toISOString().slice(0, 10),
      suspicious: false
    });
  }

  function handleDirectDebitAdd(event) {
    event.preventDefault();

    addDirectDebit({
      studentId,
      merchant: directDebitForm.merchant,
      amount: Number(directDebitForm.amount),
      frequency: directDebitForm.frequency,
      nextDate: directDebitForm.nextDate
    });

    setDirectDebitForm({
      merchant: "",
      amount: "0",
      frequency: "Monthly",
      nextDate: new Date().toISOString().slice(0, 10)
    });
  }

  function handleDeleteTransaction(transaction) {
    const confirmed = window.confirm(
      `Delete ${transaction.description} for ${student.name}?`
    );

    if (!confirmed) return;

    deleteTransaction(transaction.id);
  }

  function handleDeleteDirectDebit(item) {
    const confirmed = window.confirm(
      `Remove direct debit ${item.merchant} for ${student.name}?`
    );

    if (!confirmed) return;

    deleteDirectDebit(item.id);
  }

  function handleEditUsername() {
    const nextUsername = window.prompt(
      `Edit username for ${student.name}`,
      login?.username || ""
    );

    if (nextUsername === null) return;

    try {
      updateStudentLogin(studentId, { username: nextUsername });
      window.alert("Username updated.");
    } catch (error) {
      window.alert(error.message || "Could not update username.");
    }
  }

  function handleEditPassword() {
    const nextPassword = window.prompt(
      `Edit password for ${student.name}`,
      login?.password || "student123"
    );

    if (nextPassword === null) return;

    try {
      updateStudentLogin(studentId, { password: nextPassword });
      window.alert("Password updated.");
    } catch (error) {
      window.alert(error.message || "Could not update password.");
    }
  }

  function fillPaymentExample() {
    setTransactionForm({
      ...transactionForm,
      amount: "35.00",
      description: "WORK EXPERIENCE PAY",
      category: "Pay",
      suspicious: false
    });
  }

  function fillWithdrawalExample() {
    setTransactionForm({
      ...transactionForm,
      amount: "-4.50",
      description: "COLLEGE CAFE",
      category: "Food",
      suspicious: false
    });
  }

  return (
    <AppShell
      title={student.name}
      subtitle={`${student.classGroup} · ${student.yearLabel}`}
    >
      <div className="ph-student-profile-grid">
        <SectionCard title="Account" description="Live account view for staff.">
          <div className="ph-profile-balance">£{account?.balance?.toFixed(2) || "0.00"}</div>
          <div className="ph-profile-meta-list">
            <div>Everyday Account</div>
            <div>Card: {account?.cardStatus || "active"}</div>
            <div>Flagged payments: {suspiciousCount}</div>
          </div>
        </SectionCard>

        <SectionCard title="Student details" description="Edit core learner details.">
          <form className="ph-form" onSubmit={handleStudentSave}>
            <label className="ph-field">
              <span>Name</span>
              <input
                value={studentForm.name}
                onChange={(event) =>
                  setStudentForm({ ...studentForm, name: event.target.value })
                }
              />
            </label>

            <label className="ph-field">
              <span>Class</span>
              <input
                value={studentForm.classGroup}
                onChange={(event) =>
                  setStudentForm({ ...studentForm, classGroup: event.target.value })
                }
              />
            </label>

            <label className="ph-field">
              <span>Year</span>
              <input
                value={studentForm.yearLabel}
                onChange={(event) =>
                  setStudentForm({ ...studentForm, yearLabel: event.target.value })
                }
              />
            </label>

            <button className="ph-button ph-button-primary" type="submit">
              Save details
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Direct debits" description="Recurring payments on this account.">
          <div className="ph-inline-actions ph-inline-actions-end">
            <button
              className="ph-button ph-button-secondary"
              type="button"
              onClick={() => {
                const merchant = window.prompt("Direct debit name", "Phone Bill");
                if (!merchant) return;

                const amount = window.prompt("Amount", "15");
                if (amount === null) return;

                addDirectDebit({
                  studentId,
                  merchant,
                  amount: Number(amount),
                  frequency: "Monthly",
                  nextDate: new Date().toISOString().slice(0, 10)
                });
              }}
            >
              Add direct debit
            </button>
          </div>

          {directDebits.length === 0 ? (
            <p className="ph-muted">No direct debits for this student yet.</p>
          ) : (
            <div className="ph-direct-debit-list">
              {directDebits.map((item) => (
                <div className="ph-direct-debit-row" key={item.id}>
                  <div>
                    <strong>{item.merchant}</strong>
                    <p>£{item.amount.toFixed(2)} · {item.frequency}</p>
                    <p>Next: {item.nextDate}</p>
                  </div>

                  <button
                    className="ph-button ph-button-secondary"
                    type="button"
                    onClick={() => handleDeleteDirectDebit(item)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="ph-student-profile-grid ph-student-profile-grid-lower">
        <SectionCard title="Login settings" description="Mock username and password control for staff.">
          <div className="ph-profile-login-box">
            <p><strong>Username:</strong> {login?.username || "-"}</p>
            <p><strong>Password:</strong> {login?.password || "-"}</p>
          </div>

          <div className="ph-inline-actions">
            <button className="ph-button ph-button-secondary" type="button" onClick={handleEditUsername}>
              Change username
            </button>
            <button className="ph-button ph-button-secondary" type="button" onClick={handleEditPassword}>
              Edit password
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Add payment or withdrawal" description="Quick teacher account actions.">
          <div className="ph-inline-actions ph-inline-actions-between">
            <button
              className="ph-button ph-button-secondary"
              type="button"
              onClick={fillPaymentExample}
            >
              + Add payment
            </button>
            <button
              className="ph-button ph-button-secondary ph-button-danger-soft"
              type="button"
              onClick={fillWithdrawalExample}
            >
              - Add withdrawal
            </button>
          </div>

          <form className="ph-form" onSubmit={handleTransactionAdd}>
            <label className="ph-field">
              <span>Description</span>
              <input
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, description: event.target.value })
                }
                required
              />
            </label>

            <label className="ph-field">
              <span>Category</span>
              <input
                value={transactionForm.category}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, category: event.target.value })
                }
              />
            </label>

            <label className="ph-field">
              <span>Amount</span>
              <input
                type="number"
                step="0.01"
                value={transactionForm.amount}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, amount: event.target.value })
                }
              />
            </label>

            <label className="ph-field">
              <span>Date</span>
              <input
                type="date"
                value={transactionForm.date}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, date: event.target.value })
                }
              />
            </label>

            <label className="ph-checkbox-row">
              <input
                type="checkbox"
                checked={transactionForm.suspicious}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, suspicious: event.target.checked })
                }
              />
              {" "}Mark as payment to check
            </label>

            <button className="ph-button ph-button-primary" type="submit">
              Save transaction
            </button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Recent transactions" description="Review and delete account activity.">
        {transactions.length === 0 ? (
          <EmptyState title="No transactions" message="No transactions have been added for this student yet." />
        ) : (
          <div className="ph-table-wrap">
            <table className="ph-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td className={transaction.amount < 0 ? "ph-amount-out" : "ph-amount-in"}>
                      {transaction.amount < 0 ? "-" : "+"}£{Math.abs(transaction.amount).toFixed(2)}
                    </td>
                    <td>{transaction.category}</td>
                    <td>
                      {transaction.suspicious ? (
                        <span className="ph-badge ph-badge-warning">Check</span>
                      ) : (
                        <span className="ph-badge">Normal</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="ph-button ph-button-secondary ph-button-danger-soft"
                        type="button"
                        onClick={() => handleDeleteTransaction(transaction)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Fraud reports" description="Reports raised from this account.">
        {reports.length === 0 ? (
          <p className="ph-muted">No fraud reports for this student yet.</p>
        ) : (
          <div className="ph-report-list">
            {reports.map((report) => (
              <div className="ph-report-row" key={report.id}>
                <div>
                  <strong>{report.status}</strong>
                  <p>{report.reason}</p>
                </div>
                <div>{report.submittedAt}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}