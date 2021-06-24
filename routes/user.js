const express = require("express");
const { body, check } = require("express-validator");

const User = require("../models/User");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { upload, cloudinary } = require("../middleware/upload");

const router = express.Router();

router.post(
  "/register",
  [
    body("firstName", "invalid first name").exists().isAlphanumeric(),
    body("lastName", "invalid last name ").exists().isAlphanumeric(),
    check("email", "inalid email")
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user)
          return Promise.reject(
            "Email exists already, please pick a different one."
          );
      }),
    body("password", "password should be between 5 and 30 characters long")
      .exists()
      .isLength({ min: 5, max: 30 })
      .trim(),
  ],
  userController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("invalid email").normalizeEmail(),
    body("password", "invalid password").isLength({ min: 5, max: 30 }).trim(),
  ],
  userController.login
);

router.post(
  "/profilePhoto",
  auth,
  upload.single("profilePhoto"),
  userController.setProfilePhoto,
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

module.exports = router;
