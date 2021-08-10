const Reaction = require("../models/Reaction");
const User = require("../models/User");

const onlineUsers = [];

module.exports = async (io, socket) => {
  console.log(socket.id);

  const user = await User.findById(
    socket.decoded._id,
    "firstName lastName profilePhoto gender work birthDate"
  );

  onlineUsers.push({ socket: socket.id, _id: user._id });

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

    io.sockets.emit("reaction", { user, react });

    const authorId = author.post.author;
    const isUserOnline = onlineUsers.some((user) => {
      return user._id.toString() === authorId.toString();
    });

    if (!isUserOnline) {
      console.log("offline");
    } else {
      const userNotif = onlineUsers.find(
        (user) => user._id.toString() === authorId.toString()
      );

      if (userNotif._id.toString() === user._id.toString()) return;

      io.to(userNotif.socket).emit("reactionNotification", { user, react });
    }
  });
};
