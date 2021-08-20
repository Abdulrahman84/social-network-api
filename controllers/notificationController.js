const Notification = require("../models/Notification");

exports.myNotification = async (req, res) => {
  const newNotification = await Notification.find({
    receiver: req.user._id,
    opened: false,
  }).populate(
    "sender",
    "firstName lastName profilePhoto gender work birthDate"
  );

  const oldNotification = await Notification.find({
    receiver: req.user._id,
    opened: true,
  }).populate(
    "sender",
    "firstName lastName profilePhoto gender work birthDate"
  );

  res.send({ newNotification, oldNotification });
};
