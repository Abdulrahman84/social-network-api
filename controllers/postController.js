const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

const Post = require("../models/Post");

exports.addPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  let cloudinary_id;
  let image;
  try {
    const { content } = req.body;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "social-network",
        use_filename: true,
      });
      image = result.secure_url;
      cloudinary_id = result.public_id;
    }

    const post = new Post({
      content,
      image,
      cloudinary_id,
      location: req.body.location,
      author: req.user._id,
    });

    await post.save();
    await post.populate("author", "firstName lastName -_id").execPopulate();

    res.send(post);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "firstName lastName -_id")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  res.send(posts);
};

exports.getMyPosts = async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  res.send(posts);
};

exports.deletePost = async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });
  if (!post) return res.status(404).send({ error: "no post found" });
  res.send({ result: "post deleted" });
};
