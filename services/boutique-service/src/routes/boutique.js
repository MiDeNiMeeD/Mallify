const express = require("express");
const router = express.Router();
const boutiqueController = require("../controllers/boutiqueController");
const { authenticate, authorize } = require("../../shared/middleware/auth");

router.post(
  "/",
  authenticate,
  authorize("boutique_owner", "admin"),
  boutiqueController.createBoutique
);
router.get("/", boutiqueController.getBoutiques);
router.get("/:id", boutiqueController.getBoutiqueById);
router.put(
  "/:id",
  authenticate,
  authorize("boutique_owner", "admin"),
  boutiqueController.updateBoutique
);
router.post(
  "/:id/subscription",
  authenticate,
  authorize("boutique_owner"),
  boutiqueController.updateSubscription
);

module.exports = router;

