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
    user.save();
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

    if (req.user.cloudinary_id)
      await cloudinary.uploader.destroy(req.user.cloudinary_id);

    const result = await cloudinary.uploader.upload(req.file.path);
    req.user.profilePhoto = result.secure_url;
    req.user.cloudinary_id = result.public_id;

    await req.user.save();
    res.send(req.user);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};
