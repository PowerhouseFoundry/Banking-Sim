import React from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import {
  approveShopOrder,
  getShopOrders,
  refuseShopOrder
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";

export default function TeacherRewardsOrdersPage() {
  useBankRefresh();

  const orders = getShopOrders();

  function handleApprove(orderId) {
    approveShopOrder(orderId);
    window.alert("Rewards shop order approved.");
  }

  function handleRefuse(orderId) {
    const confirmed = window.confirm(
      "Refuse this order and refund the student?"
    );

    if (!confirmed) return;

    refuseShopOrder(orderId);
    window.alert("Order refused and student refunded.");
  }

  return (
    <AppShell
      title="Rewards Shop Orders"
      subtitle="Approve or refuse student purchases."
    >
      <SectionCard
        title="Orders"
        description="Student payments to Powerhouse Rewards Shop appear here."
      >
        {orders.length === 0 ? (
          <p className="ph-muted">No rewards shop orders yet.</p>
        ) : (
          <div className="ph-rewards-orders-list">
            {orders.map((order) => (
              <div key={order.id} className="ph-rewards-order-card">
                <div className="ph-rewards-order-main">
                  <h4>{order.studentName}</h4>
                  <p><strong>Purchase:</strong> {order.reference}</p>
                  <p><strong>Date:</strong> {order.createdAt}</p>
                  <p><strong>Status:</strong> {order.status}</p>
                </div>

                <div className="ph-rewards-order-side">
                  <div className="ph-amount-out">
                    £{Number(order.amount).toFixed(2)}
                  </div>

                  {order.status === "Pending" ? (
                    <div className="ph-inline-actions">
                      <button
                        className="ph-button ph-button-primary ph-button-small"
                        type="button"
                        onClick={() => handleApprove(order.id)}
                      >
                        Approve
                      </button>

                      <button
                        className="ph-button ph-button-secondary ph-button-small"
                        type="button"
                        onClick={() => handleRefuse(order.id)}
                      >
                        Refuse
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}