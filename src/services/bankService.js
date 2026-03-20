import {
  mockAccounts,
  mockDirectDebits,
  mockFraudReports,
  mockNotifications,
  mockStudents,
  mockTransactions
} from "../data/mockData.js";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db, ensureFirebaseReady } from "./firebase.js";

const LOCAL_CACHE_KEY = "powerhouseBankingStateCache";
const CHANGE_EVENT = "powerhouse-banking-updated";

const STATE_DOC = doc(db, "bankState", "current");

let memoryState = null;
let startedSync = false;
let initialLoadPromise = null;
let saveQueue = Promise.resolve();

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function generateSortCode() {
  const part = () => Math.floor(Math.random() * 90 + 10);
  return `${part()}-${part()}-${part()}`;
}

function generateAccountNumber() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

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

function slugifyUsername(text) {
  return (text || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.{2,}/g, ".");
}

function makeUniqueUsername(baseUsername, existingLogins = []) {
  const taken = new Set(
    existingLogins.map((login) => (login.username || "").toLowerCase())
  );

  let candidate = baseUsername || "student";
  let counter = 1;

  while (taken.has(candidate.toLowerCase())) {
    candidate = `${baseUsername || "student"}${counter}`;
    counter += 1;
  }

  return candidate;
}

function createStudentLoginRecord(student, existingLogins = [], password = "student123") {
  const baseUsername = slugifyUsername(student.name) || `student.${student.id}`;
  const username = makeUniqueUsername(baseUsername, existingLogins);

  return {
    id: createId("login"),
    userId: student.userId,
    studentId: student.id,
    role: "student",
    username,
    password,
    active: true,
    displayName: student.name
  };
}

function buildSeedLogins() {
  const logins = [
    {
      id: "login-admin",
      userId: "u-teacher-admin",
      studentId: null,
      role: "teacher",
      username: "admin",
      password: "powerhouse123",
      active: true,
      displayName: "Powerhouse Admin"
    }
  ];

  mockStudents.forEach((student) => {
    const userId = student.userId || createId("u-student");
    student.userId = userId;

    logins.push(
      createStudentLoginRecord(
        {
          ...student,
          userId
        },
        logins
      )
    );
  });

  return logins;
}

const seedState = {
  students: mockStudents.map((student) => ({
    ...student,
    userId: student.userId || createId("u-student")
  })),
  accounts: mockAccounts,
  transactions: mockTransactions,
  directDebits: mockDirectDebits,
  notifications: mockNotifications,
  fraudReports: mockFraudReports,
  recurringPayments: [],
  shopOrders: [],
  logins: buildSeedLogins(),
  templates: []
};

function ensureStateShape(state) {
  const nextState = clone(state);

  if (!Array.isArray(nextState.students)) nextState.students = [];
  if (!Array.isArray(nextState.accounts)) nextState.accounts = [];
  if (!Array.isArray(nextState.transactions)) nextState.transactions = [];
  if (!Array.isArray(nextState.directDebits)) nextState.directDebits = [];
  if (!Array.isArray(nextState.notifications)) nextState.notifications = [];
  if (!Array.isArray(nextState.fraudReports)) nextState.fraudReports = [];
  if (!Array.isArray(nextState.recurringPayments)) nextState.recurringPayments = [];
  if (!Array.isArray(nextState.shopOrders)) nextState.shopOrders = [];
  if (!Array.isArray(nextState.templates)) nextState.templates = [];
  if (!Array.isArray(nextState.logins)) nextState.logins = [];

  nextState.students = nextState.students.map((student) => {
    if (!student.userId) {
      return {
        ...student,
        userId: createId("u-student")
      };
    }
    return student;
  });

  const hasTeacherLogin = nextState.logins.some((login) => login.role === "teacher");
  if (!hasTeacherLogin) {
    nextState.logins.unshift({
      id: "login-admin",
      userId: "u-teacher-admin",
      studentId: null,
      role: "teacher",
      username: "admin",
      password: "powerhouse123",
      active: true,
      displayName: "Powerhouse Admin"
    });
  }

  nextState.students.forEach((student) => {
    const existingLogin = nextState.logins.find(
      (login) => login.studentId === student.id
    );

    if (!existingLogin) {
      const newLogin = createStudentLoginRecord(student, nextState.logins, "student123");
      nextState.logins.push(newLogin);
    } else {
      existingLogin.displayName = student.name;
      existingLogin.role = "student";
      existingLogin.studentId = student.id;
      existingLogin.userId = student.userId;
      if (!existingLogin.username) {
        existingLogin.username = makeUniqueUsername(
          slugifyUsername(student.name) || "student",
          nextState.logins
        );
      }
      if (!existingLogin.password) {
        existingLogin.password = "student123";
      }
      if (existingLogin.active === undefined) {
        existingLogin.active = true;
      }
    }
  });

  nextState.accounts = nextState.accounts.map((account) => ({
    ...account,
    sortCode: account.sortCode || generateSortCode(),
    accountNumber: account.accountNumber || generateAccountNumber(),
    savingsBalance: Number(account.savingsBalance || 0),
    cardStatus: account.cardStatus || "active",
    accountType: account.accountType || "personal"
  }));

  if (!nextState.businessAccount) {
    nextState.businessAccount = {
      id: "business-rewards",
      name: "Powerhouse Rewards Shop",
      accountType: "business",
      sortCode: "40-11-22",
      accountNumber: "88005544",
      balance: 0
    };
  }

  return nextState;
}

