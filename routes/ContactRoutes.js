const express = require("express");
const router = express.Router();
const contactCtrl = require("../Controllers/ContactControllers");
const auth = require("../utils/authMiddleware");

router.post("/", contactCtrl.createContact);
router.get("/", contactCtrl.getContacts); // admin only list

module.exports = router;
