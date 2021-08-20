const Notification = require("../models/Notification");
const User = require("../models/User");
const Reaction = require("../models/Reaction");

module.exports = async (io, socket) => {
  const user = await User.findById(
    socket.decoded._id,
    "firstName lastName profilePhoto gender work birthDate"
  );

  let reaction;
  socket.on("addReaction", async (data) => {
    if (data.reaction === "like") reaction = "like";
    if (data.reaction === "love") reaction = "love";
    if (data.reaction === "haha") reaction = "haha";
    if (data.reaction === "wow") reaction = "wow";
    if (data.reaction === "sad") reaction = "sad";
    if (data.reaction === "angry") reaction = "angry";

    const react = new Reaction({
      user: user._id,
      reaction,
      post: data.postId,
    });
    await react.save();

    const author = await react
      .populate({
        path: "post",
        model: "Post",
        select: "author",
      })
      .execPopulate();

    io.sockets.emit("reaction", { user, react, author: author.post.author });

    const notification = new Notification({
      receiver: author.post.author,
      sender: user._id,
      post: data.postId,
      type: "reaction",
    });
    await notification.save();
  });

  socket.on("opened", async (data) => {
    await Notification.findByIdAndUpdate(data.id, {
      opened: true,
    });
  });
};
