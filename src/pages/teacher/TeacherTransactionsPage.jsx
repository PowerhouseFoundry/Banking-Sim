import React, { useEffect, useMemo, useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import {
  addTransactionToStudents,
  createRecurringPayment,
  deleteRecurringPayment,
  getAllStudents,
  getClassGroups,
  getRecurringPayments,
  runDueMonthlyBills,
  runDueWeeklyPayments,
  toggleRecurringPaymentAutomatic,
  toggleRecurringPaymentActive,
  waitForPendingBankSave
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

const REWARD_PRESETS_KEY = "plcBankRewardPresets";
const SANCTION_PRESETS_KEY = "plcBankSanctionPresets";

function loadPresets(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function savePresets(key, presets) {
  window.localStorage.setItem(key, JSON.stringify(presets));
}

function createPresetId() {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function TeacherTransactionsPage() {
  useBankRefresh();

  const students = getAllStudents();
  const classGroups = getClassGroups();
  const recurringPayments = getRecurringPayments();

  const [tab, setTab] = useState("bills");
  const [formError, setFormError] = useState("");
  const [activeBillClass, setActiveBillClass] = useState("All");

  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const [billForm, setBillForm] = useState({
    classGroup: classGroups[0] || "",
    statementName: "",
    amount: "",
    monthlyDay: "1"
  });

  const [rewardPresets, setRewardPresets] = useState(() =>
    loadPresets(REWARD_PRESETS_KEY, [
      { id: createPresetId(), name: "Excellent work", amount: "5.00" },
      { id: createPresetId(), name: "Great attendance", amount: "3.00" }
    ])
  );

  const [sanctionPresets, setSanctionPresets] = useState(() =>
    loadPresets(SANCTION_PRESETS_KEY, [
      { id: createPresetId(), name: "Late fine", amount: "2.00" },
      { id: createPresetId(), name: "Behaviour sanction", amount: "5.00" }
    ])
  );

  const [newRewardPreset, setNewRewardPreset] = useState({
    name: "",
    amount: ""
  });

  const [newSanctionPreset, setNewSanctionPreset] = useState({
    name: "",
    amount: ""
  });

  const [manualReward, setManualReward] = useState({
    statementName: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10)
  });

  const [manualSanction, setManualSanction] = useState({
    statementName: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [weeklyForm, setWeeklyForm] = useState({
    statementName: "",
    amount: "",
    type: "add",
    startDate: new Date().toISOString().slice(0, 10)
  });
const [activeStudentClass, setActiveStudentClass] = useState(classGroups[0] || "");
  useEffect(() => {
    savePresets(REWARD_PRESETS_KEY, rewardPresets);
  }, [rewardPresets]);

  useEffect(() => {
    savePresets(SANCTION_PRESETS_KEY, sanctionPresets);
  }, [sanctionPresets]);

  useEffect(() => {
    if (!classGroups.includes(activeStudentClass) && classGroups[0]) {
      setActiveStudentClass(classGroups[0]);
    }
  }, [classGroups, activeStudentClass]);

  const studentsByClass = useMemo(() => {
    return classGroups.reduce((acc, group) => {
      acc[group] = students.filter((student) => student.classGroup === group);
      return acc;
    }, {});
  }, [students, classGroups]);

  const activeClassStudents = studentsByClass[activeStudentClass] || [];

  const monthlyBills = useMemo(() => {
    return recurringPayments.filter(
      (item) => item.frequency === "monthly" && Number(item.amount) < 0
    );
  }, [recurringPayments]);

  const weeklyPayments = useMemo(() => {
    return recurringPayments.filter((item) => item.frequency === "weekly");
  }, [recurringPayments]);

  function filterRecurringPaymentsByClass(payments) {
    if (activeBillClass === "All") {
      return payments;
    }

    const classStudentIds = new Set(
      students
        .filter((student) => student.classGroup === activeBillClass)
        .map((student) => student.id)
    );

    return payments.filter((payment) =>
      (payment.studentIds || []).some((studentId) => classStudentIds.has(studentId))
    );
  }

  const visibleMonthlyBills = useMemo(() => {
    return filterRecurringPaymentsByClass(monthlyBills);
  }, [monthlyBills, activeBillClass, students]);

  const visibleWeeklyPayments = useMemo(() => {
    return filterRecurringPaymentsByClass(weeklyPayments);
  }, [weeklyPayments, activeBillClass, students]);
  function toggleStudent(studentId) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId]
    );
  }

  function tickWholeClass(group) {
    const ids = (studentsByClass[group] || []).map((student) => student.id);
    setSelectedStudentIds((current) => Array.from(new Set([...current, ...ids])));
  }

  function clearWholeClass(group) {
    const ids = new Set((studentsByClass[group] || []).map((student) => student.id));
    setSelectedStudentIds((current) => current.filter((id) => !ids.has(id)));
  }

  function clearAllSelectedStudents() {
    setSelectedStudentIds([]);
  }

  function handleCreateBill(event) {
    event.preventDefault();
    setFormError("");

    const selectedClassStudents = students.filter(
      (student) => student.classGroup === billForm.classGroup
    );

    const numericAmount = Number(billForm.amount);

    if (!billForm.classGroup) {
      setFormError("Choose a class.");
      return;
    }

    if (!billForm.statementName.trim()) {
      setFormError("Enter a bill name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a bill amount greater than 0.");
      return;
    }

    if (selectedClassStudents.length === 0) {
      setFormError("There are no students in that class.");
      return;
    }

    try {
      createRecurringPayment({
        studentIds: selectedClassStudents.map((student) => student.id),
        statementName: billForm.statementName.trim(),
        amount: numericAmount,
        type: "take",
        startDate: new Date().toISOString().slice(0, 10),
        monthlyDay: billForm.monthlyDay,
        frequency: "monthly"
      });

      window.alert(
        `Monthly bill saved for ${billForm.classGroup}. It is due on day ${billForm.monthlyDay} each month. Use Set to automatic when you are ready for it to run automatically.`
      );

      setBillForm({
        classGroup: billForm.classGroup,
        statementName: "",
        amount: "",
        monthlyDay: billForm.monthlyDay
      });
    } catch (error) {
      setFormError(error.message || "Could not save monthly bill.");
    }
  }
async function handleRunDueBillsNow() {
  setFormError("");

  const confirmed = window.confirm(
    "Run all bills due today or earlier? This will deduct money from student accounts and add transactions. Continue?"
  );

  if (!confirmed) return;

  try {
    const result = runDueMonthlyBills(new Date().toISOString().slice(0, 10));
    await waitForPendingBankSave();
    window.alert(
      result.transactionCount === 0
        ? "No monthly bills are due."
        : `${result.transactionCount} learner bill${result.transactionCount === 1 ? "" : "s"} processed.`
    );
  } catch (error) {
    setFormError(error.message || "Could not run due bills.");
  }
}

  async function handleCreateWeeklyPayment(event) {
    event.preventDefault();
    setFormError("");

    if (selectedStudentIds.length === 0) {
      setFormError("Tick at least one learner first.");
      return;
    }

    const numericAmount = Number(weeklyForm.amount);
    if (!weeklyForm.statementName.trim()) {
      setFormError("Enter a job or payment name.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter an amount greater than 0.");
      return;
    }

    try {
      createRecurringPayment({
        studentIds: selectedStudentIds,
        statementName: weeklyForm.statementName.trim(),
        amount: numericAmount,
        type: weeklyForm.type,
        startDate: weeklyForm.startDate,
        frequency: "weekly"
      });
      await waitForPendingBankSave();
      window.alert(`Weekly payment saved for ${selectedStudentIds.length} learner${selectedStudentIds.length === 1 ? "" : "s"}.`);
      setWeeklyForm({
        statementName: "",
        amount: "",
        type: "add",
        startDate: new Date().toISOString().slice(0, 10)
      });
    } catch (error) {
      setFormError(error.message || "Could not save weekly payment.");
    }
  }

  async function handleRunDueWeeklyPayments() {
    setFormError("");
    if (!window.confirm("Run every weekly payment due today or earlier? Money will be added to or taken from the selected learners' accounts.")) return;

    try {
      const result = runDueWeeklyPayments(new Date().toISOString().slice(0, 10));
      await waitForPendingBankSave();
      window.alert(
        result.transactionCount === 0
          ? "No weekly payments are due."
          : `${result.transactionCount} learner payment${result.transactionCount === 1 ? "" : "s"} processed across ${result.scheduleCount} schedule${result.scheduleCount === 1 ? "" : "s"}.`
      );
    } catch (error) {
      setFormError(error.message || "Could not run weekly payments.");
    }
  }

  async function handleToggleWeeklyPayment(item) {
    toggleRecurringPaymentActive(item.id);
    await waitForPendingBankSave();
  }

  async function handleToggleAutomatic(item) {
    try {
      toggleRecurringPaymentAutomatic(item.id);
      await waitForPendingBankSave();
    } catch (error) {
      setFormError(error.message || "Could not change automatic payment setting.");
    }
  }

  async function handleDeleteRecurringPayment(item) {
    if (!window.confirm(`Delete ${item.statementName}? This stops future payments but does not remove past transactions.`)) return;
    deleteRecurringPayment(item.id);
    await waitForPendingBankSave();
  }
  function applyPresetToSelectedStudents(preset, type) {
    setFormError("");

    if (selectedStudentIds.length === 0) {
      setFormError("Tick at least one student first.");
      return;
    }

    const numericAmount = Number(preset.amount);

    if (!preset.name.trim() || !numericAmount || numericAmount <= 0) {
      setFormError("That saved button is missing a name or amount.");
      return;
    }

    addTransactionToStudents(selectedStudentIds, {
      description: preset.name.trim(),
      category: type === "reward" ? "Reward" : "Sanction",
      amount: type === "reward" ? Math.abs(numericAmount) : -Math.abs(numericAmount),
      date: new Date().toISOString().slice(0, 10),
      suspicious: false
    });

    window.alert(
      `${preset.name} applied to ${selectedStudentIds.length} student${
        selectedStudentIds.length === 1 ? "" : "s"
      }.`
    );
  }

  function addRewardPreset(event) {
    event.preventDefault();
    setFormError("");

    const numericAmount = Number(newRewardPreset.amount);

    if (!newRewardPreset.name.trim()) {
      setFormError("Enter a reward name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a reward amount greater than 0.");
      return;
    }

    setRewardPresets((current) => [
      ...current,
      {
        id: createPresetId(),
        name: newRewardPreset.name.trim(),
        amount: numericAmount.toFixed(2)
      }
    ]);

    setNewRewardPreset({ name: "", amount: "" });
  }

  function addSanctionPreset(event) {
    event.preventDefault();
    setFormError("");

    const numericAmount = Number(newSanctionPreset.amount);

    if (!newSanctionPreset.name.trim()) {
      setFormError("Enter a sanction name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a sanction amount greater than 0.");
      return;
    }

    setSanctionPresets((current) => [
      ...current,
      {
        id: createPresetId(),
        name: newSanctionPreset.name.trim(),
        amount: numericAmount.toFixed(2)
      }
    ]);

    setNewSanctionPreset({ name: "", amount: "" });
  }

  function deleteRewardPreset(id) {
    setRewardPresets((current) => current.filter((item) => item.id !== id));
  }

  function deleteSanctionPreset(id) {
    setSanctionPresets((current) => current.filter((item) => item.id !== id));
  }

  function handleManualReward(event) {
    event.preventDefault();
    setFormError("");

    const numericAmount = Number(manualReward.amount);

    if (selectedStudentIds.length === 0) {
      setFormError("Tick at least one student first.");
      return;
    }

    if (!manualReward.statementName.trim()) {
      setFormError("Enter a reward name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a reward amount greater than 0.");
      return;
    }

    addTransactionToStudents(selectedStudentIds, {
      description: manualReward.statementName.trim(),
      category: "Reward",
      amount: Math.abs(numericAmount),
      date: manualReward.date,
      suspicious: false
    });

    window.alert(
      `Reward added to ${selectedStudentIds.length} student${
        selectedStudentIds.length === 1 ? "" : "s"
      }.`
    );

    setManualReward({
      statementName: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10)
    });
  }

  function handleManualSanction(event) {
    event.preventDefault();
    setFormError("");

    const numericAmount = Number(manualSanction.amount);

    if (selectedStudentIds.length === 0) {
      setFormError("Tick at least one student first.");
      return;
    }

    if (!manualSanction.statementName.trim()) {
      setFormError("Enter a sanction name.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setFormError("Enter a sanction amount greater than 0.");
      return;
    }

    addTransactionToStudents(selectedStudentIds, {
      description: manualSanction.statementName.trim(),
      category: "Sanction",
      amount: -Math.abs(numericAmount),
      date: manualSanction.date,
      suspicious: false
    });

    window.alert(
      `Sanction added to ${selectedStudentIds.length} student${
        selectedStudentIds.length === 1 ? "" : "s"
      }.`
    );

    setManualSanction({
      statementName: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10)
    });
  }

  return (
    <AppShell
      title="Transactions"
      subtitle="Manage monthly bills, weekly pay, rewards and sanctions."
    >
      <SectionCard
        title="Transactions manager"
        description="Use the tabs below to manage regular and one-off transactions."
      >
        <div className="ph-payment-toggle">
          <button
            type="button"
            className={tab === "bills" ? "ph-payment-toggle-active" : ""}
            onClick={() => {
              setTab("bills");
              setFormError("");
            }}
          >
            Bills
          </button>

          <button
            type="button"
            className={tab === "weekly" ? "ph-payment-toggle-active" : ""}
            onClick={() => {
              setTab("weekly");
              setFormError("");
            }}
          >
            Weekly Pay
          </button>

          <button
            type="button"
            className={tab === "rewards" ? "ph-payment-toggle-active" : ""}
            onClick={() => {
              setTab("rewards");
              setFormError("");
            }}
          >
            Rewards
          </button>

          <button
            type="button"
            className={tab === "sanctions" ? "ph-payment-toggle-active" : ""}
            onClick={() => {
              setTab("sanctions");
              setFormError("");
            }}
          >
            Sanctions
          </button>
        </div>
      </SectionCard>

      {formError ? <div className="ph-error-box">{formError}</div> : null}

      {tab === "bills" ? (
        <>
          <SectionCard
            title="Set monthly bill"
            description="Bills apply to a whole class. Choose the monthly date, then switch automation on when you are ready."
          >
            <form className="ph-form" onSubmit={handleCreateBill}>
              <label className="ph-field">
                <span>Class</span>
                <select
                  className="ph-select"
                  value={billForm.classGroup}
                  onChange={(event) =>
                    setBillForm({ ...billForm, classGroup: event.target.value })
                  }
                >
                  {classGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ph-field">
                <span>Bill name</span>
                <input
                  value={billForm.statementName}
                  onChange={(event) =>
                    setBillForm({ ...billForm, statementName: event.target.value })
                  }
                  placeholder="PHONE BILL"
                />
              </label>

              <label className="ph-field">
                <span>Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={billForm.amount}
                  onChange={(event) =>
                    setBillForm({ ...billForm, amount: event.target.value })
                  }
                  placeholder="15.00"
                />
              </label>

              <label className="ph-field">
                <span>Day of each month</span>
                <select
                  className="ph-select"
                  value={billForm.monthlyDay}
                  onChange={(event) =>
                    setBillForm({ ...billForm, monthlyDay: event.target.value })
                  }
                >
                  {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <small>Choose 1–28 so the date exists in every month.</small>
              </label>

              <button className="ph-button ph-button-primary" type="submit">
                Save monthly bill
              </button>
            </form>
          </SectionCard>

          <SectionCard
            title="Current monthly bills"
            description="Automatic bills run when the app opens and check again while it stays open. Manual bills wait for the Run button."
          >
            <div className="ph-class-toggle-bar" style={{ marginBottom: "16px", flexWrap: "wrap" }}>
  <button
    type="button"
    className={
      activeBillClass === "All"
        ? "ph-button ph-button-primary"
        : "ph-button ph-button-secondary"
    }
    onClick={() => setActiveBillClass("All")}
  >
    All
  </button>

  {classGroups.map((group) => (
    <button
      key={group}
      type="button"
      className={
        activeBillClass === group
          ? "ph-button ph-button-primary"
          : "ph-button ph-button-secondary"
      }
      onClick={() => setActiveBillClass(group)}
    >
      {group}
    </button>
  ))}
</div>
<div style={{ marginBottom: "16px" }}>
  <button
    className="ph-button ph-button-primary"
    type="button"
    onClick={handleRunDueBillsNow}
  >
    Run due bills now
  </button>
</div>
            {visibleMonthlyBills.length === 0 ? (
              <p className="ph-muted">No monthly bills have been added yet.</p>
            ) : (
              <div className="ph-recurring-list">
                {visibleMonthlyBills.map((item) => (
                  <div key={item.id} className="ph-recurring-card">
                    <div>
                      <h4>{item.statementName}</h4>
                      <p className="ph-muted">
                        {item.studentIds?.length || item.studentNames?.length || 0} student
                        {((item.studentIds?.length || item.studentNames?.length || 0) === 1) ? "" : "s"}
                      </p>
                      <p className="ph-muted">
                        Due on day {item.monthlyDay} each month · Next due: {item.nextDueDate || "Not set"}
                      </p>
                      <p className="ph-muted">
                        Automatic: <strong>{item.automatic ? "On" : "Off"}</strong>
                      </p>
                    </div>

                    <div className="ph-recurring-actions">
                      <div className="ph-amount-out">
                        -£{Math.abs(Number(item.amount || 0)).toFixed(2)}
                      </div>

                      <button
                        className={item.automatic ? "ph-button ph-button-primary ph-button-small" : "ph-button ph-button-secondary ph-button-small"}
                        type="button"
                        onClick={() => handleToggleAutomatic(item)}
                      >
                        {item.automatic ? "Automatic on" : "Set to automatic"}
                      </button>

                      <button
                        className="ph-button ph-button-secondary ph-button-small"
                        type="button"
                        onClick={() => deleteRecurringPayment(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

        </>
      ) : null}

      {(tab === "weekly" || tab === "rewards" || tab === "sanctions") ? (
        <>
          <SectionCard
            title="Choose class and students"
            description="Use the class tabs to show one class at a time, then tick the learners you need."
          >
            <div
              className="ph-class-toggle-bar"
              style={{ marginBottom: "16px", flexWrap: "wrap" }}
            >
              {classGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  className={
                    activeStudentClass === group
                      ? "ph-button ph-button-primary"
                      : "ph-button ph-button-secondary"
                  }
                  onClick={() => setActiveStudentClass(group)}
                >
                  {group}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
              <button
                type="button"
                className="ph-button ph-button-secondary"
                onClick={() => tickWholeClass(activeStudentClass)}
              >
                Tick whole class
              </button>

              <button
                type="button"
                className="ph-button ph-button-secondary"
                onClick={() => clearWholeClass(activeStudentClass)}
              >
                Clear class
              </button>

              <button
                type="button"
                className="ph-button ph-button-secondary"
                onClick={clearAllSelectedStudents}
              >
                Clear all selected
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "18px",
                padding: "16px",
                background: "white"
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "10px" }}>{activeStudentClass}</div>

              <div className="ph-student-pick-list" style={{ maxHeight: "unset" }}>
                {activeClassStudents.map((student) => (
                  <label key={student.id} className="ph-student-pick-item">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                    />
                    <span>{student.name}</span>
                  </label>
                ))}

                {activeClassStudents.length === 0 ? (
                  <div className="ph-muted">No students in this class.</div>
                ) : null}
              </div>
            </div>
          </SectionCard>

          {tab === "weekly" ? (
            <>
              <SectionCard
                title="Set weekly pay"
                description="Create a regular weekly wage or deduction for the ticked learners."
              >
                <form className="ph-form" onSubmit={handleCreateWeeklyPayment}>
                  <label className="ph-field">
                    <span>Job or payment name</span>
                    <input
                      value={weeklyForm.statementName}
                      onChange={(event) => setWeeklyForm({ ...weeklyForm, statementName: event.target.value })}
                      placeholder="LOFT COFFEE SHOP PAY"
                    />
                  </label>

                  <label className="ph-field">
                    <span>Amount</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={weeklyForm.amount}
                      onChange={(event) => setWeeklyForm({ ...weeklyForm, amount: event.target.value })}
                      placeholder="25.00"
                    />
                  </label>

                  <label className="ph-field">
                    <span>Type</span>
                    <select
                      className="ph-select"
                      value={weeklyForm.type}
                      onChange={(event) => setWeeklyForm({ ...weeklyForm, type: event.target.value })}
                    >
                      <option value="add">Add money (weekly pay)</option>
                      <option value="take">Take money (weekly deduction)</option>
                    </select>
                  </label>

                  <label className="ph-field">
                    <span>First payment date</span>
                    <input
                      type="date"
                      value={weeklyForm.startDate}
                      onChange={(event) => setWeeklyForm({ ...weeklyForm, startDate: event.target.value })}
                    />
                  </label>

                  <button className="ph-button ph-button-primary" type="submit">
                    Save weekly payment
                  </button>
                </form>
              </SectionCard>

              <SectionCard
                title="Weekly payment schedules"
                description="Automatic payments use the chosen weekday and catch up safely when the app next opens."
              >
                <div className="ph-class-toggle-bar" style={{ marginBottom: "16px", flexWrap: "wrap" }}>
                  <button type="button" className={activeBillClass === "All" ? "ph-button ph-button-primary" : "ph-button ph-button-secondary"} onClick={() => setActiveBillClass("All")}>All</button>
                  {classGroups.map((group) => (
                    <button key={group} type="button" className={activeBillClass === group ? "ph-button ph-button-primary" : "ph-button ph-button-secondary"} onClick={() => setActiveBillClass(group)}>{group}</button>
                  ))}
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <button className="ph-button ph-button-primary" type="button" onClick={handleRunDueWeeklyPayments}>
                    Run due weekly payments
                  </button>
                </div>

                {visibleWeeklyPayments.length === 0 ? (
                  <p className="ph-muted">No weekly payments have been added yet.</p>
                ) : (
                  <div className="ph-recurring-list">
                    {visibleWeeklyPayments.map((item) => {
                      const amount = Number(item.amount || 0);
                      const names = item.studentNames || [];
                      const groups = [...new Set((item.studentIds || []).map((id) => students.find((student) => student.id === id)?.classGroup).filter(Boolean))];
                      return (
                        <div key={item.id} className="ph-recurring-card" style={{ opacity: item.active === false ? 0.65 : 1 }}>
                          <div>
                            <h4>{item.statementName}</h4>
                            <p className="ph-muted"><strong>{groups.join(", ") || "Class not available"}</strong></p>
                            <p className="ph-muted">{names.join(", ") || "No learners found"}</p>
                            <p className="ph-muted">Last paid: {item.lastPaidDate || "Not paid yet"} · Next due: {item.nextDueDate || "Not set"}</p>
                            <p className="ph-muted">Status: {item.active === false ? "Paused" : "Active"} · Automatic: <strong>{item.automatic ? "On" : "Off"}</strong></p>
                          </div>
                          <div className="ph-recurring-actions">
                            <div className={amount < 0 ? "ph-amount-out" : "ph-amount-in"}>{amount < 0 ? "-" : "+"}£{Math.abs(amount).toFixed(2)}</div>
                            <button className={item.automatic ? "ph-button ph-button-primary ph-button-small" : "ph-button ph-button-secondary ph-button-small"} type="button" onClick={() => handleToggleAutomatic(item)}>{item.automatic ? "Automatic on" : "Set to automatic"}</button>
                            <button className="ph-button ph-button-secondary ph-button-small" type="button" onClick={() => handleToggleWeeklyPayment(item)}>{item.active === false ? "Resume" : "Pause"}</button>
                            <button className="ph-button ph-button-secondary ph-button-small" type="button" onClick={() => handleDeleteRecurringPayment(item)}>Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            </>
          ) : null}

          {tab !== "weekly" ? <SectionCard
            title="Saved buttons"
            description={
              tab === "rewards"
                ? "Create reward buttons you can press in one click."
                : "Create sanction buttons you can press in one click."
            }
          >
            <div
              style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                marginBottom: "18px"
              }}
            >
              {(tab === "rewards" ? rewardPresets : sanctionPresets).map((preset) => (
                <div
                  key={preset.id}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "18px",
                    padding: "16px",
                    background: "white",
                    boxShadow: "0 6px 16px rgba(20, 33, 61, 0.05)"
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: "8px" }}>{preset.name}</div>
                  <div
                    className={tab === "rewards" ? "ph-amount-in" : "ph-amount-out"}
                    style={{ marginBottom: "12px" }}
                  >
                    {tab === "rewards" ? "+" : "-"}£{Math.abs(Number(preset.amount || 0)).toFixed(2)}
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="ph-button ph-button-primary ph-button-small"
                      onClick={() => applyPresetToSelectedStudents(preset, tab === "rewards" ? "reward" : "sanction")}
                    >
                      Apply
                    </button>

                    <button
                      type="button"
                      className="ph-button ph-button-secondary ph-button-small"
                      onClick={() =>
                        tab === "rewards"
                          ? deleteRewardPreset(preset.id)
                          : deleteSanctionPreset(preset.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {tab === "rewards" ? (
              <form className="ph-form" onSubmit={addRewardPreset}>
                <label className="ph-field">
                  <span>Reward name</span>
                  <input
                    value={newRewardPreset.name}
                    onChange={(event) =>
                      setNewRewardPreset({ ...newRewardPreset, name: event.target.value })
                    }
                    placeholder="Excellent work"
                  />
                </label>

                <label className="ph-field">
                  <span>Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newRewardPreset.amount}
                    onChange={(event) =>
                      setNewRewardPreset({ ...newRewardPreset, amount: event.target.value })
                    }
                    placeholder="5.00"
                  />
                </label>

                <button className="ph-button ph-button-primary" type="submit">
                  Add new reward button
                </button>
              </form>
            ) : (
              <form className="ph-form" onSubmit={addSanctionPreset}>
                <label className="ph-field">
                  <span>Sanction name</span>
                  <input
                    value={newSanctionPreset.name}
                    onChange={(event) =>
                      setNewSanctionPreset({ ...newSanctionPreset, name: event.target.value })
                    }
                    placeholder="Late fine"
                  />
                </label>

                <label className="ph-field">
                  <span>Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newSanctionPreset.amount}
                    onChange={(event) =>
                      setNewSanctionPreset({ ...newSanctionPreset, amount: event.target.value })
                    }
                    placeholder="2.00"
                  />
                </label>

                <button className="ph-button ph-button-primary" type="submit">
                  Add new sanction button
                </button>
              </form>
            )}
          </SectionCard> : null}

          {tab !== "weekly" ? <SectionCard
            title={tab === "rewards" ? "Manual reward" : "Manual sanction"}
            description={
              tab === "rewards"
                ? "Add a one-off reward by typing your own text."
                : "Add a one-off sanction by typing your own text."
            }
          >
            {tab === "rewards" ? (
              <form className="ph-form" onSubmit={handleManualReward}>
                <label className="ph-field">
                  <span>Reward name</span>
                  <input
                    value={manualReward.statementName}
                    onChange={(event) =>
                      setManualReward({ ...manualReward, statementName: event.target.value })
                    }
                    placeholder="Outstanding teamwork"
                  />
                </label>

                <label className="ph-field">
                  <span>Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={manualReward.amount}
                    onChange={(event) =>
                      setManualReward({ ...manualReward, amount: event.target.value })
                    }
                    placeholder="4.00"
                  />
                </label>

                <label className="ph-field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={manualReward.date}
                    onChange={(event) =>
                      setManualReward({ ...manualReward, date: event.target.value })
                    }
                  />
                </label>

                <button className="ph-button ph-button-primary" type="submit">
                  Apply reward to ticked students
                </button>
              </form>
            ) : (
              <form className="ph-form" onSubmit={handleManualSanction}>
                <label className="ph-field">
                  <span>Sanction name</span>
                  <input
                    value={manualSanction.statementName}
                    onChange={(event) =>
                      setManualSanction({ ...manualSanction, statementName: event.target.value })
                    }
                    placeholder="Missed equipment"
                  />
                </label>

                <label className="ph-field">
                  <span>Amount</span>
                  <input
                    type="number"
                    step="0.01"
                    value={manualSanction.amount}
                    onChange={(event) =>
                      setManualSanction({ ...manualSanction, amount: event.target.value })
                    }
                    placeholder="3.00"
                  />
                </label>

                <label className="ph-field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={manualSanction.date}
                    onChange={(event) =>
                      setManualSanction({ ...manualSanction, date: event.target.value })
                    }
                  />
                </label>

                <button className="ph-button ph-button-primary" type="submit">
                  Apply sanction to ticked students
                </button>
              </form>
            )}
          </SectionCard> : null}
        </>
      ) : null}
    </AppShell>
  );
}
