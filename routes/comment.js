const express = require("express");
const { body, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const { addComment } = require("../controllers/commentController");
const Comment = require("../models/Comment");

const router = express.Router();

// router.post(
//   "/addComment/:id",
//   [body("comment", "invalid comment").exists().isAlphanumeric()],
//   auth,
//   commentController.addComment
// );

// module.exports = router;

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("addComment", async (data) => {
      const comment = new Comment({
        comment: data.comment,
      });
      await comment.save();
      socket.emit("comment", data);
    });
  });
};

// make a function in another folder for saving the comment
