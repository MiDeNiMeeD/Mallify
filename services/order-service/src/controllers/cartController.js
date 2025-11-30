const Cart = require("../models/Cart");

exports.addToCart = async (req, res) => {
  try {
    const { product, quantity, price } = req.body;
    const customerId = req.user.userId;

    let cart = await Cart.findOne({ customer: customerId });

    if (!cart) {
      cart = new Cart({ customer: customerId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === product
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product, quantity, price });
    }

    cart.totals.itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totals.subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cart.lastModified = new Date();

    await cart.save();

    res.json({ message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.userId }).populate(
      "items.product",
      "name images price inventory"
    );

    res.json(cart || { items: [], totals: { subtotal: 0, itemCount: 0 } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.user.userId });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    cart.totals.itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totals.subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await cart.save();

    res.json({ message: "Item removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { customer: req.user.userId },
      { items: [], totals: { subtotal: 0, itemCount: 0 } }
    );

    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

