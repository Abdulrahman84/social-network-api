const Comment = require("../models/Comment");
const User = require("../models/User");

const onlineUsers = [];

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("new WS");
    onlineUsers.push(socket.id);
    socket.emit("onlineUsers", onlineUsers);

    socket.on("addComment", async (data) => {
      const comment = new Comment({
        user: socket.decoded._id,
        comment: data.comment,
        post: data.postId,
      });
      await comment.save();

      const user = await User.findById(
        socket.decoded._id,
        "firstName lastName profilePhoto"
      );

      io.sockets.emit("comment", { user, comment });
      socket.broadcast
        .to(onlineUsers[1])
        .emit("got", "you got a new comment on your post");
    });

    socket.on("disconnect", () => {
      const i = onlineUsers.indexOf(socket);
      onlineUsers.splice(i, 1);
      console.log("disconnected");
      io.sockets.emit("newOnlineUsers", onlineUsers);
    });
  });
};
