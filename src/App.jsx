import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";
import RoleRoute from "./components/layout/RoleRoute.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import StudentDashboardPage from "./pages/student/StudentDashboardPage.jsx";
import StudentMyDetailsPage from "./pages/student/StudentMyDetailsPage.jsx";
import StudentTransactionsPage from "./pages/student/StudentTransactionsPage.jsx";
import StudentTransactionDetailPage from "./pages/student/StudentTransactionDetailPage.jsx";
import StudentDirectDebitsPage from "./pages/student/StudentDirectDebitsPage.jsx";
import StudentReportPage from "./pages/student/StudentReportPage.jsx";
import StudentNotificationsPage from "./pages/student/StudentNotificationsPage.jsx";
import StudentPaymentsPage from "./pages/student/StudentPaymentsPage.jsx";
import StudentCardsPage from "./pages/student/StudentCardsPage.jsx";
import StudentScamsPage from "./pages/student/StudentScamsPage.jsx";
import StudentScamDetailPage from "./pages/student/StudentScamDetailPage.jsx";
import StudentSafetyPage from "./pages/student/StudentSafetyPage.jsx";
import StudentCardsInfoPage from "./pages/student/StudentCardsInfoPage.jsx";
import StudentSpendingPage from "./pages/student/StudentSpendingPage.jsx";
import StudentMainAccountPage from "./pages/student/StudentMainAccountPage.jsx";
import StudentSavingsAccountPage from "./pages/student/StudentSavingsAccountPage.jsx";
import TeacherDashboardPage from "./pages/teacher/TeacherDashboardPage.jsx";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage.jsx";
import TeacherStudentDetailPage from "./pages/teacher/TeacherStudentDetailPage.jsx";
import TeacherTransactionsPage from "./pages/teacher/TeacherTransactionsPage.jsx";
import TeacherFraudReportsPage from "./pages/teacher/TeacherFraudReportsPage.jsx";
import TeacherRewardsOrdersPage from "./pages/teacher/TeacherRewardsOrdersPage.jsx";
import HelpPage from "./pages/shared/HelpPage.jsx";
import NotFoundPage from "./pages/shared/NotFoundPage.jsx";
import UnauthorizedPage from "./pages/shared/UnauthorizedPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        path="/student/dashboard"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentDashboardPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/my-details"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentMyDetailsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/payments"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentPaymentsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/cards"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentCardsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/account/main"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentMainAccountPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/account/savings"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentSavingsAccountPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/transactions"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentTransactionsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/transactions/:transactionId"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentTransactionDetailPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/direct-debits"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentDirectDebitsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/report"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentReportPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/student/notifications"
        element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentNotificationsPage /></RoleRoute></ProtectedRoute>}
      />
<Route
  path="/student/scams"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["student"]}>
        <StudentScamsPage />
      </RoleRoute>
    </ProtectedRoute>
  }
/>

<Route
  path="/student/scams/:id"
  element={
    <ProtectedRoute>
      <RoleRoute allowedRoles={["student"]}>
        <StudentScamDetailPage />
      </RoleRoute>
    </ProtectedRoute>
  }
/>
<Route path="/student/safety" element={<StudentSafetyPage />} />
<Route
  path="/student/cards-info"
  element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentCardsInfoPage /></RoleRoute></ProtectedRoute>}
/>
<Route
  path="/student/spending"
  element={<ProtectedRoute><RoleRoute allowedRoles={["student"]}><StudentSpendingPage /></RoleRoute></ProtectedRoute>}
/>
      <Route
        path="/teacher/dashboard"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherDashboardPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/teacher/students"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherStudentsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/teacher/students/:studentId"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherStudentDetailPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/teacher/transactions"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherTransactionsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/teacher/reports"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherFraudReportsPage /></RoleRoute></ProtectedRoute>}
      />
      <Route
        path="/teacher/rewards-orders"
        element={<ProtectedRoute><RoleRoute allowedRoles={["teacher"]}><TeacherRewardsOrdersPage /></RoleRoute></ProtectedRoute>}
      />

      <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}