import React from "react";

function OrderTable({ orders }) {
  if (!orders || orders.length === 0) {
    return <p>No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="min-w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Order ID</th>
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Order Total</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Product(s)</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id} className="hover:bg-gray-50">
              <td className="px-4 py-2 border">{order.order_id}</td>
              <td className="px-4 py-2 border">{order.first_name} {order.last_name}</td>
              <td className="px-4 py-2 border">{order.email_address}</td>
              <td className="px-4 py-2 border">${order.order_total}</td>
              <td className="px-4 py-2 border">{order.acquisition_date}</td>
              <td className="px-4 py-2 border">
                <ul className="list-disc pl-4">
                  {order.products?.map((prod) => (
                    <li key={prod.product_id}>
                      {prod.name} (x{prod.product_qty})
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
