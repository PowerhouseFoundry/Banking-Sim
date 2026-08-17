import React, { useState } from "react";
import AppShell from "../../components/layout/AppShell.jsx";
import SectionCard from "../../components/common/SectionCard.jsx";
import useBankRefresh from "../../hooks/useBankRefresh.js";
import shopQr from "../../assets/shop-qr.png";
import {
  addShopProduct,
  deleteShopProduct,
  getShopProducts,
  toggleShopProduct,
  updateShopProduct
} from "../../services/bankService.js";

const SHOP_URL = "https://plc-bank-simulator.onrender.com/?shop=1";

function formatMoney(value) {
  return `£${Number(value || 0).toFixed(2)}`;
}

export default function TeacherShopManagerPage() {
  useBankRefresh();

  const products = getShopProducts({ includeInactive: true });
  const [form, setForm] = useState({ name: "", category: "Drinks", price: "" });
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({ name: "", category: "", price: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setMessage("");
    setError("");
  }

  function handleAdd(event) {
    event.preventDefault();
    clearFeedback();

    try {
      addShopProduct(form);
      setForm({ name: "", category: form.category || "Drinks", price: "" });
      setMessage("Product added to the shop.");
    } catch (err) {
      setError(err.message || "Could not add product.");
    }
  }

  function beginEdit(product) {
    clearFeedback();
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      category: product.category,
      price: Number(product.price).toFixed(2)
    });
  }

  function saveEdit(productId) {
    clearFeedback();

    try {
      updateShopProduct(productId, editForm);
      setEditingId("");
      setMessage("Product updated.");
    } catch (err) {
      setError(err.message || "Could not update product.");
    }
  }

  function handleToggle(product) {
    clearFeedback();
    toggleShopProduct(product.id);
    setMessage(product.active === false ? "Product is now available." : "Product hidden from the learner shop.");
  }

  function handleDelete(product) {
    const confirmed = window.confirm(
      `Delete ${product.name} from the shop catalogue? Existing purchase records will not be removed.`
    );

    if (!confirmed) return;

    clearFeedback();
    deleteShopProduct(product.id);
    setMessage("Product deleted from the catalogue.");
  }

  async function copyShopLink() {
    clearFeedback();
    try {
      await navigator.clipboard.writeText(SHOP_URL);
      setMessage("Shop link copied.");
    } catch {
      setError("Could not copy automatically. Select the shop link and copy it manually.");
    }
  }

  return (
    <AppShell
      title="Powerhouse Shop & QR"
      subtitle="Manage the products learners can buy using their PLC Bank balance."
    >
      {message ? <div className="ph-shop-admin-message ph-shop-admin-success">{message}</div> : null}
      {error ? <div className="ph-shop-admin-message ph-shop-admin-error">{error}</div> : null}

      <div className="ph-shop-admin-top-grid">
        <SectionCard
          title="Permanent shop QR code"
          description="Print this once. Staff can change products and prices later without replacing the QR code."
        >
          <div className="ph-shop-qr-layout">
            <div className="ph-shop-qr-print-card" id="ph-shop-qr-card">
              <div className="ph-shop-qr-print-heading">POWERHOUSE SHOP</div>
              <div className="ph-shop-qr-print-subheading">Scan to pay with PLC Bank</div>
              <img src={shopQr} alt="QR code for the Powerhouse Shop" />
              <div className="ph-shop-qr-print-help">Choose an item • Sign in • Authorise payment</div>
              <div className="ph-shop-qr-print-training">TRAINING SIMULATION</div>
            </div>

            <div className="ph-shop-qr-controls">
              <label className="ph-label" htmlFor="shop-url">Permanent shop link</label>
              <input id="shop-url" className="ph-input" type="text" readOnly value={SHOP_URL} />
              <div className="ph-inline-actions">
                <button className="ph-button ph-button-primary" type="button" onClick={() => window.print()}>
                  Print QR sign
                </button>
                <button className="ph-button ph-button-secondary" type="button" onClick={copyShopLink}>
                  Copy link
                </button>
                <a className="ph-button ph-button-secondary ph-button-link" href={SHOP_URL} target="_blank" rel="noreferrer">
                  Open shop
                </a>
              </div>
              <p className="ph-muted">
                The QR opens the whole shop, not one product. Learners choose the item they want and the current staff-set price is used.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Add a product"
          description="Add drinks, snacks, tuck shop items or other products."
        >
          <form className="ph-shop-add-form" onSubmit={handleAdd}>
            <label className="ph-field">
              <span>Product name</span>
              <input
                className="ph-input"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                placeholder="e.g. Orange juice"
              />
            </label>

            <label className="ph-field">
              <span>Category</span>
              <input
                className="ph-input"
                list="shop-category-options"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                placeholder="Drinks"
              />
              <datalist id="shop-category-options">
                <option value="Drinks" />
                <option value="Snacks" />
                <option value="Tuck Shop" />
                <option value="Food" />
                <option value="Other" />
              </datalist>
            </label>

            <label className="ph-field">
              <span>Price</span>
              <div className="ph-shop-price-input-wrap">
                <span>£</span>
                <input
                  className="ph-input"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => updateForm("price", event.target.value)}
                  placeholder="1.50"
                />
              </div>
            </label>

            <button className="ph-button ph-button-primary" type="submit">Add product</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard
        title="Shop products"
        description="Edit a price or product name at any time. Hide an item when it is unavailable."
      >
        {products.length === 0 ? (
          <p className="ph-muted">No products have been added yet.</p>
        ) : (
          <div className="ph-shop-admin-product-list">
            {products.map((product) => {
              const editing = editingId === product.id;

              return (
                <div className={`ph-shop-admin-product ${product.active === false ? "ph-shop-admin-product-inactive" : ""}`} key={product.id}>
                  {editing ? (
                    <>
                      <input
                        className="ph-input"
                        value={editForm.name}
                        onChange={(event) => setEditForm((current) => ({ ...current, name: event.target.value }))}
                        aria-label="Product name"
                      />
                      <input
                        className="ph-input"
                        value={editForm.category}
                        onChange={(event) => setEditForm((current) => ({ ...current, category: event.target.value }))}
                        aria-label="Category"
                      />
                      <div className="ph-shop-price-input-wrap">
                        <span>£</span>
                        <input
                          className="ph-input"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editForm.price}
                          onChange={(event) => setEditForm((current) => ({ ...current, price: event.target.value }))}
                          aria-label="Price"
                        />
                      </div>
                      <div className="ph-inline-actions">
                        <button className="ph-button ph-button-primary ph-button-small" type="button" onClick={() => saveEdit(product.id)}>Save</button>
                        <button className="ph-button ph-button-secondary ph-button-small" type="button" onClick={() => setEditingId("")}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="ph-shop-admin-product-main">
                        <div className="ph-shop-admin-product-title-row">
                          <strong>{product.name}</strong>
                          <span className={product.active === false ? "ph-shop-status ph-shop-status-off" : "ph-shop-status ph-shop-status-on"}>
                            {product.active === false ? "Hidden" : "Available"}
                          </span>
                        </div>
                        <span className="ph-muted">{product.category}</span>
                      </div>
                      <div className="ph-shop-admin-product-price">{formatMoney(product.price)}</div>
                      <div className="ph-inline-actions ph-shop-admin-actions">
                        <button className="ph-button ph-button-secondary ph-button-small" type="button" onClick={() => beginEdit(product)}>Edit</button>
                        <button className="ph-button ph-button-secondary ph-button-small" type="button" onClick={() => handleToggle(product)}>
                          {product.active === false ? "Show" : "Hide"}
                        </button>
                        <button className="ph-button ph-button-secondary ph-button-small ph-shop-delete-button" type="button" onClick={() => handleDelete(product)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </AppShell>
  );
}
