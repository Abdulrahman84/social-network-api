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
  const posts = await Post.aggregate([
    {
      $match: {
        $or: [
          { author: { $in: req.user.following } },
          { author: req.user._id },
        ],
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: parseInt(req.query.skip) },
    { $limit: parseInt(req.query.limit) },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $lookup: {
        from: "reactions",
        localField: "_id",
        foreignField: "post",
        as: "reactionsCount",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "commentsCount",
      },
    },
    {
      $addFields: {
        numOfComments: { $size: "$commentsCount" },
        numOfReactions: { $size: "$reactionsCount" },
        myReaction: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.user", req.user._id] },
          },
        },
      },
    },
    {
      $project: {
        content: 1,
        image: 1,
        location: 1,
        createdAt: 1,
        updatedAt: 1,
        numOfReactions: 1,
        numOfComments: 1,
        myReaction: 1,
        "author._id": 1,
        "author.firstName": 1,
        "author.lastName": 1,
        "author.profilePhoto": 1,
        "author.work": 1,
        "author.gender": 1,
        "author.birthDate": 1,
      },
    },
  ]);
  res.send(posts);
};

exports.getSinglePost = async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id }).populate({
    path: "author",
    model: "User",
    select: "firstName lastName profilePhoto gender work birthDate",
  });
  await post
    .populate({
      path: "comments",
      model: "Comment",
      select: "user comment createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        model: "User",
        select: "firstName lastName profilePhoto gender work birthDate",
      },
    })
    .populate({
      path: "reactions",
      model: "Reaction",
      populate: {
        path: "user",
        model: "User",
        select: "firstName lastName profilePhoto gender work birthDate",
      },
    })
    .execPopulate();

  const likes = post.reactions.filter((doc) => doc.reaction === "like");
  const loves = post.reactions.filter((doc) => doc.reaction === "love");
  const hahas = post.reactions.filter((doc) => doc.reaction === "haha");
  const sads = post.reactions.filter((doc) => doc.reaction === "sad");
  const angrys = post.reactions.filter((doc) => doc.reaction === "angry");
  const wows = post.reactions.filter((doc) => doc.reaction === "wow");

  const myReaction = post.reactions.filter(
    (doc) => doc.user._id.toString() === req.user._id.toString()
  );

  res.send({
    post,
    comments: post.comments,
    reactions: post.reactions,
    myReaction: myReaction[0].reaction,
    numOfComments: post.comments.length,
    numOfLikes: likes.length,
    numOfLoves: loves.length,
    numOfHahas: hahas.length,
    numOfSads: sads.length,
    numOfWows: wows.length,
    numOfAngrys: angrys.length,
  });
};

exports.getAllPhotos = async (req, res) => {
  const posts = await Post.find({ author: req.user._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  if (!posts) return res.status(404).send();

  const images = posts
    .filter((post) => {
      return post.image != null;
    })
    .map((image) => image.image);

  res.send(images);
};

exports.getAllUserPhotos = async (req, res) => {
  const id = req.params.id;
  const posts = await Post.find({ author: id })
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  if (!posts) return res.status(404).send();

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
