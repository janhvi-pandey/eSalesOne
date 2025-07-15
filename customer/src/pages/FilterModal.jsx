import React from "react";

export default function FilterModal({ filters, setFilters, onApply, onClear, onClose }) {
  return (
    <div className="filter-card">
      <div className="filter-row">
        <label>
          Order ID
          <input
            type="text"
            value={filters.orderId}
            onChange={(e) => setFilters({ ...filters, orderId: e.target.value })}
          />
        </label>
        <label>
          Product ID
          <input
            type="text"
            value={filters.productId}
            onChange={(e) => setFilters({ ...filters, productId: e.target.value })}
          />
        </label>
        <label>
          Campaign ID
          <input
            type="text"
            value={filters.campaignId}
            onChange={(e) => setFilters({ ...filters, campaignId: e.target.value })}
          />
        </label>
      </div>
      <div className="filter-row">
        <label>
          <input
            type="radio"
            name="orderType"
            value="One-time Purchase"
            checked={filters.orderType === "One-time Purchase"}
            onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
          />
          One-time Purchase
        </label>
        <label>
          <input
            type="radio"
            name="orderType"
            value="Subscription"
            checked={filters.orderType === "Subscription"}
            onChange={(e) => setFilters({ ...filters, orderType: e.target.value })}
          />
          Subscription
        </label>
        <label>
          <input
            type="radio"
            name="orderType"
            value=""
            checked={filters.orderType === ""}
            onChange={() => setFilters({ ...filters, orderType: "" })}
          />
          All
        </label>
      </div>
      <div className="filter-actions">
        <button className="apply-filter-btn" onClick={onApply}>
          Apply
        </button>
        <button className="clear-filter-btn" onClick={onClear}>
          Clear
        </button>
        <button className="close-filter-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
