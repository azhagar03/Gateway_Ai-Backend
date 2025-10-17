require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config();
// Routes
const ProductsRoutes = require("./routes/ProductsRoutes");
const ContactRoutes = require("./routes/ContactRoutes");
const OrderRoutes = require("./routes/OrderRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const PaymentsRoutes = require("./routes/PaymentsRoutes");

// Admin model
const Admin = require("./Models/Admin");

const app = express();
app.use(cors({
  origin:["http://localhost:3000","https://gatewayai.in"]
}));
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/products", ProductsRoutes);
app.use("/api/contact", ContactRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/payment", PaymentsRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Seed default admin if not exists
    const existingAdmin = await Admin.findOne({ username: "admin" });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin@321", 10);
      await new Admin({ username: "admin", passwordHash }).save();
      console.log("✅ Default admin created (username: admin, password: admin@321)");
    }

    // Start server
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });
