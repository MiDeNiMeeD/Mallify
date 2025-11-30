const Boutique = require("../models/Boutique");

exports.createBoutique = async (req, res) => {
  try {
    const boutiqueData = {
      ...req.body,
      owner: req.user.userId,
    };

    const boutique = new Boutique(boutiqueData);
    await boutique.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.BOUTIQUES,
      "boutique.created",
      { boutiqueId: boutique._id, ownerId: boutique.owner }
    );

    res
      .status(201)
      .json({ message: "Boutique created successfully", boutique });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoutiques = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (status) {
      query.isActive = status === "active";
    }

    const boutiques = await Boutique.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Boutique.countDocuments(query);

    res.json({
      boutiques,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBoutiqueById = async (req, res) => {
  try {
    const boutique = await Boutique.findById(req.params.id)
      .populate("owner", "email profile")
      .populate("managers", "email profile");

    if (!boutique) {
      return res.status(404).json({ error: "Boutique not found" });
    }

    res.json(boutique);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBoutique = async (req, res) => {
  try {
    const boutique = await Boutique.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!boutique) {
      return res
        .status(404)
        .json({ error: "Boutique not found or unauthorized" });
    }

    res.json({ message: "Boutique updated successfully", boutique });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod } = req.body;

    const boutique = await Boutique.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });
    if (!boutique) {
      return res.status(404).json({ error: "Boutique not found" });
    }

    boutique.subscription.plan = plan;
    boutique.subscription.status = "active";
    boutique.subscription.paymentMethod = paymentMethod;
    boutique.subscription.startDate = new Date();
    boutique.subscription.endDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ); // 30 days

    await boutique.save();

    const messageBroker = require("../../shared/utils/messageBroker");
    await messageBroker.publish(
      messageBroker.exchanges.BOUTIQUES,
      "boutique.subscription_updated",
      { boutiqueId: boutique._id, plan, status: "active" }
    );

    res.json({ message: "Subscription updated successfully", boutique });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

