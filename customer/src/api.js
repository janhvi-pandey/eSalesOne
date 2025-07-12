import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_STICKY_BASE,
  auth: {
    username: import.meta.env.VITE_STICKY_UNAME,
    password: import.meta.env.VITE_STICKY_PASSWD,
  },
  headers: { "Content-Type": "application/json" },
});

export async function verifyCardLast4(orderId, last4) {
  const req_body = {
    order_id: [Number(orderId)],
  };

  const { data } = await api.post("order_view", req_body);
  console.log("Request Body:", req_body);
  console.log("API Response:", data);

  if (data.response_code !== "100") {
    return { isMatch: false, customerId: null };
  }

  const ccLast4 = data.cc_last_4;
  const fullCardNumber = data.credit_card_number;

  const isMatch =
    ccLast4 === last4 || (fullCardNumber && fullCardNumber.endsWith(last4));

  console.log("Is Match:", isMatch);

  return { isMatch, customerId: isMatch ? data.customer_id : null };
}

export async function getCustomerIdFromOrder(orderId, last4) {
  const { data } = await api.post("order_view", {
    order_id: [Number(orderId)],
  });
  //   console.log("c", data);

  if (data.response_code !== "100") {
    throw new Error("Invalid order ID");
  }

  const match =
    data.cc_last_4 === last4 ||
    (data.credit_card_number && data.credit_card_number.endsWith(last4));

  if (!match) {
    throw new Error("Card number mismatch");
  }

  if (!data.customer_id) {
    throw new Error("Customer ID not found in order");
  }

  return data.customer_id;
}

export async function getCustomerInfo(customerID) {
  const { data } = await api.post("customer_view", {
    customer_id: Number(customerID),
  });

  if (data.response_code !== "100") {
    throw new Error("Customer not found");
  }

  return {
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    order_count: data.order_count,
    order_list: data.order_list || [],
  };
}
export async function getOrdersByIds(orderIds) {
  const { data } = await api.post("order_view", {
    order_id: orderIds.map(Number),
  });

  if (data.response_code !== "100") {
    throw new Error("Failed to fetch orders");
  }

  const orderData = data.data || {};
  //   console.log("Order", orderData);
  return Object.entries(orderData).map(([id, order]) => ({
    order_id: id,
    acquisition_date: order.acquisition_date,
    status: order.order_status,
    order_total: order.order_total,
    campaign_id: order.campaign_id || "N/A",
    gateway_id: order.gateway_id || "N/A",
    product_ids: (order.products || []).map((p) => p.product_id).join(", "),
    total_products: (order.products || []).length,
    products: order.products || [],
  }));
}

export const getUpcomingSubscriptions = (orderDetails) => {
  const upcomingPayments = [];
  const today = new Date();

  orderDetails.forEach((order) => {
    const products = order.products || [];
    products.forEach((product) => {
      if (
        product.is_recurring &&
        product.recurring_date &&
        product.recurring_date !== "0000-00-00"
      ) {
        const recurringDate = new Date(product.recurring_date);
        if (recurringDate > today) {
          const formattedDate = recurringDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          upcomingPayments.push({
            product_name: product.name,
            date: formattedDate,
            amount: product.next_billing_price,
            is_trial: product.is_trial,
          });
        }
      }
    });
  });

  return upcomingPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
};
