const Comment = require("../models/Comment");
const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
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

      console.log(comment.user);
      socket.emit("comment", { user, comment });
    });
  });
};
