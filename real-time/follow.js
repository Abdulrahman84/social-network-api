const User = require("../models/User");
const Notification = require("../models/Notification");

module.exports = async (io, socket) => {
  const user = await User.findById(
    socket.decoded._id,
    "firstName lastName profilePhoto gender work birthDate"
  );

  socket.on("follow", async (data) => {
    const notification = new Notification({
      receiver: data.id,
      sender: user._id,
      type: "follow",
    });
    await notification.save();
    io.sockets.emit("follow", { user, id: data.id });
  });

  socket.on("opened", async (data) => {
    await Notification.findByIdAndUpdate(data.id, {
      opened: true,
    });
  });
};
