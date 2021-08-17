const express = require("express");

const commentController = require("../controllers/commentController");
const auth = require("../middleware/auth");

const router = express.Router();

router.put("/updateComment", auth, commentController.updateComment);

router.delete("/deleteComment", auth, commentController.deleteComment);

module.exports = router;
