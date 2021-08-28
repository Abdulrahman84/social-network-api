const Notification = require("../models/Notification");

exports.myNotification = async (req, res) => {
  const newNotification = await Notification.find({
    receiver: req.user._id,
    opened: false,
    sender: { $ne: req.user._id },
  }).populate(
    "sender",
    "firstName lastName profilePhoto gender work birthDate"
  );

  const oldNotification = await Notification.find({
    receiver: req.user._id,
    opened: true,
    sender: { $ne: req.user._id },
  }).populate(
    "sender",
    "firstName lastName profilePhoto gender work birthDate"
  );

  res.send({ newNotification, oldNotification });
};
