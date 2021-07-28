const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Post = require("../models/Post");

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

exports.getMyProfile = async (req, res) => {
  const user = req.user;
  const posts = await Post.find({ author: user._id });
  res.send({ user, posts });
};

exports.getProfile = async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id, "-password");
  const posts = await Post.find({ author: id });
  if (!user) return res.status(404).send({ error: "no user found" });
  res.send({ user, posts });
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
  const users = await User.find({}, "-password")
    .sort({ createdAt: -1 })
    .limit(parseInt(req.query.limit))
    .skip(parseInt(req.query.skip));
  res.send(users);
  // }
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
