const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { authenticate, authorize } = require("../../shared/middleware/auth");

router.post(
  "/",
  authenticate,
  authorize("boutique_owner", "admin"),
  productController.createProduct
);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.put(
  "/:id",
  authenticate,
  authorize("boutique_owner", "admin"),
  productController.updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("boutique_owner", "admin"),
  productController.deleteProduct
);
router.patch(
  "/:id/inventory",
  authenticate,
  authorize("boutique_owner", "admin"),
  productController.updateInventory
);

module.exports = router;

