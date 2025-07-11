import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getCustomerInfo,
  getOrdersByIds,
  getUpcomingSubscriptions,
} from "../api";

export default function DashboardPage() {
  const [customer, setCustomer] = useState(null);
  const [detailedOrders, setDetailedOrders] = useState([]);
  const [error, setError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [upcomingPayment, setUpcomingPayment] = useState(null);
  const [showOrders, setShowOrders] = useState(false);

  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const customerId = query.get("customer_id");

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const data = await getCustomerInfo(customerId);
        setCustomer(data);

        if (data?.order_list?.length) {
          const orders = await getOrdersByIds(data.order_list);
          const subscriptions = getUpcomingSubscriptions(orders);
          if (subscriptions?.length > 0) {
            setUpcomingPayment(subscriptions[0]);
          }
        }
      } catch (err) {
        setError("Unable to load customer information.");
        console.error(err);
      }
    }

    if (customerId) {
      fetchCustomer();
    } else {
      setError("Missing customer ID.");
    }
  }, [customerId]);

  const loadOrders = async () => {
    if (!customer?.order_list?.length) return;
    try {
      setLoadingOrders(true);
      const orderIds = customer.order_list;
      const details = await getOrdersByIds(orderIds);
      setDetailedOrders(details);
      setShowOrders(true);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Could not load order details.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (error) return <div className="error-msg">{error}</div>;
  if (!customer) return <div>Loading customer info...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <h1 className="dashboard-greeting">
          {getGreeting()}, {customer.first_name} {customer.last_name}!
        </h1>

        <div className="dashboard-stats-grid">
          <div className="stat-card">
            <p className="stat-label">Total Orders</p>
            <p className="stat-value">{customer.order_count}</p>
          </div>

          <div className="stat-card">
            <p className="stat-label">Next Payment</p>
            <p className="stat-value">
              {upcomingPayment ? (
                <>
                  {upcomingPayment.date}
                  {upcomingPayment.is_trial && <span> (Trial)</span>}
                </>
              ) : (
                "None"
              )}
            </p>
          </div>
        </div>

        {customer.order_list.length > 0 && (
          <button
            className="dashboard-button"
            onClick={() => {
              loadOrders();
              setTimeout(() => {
                document
                  .getElementById("orders-section")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 300);
            }}
          >
            View Orders
          </button>
        )}

        {showOrders && (
          <div className="orders-table-wrapper" id="orders-section">
            {loadingOrders ? (
              <p>Loading order details...</p>
            ) : detailedOrders.length > 0 ? (
              <>
                <h2 className="dashboard-subheading">Recent Orders</h2>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Order ID</th>
                      <th>Product IDs</th>
                      <th>Total Products</th>
                      <th>Campaign ID</th>
                      <th>Gateway ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedOrders.map((order, index) => (
                      <tr key={order.order_id}>
                        <td>{index + 1}</td>
                        <td>{order.order_id}</td>
                        <td>{order.product_ids}</td>
                        <td>{order.total_products}</td>
                        <td>{order.campaign_id}</td>
                        <td>{order.gateway_id || "N/A"}</td>
                        <td>{order.acquisition_date}</td>
                        <td>{order.status}</td>
                        <td>${order.order_total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>No recent orders found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
