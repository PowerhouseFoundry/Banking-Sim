import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/powerhouse-logo.png";
import { useAuth } from "../../contexts/AuthContext.jsx";
import useBankRefresh from "../../hooks/useBankRefresh.js";
import {
  getShopProducts,
  getStudentAccount,
  purchaseShopProduct
} from "../../services/bankService.js";

function categoryIcon(category) {
  const value = (category || "").toLowerCase();
  if (value.includes("drink")) return "☕";
  if (value.includes("snack") || value.includes("tuck")) return "🍫";
  if (value.includes("food")) return "🥪";
  return "🛍️";
}

function ProductSymbol({ product, className }) {
  return (
    <span className={className} aria-hidden="true">
      {product?.symbolDataUrl ? (
        <img src={product.symbolDataUrl} alt="" />
      ) : (
        categoryIcon(product?.category)
      )}
    </span>
  );
}

function formatMoney(value) {
  return `£${Number(value || 0).toFixed(2)}`;
}

export default function ShopPage() {
  useBankRefresh();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [receipt, setReceipt] = useState(null);

  const products = getShopProducts();
  const selectedProductId = searchParams.get("product") || "";
  const selectedProduct = products.find((product) => product.id === selectedProductId) || null;
  const account = user?.role === "student" ? getStudentAccount(user.studentId) : null;

  const groupedProducts = useMemo(() => {
    return products.reduce((groups, product) => {
      const category = product.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(product);
      return groups;
    }, {});
  }, [products]);

  useEffect(() => {
    setPaymentError("");
    setReceipt(null);
  }, [selectedProductId]);

  function selectProduct(product) {
    if (!user) {
      const returnTo = `/?shop=1&product=${encodeURIComponent(product.id)}`;
      navigate(`/?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (user.role === "teacher") {
      navigate("/teacher/shop-manager");
      return;
    }

    setSearchParams({ shop: "1", product: product.id });
  }

  function backToShop() {
    setSearchParams({ shop: "1" });
  }

  async function handlePay() {
    if (!user || user.role !== "student" || !selectedProduct) return;

    setPaymentError("");
    setProcessing(true);

    try {
      const result = await purchaseShopProduct({
        studentId: user.studentId,
        productId: selectedProduct.id
      });

      setReceipt(result);
    } catch (error) {
      setPaymentError(error.message || "Payment could not be completed.");
    } finally {
      setProcessing(false);
    }
  }

  if (receipt) {
    return (
      <div className="ph-shop-page">
        <div className="ph-shop-topbar">
          <img src={logo} alt="Powerhouse" className="ph-shop-logo" />
          <span className="ph-shop-training-label">Training payment</span>
        </div>

        <main className="ph-shop-narrow">
          <section className="ph-shop-receipt-card">
            <div className="ph-shop-success-icon">✓</div>
            <p className="ph-shop-kicker">Payment successful</p>
            <h1>{receipt.product.name}</h1>
            <div className="ph-shop-receipt-price">{formatMoney(receipt.product.price)}</div>
            <p className="ph-shop-receipt-copy">
              Your PLC Bank account has been charged. Show this screen when collecting your item if staff ask to see it.
            </p>

            <div className="ph-shop-receipt-details">
              <div>
                <span>Paid by</span>
                <strong>{user?.name}</strong>
              </div>
              <div>
                <span>New balance</span>
                <strong>{formatMoney(receipt.newBalance)}</strong>
              </div>
            </div>

            <div className="ph-shop-receipt-actions">
              <button className="ph-button ph-button-primary" type="button" onClick={backToShop}>
                Buy another item
              </button>
              <button
                className="ph-button ph-button-secondary"
                type="button"
                onClick={() => navigate("/student/dashboard")}
              >
                Return to PLC Bank
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (selectedProduct && user?.role === "student") {
    return (
      <div className="ph-shop-page">
        <div className="ph-shop-topbar">
          <button className="ph-shop-back-link" type="button" onClick={backToShop}>← Shop</button>
          <span className="ph-shop-training-label">Training payment</span>
        </div>

        <main className="ph-shop-narrow">
          <section className="ph-shop-checkout-card">
            <ProductSymbol product={selectedProduct} className="ph-shop-checkout-icon" />
            <p className="ph-shop-kicker">Confirm your purchase</p>
            <h1>{selectedProduct.name}</h1>
            <p className="ph-shop-category">{selectedProduct.category}</p>
            <div className="ph-shop-checkout-price">{formatMoney(selectedProduct.price)}</div>

            <div className="ph-shop-balance-panel">
              <span>Your available balance</span>
              <strong>{formatMoney(account?.balance)}</strong>
            </div>

            {account?.cardStatus === "frozen" ? (
              <div className="ph-shop-message ph-shop-message-warning">
                Your card is frozen. This payment will be declined until it is unfrozen.
              </div>
            ) : null}

            {paymentError ? (
              <div className="ph-shop-message ph-shop-message-error" role="alert">
                {paymentError}
              </div>
            ) : null}

            <button
              className="ph-shop-pay-button"
              type="button"
              disabled={processing}
              onClick={handlePay}
            >
              {processing ? "Processing payment…" : `Pay ${formatMoney(selectedProduct.price)}`}
            </button>

            <button className="ph-shop-cancel-button" type="button" onClick={backToShop} disabled={processing}>
              Cancel
            </button>

            <p className="ph-shop-secure-note">
              The price comes directly from the Powerhouse Shop catalogue. You cannot change the payment amount.
            </p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="ph-shop-page">
      <header className="ph-shop-hero">
        <div className="ph-shop-topbar ph-shop-topbar-hero">
          <img src={logo} alt="Powerhouse" className="ph-shop-logo" />
          <span className="ph-shop-training-label">PLC Bank training shop</span>
        </div>

        <div className="ph-shop-hero-copy">
          <p className="ph-shop-kicker">Powerhouse Shop</p>
          <h1>Choose what you would like to buy</h1>
          <p>Drinks, snacks and tuck shop items. Select an item, sign in to PLC Bank and authorise the payment.</p>
          {user?.role === "student" ? (
            <div className="ph-shop-signed-in">Signed in as <strong>{user.name}</strong></div>
          ) : user?.role === "teacher" ? (
            <button className="ph-button ph-button-secondary" type="button" onClick={() => navigate("/teacher/shop-manager")}>
              Open staff shop manager
            </button>
          ) : (
            <div className="ph-shop-signin-note">You will be asked to sign in before money leaves your account.</div>
          )}
        </div>
      </header>

      <main className="ph-shop-content">
        {products.length === 0 ? (
          <section className="ph-shop-empty">
            <h2>No products are available</h2>
            <p>Staff can add products from the PLC Bank teacher account.</p>
          </section>
        ) : (
          Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <section className="ph-shop-category-section" key={category}>
              <div className="ph-shop-category-heading">
                <span className="ph-shop-category-icon" aria-hidden="true">{categoryIcon(category)}</span>
                <div>
                  <p>Shop category</p>
                  <h2>{category}</h2>
                </div>
              </div>

              <div className="ph-shop-product-grid">
                {categoryProducts.map((product) => (
                  <button
                    type="button"
                    className="ph-shop-product-card"
                    key={product.id}
                    onClick={() => selectProduct(product)}
                  >
                    <ProductSymbol product={product} className="ph-shop-product-icon" />
                    <span className="ph-shop-product-name">{product.name}</span>
                    <span className="ph-shop-product-price">{formatMoney(product.price)}</span>
                    <span className="ph-shop-product-action">Select item →</span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="ph-shop-footer">
        PLC Bank is a fictional training bank for educational use at West SILC Powerhouse.
      </footer>
    </div>
  );
}
