const express = require("express");
const { body, validationResult } = require("express-validator");

const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

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
