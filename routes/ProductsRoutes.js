const express = require("express");
const router = express.Router();
const productCtrl = require("../Controllers/ProductControllers");
const auth = require("../utils/authMiddleware");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.get("/", productCtrl.getProducts);
router.get("/:id", productCtrl.getProduct);

router.post("/", auth, upload.single("image"), productCtrl.createProduct);
router.put("/:id", auth, upload.single("image"), productCtrl.updateProduct);
router.delete("/:id", auth, productCtrl.deleteProduct);

module.exports = router;
