const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});

// GET summary of products
router.get("/total_qty", async (req, res) => {
  try {
    const products = await Product.find();
    const productMap = {};
    const FIXED_PRODUCTION_COST_PER_UNIT = 15;

    for (const product of products) {
      const pid = product.product_id;
      const qty = parseInt(product.product_qty) || 0;

     
      let unitPrice = parseFloat(product.price || "0");
      if (unitPrice === 0 && product.next_subscription_product_price) {
        unitPrice = parseFloat(product.next_subscription_product_price);
      }

      const totalProductPrice = unitPrice * qty;

      if (!productMap[pid]) {
        productMap[pid] = {
          product_id: pid,
          name: product.name,
          totalQty: qty,
          totalPrice: totalProductPrice,
        };
      } else {
        productMap[pid].totalQty += qty;
        productMap[pid].totalPrice += totalProductPrice;
      }
    }

    const result = Object.values(productMap).map((p) => {
      const avgUnitPrice = p.totalPrice / p.totalQty;
      const totalProductionCost = FIXED_PRODUCTION_COST_PER_UNIT * p.totalQty;
      const profitOrLoss = p.totalPrice - totalProductionCost;

      return {
        product_id: p.product_id,
        name: p.name,
        totalQty: p.totalQty,
        price: p.totalPrice.toFixed(2),
        production_cost: totalProductionCost.toFixed(2),
        price_per_unit: avgUnitPrice.toFixed(2),
        profit_or_loss: profitOrLoss.toFixed(2),
      };
    });

    res.status(200).json(result);
  } catch (err) {
    console.error("Error generating summary:", err.message);
    res.status(500).json({ error: "Failed to calculate product summary" });
  }
});



module.exports = router;
