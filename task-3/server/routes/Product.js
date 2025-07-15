const express = require("express");
const router = express.Router();
const stickyApi = require("../stickyApi");
const Product = require("../models/Product");

router.post("/", async (req, res) => {
  //   console.log(" Sync Start");

  const { productIds, startDate, endDate } = req.body;
  //   console.log("Request Body:", req.body);

  if (!productIds || !startDate || !endDate) {
    return res
      .status(400)
      .json({ error: "productIds, startDate and endDate are required" });
  }

  try {
    // Step 1: Call order_find to get matching order IDs
    const orderFindRes = await stickyApi.post("/order_find", {
      campaign_id: "all",
      start_date: startDate,
      end_date: endDate,
      start_time: "",
      end_time: "",
      product_id: productIds,
      criteria: "all",
      search_type: "all",
    });

    // console.log(" Order Find Response:", orderFindRes.data);

    const orderIds = orderFindRes.data?.order_id || [];

    if (orderIds.length === 0) {
      return res.status(200).json({ message: "No orders found" });
    }

    // console.log(` Found ${orderIds.length} order(s)`);

    // Step 2: Call order_view with all order IDs
    const orderViewRes = await stickyApi.post("/order_view", {
      order_id: orderIds,
    });
    // console.log(" Order View Response:", orderViewRes.data);

    // Step 3: Normalize object-of-objects to array
    const orders = Object.values(orderViewRes.data.data);
    // console.log(" Normalized Orders Array:", orders);

    let totalProducts = 0;

    for (const order of orders) {
      const products = order.products || [];

      if (products.length > 0) {
        const formattedProducts = products.map((p) => ({
          ...p,
          order_id: order.order_id,
        }));

        // console.log(" Before saving products:", formattedProducts);

        try {
          await Product.insertMany(formattedProducts, { ordered: false });
          //   console.log(" Products saved:", formattedProducts);
          totalProducts += products.length;
        } catch (insertErr) {
          console.error(
            ` Failed to insert products for order ${order.order_id}:`,
            insertErr.message
          );
        }
      }
    }

    // Final response
    res.json({
      message: " Sync complete",
      totalOrders: orderIds.length,
      totalProducts,
    });
  } catch (err) {
    console.error(" Sync failed:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.message });
  }
});

module.exports = router;
