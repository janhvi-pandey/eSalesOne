import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";
import { FaFilter } from "react-icons/fa";
import {
  getCustomerInfo,
  getOrdersByIds,
  getUpcomingSubscriptions,
} from "../api";

export default function DashboardPage() {
  const [customer, setCustomer] = useState(null);
  const [detailedOrders, setDetailedOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState("");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [upcomingPayment, setUpcomingPayment] = useState(null);
  const [showOrders, setShowOrders] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    orderId: "",
    productId: "",
    campaignId: "",
    orderType: "",
  });

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
        console.error(err);
        setError("Unable to load customer information.");
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
      setFilteredOrders(details);
      setShowOrders(true);
    } catch (err) {
      console.error("Failed to load orders", err);
      setError("Could not load order details.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const applyFilters = () => {
    const { orderId, productId, campaignId, orderType } = filters;

    const filtered = detailedOrders
      .map((order) => {
        const matchingProducts = order.products.filter((product) => {
          const isRecurring =
            product.is_recurring === "1" || product.is_recurring === 1;
          const typeLabel = isRecurring ? "Subscription" : "One-time Purchase";

          return (
            (!orderId || order.order_id.includes(orderId)) &&
            (!productId || product.product_id.includes(productId)) &&
            (!campaignId || order.campaign_id.includes(campaignId)) &&
            (!orderType || typeLabel === orderType)
          );
        });

        return matchingProducts.length > 0
          ? { ...order, products: matchingProducts }
          : null;
      })
      .filter(Boolean);

    setFilteredOrders(filtered);
    setShowFilter(false);
  };

  const clearFilters = () => {
    setFilters({
      orderId: "",
      productId: "",
      campaignId: "",
      orderType: "",
    });
    setFilteredOrders(detailedOrders);
    setShowFilter(false);
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
                  {/* {upcomingPayment.is_trial && <span> (Trial)</span>} */}
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
            <div className="orders-header-row">
              <h2 className="dashboard-subheading">Order History</h2>
              <button
                className="filter-icon-rounded"
                onClick={() => setShowFilter(!showFilter)}
                title="Toggle Filter"
              >
                <FaFilter />
              </button>
            </div>

            {showFilter && (
              <div className="filter-card">
                <div className="filter-row">
                  <div className="filter-field">
                    <label>Order ID</label>
                    <input
                      type="text"
                      value={filters.orderId}
                      onChange={(e) =>
                        setFilters({ ...filters, orderId: e.target.value })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label>Product ID</label>
                    <input
                      type="text"
                      value={filters.productId}
                      onChange={(e) =>
                        setFilters({ ...filters, productId: e.target.value })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label>Campaign ID</label>
                    <input
                      type="text"
                      value={filters.campaignId}
                      onChange={(e) =>
                        setFilters({ ...filters, campaignId: e.target.value })
                      }
                    />
                  </div>
                  <div className="filter-field">
                    <label>Order Type</label>
                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          name="orderType"
                          value="One-time Purchase"
                          checked={filters.orderType === "One-time Purchase"}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              orderType: e.target.value,
                            })
                          }
                        />
                        One-time
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="orderType"
                          value="Subscription"
                          checked={filters.orderType === "Subscription"}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              orderType: e.target.value,
                            })
                          }
                        />
                        Subscription
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="orderType"
                          value=""
                          checked={filters.orderType === ""}
                          onChange={() =>
                            setFilters({ ...filters, orderType: "" })
                          }
                        />
                        All
                      </label>
                    </div>
                  </div>
                </div>

                <div className="filter-actions">
                  <button onClick={applyFilters}>Apply</button>
                  <button onClick={clearFilters}>Clear</button>
                </div>
              </div>
            )}

            {loadingOrders ? (
              <p>Loading order details...</p>
            ) : filteredOrders.length > 0 ? (
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
                    return filteredOrders.flatMap((order) =>
                      order.products.map((product) => {
                        const isRecurring =
                          product.is_recurring === "1" ||
                          product.is_recurring === 1;
                        const orderType = isRecurring
                          ? "Subscription"
                          : "One-time Purchase";

                        return (
                          <tr
                            key={`${order.order_id}-${product.product_id}-${serial}`}
                          >
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
            ) : (
              <p>No matching orders found.</p>
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
