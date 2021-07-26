const express = require("express");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const postController = require("../controllers/postController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post(
  "/addPost",
  [
    body("content", "invalid content").isString().optional({ nullable: true }),
    body("location", "invalid location")
      .isString()
      .optional({ nullable: true }),
  ],
  auth,
  upload.single("image"),
  postController.addPost
);

router.put(
  "/updatePost/:id",
  [
    body("content", "invalid content").isString().optional({ nullable: true }),
    body("location", "invalid location")
      .isString()
      .optional({ nullable: true }),
  ],
  auth,
  postController.updatePost
);

router.put(
  "/updatePostImage/:id",
  auth,
  upload.single("image"),
  postController.updatePostImage
);

router.get("/allPosts", postController.getAllPosts);

router.get("/myPosts", auth, postController.getMyPosts);

router.get("/followingPosts", auth, postController.getFollowingPosts);

router.get("/singlePost/:id", postController.getSinglePost);

router.delete("/deletePost/:id", auth, postController.deletePost);

module.exports = router;
