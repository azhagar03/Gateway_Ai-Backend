const express = require("express");
const router = express.Router();
const paymentCtrl = require("../Controllers/PaymentControllers");

router.post("/create-order", paymentCtrl.createOrder);

router.post("/verify", paymentCtrl.verify);

router.post("/free-order", paymentCtrl.createFreeOrder);

module.exports = router;
