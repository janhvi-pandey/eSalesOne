import { useState } from "react";
import { getOrderCount } from "./apii";
import "./index.css";

const PRODUCTS = [2142, 2181, 2201];
const ORDERS_PER_PAGE = 10;

function App() {
  const [selected, setSelected] = useState("");
  const [count, setCount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);

  // ✅ Only updates selected product — no fetch here
  const handleChange = (e) => {
    const id = Number(e.target.value);
    setSelected(id);
    setCount(null);
    setOrders([]);
    setCurrentPage(1);
  };

  // ✅ Only called when "Fetch Orders" is clicked
  const handleFetch = async () => {
    if (selected && startDate && endDate) {
      setCurrentPage(1);
      await fetchOrderCountWithDates(selected, startDate, endDate);
    }
  };

  const fetchOrderCountWithDates = async (productId, start, end) => {
    try {
      setLoading(true);
      setError("");

      const formattedStart = formatDate(start);
      const formattedEnd = formatDate(end);
      const [cnt, _, orderData] = await getOrderCount(
        productId,
        formattedStart,
        formattedEnd
      );
      setCount(cnt);

      const orderList = Object.entries(orderData || {}).map(([id, order]) => ({
        ...order,
        order_id: id,
      }));

      setOrders(orderList);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${month}/${day}/${year}`;
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  return (
    <main className="container">
      <div className="card">
        <h2 className="heading">Order Count</h2>

        <label htmlFor="productID" className="label">
          Product Id:&nbsp;
          <select value={selected} onChange={handleChange} className="select">
            <option value="">Please choose an ID</option>
            {PRODUCTS.map((p) => (
              <option value={p} key={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <div className="dateRange">
          <label htmlFor="startDate" className="label">
            Start Date:&nbsp;
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="select"
            />
          </label>
          <label htmlFor="endDate" className="label">
            End Date:&nbsp;
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="select"
            />
          </label>
        </div>

        <button
          onClick={handleFetch}
          disabled={!startDate || !endDate || !selected}
          className="select fetch-button"
        >
          Fetch Orders
        </button>

        {loading && <p className="loading">Fetching Orders...</p>}
        {count !== null && !loading && (
          <p className="result">Orders: {count.toLocaleString()}</p>
        )}
        {error && <p className="error">{error}</p>}

        {orders.length > 0 && (
          <>
            <table className="table">
              <thead>
                <tr className="theadRow">
                  <th>S.No.</th>
                  <th>Order ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Acquisition Date</th>
                  <th>Total ($)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => (
                  <tr key={order.order_id}>
                    <td>{(currentPage - 1) * ORDERS_PER_PAGE + index + 1}</td>
                    <td>{order.order_id}</td>
                    <td>{order.billing_first_name}</td>
                    <td>{order.billing_last_name}</td>
                    <td>{order.email_address}</td>
                    <td>{order.acquisition_date}</td>
                    <td>{order.order_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="fetch-button"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="fetch-button"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default App;