function readLocalCache() {
  const storage = getBrowserStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(LOCAL_CACHE_KEY);
    if (!raw) return null;
    return ensureStateShape(JSON.parse(raw));
  } catch {
    return null;
  }
}

function saveLocalCache(state) {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.setItem(LOCAL_CACHE_KEY, JSON.stringify(ensureStateShape(state)));
}

function getDefaultState() {
  return ensureStateShape(seedState);
}

function setMemoryState(nextState) {
  memoryState = ensureStateShape(nextState);
  saveLocalCache(memoryState);
  emitChange();
  return memoryState;
}

async function loadInitialStateFromFirestore() {
  await ensureFirebaseReady();

  const snapshot = await getDoc(STATE_DOC);

  if (snapshot.exists()) {
    return setMemoryState(snapshot.data());
  }

  const startingState = readLocalCache() || getDefaultState();
  await setDoc(STATE_DOC, startingState);
  return setMemoryState(startingState);
}

function startFirestoreSync() {
  if (startedSync) return;
  startedSync = true;

  memoryState = readLocalCache() || getDefaultState();

  initialLoadPromise = loadInitialStateFromFirestore()
    .then(() => ensureFirebaseReady())
    .then(() => {
      onSnapshot(STATE_DOC, (snapshot) => {
        if (!snapshot.exists()) return;
        setMemoryState(snapshot.data());
      });
    })
    .catch((error) => {
      console.error("Failed to start Firestore sync:", error);
    });
}

export function waitForBankState() {
  startFirestoreSync();
  return initialLoadPromise || Promise.resolve(memoryState || getDefaultState());
}

