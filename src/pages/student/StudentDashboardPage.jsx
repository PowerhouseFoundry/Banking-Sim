import React, { useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  getStudentAccount,
  getStudentNotifications,
  getStudentTransactions
} from "../../services/bankService.js";
import useBankRefresh from "../../hooks/useBankRefresh.js";
import heroImage from "../../assets/images/student-banking-hero.png";
import scamsImg from "../../assets/images/discover/scams.png";
import safetyImg from "../../assets/images/discover/safety.png";
import cardsImg from "../../assets/images/discover/cards.png";
import spendingImg from "../../assets/images/discover/spending.png";


export default function StudentDashboardPage() {
  useBankRefresh();
  const { user } = useAuth();
  const [activeTopic, setActiveTopic] = useState(null);

  const account = getStudentAccount(user.studentId);
  const notifications = getStudentNotifications(user.studentId);
  const transactions = getStudentTransactions(user.studentId);

  const unreadNotifications = notifications.filter((item) => !item.read);
  const latestUnreadNotification = unreadNotifications[0] || null;

  const savingsBalance = account?.savingsBalance ?? 0;
  const cardStatus = account?.cardStatus || "active";
  const suspiciousTransactions = transactions.filter((item) => item.suspicious);

  const topics = {
    scams: {
      title: "Scams & Fraud",
      image: scamsImg,
      subtitle: "Learn how to spot and avoid scams",
      content: (
        <>
          <h4>What is a scam?</h4>
          <p>A scam is when someone tries to trick you to get your money or personal details.</p>

          <h4>Common scams</h4>
          <ul>
            <li>Fake bank texts or emails</li>
            <li>Phone calls pretending to be your bank</li>
            <li>Messages telling you to act quickly</li>
          </ul>

          <h4>Warning signs</h4>
          <ul>
            <li>Urgent language</li>
            <li>Requests for passwords or PINs</li>
            <li>Links you were not expecting</li>
          </ul>

          <h4>What to do</h4>
          <ul>
            <li>Do not click the link</li>
            <li>Do not share your details</li>
            <li>Tell a teacher or staff member</li>
          </ul>
        </>
      )
    },
    safety: {
      title: "Banking Safety",
      image: safetyImg,
      subtitle: "Keep your bank account secure",
      content: (
        <>
          <h4>Keep your account safe</h4>
          <p>Your account is private. Only you should use it.</p>

          <h4>Keep these safe</h4>
          <ul>
            <li>Password</li>
            <li>PIN</li>
            <li>Bank card</li>
          </ul>

          <h4>Good habits</h4>
          <ul>
            <li>Log out when finished</li>
            <li>Use a strong password</li>
            <li>Keep your card in a safe place</li>
          </ul>
        </>
      )
    },
    cards: {
      title: "Cards",
      image: cardsImg,
      subtitle: "Understand how cards work",
      content: (
        <>
          <h4>Debit card</h4>
          <p>A debit card uses your own money from your bank account.</p>

          <h4>Credit card</h4>
          <p>A credit card means borrowed money that must be paid back later.</p>

          <h4>Important rules</h4>
          <ul>
            <li>Do not share your card</li>
            <li>Check your payments</li>
            <li>Report it if it is lost</li>
          </ul>
        </>
      )
    },
    spending: {
      title: "Spending & Budgeting",
      image: spendingImg,
      subtitle: "Manage your money better",
      content: (
        <>
          <h4>What is budgeting?</h4>
          <p>Budgeting means planning how you use your money.</p>

          <h4>Think before spending</h4>
          <ul>
            <li>Do I need this?</li>
            <li>Can I afford it?</li>
            <li>What is my balance?</li>
          </ul>

          <h4>Good habits</h4>
          <ul>
            <li>Save some money</li>
            <li>Do not spend everything at once</li>
            <li>Check your balance often</li>
          </ul>
        </>
      )
    }
  };

  return (
    <AppShell title={`Hello, ${user.name}`} subtitle="Your banking home screen">
      <div
        className="ph-student-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(10,20,45,0.18), rgba(10,20,45,0.34)), url(${heroImage})`
        }}
      >
        <div className="ph-student-hero-topnav">
          <Link to="/student/dashboard" className="ph-student-hero-toplink ph-student-hero-toplink-active">
            Home
          </Link>
          <Link to="/student/payments" className="ph-student-hero-toplink">
            Pay
          </Link>
          <Link to="/student/cards" className="ph-student-hero-toplink">
            Cards
          </Link>
        </div>

        <div className="ph-student-hero-actions ph-student-hero-actions-desktop">
          <Link to="/student/payments?mode=person" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">£</span>
            </span>
            <span className="ph-student-hero-action-text">Pay someone in the UK</span>
          </Link>

          <Link to="/student/payments?mode=savings" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">⇄</span>
            </span>
            <span className="ph-student-hero-action-text">Transfer between your accounts</span>
          </Link>

          <Link to="/student/payments?mode=business" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">🏢</span>
            </span>
            <span className="ph-student-hero-action-text">Pay a bill or company</span>
          </Link>
        </div>

        <div className="ph-student-hero-actions ph-student-hero-actions-mobile">
          <Link to="/student/payments?mode=person" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">£</span>
            </span>
            <span className="ph-student-hero-action-text">Pay someone</span>
          </Link>

          <Link to="/student/payments?mode=savings" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">⇄</span>
            </span>
            <span className="ph-student-hero-action-text">Transfer</span>
          </Link>

          <Link to="/student/payments?mode=business" className="ph-student-hero-action">
            <span className="ph-student-hero-action-circle">
              <span className="ph-student-hero-action-icon">🏢</span>
            </span>
            <span className="ph-student-hero-action-text">Pay a bill</span>
          </Link>
        </div>
      </div>

      <SectionCard title="Your products">
        <div className="ph-student-products-list">
          <Link to="/student/account/main" className="ph-student-product-card">
            <div className="ph-student-product-left">
              <div className="ph-student-product-title">Current Account</div>
              <div className="ph-student-product-subtitle">
                {account?.sortCode || "11-22-33"} {account?.accountNumber || "12345678"}
              </div>
            </div>

            <div className="ph-student-product-right">
              <div className="ph-student-product-balance">
                £{account?.balance?.toFixed(2) || "0.00"}
              </div>
            </div>
          </Link>

          <Link to="/student/account/savings" className="ph-student-product-card">
            <div className="ph-student-product-left">
              <div className="ph-student-product-title">Savings Account</div>
              <div className="ph-student-product-subtitle">Money set aside</div>
            </div>

            <div className="ph-student-product-right">
              <div className="ph-student-product-balance">
                £{Number(savingsBalance).toFixed(2)}
              </div>
            </div>
          </Link>
        </div>
      </SectionCard>

      <SectionCard title="Discover">
        <div className="ph-discover-viewport">
          <div className="ph-discover-grid">
         {Object.entries(topics).map(([key, topic]) => {
  if (key === "scams") {
    return (
      <Link
        key={key}
        to="/student/scams"
        className="ph-discover-card"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="ph-discover-image-wrap">
          <img src={topic.image} alt={topic.title} className="ph-discover-image" />
        </div>

        <div className="ph-discover-text">
          <div className="ph-discover-title">{topic.title}</div>
          <div className="ph-discover-subtitle">{topic.subtitle}</div>
        </div>
      </Link>
    );
  }

  if (key === "safety") {
    return (
      <Link
        key={key}
        to="/student/safety"
        className="ph-discover-card"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="ph-discover-image-wrap">
          <img src={topic.image} alt={topic.title} className="ph-discover-image" />
        </div>

        <div className="ph-discover-text">
          <div className="ph-discover-title">{topic.title}</div>
          <div className="ph-discover-subtitle">{topic.subtitle}</div>
        </div>
      </Link>
    );
  }

  if (key === "cards") {
    return (
      <Link
        key={key}
        to="/student/cards-info"
        className="ph-discover-card"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="ph-discover-image-wrap">
          <img src={topic.image} alt={topic.title} className="ph-discover-image" />
        </div>

        <div className="ph-discover-text">
          <div className="ph-discover-title">{topic.title}</div>
          <div className="ph-discover-subtitle">{topic.subtitle}</div>
        </div>
      </Link>
    );
  }

  if (key === "spending") {
    return (
      <Link
        key={key}
        to="/student/spending"
        className="ph-discover-card"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="ph-discover-image-wrap">
          <img src={topic.image} alt={topic.title} className="ph-discover-image" />
        </div>

        <div className="ph-discover-text">
          <div className="ph-discover-title">{topic.title}</div>
          <div className="ph-discover-subtitle">{topic.subtitle}</div>
        </div>
      </Link>
    );
  }

  return (
    <button
      key={key}
      type="button"
      className="ph-discover-card"
      onClick={() => setActiveTopic(key)}
    >
      <div className="ph-discover-image-wrap">
        <img src={topic.image} alt={topic.title} className="ph-discover-image" />
      </div>

      <div className="ph-discover-text">
        <div className="ph-discover-title">{topic.title}</div>
        <div className="ph-discover-subtitle">{topic.subtitle}</div>
      </div>
    </button>
  );
})}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Account status">
        <div className="ph-account-details-card">
          <div className="ph-account-detail-row">
            <span>Card status</span>
            <strong>{cardStatus}</strong>
          </div>
          <div className="ph-account-detail-row">
            <span>Messages</span>
            <strong>{unreadNotifications.length}</strong>
          </div>
          <div className="ph-account-detail-row">
            <span>Payments to check</span>
            <strong>{suspiciousTransactions.length}</strong>
          </div>
        </div>

        {latestUnreadNotification ? (
          <Link
            to="/student/notifications"
            className="ph-student-message-alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginTop: "14px",
              padding: "14px 16px",
              borderRadius: "16px",
              border: "1px solid var(--border)",
              background: "var(--panel-soft)",
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                background: "#e8f0ff",
                display: "grid",
                placeItems: "center",
                fontSize: "18px",
                flexShrink: 0
              }}
            >
              🔔
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                {latestUnreadNotification.title || "New message"}
              </div>
              <div
                className="ph-muted"
                style={{
                  fontSize: "14px",
                  lineHeight: 1.4
                }}
              >
                {latestUnreadNotification.message}
              </div>
            </div>
          </Link>
        ) : null}

        {suspiciousTransactions.length > 0 ? (
          <div className="ph-inline-actions" style={{ marginTop: "14px" }}>
            <Link className="ph-button ph-button-primary ph-button-link" to="/student/report">
              Check payment
            </Link>
          </div>
        ) : null}
      </SectionCard>

      {activeTopic ? (
        <div className="ph-modal-overlay" onClick={() => setActiveTopic(null)}>
          <div className="ph-modal" onClick={(event) => event.stopPropagation()}>
            <div className="ph-modal-header">
              <h3>{topics[activeTopic].title}</h3>
              <button type="button" onClick={() => setActiveTopic(null)}>
                ✕
              </button>
            </div>

            <div className="ph-modal-content">{topics[activeTopic].content}</div>

            <div className="ph-modal-footer">
              <button
                type="button"
                className="ph-button ph-button-primary"
                onClick={() => setActiveTopic(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}