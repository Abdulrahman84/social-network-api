const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const postController = require("../controllers/postController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/addPost",
  [
    body("content", "invalid content")
      .isAlphanumeric()
      .optional({ nullable: true }),
    body("location", "invalid location")
      .isString()
      .optional({ nullable: true }),
  ],
  auth,
  upload.single("image"),
  postController.addPost
);

router.get("/allPosts", postController.getAllPosts);

router.get("/myPosts", auth, postController.getMyPosts);

router.get("/singlePost/:id", postController.getSinglePost);

router.delete("/deletePost/:id", auth, postController.deletePost);

module.exports = router;