export function subscribeToBankingChanges(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  startFirestoreSync();
  window.addEventListener(CHANGE_EVENT, callback);

  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function initialiseBankState() {
  startFirestoreSync();
  return memoryState || readLocalCache() || getDefaultState();
}

function readState() {
  startFirestoreSync();
  return memoryState || readLocalCache() || getDefaultState();
}

function writeState(nextState) {
  startFirestoreSync();

  const cleanState = ensureStateShape(nextState);
  setMemoryState(cleanState);

  saveQueue = saveQueue
    .then(async () => {
      await ensureFirebaseReady();
      await setDoc(STATE_DOC, cleanState);
    })
    .catch((error) => {
      console.error("Failed to save bank state:", error);
    });

  return cleanState;
}

export function resetBankState() {
  return writeState(clone(seedState));
}

function mapStudent(state, student) {
  return {
    ...student,
    account: state.accounts.find((account) => account.studentId === student.id) || null,
    transactions: state.transactions.filter((transaction) => transaction.studentId === student.id),
    reports: state.fraudReports.filter((report) => report.studentId === student.id),
    directDebits: state.directDebits.filter((item) => item.studentId === student.id),
    login: state.logins.find((login) => login.studentId === student.id) || null
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

export function authenticateLogin({ username, password }) {
  const state = readState();

  const login = state.logins.find(
    (item) =>
      item.active !== false &&
      (item.username || "").toLowerCase() === (username || "").trim().toLowerCase()
  );

  if (!login) {
    throw new Error("We could not find that username.");
  }

  if (login.password !== password) {
    throw new Error("Incorrect password.");
  }

  if (login.role === "teacher") {
    return {
      id: login.userId,
      loginId: login.id,
      name: login.displayName || "Powerhouse Admin",
      username: login.username,
      role: "teacher"
    };
  }

  const student = state.students.find((item) => item.id === login.studentId);

  if (!student) {
    throw new Error("This student account is missing.");
  }

  return {
    id: login.userId,
    loginId: login.id,
    studentId: student.id,
    name: student.name,
    username: login.username,
    role: "student",
    classGroup: student.classGroup
  };
}

export function getAllLoginDetails() {
  const state = readState();
  return clone(state.logins);
}

export function getStudentLoginDetails(studentId) {
  const state = readState();
  return state.logins.find((login) => login.studentId === studentId) || null;
}

export function updateStudentLogin(studentId, updates) {
  const state = readState();
  const login = state.logins.find((item) => item.studentId === studentId);
  const student = state.students.find((item) => item.id === studentId);

  if (!login || !student) return null;

  if (updates.username !== undefined) {
    const nextUsername = (updates.username || "").trim();
    const clash = state.logins.find(
      (item) =>
        item.id !== login.id &&
        (item.username || "").toLowerCase() === nextUsername
    );

    if (clash) {
      throw new Error("That username is already in use.");
    }

    if (nextUsername) {
      login.username = nextUsername;
    }
  }

  if (updates.password !== undefined) {
    const nextPassword = (updates.password || "").trim();
    if (nextPassword) {
      login.password = nextPassword;
    }
  }

  if (updates.active !== undefined) {
    login.active = !!updates.active;
  }

  login.displayName = student.name;

  writeState(state);
  return login;
}

export function resetStudentPassword(studentId, nextPassword = "student123") {
  return updateStudentLogin(studentId, { password: nextPassword });
}

export function changeStudentOwnPassword({
  loginId,
  currentPassword,
  newPassword,
  confirmPassword
}) {
  const state = readState();

  const login = state.logins.find((item) => item.id === loginId);

  if (!login || login.role !== "student") {
    throw new Error("Student login not found.");
  }

  if (login.password !== currentPassword) {
    throw new Error("Your current password is incorrect.");
  }

  const safeNewPassword = (newPassword || "").trim();
  const safeConfirmPassword = (confirmPassword || "").trim();

  if (!safeNewPassword) {
    throw new Error("Enter a new password.");
  }

  if (safeNewPassword !== safeConfirmPassword) {
    throw new Error("New passwords do not match.");
  }

  login.password = safeNewPassword;

  addNotification(
    state,
    login.studentId,
    "success",
    "Password changed",
    "Your password has been changed successfully."
  );

  writeState(state);
  return true;
}

export function getStudentById(studentId) {
  const state = readState();
  return state.students.find((student) => student.id === studentId) || null;
}

export function getStudentAccount(studentId) {
  const state = readState();
  return state.accounts.find((account) => account.studentId === studentId) || null;
}

export function getBusinessAccount() {
  const state = readState();
  return state.businessAccount || null;
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

  return state.fraudReports
    .filter((item) => item.studentId === studentId)
    .map((report) => ({
      ...report,
      transaction:
        state.transactions.find((transaction) => transaction.id === report.transactionId) ||
        null,
      resolutionTransaction:
        state.transactions.find(
          (transaction) => transaction.id === report.resolutionTransactionId
        ) || null,
      resolutionMessage: report.resolutionMessage || "",
      resolutionRefunded: !!report.resolutionRefunded,
      resolvedAt: report.resolvedAt || null
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
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
      studentName:
        state.students.find((student) => student.id === transaction.studentId)?.name ||
        "Unknown"
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getAllFraudReports() {
  const state = readState();
  return state.fraudReports
    .map((report) => ({
      ...report,
      transaction:
        state.transactions.find((transaction) => transaction.id === report.transactionId) ||
        null
    }))
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

export function getTransactionById(transactionId) {
  const state = readState();
  return state.transactions.find((transaction) => transaction.id === transactionId) || null;
}

export function addStudent({
  name,
  classGroup,
  yearLabel,
  startingBalance = 0,
  username,
  password
}) {
  const state = readState();
  const studentId = createId("student");
  const accountId = createId("account");
  const safeName = name?.trim() || "New Student";
  const userId = createId("u-student");

  const student = {
    id: studentId,
    userId,
    name: safeName,
    classGroup: classGroup?.trim() || "Mint",
    yearLabel: yearLabel?.trim() || "Year 1",
    accountId
  };

  state.students.push(student);

  state.accounts.push({
    id: accountId,
    studentId,
    balance: Number(startingBalance) || 0,
    savingsBalance: 0,
    accountName: "Everyday Account",
    cardStatus: "active",
    sortCode: generateSortCode(),
    accountNumber: generateAccountNumber(),
    accountType: "personal"
  });

  const desiredUsername = (username || "").trim();
  const finalUsername = desiredUsername
    ? makeUniqueUsername(desiredUsername, state.logins)
    : makeUniqueUsername(slugifyUsername(safeName) || "student", state.logins);

  state.logins.push({
    id: createId("login"),
    userId,
    studentId,
    role: "student",
    username: finalUsername,
    password: (password || "").trim() || "student123",
    active: true,
    displayName: safeName
  });

  addNotification(
    state,
    studentId,
    "success",
    "Account ready",
    `Your training bank account has been created for ${safeName}.`
  );

  writeState(state);
  return studentId;
}

export function updateStudent(studentId, updates) {
  const state = readState();
  const student = state.students.find((item) => item.id === studentId);
  const login = state.logins.find((item) => item.studentId === studentId);

  if (!student) return null;

  Object.assign(student, {
    name: updates.name?.trim() || student.name,
    classGroup: updates.classGroup?.trim() || student.classGroup,
    yearLabel: updates.yearLabel?.trim() || student.yearLabel
  });

  if (login) {
    login.displayName = student.name;
  }

  writeState(state);
  return student;
}

export function deleteStudent(studentId) {
  const state = readState();

  const student = state.students.find((item) => item.id === studentId);
  if (!student) return null;

  state.students = state.students.filter((item) => item.id !== studentId);
  state.accounts = state.accounts.filter((item) => item.studentId !== studentId);
  state.transactions = state.transactions.filter((item) => item.studentId !== studentId);
  state.directDebits = state.directDebits.filter((item) => item.studentId !== studentId);
  state.notifications = state.notifications.filter((item) => item.studentId !== studentId);
  state.fraudReports = state.fraudReports.filter((item) => item.studentId !== studentId);
  state.logins = state.logins.filter((item) => item.studentId !== studentId);
  state.recurringPayments = state.recurringPayments.filter((item) => !item.studentIds?.includes(studentId));
  state.shopOrders = state.shopOrders.filter((item) => item.studentId !== studentId);

  writeState(state);
  return true;
}

export function addTransaction({
  studentId,
  description,
  category,
  amount,
  date,
  suspicious = false
}) {
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
    addNotification(
      state,
      studentId,
      "success",
      "Money added",
      `${txn.description} was added to your account.`
    );
  } else {
    addNotification(
      state,
      studentId,
      suspicious ? "warning" : "info",
      suspicious ? "Check this payment" : "New payment",
      suspicious
        ? `${txn.description} has been marked for checking.`
        : `${txn.description} has left your account.`
    );
  }

  writeState(state);
  return txn;
}

export function deleteTransaction(transactionId) {
  const state = readState();

  const transactionIndex = state.transactions.findIndex((item) => item.id === transactionId);
  if (transactionIndex === -1) return null;

  const txn = state.transactions[transactionIndex];
  const account = state.accounts.find((item) => item.id === txn.accountId);

  if (account) {
    account.balance = Number((account.balance - txn.amount).toFixed(2));
  }

  state.transactions.splice(transactionIndex, 1);
  writeState(state);
  return txn;
}

export function updateTransaction(transactionId, updates) {
  const state = readState();

  const txn = state.transactions.find((item) => item.id === transactionId);
  if (!txn) return null;

  const account = state.accounts.find((item) => item.id === txn.accountId);
  if (!account) return null;

  const oldAmount = Number(txn.amount) || 0;
  const newAmount =
    updates.amount === undefined ? oldAmount : Number(updates.amount) || 0;

  txn.description =
    updates.description === undefined
      ? txn.description
      : updates.description?.trim() || txn.description;

  txn.category =
    updates.category === undefined
      ? txn.category
      : updates.category?.trim() || txn.category;

  txn.amount = newAmount;

  if (updates.date !== undefined) {
    txn.date = updates.date || txn.date;
  }

  if (updates.suspicious !== undefined) {
    txn.suspicious = !!updates.suspicious;
  }

  account.balance = Number((account.balance - oldAmount + newAmount).toFixed(2));

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

  addNotification(
    state,
    studentId,
    "info",
    "Direct debit added",
    `${directDebit.merchant} has been set up as a ${directDebit.frequency.toLowerCase()} payment.`
  );

  writeState(state);
  return directDebit;
}

export function deleteDirectDebit(directDebitId) {
  const state = readState();
  const index = state.directDebits.findIndex((item) => item.id === directDebitId);

  if (index === -1) return null;

  const directDebit = state.directDebits[index];
  state.directDebits.splice(index, 1);

  addNotification(
    state,
    directDebit.studentId,
    "info",
    "Direct debit removed",
    `${directDebit.merchant} has been removed from your regular payments.`
  );

  writeState(state);
  return directDebit;
}
export function createFraudReport({ studentId, transactionId, reason }) {
  const state = readState();
  const student = state.students.find((item) => item.id === studentId);
  const transaction = state.transactions.find((item) => item.id === transactionId);

  if (!student || !transaction) return null;

  const existing = state.fraudReports.find(
    (item) =>
      item.studentId === studentId &&
      item.transactionId === transactionId &&
      item.status !== "Resolved"
  );

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
    submittedAt: todayDate(),
    resolvedAt: null,
    resolutionMessage: "",
    resolutionRefunded: false,
    resolutionTransactionId: null
  };

  state.fraudReports.unshift(report);
  transaction.suspicious = true;

  addNotification(
    state,
    studentId,
    "success",
    "Report sent",
    `Your report about ${transaction.description} has been sent to staff.`
  );

  writeState(state);
  return report;
}
export function resolveFraudReport(reportId, { refund = false, message = "" } = {}) {
  const state = readState();
  const report = state.fraudReports.find((item) => item.id === reportId);
  if (!report) {
    throw new Error("Fraud report not found.");
  }

  if (report.status === "Resolved") {
    throw new Error("This fraud report has already been resolved.");
  }

  const account = state.accounts.find((item) => item.studentId === report.studentId);
  const originalTransaction = state.transactions.find(
    (item) => item.id === report.transactionId
  );

  if (!account || !originalTransaction) {
    throw new Error("The report is missing account or transaction details.");
  }

  const cleanMessage = (message || "").trim();

  report.status = "Resolved";
  report.resolvedAt = todayDate();
  report.resolutionMessage = cleanMessage;
  report.resolutionRefunded = !!refund;

  originalTransaction.suspicious = false;

  if (refund) {
    const refundAmount = Math.abs(Number(originalTransaction.amount) || 0);

    account.balance = Number((account.balance + refundAmount).toFixed(2));

    const refundTransaction = {
      id: createId("txn"),
      accountId: account.id,
      studentId: report.studentId,
      date: todayDate(),
      description: `FRAUD REFUND - ${originalTransaction.description}`,
      category: "Refund",
      amount: refundAmount,
      suspicious: false,
      fraudReportId: report.id
    };

    state.transactions.unshift(refundTransaction);
    report.resolutionTransactionId = refundTransaction.id;

    addNotification(
      state,
      report.studentId,
      "success",
      "Fraud report resolved",
      cleanMessage
        ? `Your report has been resolved. Refund given. Staff message: ${cleanMessage}`
        : "Your report has been resolved. Refund given."
    );
  } else {
    const reviewTransaction = {
      id: createId("txn"),
      accountId: account.id,
      studentId: report.studentId,
      date: todayDate(),
      description: "FRAUD REPORT REVIEWED - NO REFUND",
      category: "Fraud review",
      amount: 0,
      suspicious: false,
      fraudReportId: report.id
    };

    state.transactions.unshift(reviewTransaction);
    report.resolutionTransactionId = reviewTransaction.id;

    addNotification(
      state,
      report.studentId,
      "info",
      "Fraud report resolved",
      cleanMessage
        ? `Your report has been reviewed. No refund given. Staff message: ${cleanMessage}`
        : "Your report has been reviewed. No refund given."
    );
  }

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

export function moveMoneyToSavings(studentId, amount) {
  const state = readState();
  const account = state.accounts.find((item) => item.studentId === studentId);

  if (!account) {
    throw new Error("Account not found.");
  }

  const numericAmount = Number(amount);

  if (numericAmount <= 0) {
    throw new Error("Enter a valid amount.");
  }

  if (account.balance < numericAmount) {
    throw new Error("Not enough money in your main account.");
  }

  account.balance = Number((account.balance - numericAmount).toFixed(2));
  account.savingsBalance = Number(((account.savingsBalance || 0) + numericAmount).toFixed(2));

  state.transactions.unshift({
    id: createId("txn"),
    accountId: account.id,
    studentId,
    date: todayDate(),
    description: "TRANSFER TO SAVINGS",
    category: "Savings",
    amount: -numericAmount,
    suspicious: false
  });

  addNotification(state, studentId, "info", "Savings transfer", `£${numericAmount.toFixed(2)} moved to savings.`);
  writeState(state);
  return account;
}

export function moveMoneyFromSavings(studentId, amount) {
  const state = readState();
  const account = state.accounts.find((item) => item.studentId === studentId);

  if (!account) {
    throw new Error("Account not found.");
  }

  const numericAmount = Number(amount);

  if (numericAmount <= 0) {
    throw new Error("Enter a valid amount.");
  }

  if ((account.savingsBalance || 0) < numericAmount) {
    throw new Error("Not enough money in savings.");
  }

  account.savingsBalance = Number(((account.savingsBalance || 0) - numericAmount).toFixed(2));
  account.balance = Number((account.balance + numericAmount).toFixed(2));

  state.transactions.unshift({
    id: createId("txn"),
    accountId: account.id,
    studentId,
    date: todayDate(),
    description: "TRANSFER FROM SAVINGS",
    category: "Savings",
    amount: numericAmount,
    suspicious: false
  });

  addNotification(state, studentId, "info", "Savings transfer", `£${numericAmount.toFixed(2)} moved to your main account.`);
  writeState(state);
  return account;
}

export function applySavingsInterest(studentId) {
  const state = readState();
  const account = state.accounts.find((item) => item.studentId === studentId);

  if (!account) {
    throw new Error("Account not found.");
  }

  const balance = Number(account.savingsBalance || 0);
  const interest = Number((balance * 0.02).toFixed(2));

  if (interest <= 0) {
    return 0;
  }

  account.savingsBalance = Number((balance + interest).toFixed(2));

  state.transactions.unshift({
    id: createId("txn"),
    accountId: account.id,
    studentId,
    date: todayDate(),
    description: "SAVINGS INTEREST",
    category: "Savings",
    amount: interest,
    suspicious: false
  });

  addNotification(state, studentId, "success", "Interest added", `£${interest.toFixed(2)} interest added to savings.`);
  writeState(state);
  return interest;
}
export function applyMonthlyUpdate(runDate = todayDate()) {
  const state = readState();

  const OVERDRAFT_RATE = 0.35 / 12; // 35% yearly split monthly

  (state.recurringPayments || []).forEach((payment) => {
    if (!payment.active) {
      return;
    }

    const safeMonthlyDay = Math.min(
      Math.max(Number(payment.monthlyDay) || new Date(payment.nextDueDate).getDate() || 1, 1),
      28
    );

    while (payment.nextDueDate && payment.nextDueDate <= runDate) {
      const validStudentIds = [...new Set(payment.studentIds || [])].filter(Boolean);

      validStudentIds.forEach((studentId) => {
        const account = state.accounts.find((item) => item.studentId === studentId);
        if (!account) return;

        state.transactions.unshift({
          id: createId("txn"),
          accountId: account.id,
          studentId,
          date: payment.nextDueDate,
          description: payment.statementName || "MONTHLY PAYMENT",
          category: payment.amount < 0 ? "Deduction" : "Pay",
          amount: Number(payment.amount) || 0,
          suspicious: false
        });

        account.balance = Number((account.balance + Number(payment.amount || 0)).toFixed(2));

        if (Number(payment.amount) >= 0) {
          addNotification(
            state,
            studentId,
            "success",
            "Monthly payment added",
            `${payment.statementName} has been added to your account.`
          );
        } else {
          addNotification(
            state,
            studentId,
            "info",
            "Monthly payment taken",
            `${payment.statementName} has been taken from your account.`
          );
        }
      });

      payment.nextDueDate = addOneMonthToDueDate(payment.nextDueDate, safeMonthlyDay);
    }
  });

  state.accounts.forEach((account) => {
    const studentId = account.studentId;

    if (account.balance < 0) {
      const interest = Number((Math.abs(account.balance) * OVERDRAFT_RATE).toFixed(2));

      if (interest > 0) {
        account.balance = Number((account.balance - interest).toFixed(2));

        state.transactions.unshift({
          id: createId("txn"),
          accountId: account.id,
          studentId,
          date: runDate,
          description: "OVERDRAFT INTEREST CHARGE",
          category: "Charges",
          amount: -interest,
          suspicious: false
        });

        addNotification(
          state,
          studentId,
          "warning",
          "Overdraft charge",
          `£${interest.toFixed(2)} overdraft interest has been charged.`
        );
      }
    }

    const savings = Number(account.savingsBalance || 0);

    if (savings > 0) {
      const interest = Number((savings * 0.02).toFixed(2));

      account.savingsBalance = Number((savings + interest).toFixed(2));

      state.transactions.unshift({
        id: createId("txn"),
        accountId: account.id,
        studentId,
        date: runDate,
        description: "SAVINGS INTEREST",
        category: "Savings",
        amount: interest,
        suspicious: false
      });

      addNotification(
        state,
        studentId,
        "success",
        "Savings interest",
        `£${interest.toFixed(2)} added to your savings.`
      );
    }
  });

  writeState(state);
}
export function setCardStatus(studentId, status) {
  const state = readState();
  const account = state.accounts.find((item) => item.studentId === studentId);

  if (!account) {
    throw new Error("Account not found.");
  }

  account.cardStatus = status;

  addNotification(
    state,
    studentId,
    status === "frozen" ? "warning" : "success",
    status === "frozen" ? "Card frozen" : "Card active",
    status === "frozen"
      ? "Your card has been frozen."
      : "Your card has been unfrozen and is ready to use."
  );

  writeState(state);
  return account;
}

export function transferMoney({
  fromStudentId,
  paymentType = "person",
  sortCode,
  accountNumber,
  amount,
  reference
}) {
  const state = readState();

  const senderAccount = state.accounts.find(
    (acc) => acc.studentId === fromStudentId
  );

  if (!senderAccount) {
    throw new Error("Sender account not found.");
  }

  if (senderAccount.cardStatus === "frozen") {
    throw new Error("Your card is frozen. Unfreeze it before making payments.");
  }

  const numericAmount = Number(amount);

  if (numericAmount <= 0) {
    throw new Error("Invalid transfer amount.");
  }

if (senderAccount.balance < 0) {
  throw new Error("You cannot make payments while your account is overdrawn.");
}

if (senderAccount.balance < numericAmount) {
  throw new Error("Insufficient funds.");
}

  const cleanSortCode = (sortCode || "").trim();
  const cleanAccountNumber = (accountNumber || "").trim();
  const cleanReference = (reference || "").trim();

  if (!/^\d{2}-\d{2}-\d{2}$/.test(cleanSortCode)) {
    throw new Error("Sort code must be in the format 12-34-56.");
  }

  if (!/^\d{8}$/.test(cleanAccountNumber)) {
    throw new Error("Account number must be 8 digits.");
  }

  const senderStudent = state.students.find((s) => s.id === fromStudentId);
  if (!senderStudent) {
    throw new Error("Sender not found.");
  }

  let recipientName = "";
  let senderDescription = "";
  let recipientTransaction = null;

  if (paymentType === "business") {
    const businessAccount = state.businessAccount;

    if (
      !businessAccount ||
      businessAccount.sortCode !== cleanSortCode ||
      businessAccount.accountNumber !== cleanAccountNumber
    ) {
      throw new Error("These business account details do not match a known account.");
    }

    recipientName = businessAccount.name;
    businessAccount.balance = Number((Number(businessAccount.balance || 0) + numericAmount).toFixed(2));

    senderDescription = "PAYMENT TO POWERHOUSE REWARDS SHOP";
  } else {
    const recipientAccount = state.accounts.find(
      (acc) =>
        acc.sortCode === cleanSortCode &&
        acc.accountNumber === cleanAccountNumber
    );

    if (!recipientAccount) {
      throw new Error("These account details do not match a known account.");
    }

    if (recipientAccount.studentId === fromStudentId) {
      throw new Error("You cannot send money to your own main account.");
    }

    const recipientStudent = state.students.find(
      (s) => s.id === recipientAccount.studentId
    );

    if (!recipientStudent) {
      throw new Error("Recipient not found.");
    }

    recipientName = recipientStudent.name;
    recipientAccount.balance = Number(
      (recipientAccount.balance + numericAmount).toFixed(2)
    );

    recipientTransaction = {
      id: createId("txn"),
      accountId: recipientAccount.id,
      studentId: recipientAccount.studentId,
      date: todayDate(),
      description: `TRANSFER FROM ${senderStudent.name.toUpperCase()}`,
      category: "Transfer",
      amount: numericAmount,
      suspicious: false,
      reference: cleanReference
    };

    state.transactions.unshift(recipientTransaction);
    addNotification(
      state,
      recipientAccount.studentId,
      "success",
      "Money received",
      `You received £${numericAmount.toFixed(2)} from ${senderStudent.name}.`
    );

    senderDescription = `TRANSFER TO ${recipientStudent.name.toUpperCase()}`;
  }

  senderAccount.balance = Number(
    (senderAccount.balance - numericAmount).toFixed(2)
  );

  const senderTxn = {
    id: createId("txn"),
    accountId: senderAccount.id,
    studentId: fromStudentId,
    date: todayDate(),
    description: senderDescription,
    category: paymentType === "business" ? "Business payment" : "Transfer",
    amount: -numericAmount,
    suspicious: false,
    reference: cleanReference
  };

  state.transactions.unshift(senderTxn);

  addNotification(
    state,
    fromStudentId,
    "info",
    "Payment sent",
    `£${numericAmount.toFixed(2)} sent to ${recipientName}.`
  );

  if (
    paymentType === "business" &&
    senderDescription === "PAYMENT TO POWERHOUSE REWARDS SHOP"
  ) {
    state.shopOrders.unshift({
      id: createId("order"),
      studentId: fromStudentId,
      studentName: senderStudent.name,
      amount: numericAmount,
      reference: cleanReference || "Rewards shop purchase",
      createdAt: todayDate(),
      status: "Pending",
      paymentTransactionId: senderTxn.id,
      refundTransactionId: null
    });
  }

  writeState(state);

  return {
    senderTxn,
    recipientTransaction,
    recipientName
  };
}

export function getTransactionTemplates() {
  const data = readState();
  return data.templates || [];
}

export function saveTransactionTemplate(template) {
  const data = readState();

  if (!data.templates) {
    data.templates = [];
  }

  const newTemplate = {
    id: "tpl" + Date.now(),
    templateName: template.templateName?.trim() || "New Template",
    statementName: template.statementName?.trim() || "NEW TRANSACTION",
    amount: Number(template.amount) || 0,
    category: template.category?.trim() || "Other"
  };

  data.templates.push(newTemplate);
  writeState(data);
  return newTemplate;
}

export function addTransactionToStudents(studentIds, transaction) {
  const uniqueStudentIds = [...new Set(studentIds)].filter(Boolean);

  uniqueStudentIds.forEach((studentId) => {
    addTransaction({
      studentId,
      description:
        transaction.description?.trim() ||
        transaction.statementName?.trim() ||
        transaction.name?.trim() ||
        "Bulk transaction",
      category: transaction.category?.trim() || "Other",
      amount: Number(transaction.amount) || 0,
      date: transaction.date || todayDate(),
      suspicious: !!transaction.suspicious
    });
  });

  return uniqueStudentIds.length;
}

export function addTransactionToClass(classGroup, transaction) {
  const data = readState();

  const ids = data.students
    .filter((student) => student.classGroup === classGroup)
    .map((student) => student.id);

  return addTransactionToStudents(ids, transaction);
}

export function getClassGroups() {
  const data = readState();
  const groups = [...new Set(data.students.map((student) => student.classGroup))];
  return groups.sort();
}

export function applyQuickClassPayment(classGroup) {
  return addTransactionToClass(classGroup, {
    description: "WORK EXPERIENCE PAY",
    category: "Pay",
    amount: 35,
    date: todayDate(),
    suspicious: false
  });
}

export function applyQuickPaymentToAllStudents({
  description,
  category,
  amount,
  suspicious = false
}) {
  const data = readState();
  const studentIds = data.students.map((student) => student.id);

  return addTransactionToStudents(studentIds, {
    description,
    category,
    amount,
    date: todayDate(),
    suspicious
  });
}

function padMonthNumber(value) {
  return String(value).padStart(2, "0");
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function buildMonthlyDueDate(year, monthIndex, monthlyDay) {
  const safeDay = Math.min(Math.max(Number(monthlyDay) || 1, 1), 28);
  return `${year}-${padMonthNumber(monthIndex + 1)}-${padMonthNumber(safeDay)}`;
}

function getNextMonthlyDueDate(fromDate, monthlyDay) {
  const baseDate = fromDate ? new Date(`${fromDate}T00:00:00`) : new Date();
  const safeDay = Math.min(Math.max(Number(monthlyDay) || 1, 1), 28);

  const year = baseDate.getFullYear();
  const monthIndex = baseDate.getMonth();

  const candidateThisMonth = buildMonthlyDueDate(year, monthIndex, safeDay);

  if (candidateThisMonth >= (fromDate || todayDate())) {
    return candidateThisMonth;
  }

  const nextMonthDate = new Date(year, monthIndex + 1, 1);
  return buildMonthlyDueDate(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth(),
    safeDay
  );
}

function addOneMonthToDueDate(currentDueDate, monthlyDay) {
  const current = new Date(`${currentDueDate}T00:00:00`);
  const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  return buildMonthlyDueDate(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    monthlyDay
  );
}

export function getRecurringPayments() {
  const state = readState();

  return (state.recurringPayments || []).map((item) => ({
    ...item,
    monthlyDay: Number(item.monthlyDay || new Date(item.nextDueDate).getDate() || 1),
    studentNames: (item.studentIds || [])
      .map((id) => state.students.find((student) => student.id === id)?.name)
      .filter(Boolean)
  }));
}

export function createRecurringPayment({
  studentIds,
  statementName,
  amount,
  type,
  startDate,
  monthlyDay,
  frequency = "monthly"
}) {
  const state = readState();

  const validStudentIds = [...new Set(studentIds || [])].filter(Boolean);

  if (validStudentIds.length === 0) {
    throw new Error("Select at least one student.");
  }

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error("Enter an amount greater than 0.");
  }

  const safeMonthlyDay = Math.min(Math.max(Number(monthlyDay) || 1, 1), 28);
  const safeStartDate = startDate || todayDate();
  const finalAmount = type === "take" ? -Math.abs(numericAmount) : Math.abs(numericAmount);

  const recurringPayment = {
    id: createId("recurring"),
    studentIds: validStudentIds,
    statementName: statementName?.trim() || "Monthly payment",
    amount: finalAmount,
    type: type || "add",
    startDate: safeStartDate,
    monthlyDay: safeMonthlyDay,
    nextDueDate: getNextMonthlyDueDate(safeStartDate, safeMonthlyDay),
    frequency,
    active: true
  };

  state.recurringPayments.unshift(recurringPayment);
  writeState(state);
  return recurringPayment;
}

export function toggleRecurringPaymentActive(recurringPaymentId) {
  const state = readState();
  const item = state.recurringPayments.find((payment) => payment.id === recurringPaymentId);

  if (!item) {
    throw new Error("Recurring payment not found.");
  }

  item.active = !item.active;
  writeState(state);
  return item;
}

export function deleteRecurringPayment(recurringPaymentId) {
  const state = readState();
  const index = state.recurringPayments.findIndex((payment) => payment.id === recurringPaymentId);

  if (index === -1) {
    throw new Error("Recurring payment not found.");
  }

  const deleted = state.recurringPayments[index];
  state.recurringPayments.splice(index, 1);
  writeState(state);
  return deleted;
}

export function getShopOrders() {
  const state = readState();
  return (state.shopOrders || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getPendingShopOrders() {
  return getShopOrders().filter((item) => item.status === "Pending");
}

export function approveShopOrder(orderId) {
  const state = readState();
  const order = state.shopOrders.find((item) => item.id === orderId);

  if (!order) {
    throw new Error("Shop order not found.");
  }

  order.status = "Approved";

  addNotification(
    state,
    order.studentId,
    "success",
    "Shop order approved",
    `Your Powerhouse Rewards Shop purchase has been approved.`
  );

  writeState(state);
  return order;
}

export function refuseShopOrder(orderId) {
  const state = readState();
  const order = state.shopOrders.find((item) => item.id === orderId);

  if (!order) {
    throw new Error("Shop order not found.");
  }

  if (order.status === "Refused") {
    throw new Error("This order has already been refused.");
  }

  const account = state.accounts.find((item) => item.studentId === order.studentId);
  if (!account) {
    throw new Error("Student account not found.");
  }

  account.balance = Number((account.balance + Number(order.amount)).toFixed(2));

  const refundTxn = {
    id: createId("txn"),
    accountId: account.id,
    studentId: order.studentId,
    date: todayDate(),
    description: "REFUND FROM POWERHOUSE REWARDS SHOP",
    category: "Refund",
    amount: Number(order.amount),
    suspicious: false
  };

  state.transactions.unshift(refundTxn);

  order.status = "Refused";
  order.refundTransactionId = refundTxn.id;

  addNotification(
    state,
    order.studentId,
    "info",
    "Shop order refused",
    `Your payment to Powerhouse Rewards Shop was refunded.`
  );

  writeState(state);
  return order;
}

export const initialiseMockBankingState = initialiseBankState;
export const resetMockBankingState = resetBankState;