// const express = require("express");
// const router = express.Router();
// const stickyApi = require("../stickyApi");
// const Product = require("../models/Product");

// router.post("/", async (req, res) => {
//   const { productIds, startDate, endDate } = req.body;

//   console.log("Sync request received:", req.body);

//   if (!productIds || !startDate || !endDate) {
//     console.log("Missing required fields.");
//     return res
//       .status(400)
//       .json({ error: "productIds, startDate and endDate are required" });
//   }

//   try {
//     console.log("Calling /order_find with productIds:", productIds);

//     const orderFindRes = await stickyApi.post("/order_find", {
//       campaign_id: "all",
//       start_date: startDate,
//       end_date: endDate,
//       start_time: "",
//       end_time: "",
//       product_id: productIds,
//       criteria: "all",
//       search_type: "all",
//     });

//     console.log("Order find response:", orderFindRes.data);
//     const orderIds = orderFindRes.data?.order_id || [];
//     console.log("Orders found:", orderIds.length);

//     if (orderIds.length === 0) {
//       console.log("No orders found.");
//       return res.status(200).json({ message: "No orders found" });
//     }

//     console.log("Calling /order_view for order details");

//     const orderViewRes = await stickyApi.post("/order_view", {
//       order_id: orderIds,
//     });

//     const orders = Object.values(orderViewRes.data.data || {});
//     console.log("Orders array:", orders.length);

   
//     if (orders.length > 0) {
//       console.log(" First order sample structure:");
//       console.log(JSON.stringify(orders[0], null, 2));

//       if (orders[0].products) {
//         console.log("First order's products array:", JSON.stringify(orders[0].products, null, 2));
//       } else {
//         console.log(" 'products' field missing in first order!");
//       }
//     }

//     let totalProducts = 0;
//     const normalizedProductIds = productIds.map(String); 

//     for (const order of orders) {
//       const products = order.products || [];
//       console.log("Processing order:", order.order_id, "Products in order:", products.length);

//       console.log(
//         " Comparing with productIds:",
//         normalizedProductIds,
//         "\nProducts in order:",
//         products.map((p) => p.product_id)
//       );

//       const filteredProducts = products
//         .filter((p) => normalizedProductIds.includes(String(p.product_id)))
//         .map((p) => ({
//           ...p,
//           order_id: order.order_id,
//         }));

//       console.log("Filtered products:", filteredProducts.length);

//       if (filteredProducts.length > 0) {
//         try {
//           await Product.insertMany(filteredProducts, { ordered: false });
//           console.log(" Inserted products for order:", order.order_id);
//           totalProducts += filteredProducts.length;
//         } catch (insertErr) {
//           console.error(" Insert error for order", order.order_id, ":", insertErr.message);
//         }
//       }
//     }

//     console.log(
//       " Sync complete. Total orders:",
//       orderIds.length,
//       "Total products inserted:",
//       totalProducts
//     );

//     res.json({
//       message: "Sync complete",
//       totalOrders: orderIds.length,
//       totalProducts,
//     });
//   } catch (err) {
//     console.error(" Sync failed:", err.message);
//     res.status(500).json({ error: "Something went wrong", details: err.message });
//   }
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const stickyApi = require("../stickyApi");
const Product = require("../models/Product");

//  Import Redis client
const redis = require("../redis");

router.post("/", async (req, res) => {
  const { productIds, startDate, endDate } = req.body;

  console.log("Sync request received:", req.body);

  if (!productIds || !startDate || !endDate) {
    console.log("Missing required fields.");
    return res
      .status(400)
      .json({ error: "productIds, startDate and endDate are required" });
  }

  try {
    console.log("Calling /order_find with productIds:", productIds);

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

    console.log("Order find response:", orderFindRes.data);
    const orderIds = orderFindRes.data?.order_id || [];
    console.log("Orders found:", orderIds.length);

    if (orderIds.length === 0) {
      console.log("No orders found.");
      return res.status(200).json({ message: "No orders found" });
    }

    console.log("Calling /order_view for order details");

    const orderViewRes = await stickyApi.post("/order_view", {
      order_id: orderIds,
    });

    const orders = Object.values(orderViewRes.data.data || {});
    console.log("Orders array:", orders.length);

    if (orders.length > 0) {
      console.log(" First order sample structure:");
      console.log(JSON.stringify(orders[0], null, 2));

      if (orders[0].products) {
        console.log("First order's products array:", JSON.stringify(orders[0].products, null, 2));
      } else {
        console.log(" 'products' field missing in first order!");
      }
    }

    let totalProducts = 0;
    const normalizedProductIds = productIds.map(String);

    for (const order of orders) {
      const products = order.products || [];
      console.log("Processing order:", order.order_id, "Products in order:", products.length);

      console.log(
        " Comparing with productIds:",
        normalizedProductIds,
        "\nProducts in order:",
        products.map((p) => p.product_id)
      );

      const filteredProducts = products
        .filter((p) => normalizedProductIds.includes(String(p.product_id)))
        .map((p) => ({
          ...p,
          order_id: order.order_id,
        }));

      console.log("Filtered products:", filteredProducts.length);

      if (filteredProducts.length > 0) {
        try {
          await Product.insertMany(filteredProducts, { ordered: false });
          console.log(" Inserted products for order:", order.order_id);
          totalProducts += filteredProducts.length;
        } catch (insertErr) {
          console.error(" Insert error for order", order.order_id, ":", insertErr.message);
        }
      }
    }

    console.log(
      " Sync complete. Total orders:",
      orderIds.length,
      "Total products inserted:",
      totalProducts
    );

    // Redis cache invalidation only if new data was inserted
    if (totalProducts > 0) {
      await redis.del("products:all");
      await redis.del("products:summary");
      console.log("🧹 Redis cache invalidated — new products inserted");
    } else {
      console.log("🟡 No new products inserted — Redis cache not touched");
    }

    res.json({
      message: "Sync complete",
      totalOrders: orderIds.length,
      totalProducts,
    });
  } catch (err) {
    console.error(" Sync failed:", err.message);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});

module.exports = router;
