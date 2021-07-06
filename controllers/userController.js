const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).send({ error: errors.array()[0].msg });
  try {
    const user = new User(req.body);
    const token = user.generateAuthToken();
    await user.save();
    res.send({ token });
  } catch (e) {
    res.status(400).send({ error: e.message });
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
    res.status(400).send({ error: e.message });
  }
};

exports.setProfilePhoto = async (req, res) => {
  try {
    if (!req.file)
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
      use_filename: true,
    });
    req.user.profilePhoto = result.secure_url;
    req.user.cl_profilePhoto_id = result.public_id;

    await req.user.save();
    res.send(req.user.deleteExtraInfo());
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

exports.setCoverImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).send({ error: "please upload a photo" });

    if (req.user.cl_coverImage_id)
      await cloudinary.uploader.destroy(req.user.cl_coverImage_id);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "social-network",
      use_filename: true,
    });

    req.user.coverImage = result.secure_url;
    req.user.cl_coverImage_id = result.public_id;

    await req.user.save();
    res.send(req.user.deleteExtraInfo());
  } catch (e) {
    console.log(e);
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
      { new: true }
    );
    res.send(user);
  } catch (e) {
    res.status(500).send({ error: e });
    console.log(e);
  }
};

exports.getMyProfile = async (req, res) => {
  const user = req.user;
  res.send({
    user: user.deleteExtraInfo(),
    numberOfFollowers: user.followers.length,
    numberOfFollowing: user.following.length,
  });
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send({ error: "no user found" });
  res.send({
    user: user.deleteExtraInfo(),
    numberOfFollowers: user.followers.length,
    numberOfFollowing: user.following.length,
  });
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
    { new: true }
  );

  res.send(user.deleteExtraInfo());
};
