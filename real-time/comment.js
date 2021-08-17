const Comment = require("../models/Comment");
const User = require("../models/User");

const onlineUsers = [];

module.exports = async (io, socket) => {
  console.log("new WS");
  socket.join(socket.decoded._id);

  onlineUsers.push({ socketId: socket.id, _id: socket.decoded._id });

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

    io.sockets.emit("comment", { user, comment, author });

    // const authorId = author.post.author;
    // const isUserOnline = onlineUsers.find(
    //   (user) => user._id.toString() === authorId.toString()
    // );

    // const id = isUserOnline.socketId;

    // socket.on("notification", (room) => {
    //   io.in(room).emit("notification", {
    //     comment,
    //     user,
    //     msg: "only for you",
    //   });
    //   if (!isUserOnline) {
    //     console.log("user is offline");
    //   } else {
    //     if (isUserOnline._id.toString() !== user._id.toString()) {
    //     } else {
    //       console.log("yourself");
    //     }
    //   }
    // });
  });
  socket.on("disconnect", () => {
    const index = onlineUsers.findIndex((user1) => user1._id === user._id);
    if (index !== -1) {
      onlineUsers.splice(index, 1);
    }
    // console.log("disconnected");
    // io.sockets.emit("newOnlineUsers", onlineUsers);
  });
};
