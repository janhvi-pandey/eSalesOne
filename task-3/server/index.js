const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/Product");
// const productFetchLocalRoutes = require("./routes/ProductLocal");
const productFetchRedis = require("./routes/ProductLocalRedis");
dotenv.config();

const app = express();
app.use(express.json());
// console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
  });

const cors = require('cors');
app.use(cors());

app.use("/api/product", productRoutes);
// app.use("/api/local_products", productFetchLocalRoutes);
app.use("/api/local_products", productFetchRedis);



app.get("/", (req, res) => {
  res.send("Server is running 😊");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
