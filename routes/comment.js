const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const commentController = require("../controllers/commentController");

const router = express.Router();

router.post(
  "/addComment/:id",
  [body("comment", "invalid comment").exists().isAlphanumeric()],
  auth,
  commentController.addComment
);

module.exports = router;
