const Order = require("../Models/Orders");

// ✅ Get ALL orders (Paid + Free + Pending, etc.)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get only Paid orders
exports.getPaidOrders = async (req, res) => {
  try {
    const paid = await Order.find({ paymentStatus: "Paid" }).sort({ createdAt: -1 });
    res.json(paid);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create new order (paid)
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(400).json({ message: "Invalid data" });
  }
};

// ✅ Delete Order by ID
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ message: "Server error while deleting order" });
  }
};
