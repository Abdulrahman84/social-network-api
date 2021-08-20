const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");

const onlineUsers = [];

module.exports = async (io, socket) => {
  console.log("new WS");

  onlineUsers.push({ socketId: socket.id, _id: socket.decoded._id });
  socket.emit("onlineUsers", onlineUsers);

  const user = await User.findById(
    socket.decoded._id,
    "firstName lastName profilePhoto gender work birthDate"
  );

  socket.on("addComment", async (data) => {
    const comment = new Comment({
      user: socket.decoded._id,
      comment: data.comment,
      post: data.postId,
    });
    await comment.save();

    const author = await comment
      .populate({
        path: "post",
        model: "Post",
        select: "author",
      })
      .execPopulate();

    io.sockets.emit("comment", { user, comment, author: author.post.author });

    const notification = new Notification({
      receiver: author.post.author,
      sender: user._id,
      post: data.postId,
      type: "comment",
    });
    await notification.save();
  });

  socket.on("opened", async (data) => {
    await Notification.findByIdAndUpdate(data.id, {
      opened: true,
    });
  });

  socket.on("disconnect", () => {
    setTimeout(() => {
      const index = onlineUsers.findIndex((user1) => user1._id == user._id);

      if (index !== -1) {
        onlineUsers.splice(index, 1);
        io.sockets.emit("newOnlineUsers", onlineUsers);
      } else {
        console.log("-1");
      }
    }, 1500);
  });
};
