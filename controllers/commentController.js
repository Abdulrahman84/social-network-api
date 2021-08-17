const Comment = require("../models/Comment");

exports.updateComment = async (req, res) => {
  const commentId = req.body.id;
  if (!commentId)
    return res.status(404).send({ error: "no comment id provided" });

  const commentDoc = await Comment.findOne({
    _id: commentId,
    user: req.user._id,
  });
  if (!commentDoc) return res.status(401).send({ error: "unauthorized" });

  commentDoc.comment = req.body.comment;
  await commentDoc.save();

  res.send(commentDoc);
};

exports.deleteComment = async (req, res) => {
  const commentId = req.body.id;
  if (!commentId)
    return res.status(404).send({ error: "no comment id provided" });

  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: req.user._id,
  });

  if (!comment) return res.status(401).send({ error: "unauthorized" });

  res.send({ result: "deleted" });
};
