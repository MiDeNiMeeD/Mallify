const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      customer: req.user.userId,
    };

    const order = new Order(orderData);
    await order.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.ORDERS,
      "order.created",
      {
        orderId: order._id,
        customerId: order.customer,
        boutiqueId: order.boutique,
        total: order.pricing.total,
        items: order.items,
      }
    );

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { customer: req.user.userId };

    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate("boutique", "name logo")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.userId,
    })
      .populate("boutique", "name logo contact")
      .populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date(),
      notes,
    });

    await order.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.ORDERS,
      "order.status_updated",
      {
        orderId: order._id,
        status,
        customerId: order.customer,
      }
    );

    res.json({ message: "Order status updated", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user.userId,
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      return res
        .status(400)
        .json({ error: "Order cannot be cancelled at this stage" });
    }

    order.status = "cancelled";
    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      notes: "Cancelled by customer",
    });

    await order.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.ORDERS,
      "order.cancelled",
      { orderId: order._id, customerId: order.customer }
    );

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

