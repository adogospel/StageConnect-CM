const Notification = require("../models/Notification");


// 🔹 GET MES NOTIFICATIONS
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🔹 COMPTER NOTIFICATIONS NON LUES
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🔹 MARQUER UNE NOTIFICATION COMME LUE
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🔹 MARQUER TOUTES COMME LUES
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "Toutes les notifications sont marquées comme lues" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// 🔹 SUPPRIMER UNE NOTIFICATION
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    res.status(200).json({ message: "Notification supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};