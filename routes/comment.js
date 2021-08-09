const Comment = require("../models/Comment");
const User = require("../models/User");

const onlineUsers = [];

module.exports = (io) => {
  io.on("connection", async (socket) => {
    console.log("new WS");

    const user = await User.findById(
      socket.decoded._id,
      "firstName lastName profilePhoto gender work birthDate"
    );

    onlineUsers.push({ socket: socket.id, _id: user._id });
    socket.emit("onlineUsers", onlineUsers);

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

      io.sockets.emit("comment", { user, comment });

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

        if (userNotif._id.toString() === authorId.toString()) return;

        io.to(userNotif.socket).emit("notification", { user, comment });
      }
    });

    socket.on("disconnect", () => {
      const i = onlineUsers.indexOf(socket);
      onlineUsers.splice(i, 1);
      console.log("disconnected");
      io.sockets.emit("newOnlineUsers", onlineUsers);
    });
  });
};
