const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const messageBroker = require("../shared/utils/messageBroker");

const app = express();
const PORT = process.env.PORT || 3008;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

messageBroker.connect().catch(console.error);

// Subscribe to order events for delivery creation
messageBroker.subscribe(
  messageBroker.exchanges.ORDERS,
  "order.confirmed",
  "delivery-service-orders",
  async (data) => {
    console.log("Creating delivery for order:", data.orderId);
    // TODO: Create delivery record and assign driver
  }
);

// TODO: Add delivery routes

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "delivery-service" });
});

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => console.log(`Delivery Service on port ${PORT}`));

