const Follow = require("../models/Follow");

const User = require("../models/User");

exports.follow = async (req, res) => {
  const userId = req.params.id;
  const visitorId = req.user._id;

  const userDoc = await User.findById(userId);
  if (!userDoc) return res.status(400).send({ error: "no user found" });

  if (userId == visitorId)
    return res.status(400).send({ error: "you can not follow yourself" });

  const alreadyFollow = req.user.following.includes(userId);
  if (alreadyFollow) {
    await Promise.all([
      User.findByIdAndUpdate(visitorId, { $pull: { following: userId } }),
      User.findByIdAndUpdate(userId, { $pull: { followers: visitorId } }),
      Follow.findOneAndDelete({ user: userId, follower: visitorId }),
    ]);
  }
  if (!alreadyFollow) {
    const follow = new Follow({
      user: userId,
      follower: visitorId,
    });
    await follow.save();

    await Promise.all([
      User.findByIdAndUpdate(visitorId, { $push: { following: userId } }),
      User.findByIdAndUpdate(userId, { $push: { followers: visitorId } }),
    ]);
  }

  const followsCounts = await User.aggregate([
    { $match: { _id: visitorId } },
    {
      $project: {
        following: { $size: "$following" },
        followers: { $size: "$followers" },
      },
    },
  ]);

  res.send(followsCounts);
};

exports.getMyFollowers = async (req, res) => {
  const followers = await req.user
    .populate("followers", "firstName lastName profilePhoto -_id")
    .execPopulate();

  res.send(followers);
};

exports.getMyFollowings = async (req, res) => {
  const followings = await req.user
    .populate("following", "firstName lastName profilePhoto -_id")
    .execPopulate();

  res.send(followings);
};

exports.getUsersFollowers = async (req, res) => {
  const followers = await User.findById(req.params.id, "followers").populate(
    "followers",
    "firstName lastName profilePhoto -_id"
  );

  res.send(followers);
};

exports.getUsersFollowings = async (req, res) => {
  const followings = await User.findById(req.params.id, "following").populate(
    "following",
    "firstName lastName profilePhoto -_id"
  );

  res.send(followings);
};
