import {
  mockAccounts,
  mockDirectDebits,
  mockFraudReports,
  mockNotifications,
  mockStudents,
  mockTransactions
} from "../data/mockData.js";

const STORAGE_KEY = "powerhouseBankingState";
const CHANGE_EVENT = "powerhouse-banking-updated";

const seedState = {
  students: mockStudents,
  accounts: mockAccounts,
  transactions: mockTransactions,
  directDebits: mockDirectDebits,
  notifications: mockNotifications,
  fraudReports: mockFraudReports
};

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function getBrowserStorage() {
  return typeof window !== "undefined" ? window.localStorage : null;
}

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

export function subscribeToBankingChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function initialiseBankState() {
  const storage = getBrowserStorage();
  if (!storage) {
    return clone(seedState);
  }

  const existing = storage.getItem(STORAGE_KEY);
  if (!existing) {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return clone(seedState);
  }

  try {
    return JSON.parse(existing);
  } catch {
    storage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return clone(seedState);
  }
}

function readState() {
  return initialiseBankState();
}

function writeState(nextState) {
  const storage = getBrowserStorage();
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  }
  emitChange();
  return nextState;
}

export function resetBankState() {
  return writeState(clone(seedState));
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function mapStudent(state, student) {
  return {
    ...student,
    account: state.accounts.find((account) => account.studentId === student.id) || null,
    transactions: state.transactions.filter((transaction) => transaction.studentId === student.id),
    reports: state.fraudReports.filter((report) => report.studentId === student.id),
    directDebits: state.directDebits.filter((item) => item.studentId === student.id)
  };
}

function addNotification(state, studentId, type, title, message) {
  state.notifications.unshift({
    id: createId("note"),
    studentId,
    type,
    title,
    message,
    read: false
  });
}

export function getStudentById(studentId) {
  const state = readState();
  return state.students.find((student) => student.id === studentId) || null;
}

export function getStudentAccount(studentId) {
  const state = readState();
  return state.accounts.find((account) => account.studentId === studentId) || null;
}

export function getStudentTransactions(studentId) {
  const state = readState();
  return state.transactions
    .filter((transaction) => transaction.studentId === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getStudentDirectDebits(studentId) {
  const state = readState();
  return state.directDebits.filter((item) => item.studentId === studentId);
}

export function getStudentNotifications(studentId) {
  const state = readState();
  return state.notifications.filter((item) => item.studentId === studentId);
}

export function getStudentFraudReports(studentId) {
  const state = readState();
  return state.fraudReports.filter((item) => item.studentId === studentId);
}

export function getTeacherOverview() {
  const state = readState();
  return {
    students: state.students.map((student) => mapStudent(state, student)),
    accounts: clone(state.accounts),
    reports: getAllFraudReports(),
    transactions: getAllTransactions(),
    directDebits: clone(state.directDebits)
  };
}

export function getAllStudents() {
  const state = readState();
  return state.students.map((student) => mapStudent(state, student));
}

export function getAllTransactions() {
  const state = readState();
  return state.transactions
    .map((transaction) => ({
      ...transaction,
      studentName: state.students.find((student) => student.id === transaction.studentId)?.name || "Unknown"
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getAllFraudReports() {
  const state = readState();
  return state.fraudReports
    .map((report) => ({
      ...report,
      transaction: state.transactions.find((transaction) => transaction.id === report.transactionId) || null
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getTransactionById(transactionId) {
  const state = readState();
  return state.transactions.find((transaction) => transaction.id === transactionId) || null;
}

export function addStudent({ name, classGroup, yearLabel, startingBalance = 0 }) {
  const state = readState();
  const studentId = createId("student");
  const accountId = createId("account");
  const safeName = name?.trim() || "New Student";

  state.students.push({
    id: studentId,
    userId: createId("u-student"),
    name: safeName,
    classGroup: classGroup?.trim() || "Mint",
    yearLabel: yearLabel?.trim() || "Year 1",
    accountId
  });

  state.accounts.push({
    id: accountId,
    studentId,
    balance: Number(startingBalance) || 0,
    accountName: "Everyday Account",
    cardStatus: "active"
  });

  addNotification(state, studentId, "success", "Account ready", `Your training bank account has been created for ${safeName}.`);
  writeState(state);
  return studentId;
}

export function updateStudent(studentId, updates) {
  const state = readState();
  const student = state.students.find((item) => item.id === studentId);
  if (!student) return null;

  Object.assign(student, {
    name: updates.name?.trim() || student.name,
    classGroup: updates.classGroup?.trim() || student.classGroup,
    yearLabel: updates.yearLabel?.trim() || student.yearLabel
  });

  writeState(state);
  return student;
}

export function addTransaction({ studentId, description, category, amount, date, suspicious = false }) {
  const state = readState();
  const account = state.accounts.find((item) => item.studentId === studentId);
  const student = state.students.find((item) => item.id === studentId);
  if (!account || !student) return null;

  const numericAmount = Number(amount) || 0;
  const txn = {
    id: createId("txn"),
    accountId: account.id,
    studentId,
    date: date || todayDate(),
    description: description?.trim() || "Manual transaction",
    category: category?.trim() || "Other",
    amount: numericAmount,
    suspicious: !!suspicious
  };

  state.transactions.push(txn);
  account.balance = Number((account.balance + numericAmount).toFixed(2));

  if (numericAmount > 0) {
    addNotification(state, studentId, "success", "Money added", `${txn.description} was added to your account.`);
  } else {
    addNotification(
      state,
      studentId,
      suspicious ? "warning" : "info",
      suspicious ? "Check this payment" : "New payment",
      suspicious ? `${txn.description} has been marked for checking.` : `${txn.description} has left your account.`
    );
  }

  writeState(state);
  return txn;
}

export function addDirectDebit({ studentId, merchant, amount, frequency, nextDate }) {
  const state = readState();
  const student = state.students.find((item) => item.id === studentId);
  if (!student) return null;

  const directDebit = {
    id: createId("dd"),
    studentId,
    merchant: merchant?.trim() || "New direct debit",
    amount: Math.abs(Number(amount) || 0),
    frequency: frequency?.trim() || "Monthly",
    nextDate: nextDate || todayDate(),
    active: true
  };

  state.directDebits.push(directDebit);
  addNotification(state, studentId, "info", "Direct debit added", `${directDebit.merchant} has been set up as a ${directDebit.frequency.toLowerCase()} payment.`);
  writeState(state);
  return directDebit;
}

export function createFraudReport({ studentId, transactionId, reason }) {
  const state = readState();
  const student = state.students.find((item) => item.id === studentId);
  const transaction = state.transactions.find((item) => item.id === transactionId);
  if (!student || !transaction) return null;

  const existing = state.fraudReports.find((item) => item.studentId === studentId && item.transactionId === transactionId && !["Resolved", "Teaching scenario complete"].includes(item.status));
  if (existing) {
    return existing;
  }

  const report = {
    id: createId("report"),
    studentId,
    transactionId,
    studentName: student.name,
    reason: reason?.trim() || "Please check this payment.",
    status: "New",
    submittedAt: todayDate()
  };

  state.fraudReports.unshift(report);
  transaction.suspicious = true;
  addNotification(state, studentId, "success", "Report sent", `Your report about ${transaction.description} has been sent to staff.`);
  writeState(state);
  return report;
}

export function updateFraudReportStatus(reportId, status) {
  const state = readState();
  const report = state.fraudReports.find((item) => item.id === reportId);
  if (!report) return null;

  report.status = status;
  let message = `Staff changed your payment report to ${status.toLowerCase()}.`;
  let type = "info";

  if (status === "Resolved") {
    type = "success";
  }
  if (status === "Teaching scenario") {
    message = "Staff marked this as a practice teaching scenario.";
  }
  if (status === "Teaching scenario complete") {
    type = "success";
    message = "Staff finished the teaching scenario for this payment.";
  }

  addNotification(state, report.studentId, type, "Report updated", message);
  writeState(state);
  return report;
}

export function markNotificationRead(notificationId) {
  const state = readState();
  const notification = state.notifications.find((item) => item.id === notificationId);
  if (!notification) return null;
  notification.read = true;
  writeState(state);
  return notification;
}

// Legacy aliases kept for backward compatibility during the mock-to-Firebase transition.
export const initialiseMockBankingState = initialiseBankState;
export const resetMockBankingState = resetBankState;
