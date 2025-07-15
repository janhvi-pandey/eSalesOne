const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  order_id: String,
  product_id: String,
  sku: String,
  price: String,
  product_qty: String,
  name: String,
  is_recurring: String,
  is_terminal: String,
  recurring_date: String,
  subscription_id: String,
  next_subscription_product: String,
  next_subscription_product_id: String,
  next_subscription_product_price: String,
  forecasted_revenue: String,
  billing_model_discount: String,
  is_add_on: String,
  is_in_trial: String,
  step_number: String,
  is_shippable: String,
  is_full_refund: String,
  refund_amount: String,
  on_hold: String,
  hold_date: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
