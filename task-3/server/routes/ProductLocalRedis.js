const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const redis = require("../redis");

// Cache settings
const CACHE_EXPIRY_SECONDS = 3600; // 1 hour
const ALL_PRODUCTS_KEY = "cache:products:all";
const SUMMARY_KEY = "cache:products:summary";

// GET all products (with Redis cache)
router.get("/", async (req, res) => {
  try {
    // Try fetching from Redis
    const cache = await redis.get(ALL_PRODUCTS_KEY);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    // Fetch from MongoDB if not in cache
    const products = await Product.find().sort({ createdAt: -1 });

    // Store result in Redis for future requests
    if (products && products.length > 0) {
      await redis.set(ALL_PRODUCTS_KEY, JSON.stringify(products), 'EX', CACHE_EXPIRY_SECONDS);
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Failed to fetch product data" });
  }
});

// GET product quantity and financial summary (with Redis cache)
router.get("/total_qty", async (req, res) => {
  try {
    // Try fetching from Redis
    const cache = await redis.get(SUMMARY_KEY);
    if (cache) {
      return res.status(200).json(JSON.parse(cache));
    }

    // Fetch products from MongoDB
    const products = await Product.find();
    const productMap = {};
    const FIXED_PRODUCTION_COST_PER_UNIT = 2;

    // Group and calculate totals per product_id
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

    // Prepare final summary array
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

    // Cache the result in Redis
    if (result.length > 0) {
      await redis.set(SUMMARY_KEY, JSON.stringify(result), 'EX', CACHE_EXPIRY_SECONDS);
    }

    res.status(200).json(result);
  } catch (err) {
    console.error("Error generating product summary:", err.message);
    res.status(500).json({ error: "Failed to calculate product summary" });
  }
});

module.exports = router;
