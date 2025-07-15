import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
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
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const navigate = useNavigate();
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
            setHasActiveSubscription(true);
          } else {
            setHasActiveSubscription(false);
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
    if (!hasActiveSubscription) {
      setError("No active subscription.");
      return;
    }

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
        <button className="logout-btn" onClick={() => navigate("/")}>
          <IoLogOutOutline />
        </button>

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

        {customer.order_list.length > 0 && hasActiveSubscription && (
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

        {showOrders && hasActiveSubscription && (
          <div className="orders-table-wrapper" id="orders-section">
            {loadingOrders ? (
              <p>Loading order details...</p>
            ) : detailedOrders.length > 0 ? (
              <>
                <h2 className="dashboard-subheading">Order History</h2>
                <table className="orders-table">
                 <thead>
  <tr>
    <th>S.No.</th>
    <th>Order ID</th>
    <th>Product ID</th>
    <th>Product Name</th>
    <th>Campaign ID</th>
    <th>Date</th>
    <th>Order Type</th>
    <th>Product Price</th>
  </tr>
</thead>
<tbody>
  {(() => {
    let serial = 1;
    return detailedOrders.flatMap((order) =>
      order.products.map((product) => {
        const isRecurring = product.is_recurring === "1" || product.is_recurring === 1;
        const orderType = isRecurring ? "Subscription" : "One-time Purchase";

        return (
          <tr key={`${order.order_id}-${product.product_id}-${serial}`}>
            <td>{serial++}</td>
            <td>{order.order_id}</td>
            <td>{product.product_id}</td>
            <td>{product.name}</td>
            <td>{order.campaign_id}</td>
            <td>{order.acquisition_date}</td>
            <td>{orderType}</td>
            <td>${product.price}</td>
          </tr>
        );
      })
    );
  })()}
</tbody>



                </table>
              </>
            ) : (
              <p>No recent orders found.</p>
            )}
          </div>
        )}

        {!hasActiveSubscription && (
          <div className="error-msg" style={{ marginTop: "2rem" }}>
            No active subscription.
          </div>
        )}
      </div>
    </div>
  );
}
