const Comment = require("../models/Comment");
const { validationResult } = require("express-validator");

exports.addComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  const io = req.app.get("socketIo");

  io.on("connection", (socket) => {
    console.log(socket.id);

    socket.on("test", (comment) => {
      console.log(comment);
      res.send(comment);
    });
    // const comment = new Comment({
    //   user: req.user._id,
    //   comment: req.body.comment,
    //   post: req.params.id,
    // });
    // await comment.save();
  });
};
