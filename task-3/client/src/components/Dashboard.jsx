import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/local_products/total_qty")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch product summary", err));
  }, []);

  return (
    <div className="dashboard" style={{ padding: "20px" }}>
      <h1 className="dashboard-heading">Product Report</h1>
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table
          className="product-table"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product ID</th>
              <th>Name</th>
              <th>Total Qty</th>
              <th>Total Price ($)</th>
              <th>Production Cost ($)</th>
              <th>Price Per Unit ($)</th>
              <th>Profit / Loss</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, index) => {
              const profitValue = parseFloat(prod.profit_or_loss);
              const isProfit = profitValue >= 0;

              return (
                <tr key={prod.product_id}>
                  <td>{index + 1}</td>
                  <td>{prod.product_id}</td>
                  <td>{prod.name}</td>
                  <td>{prod.totalQty}</td>
                  <td>${parseFloat(prod.price).toFixed(2)}</td>
                  <td>${parseFloat(prod.production_cost).toFixed(2)}</td>
                  <td>${parseFloat(prod.price_per_unit).toFixed(2)}</td>
                  <td>
                    <span
                      style={{
                        backgroundColor: isProfit ? "#d1fadf" : "#ffe0e0",
                        color: isProfit ? "green" : "red",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        display: "inline-block",
                        fontWeight: "bold",
                      }}
                    >
                      ${Math.abs(profitValue).toFixed(2)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
