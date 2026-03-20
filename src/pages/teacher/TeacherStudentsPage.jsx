import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import {
  addStudent,
  getAllStudents,
  getClassGroups,
  updateStudent,
  updateStudentLogin,
  resetStudentPassword,
  deleteStudent
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function TeacherStudentsPage() {
  useBankRefresh();
  const navigate = useNavigate();

  const students = getAllStudents();
  const classGroups = getClassGroups();

  const [selectedClass, setSelectedClass] = useState(classGroups[0] || "");
  const [searchText, setSearchText] = useState("");
  const [isAddingNewClass, setIsAddingNewClass] = useState(false);
  const [newClassName, setNewClassName] = useState("");

  const [form, setForm] = useState({
    name: "",
    classGroup: "",
    startingBalance: "",
    username: "",
    password: ""
  });

  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => !selectedClass || student.classGroup === selectedClass)
      .filter((student) =>
        student.name.toLowerCase().includes(searchText.toLowerCase().trim())
      );
  }, [students, selectedClass, searchText]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert("Enter a student name.");
      return;
    }

    const finalClassGroup = isAddingNewClass
      ? newClassName.trim()
      : form.classGroup.trim();

    if (!finalClassGroup) {
      window.alert("Select a class or enter a new class name.");
      return;
    }

    addStudent({
      name: form.name.trim(),
      classGroup: finalClassGroup,
      startingBalance: Number(form.startingBalance) || 0,
      username: form.username,
      password: form.password
    });

    setSelectedClass(finalClassGroup);
    setIsAddingNewClass(false);
    setNewClassName("");
    setForm({
      name: "",
      classGroup: "",
      startingBalance: "",
      username: "",
      password: ""
    });
  }

  function handleClassChange(value) {
    if (value === "__new__") {
      setIsAddingNewClass(true);
      setForm((current) => ({
        ...current,
        classGroup: ""
      }));
      return;
    }

    setIsAddingNewClass(false);
    setNewClassName("");
    setForm((current) => ({
      ...current,
      classGroup: value
    }));
  }

  function handleEditStudent(student) {
    const newName = window.prompt("Student name", student.name);
    if (newName === null) return;

    const newClass = window.prompt("Class group", student.classGroup);
    if (newClass === null) return;

    updateStudent(student.id, {
      name: newName,
      classGroup: newClass
    });
  }

  function handleEditUsername(student) {
    const newUsername = window.prompt(
      `Edit username for ${student.name}`,
      student.login?.username || ""
    );

    if (newUsername === null) return;

    try {
      updateStudentLogin(student.id, { username: newUsername });
      window.alert("Username updated.");
    } catch (error) {
      window.alert(error.message || "Could not update username.");
    }
  }

  function handleEditPassword(student) {
    const newPassword = window.prompt(
      `Edit password for ${student.name}`,
      student.login?.password || "student123"
    );

    if (newPassword === null) return;

    try {
      updateStudentLogin(student.id, { password: newPassword });
      window.alert("Password updated.");
    } catch (error) {
      window.alert(error.message || "Could not update password.");
    }
  }

  function handleResetPassword(student) {
    const confirmed = window.confirm(
      `Reset ${student.name}'s password to student123?`
    );

    if (!confirmed) return;

    resetStudentPassword(student.id, "student123");
    window.alert("Password reset to student123.");
  }

  function handleDeleteStudent(student) {
    const confirmed = window.confirm(
      `Delete ${student.name}? This removes their login, account, and all banking data.`
    );

    if (!confirmed) return;

    deleteStudent(student.id);
  }

  function handleViewProfile(student) {
    navigate(`/teacher/students/${student.id}`);
  }

  return (
    <AppShell
      title="Students"
      subtitle="Create students, manage banking records, and control login details."
    >
      <div className="ph-grid ph-grid-2">
        <SectionCard
          title="Add student"
          description="Create a student with bank account and login details."
        >
          <form className="ph-form" onSubmit={handleSubmit}>
            <label className="ph-field">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                required
              />
            </label>

            <label className="ph-field">
              <span>Class group</span>
              <select
                className="ph-select"
                value={isAddingNewClass ? "__new__" : form.classGroup}
                onChange={(event) => handleClassChange(event.target.value)}
                required={!isAddingNewClass}
              >
                <option value="">Select class</option>
                {classGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
                <option value="__new__">+ Add new class</option>
              </select>
            </label>

            {isAddingNewClass ? (
              <label className="ph-field">
                <span>New class name</span>
                <input
                  value={newClassName}
                  onChange={(event) => setNewClassName(event.target.value)}
                  placeholder="Enter new class name"
                  required
                />
              </label>
            ) : null}

            <label className="ph-field">
              <span>Starting balance</span>
              <input
                type="number"
                step="0.01"
                value={form.startingBalance}
                onChange={(event) =>
                  setForm({ ...form, startingBalance: event.target.value })
                }
                placeholder="0.00"
              />
            </label>

            <label className="ph-field">
              <span>Username</span>
              <input
                value={form.username}
                onChange={(event) =>
                  setForm({ ...form, username: event.target.value })
                }
                placeholder="Leave blank to auto-create"
              />
            </label>

            <label className="ph-field">
              <span>Password</span>
              <input
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="Leave blank for student123"
              />
            </label>

            <button className="ph-button ph-button-primary" type="submit">
              Add student
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Teacher note"
          description="This is mock admin login control for the training app."
        >
          <div className="ph-simple-list">
            <p><strong>Teacher admin login</strong></p>
            <p>Username: <strong>admin</strong></p>
            <p>Password: <strong>powerhouse123</strong></p>
            <p className="ph-muted" style={{ marginTop: "12px" }}>
              Staff can view and edit student usernames and passwords here because this is a training system, not a real bank.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Student list"
        description="Open a student profile to see transactions, payments, direct debits, and login details."
      >
        <div className="ph-class-toggle-bar" style={{ marginBottom: "16px", flexWrap: "wrap" }}>
          {classGroups.map((group) => (
            <button
              key={group}
              type="button"
              className={
                selectedClass === group
                  ? "ph-button ph-button-primary"
                  : "ph-button ph-button-secondary"
              }
              onClick={() => setSelectedClass(group)}
            >
              {group}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            className="ph-teacher-search"
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search student name"
          />
        </div>

        <div className="ph-table-wrap">
          <table className="ph-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class</th>
                <th>Balance</th>
                <th>Username</th>
                <th>Password</th>
                <th>Profile</th>
                <th>Login actions</th>
                <th>Student</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.classGroup}</td>
                  <td>£{student.account?.balance?.toFixed(2) || "0.00"}</td>
                  <td>{student.login?.username || "-"}</td>
                  <td>{student.login?.password || "-"}</td>

                  <td>
                    <button
                      className="ph-button ph-button-primary"
                      type="button"
                      onClick={() => handleViewProfile(student)}
                    >
                      View Profile
                    </button>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        className="ph-button ph-button-secondary"
                        type="button"
                        onClick={() => handleEditUsername(student)}
                      >
                        Username
                      </button>

                      <button
                        className="ph-button ph-button-secondary"
                        type="button"
                        onClick={() => handleEditPassword(student)}
                      >
                        Password
                      </button>

                      <button
                        className="ph-button ph-button-secondary"
                        type="button"
                        onClick={() => handleResetPassword(student)}
                      >
                        Reset
                      </button>
                    </div>
                  </td>

                  <td>
                    <button
                      className="ph-button ph-button-secondary"
                      type="button"
                      onClick={() => handleEditStudent(student)}
                    >
                      Edit
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => handleDeleteStudent(student)}
                      style={{
                        border: "none",
                        background: "transparent",
                        fontSize: "1.3rem",
                        fontWeight: "700",
                        color: "#c62828",
                        cursor: "pointer"
                      }}
                      aria-label={`Delete ${student.name}`}
                      title={`Delete ${student.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}

              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="ph-muted" style={{ padding: "20px" }}>
                    No students found in this class.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </AppShell>
  );
}