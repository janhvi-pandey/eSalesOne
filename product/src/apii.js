import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_STICKY_BASE,
  auth: {
    username: import.meta.env.VITE_STICKY_UNAME,
    password: import.meta.env.VITE_STICKY_PASSWD,
  },
  headers: { "Content-Type": "application/json" },
});

function manageRecentSearches(key) {
  const historyKey = "recent_searches_keys";
  let keys = JSON.parse(localStorage.getItem(historyKey)) || [];

  if (!keys.includes(key)) {
    keys.push(key);
    if (keys.length > 5) {
      const oldKey = keys.shift();
      localStorage.removeItem(oldKey);
    }
    localStorage.setItem(historyKey, JSON.stringify(keys));
  }
}

export async function getOrderCount(productID, startDate = "01/01/2000", endDate = "01/01/2100") {
  const cachedKey = `order_count_${productID}_${startDate}_${endDate}`;
  const cachedItem = localStorage.getItem(cachedKey);

  if (cachedItem) {
    try {
      const parsed = JSON.parse(cachedItem);
      const now = Date.now();
      const threshold = 2 * 60 * 1000;

      if (now - parsed.timestamp < threshold) {
        return [parsed.count, parsed.orderID, parsed.orders];
      }
    } catch {
      localStorage.removeItem(cachedKey);
    }
  }

  const req_body = {
    campaign_id: "all",
    start_date: startDate,
    end_date: endDate,
    start_time: "",
    end_time: "",
    product_id: [productID],
    criteria: "all",
    search_type: "all",
    return_type: "order_view",
  };

  const { data } = await api.post("order_find", req_body);

  if (data.response_code !== "100") {
    throw new Error("API Error");
  }

  const count = Number(data.total_orders ?? 0);
  const orderID = data.order_id || [];
  const orderData = data.data || {};
  console.log("OrderData",orderData);
  const orders = Object.entries(orderData).map(([id, order]) => ({
    order_id: id,
    acquisition_date: order.acquisition_date,
    billing_first_name: order.billing_first_name,
    billing_last_name: order.billing_last_name,
    email_address: order.email_address,
    order_total: order.order_total,
  }));
  console.log("Orders",orders);
  localStorage.setItem(
    cachedKey,
    JSON.stringify({
      count,
      timestamp: Date.now(),
      orderID,
      orders,
    })
  );

  manageRecentSearches(cachedKey);

  return [count, orderID, orders];
}
