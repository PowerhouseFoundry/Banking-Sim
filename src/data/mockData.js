export const mockStudents = [
  { id: "student-001", userId: "u-student-001", name: "Jordan Smith", classGroup: "Mint", yearLabel: "Year 1", accountId: "account-001" },
  { id: "student-002", userId: "u-student-002", name: "Casey Brown", classGroup: "Peach", yearLabel: "Year 1", accountId: "account-002" },
  { id: "student-003", userId: "u-student-003", name: "Taylor Green", classGroup: "Amber", yearLabel: "Year 2", accountId: "account-003" }
];

export const mockUsers = {
  "student@powerhouse.local": { id: "u-student-001", studentId: "student-001", name: "Jordan Smith", email: "student@powerhouse.local", role: "student", classGroup: "Mint" },
  "teacher@powerhouse.local": { id: "u-teacher-001", name: "Miss Patel", email: "teacher@powerhouse.local", role: "teacher" }
};

export const mockAccounts = [
  { id: "account-001", studentId: "student-001", balance: 128.5, accountName: "Everyday Account", cardStatus: "active" },
  { id: "account-002", studentId: "student-002", balance: 92.0, accountName: "Everyday Account", cardStatus: "active" },
  { id: "account-003", studentId: "student-003", balance: 210.25, accountName: "Everyday Account", cardStatus: "active" }
];

export const mockTransactions = [
  { id: "txn-001", accountId: "account-001", studentId: "student-001", date: "2026-03-14", description: "College Lunch", category: "Food", amount: -4.5, suspicious: false },
  { id: "txn-002", accountId: "account-001", studentId: "student-001", date: "2026-03-12", description: "Work Experience Pay", category: "Income", amount: 35.0, suspicious: false },
  { id: "txn-003", accountId: "account-001", studentId: "student-001", date: "2026-03-11", description: "Bus Travel", category: "Travel", amount: -2.0, suspicious: false },
  { id: "txn-004", accountId: "account-001", studentId: "student-001", date: "2026-03-10", description: "City Mobile", category: "Direct Debit", amount: -15.0, suspicious: false },
  { id: "txn-005", accountId: "account-001", studentId: "student-001", date: "2026-03-09", description: "Quick Tech Online", category: "Shopping", amount: -49.99, suspicious: true },
  { id: "txn-006", accountId: "account-002", studentId: "student-002", date: "2026-03-12", description: "Cafe Shift Pay", category: "Income", amount: 22.0, suspicious: false },
  { id: "txn-007", accountId: "account-003", studentId: "student-003", date: "2026-03-13", description: "Warehouse Training Pay", category: "Income", amount: 50.0, suspicious: false }
];

export const mockDirectDebits = [
  { id: "dd-001", studentId: "student-001", merchant: "City Mobile", amount: 15.0, frequency: "Monthly", nextDate: "2026-04-10", active: true },
  { id: "dd-002", studentId: "student-001", merchant: "Music Stream", amount: 6.99, frequency: "Monthly", nextDate: "2026-04-02", active: true },
  { id: "dd-003", studentId: "student-002", merchant: "Travel Saver", amount: 8.0, frequency: "Weekly", nextDate: "2026-03-20", active: true }
];

export const mockNotifications = [
  { id: "note-001", studentId: "student-001", type: "warning", title: "Check this payment", message: "A payment to Quick Tech Online looks unusual. Did you expect it?", read: false },
  { id: "note-002", studentId: "student-001", type: "info", title: "Direct debit due soon", message: "City Mobile will be taken on 10 April 2026.", read: false },
  { id: "note-003", studentId: "student-002", type: "success", title: "Pay added", message: "Your training shift payment has been added.", read: true }
];

export const mockFraudReports = [
  { id: "report-001", studentId: "student-001", transactionId: "txn-005", studentName: "Jordan Smith", reason: "I do not remember buying this.", status: "New", submittedAt: "2026-03-14" },
  { id: "report-002", studentId: "student-003", transactionId: "txn-007", studentName: "Taylor Green", reason: "I wanted staff to check this payment.", status: "Reviewed", submittedAt: "2026-03-12" }
];
