import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { getStudentNotifications, markNotificationRead } from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function StudentNotificationsPage() {
  useBankRefresh();
  const { user } = useAuth();
  const notifications = getStudentNotifications(user.studentId);

  return (
    <AppShell title="Notifications" subtitle="Messages about your account.">
      <SectionCard title="Recent messages" description="Short alerts help students spot unusual activity.">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications" message="There are no new messages for this account." />
        ) : (
          <div className="ph-notification-list">
            {notifications.map((item) => (
              <div className={`ph-notification ${item.read ? "" : "ph-notification-unread"}`} key={item.id}>
                <div className="ph-notification-head">
                  <h4>{item.title}</h4>
                  {!item.read ? (
                    <button className="ph-button ph-button-secondary ph-button-small" onClick={() => markNotificationRead(item.id)}>
                      Mark read
                    </button>
                  ) : null}
                </div>
                <p>{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
