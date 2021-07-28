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
    await post
      .populate("author", "firstName lastName profilePhoto gender")
      .execPopulate();

    res.send(post);
  } catch (e) {
    res.send(e.message);
  }
};

exports.updatePost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  const { content, location } = req.body;
  const post = await Post.findOneAndUpdate(
    {
      _id: req.params.id,
      author: req.user._id,
    },
    {
      content,
      location,
    },
    { omitUndefined: true, new: true }
  );
  if (!post) return res.send({ error: "not allowed" });
  res.send(post);
};

exports.updatePostImage = async (req, res) => {
  try {
    if (!req.file || req.validationError)
      return res.status(400).send({ error: "please upload a photo" });

    const post = await Post.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post) return res.status(401).send({ error: "Not allowed" });

    if (post.cloudinary_id)
      await cloudinary.uploader.destroy(post.cloudinary_id);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "social-network",
    });
    post.image = result.secure_url;
    post.cloudinary_id = result.public_id;

    await post.save();
    res.send(post);
  } catch (e) {
    console.log(e);
  }
};

exports.getAllPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "firstName lastName profilePhoto gender")
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

exports.getFollowingPosts = async (req, res) => {
  const posts = await Post.find({ author: { $in: req.user.following } })
    .sort({
      createdAt: -1,
    })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip))
    .populate(
      "author",
      "firstName lastName profilePhoto gender work birthDate"
    );
  res.send(posts);
};

exports.getSinglePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id });
  await post
    .populate({
      path: "comments",
      model: "Comment",
      select: "user comment createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        model: "User",
        select: "firstName lastName profilePhoto gender",
      },
    })
    .execPopulate();

  res.send({ post, comments: post.comments });
};

exports.getAllPhotos = async (req, res) => {
  const posts = await Post.find({ author: req.user._id });

  const images = posts
    .filter((post) => {
      return post.image != null;
    })
    .map((image) => image.image);

  res.send(images);
};

exports.deletePost = async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    author: req.user._id,
  });
  if (!post) return res.status(404).send({ error: "no post found" });
  res.send({ result: "post deleted" });
};
