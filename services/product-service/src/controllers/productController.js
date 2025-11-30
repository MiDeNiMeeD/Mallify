const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish("products", "product.created", {
      productId: product._id,
      boutiqueId: product.boutique,
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      boutique,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
    } = req.query;
    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (boutique) query.boutique = boutique;
    if (minPrice || maxPrice) {
      query["price.regular"] = {};
      if (minPrice) query["price.regular"].$gte = parseFloat(minPrice);
      if (maxPrice) query["price.regular"].$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("boutique", "name logo")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: -1 });

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("boutique", "name logo contact");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Increment view count
    product.stats.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateInventory = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (operation === "add") {
      product.inventory.quantity += quantity;
    } else if (operation === "subtract") {
      if (product.inventory.quantity < quantity) {
        return res.status(400).json({ error: "Insufficient inventory" });
      }
      product.inventory.quantity -= quantity;
    }

    await product.save();

    res.json({ message: "Inventory updated", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

