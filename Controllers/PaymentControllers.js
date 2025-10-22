const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../Models/Orders");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { amount, form, items } = req.body;
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    });

    const dbOrder = new Order({
      ...form,
      items: items.map((i) => ({
        productName: i.name,
        image: i.image,     
        qty: i.qty,
        price: i.price,
      })),
      totalAmount: amount,
      paymentStatus: "Pending",
    });
    await dbOrder.save();

    res.json({
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.id,
      amount: order.amount,
      orderId: dbOrder._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Razorpay order failed", error: err });
  }
};

const sendAdminNotification = async (order) => {
  try {
    const itemsList = order.items
      .map((i) => `${i.productName} x${i.qty} - ₹${i.price * i.qty}`)
      .join("\n");

    const response = await resend.emails.send({
      from: "Gateway AI <onboarding@resend.dev>", 
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

    console.log("✅ Admin email sent via Resend:", response);
  } catch (err) {
    console.error("❌ Error sending admin email:", err);
  }
};



exports.verify = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature)
      return res.status(400).json({ message: "Invalid signature" });

    const order = await Order.findById(orderId);
    order.paymentStatus = "Paid";
    await order.save();

    // Send notification to admin
    await sendAdminNotification(order);

    res.json({ message: "Payment verified & order updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
};


exports.createFreeOrder = async (req, res) => {
  try {
    const { items = [], ...orderData } = req.body;

    const formattedItems = items.map((i) => ({
      productName: i.productName || i.name,
      image: i.image,
      qty: i.qty,
      price: i.price,
    }));

    const order = new Order({
      ...orderData,
      items: formattedItems,
      paymentStatus: "Free",
      totalAmount: 0,
    });

    await order.save();

    // Send admin notification for free order too
    await sendAdminNotification(order);

    res.status(201).json({ message: "Free order saved successfully", order });
  } catch (err) {
    console.error("Error saving free order:", err);
    res.status(500).json({ message: "Failed to save free order", error: err.message });
  }
};
