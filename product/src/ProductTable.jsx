import React from "react";

function ProductTable({ orders }) {
  if (!Array.isArray(orders) || orders.length === 0) {
    return <p>No orders to display.</p>;
  }

  return (
    <div style={styles.wrapper}>
      <table style={styles.table} className="order-table">
        <thead>
          <tr>
            <th style={styles.th}>S.No.</th>
            <th style={styles.th}>Order ID</th>
            <th style={styles.th}>Acquisition Date</th>
            <th style={styles.th}>First Name</th>
            <th style={styles.th}>Last Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Total ($)</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.order_id}>
              <td style={styles.td}>{index + 1}</td>
              <td style={styles.td}>{order.order_id}</td>
              <td style={styles.td}>{order.acquisition_date}</td>
              <td style={styles.td}>{order.billing_first_name}</td>
              <td style={styles.td}>{order.billing_last_name}</td>
              <td style={styles.td}>{order.email_address}</td>
              <td style={styles.td}>
                {Number(order.order_total || 0).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: "30px",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "16px",
    backgroundColor: "#fff",
  },
  th: {
    padding: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#f3f4f6",
    textAlign: "center",
  },
  td: {
    padding: "10px",
    border: "1px solid #ddd",
    textAlign: "center",
  },
};

export default ProductTable;
