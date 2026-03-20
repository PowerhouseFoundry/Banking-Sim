import React, { useState } from "react";
import {
  getAllStudents,
  getTransactionTemplates,
  saveTransactionTemplate,
  addTransactionToStudents,
  addTransactionToClass,
  getClassGroups,
  applyQuickPaymentToAllStudents
} from "../../services/bankService.js";

export default function BulkTransactionForm() {
  const students = getAllStudents();
  const templates = getTransactionTemplates();
  const classGroups = getClassGroups();

  const [statementName, setStatementName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [applyMode, setApplyMode] = useState("selected");
  const [selectedClass, setSelectedClass] = useState("");

  function toggleStudent(id) {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  }

  function resetForm() {
    setStatementName("");
    setAmount("");
    setCategory("Other");
    setSelectedStudents([]);
    setSelectedClass("");
  }

  function applyTransaction() {
    if (!statementName || amount === "") {
      window.alert("Please complete the statement name and amount.");
      return;
    }

    const transaction = {
      description: statementName,
      category,
      amount: Number(amount),
      suspicious: false
    };

    if (applyMode === "all") {
      const count = applyQuickPaymentToAllStudents(transaction);
      window.alert(`Transaction applied to ${count} students.`);
      resetForm();
      return;
    }

    if (applyMode === "class") {
      if (!selectedClass) {
        window.alert("Please choose a class.");
        return;
      }

      const count = addTransactionToClass(selectedClass, transaction);
      window.alert(`Transaction applied to ${count} students in ${selectedClass}.`);
      resetForm();
      return;
    }

    if (selectedStudents.length === 0) {
      window.alert("Please select at least one student.");
      return;
    }

    const count = addTransactionToStudents(selectedStudents, transaction);
    window.alert(`Transaction applied to ${count} students.`);
    resetForm();
  }

  function saveTemplate() {
    if (!templateName || !statementName || amount === "") {
      window.alert("Complete template name, statement name, and amount first.");
      return;
    }

    saveTransactionTemplate({
      templateName,
      statementName,
      amount: Number(amount),
      category
    });

    window.alert("Template saved.");
    setTemplateName("");
  }

  function loadTemplate(template) {
    setStatementName(template.statementName || "");
    setAmount(String(template.amount ?? ""));
    setCategory(template.category || "Other");
  }

  return (
    <div className="ph-card">
      <h3>Bulk Transactions and Transaction Bank</h3>

      <div style={{ marginBottom: "16px" }}>
        <strong>Transaction Bank</strong>
        <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className="ph-button ph-button-secondary"
              onClick={() => loadTemplate(template)}
            >
              {template.templateName} - {template.statementName}
            </button>
          ))}
        </div>
      </div>

      <div className="ph-form">
        <label className="ph-field">
          <span>Statement name</span>
          <input
            value={statementName}
            onChange={(e) => setStatementName(e.target.value)}
            placeholder="WORK EXPERIENCE PAY"
          />
        </label>

        <label className="ph-field">
          <span>Amount</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="35"
          />
        </label>

        <label className="ph-field">
          <span>Category</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Pay"
          />
        </label>
      </div>

      <div style={{ marginTop: "16px" }}>
        <strong>Apply to</strong>

        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="radio"
              name="applyMode"
              value="selected"
              checked={applyMode === "selected"}
              onChange={() => setApplyMode("selected")}
            />
            {" "}Selected students
          </label>

          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="radio"
              name="applyMode"
              value="class"
              checked={applyMode === "class"}
              onChange={() => setApplyMode("class")}
            />
            {" "}Whole class
          </label>

          <label style={{ display: "block", marginBottom: "8px" }}>
            <input
              type="radio"
              name="applyMode"
              value="all"
              checked={applyMode === "all"}
              onChange={() => setApplyMode("all")}
            />
            {" "}All students
          </label>
        </div>

        {applyMode === "class" ? (
          <select
            className="ph-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">Choose a class</option>
            {classGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        ) : null}

        {applyMode === "selected" ? (
          <div style={{ marginTop: "12px" }}>
            <strong>Select students</strong>
            <div style={{ marginTop: "8px" }}>
              {students.map((student) => (
                <div key={student.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => toggleStudent(student.id)}
                    />
                    {" "}{student.name} ({student.classGroup})
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          className="ph-button ph-button-primary"
          onClick={applyTransaction}
        >
          Apply Transaction
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h4>Save to Transaction Bank</h4>

      <label className="ph-field">
        <span>Template name</span>
        <input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Work Experience Pay"
        />
      </label>

      <div style={{ marginTop: "12px" }}>
        <button
          type="button"
          className="ph-button ph-button-secondary"
          onClick={saveTemplate}
        >
          Save to Transaction Bank
        </button>
      </div>
    </div>
  );
}