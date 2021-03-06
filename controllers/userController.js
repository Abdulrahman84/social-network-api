const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Post = require("../models/Post");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).send(errors.array()[0].msg);
  try {
    const user = new User(req.body);
    const token = user.generateAuthToken();
    await user.save();
    res.send({ token });
  } catch (e) {
    const error = JSON.parse(e.message);
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = user.generateAuthToken();
    res.send({ token });
  } catch (e) {
    const error = JSON.parse(e.message);
    res.status(400).send(error);
  }
};

exports.setProfilePhoto = async (req, res) => {
  try {
    if (!req.file || req.validationError)
      return res.status(400).send({ error: "please upload a photo" });

    if (req.user.cl_profilePhoto_id) {
      const oldPhoto = {
        cl_profilePhoto_id: req.user.cl_profilePhoto_id,
        profilePhoto: req.user.profilePhoto,
      };
      req.user.previousProfilePhotos.push(oldPhoto);
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "social-network",
    });
    req.user.profilePhoto = result.secure_url;
    req.user.cl_profilePhoto_id = result.public_id;

    await req.user.save();
    res.send(req.user.deleteExtraInfo());
  } catch (e) {
    res.send(e);
  }
};

exports.setCoverImage = async (req, res) => {
  try {
    if (!req.file || req.validationError)
      return res.status(400).send({ error: "please upload a photo" });

    if (req.user.cl_coverImage_id)
      await cloudinary.uploader.destroy(req.user.cl_coverImage_id);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "social-network",
    });

    req.user.coverImage = result.secure_url;
    req.user.cl_coverImage_id = result.public_id;

    await req.user.save();
    res.send(req.user.deleteExtraInfo());
  } catch (e) {
    res.send(e);
  }
};

exports.addPersonalInfo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  const { location, socialCondition, work, study, bio, religion } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        location,
        socialCondition,
        work,
        study,
        bio,
        religion,
      },
      { omitUndefined: true, new: true }
    );
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e });
    console.log(e);
  }
};

exports.changMode = async (req, res) => {
  const user = req.user;
  user.darkMode = user.darkMode ? false : true;

  await user.save();

  res.send({ result: `dark mode ${user.darkMode}` });
};

exports.logout = (req, res) => {
  req.user = "";
  res.send({ result: "Logged out" });
};

exports.getMyProfile = async (req, res) => {
  const user = req.user;
  const posts = await Post.aggregate([
    {
      $match: {
        author: user._id,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "commentsCount",
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
        sadReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "sad"] },
          },
        },
        hahaReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "haha"] },
          },
        },
        loveReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "love"] },
          },
        },
        likeReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "like"] },
          },
        },
        angryReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "angry"] },
          },
        },
        wowReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "wow"] },
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
        like: {
          $size: "$likeReactions",
        },
        love: {
          $size: "$loveReactions",
        },
        wow: {
          $size: "$wowReactions",
        },
        sad: {
          $size: "$sadReactions",
        },
        haha: {
          $size: "$hahaReactions",
        },
        angry: {
          $size: "$angryReactions",
        },
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
  res.send({ user, posts });
};

exports.getProfile = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  if (!user) return res.status(404).send({ error: "no user found" });

  const posts = await Post.aggregate([
    {
      $match: {
        author: user._id,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "post",
        as: "commentsCount",
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
        sadReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "sad"] },
          },
        },
        hahaReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "haha"] },
          },
        },
        loveReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "love"] },
          },
        },
        likeReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "like"] },
          },
        },
        angryReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "angry"] },
          },
        },
        wowReactions: {
          $filter: {
            input: "$reactionsCount",
            as: "reaction",
            cond: { $eq: ["$$reaction.reaction", "wow"] },
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
        like: {
          $size: "$likeReactions",
        },
        love: {
          $size: "$loveReactions",
        },
        wow: {
          $size: "$wowReactions",
        },
        sad: {
          $size: "$sadReactions",
        },
        haha: {
          $size: "$hahaReactions",
        },
        angry: {
          $size: "$angryReactions",
        },
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

  const follow = user.followers.includes(req.user._id) ? true : false;

  res.send({ user, posts, darkMode: req.user.darkMode, follow });
};

exports.suggestUsers = async (req, res) => {
  // const location = req.user.location;
  // if (location) {
  //   const users = await User.find({ location }, "-password");
  //   console.log(users);
  //   res.send(
  //     users.filter((user) => user._id.toString() !== req.user._id.toString())
  //   );
  // } else {
  console.log(req.user.following);
  const users = await User.find(
    { _id: { $nin: req.user.following, $ne: req.user._id } },
    "-password"
  )
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  console.log(users.length);
  res.send(users);
  // }
};

exports.searchUsers = async (req, res) => {
  const users = await User.find({
    $text: { $search: req.query.userName },
  }).sort({
    createdAt: -1,
  });

  if (!users.length) return res.send({ msg: "No user matched your searach" });

  res.send(users);
};

exports.updatePersonalInfo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  const {
    firstName,
    lastName,
    location,
    socialCondition,
    work,
    study,
    bio,
    religion,
    gender,
    birthDate,
  } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName,
      lastName,
      location,
      socialCondition,
      work,
      study,
      bio,
      religion,
      gender,
      birthDate,
    },
    { omitUndefined: true, new: true }
  );

  res.send(user.deleteExtraInfo());
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });

  const user = req.user;
  const password = req.body.password;

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.send({
      erorr: "the password you entered does not match old password",
    });
  user.password = req.body.newPassword;
  await user.save();
  res.send({ result: "password updated" });
};

exports.deleteMainProfilePhoto = async (req, res) => {
  if (!req.user.profilePhoto)
    return res.send({ message: "No profile photo to delete" });

  await cloudinary.uploader.destroy(req.user.cl_profilePhoto_id);
  req.user.profilePhoto = null;
  req.user.cl_profilePhoto_id = null;

  await req.user.save();
  res.send(req.user);
};

exports.deleteCoverImage = async (req, res) => {
  if (!req.user.coverImage)
    return res.send({ message: "No cover image to delete" });
  if (req.user.cl_coverImage_id)
    await cloudinary.uploader.destroy(req.user.cl_coverImage_id);
  req.user.coverImage = null;
  req.user.cl_coverImage_id = null;

  await req.user.save();
  res.send(req.user);
};

exports.deleteOldProfilePhoto = async (req, res) => {
  const photoToDelete = req.user.previousProfilePhotos.find(
    (photo) => photo._id.toString() === req.params.id.toString()
  );
  await cloudinary.uploader.destroy(photoToDelete.cl_profilePhoto_id);

  req.user.previousProfilePhotos = req.user.previousProfilePhotos.filter(
    (photo) => {
      return photo._id.toString() !== req.params.id.toString();
    }
  );

  await req.user.save();
  res.send(req.user);
};

exports.deletePersonalInfo = async (req, res) => {
  const {
    location,
    socialCondition,
    work,
    study,
    bio,
    religion,
    gender,
    birthDate,
  } = req.body;

  if (location == "") req.user.location = null;
  if (socialCondition == "") req.user.socialCondition = null;
  if (work == "") req.user.work = null;
  if (study == "") req.user.study = null;
  if (bio == "") req.user.bio = null;
  if (religion == "") req.user.religion = null;
  if (gender == "") req.user.gender = null;
  if (birthDate == "") req.user.birthDate = null;

  await req.user.save();

  res.send({ result: "Deleted" });
};
