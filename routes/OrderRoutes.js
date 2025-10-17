const express = require("express");
const router = express.Router();
const orderCtrl = require("../Controllers/OrderControllers");
const Order = require("../Models/Orders");

// ✅ Fetch all orders (Paid + Free)
router.get("/", orderCtrl.getAllOrders);

// ✅ Fetch only paid orders
router.get("/paid", orderCtrl.getPaidOrders);

// ✅ Create paid order
router.post("/", orderCtrl.createOrder);

router.delete("/:id", orderCtrl.deleteOrder);

// ✅ Create free order (coupon or offer)
const sendAdminNotification = async (order) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASS,
      },
    });

    const itemsList = order.items
      .map((i) => `${i.productName} x${i.qty} - ₹${i.price * i.qty}`)
      .join("\n");

    await transporter.sendMail({
      from: `"${order.firstName} ${order.lastName}" <${order.email}>`, 
      to: process.env.ADMIN_EMAIL,
      subject: `🛒 New Order (${order.paymentStatus}) - ${order.firstName} ${order.lastName}`,
      text: `
A new order has been placed.

Name: ${order.firstName} ${order.lastName}
Email: ${order.email}
Phone: ${order.phone}
Total: ₹${order.totalAmount}
Payment Status: ${order.paymentStatus}

Items:
${itemsList}
      `,
    });
  } catch (err) {
    console.error("Error sending admin email:", err);
  }
};

// router.post("/free-order", async (req, res) => {
//   try {
//     const { items = [], ...orderData } = req.body;

//     const formattedItems = items.map((i) => ({
//       productName: i.productName || i.name,
//       image: i.image,
//       qty: i.qty,
//       price: i.price,
//     }));

//     const order = new Order({
//       ...orderData,
//       items: formattedItems,
//       paymentStatus: "Free",
//       totalAmount: 0,
//     });

//     await order.save();
//      await sendAdminNotification(order);
//     res.status(201).json({ message: "Free order saved successfully", order });
//   } catch (err) {
//     console.error("❌ Error saving free order:", err);
//     res.status(500).json({ message: "Failed to save free order", error: err.message });
//   }
// });

module.exports = router;
