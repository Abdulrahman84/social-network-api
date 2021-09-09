const express = require("express");
const { body, check } = require("express-validator");

const User = require("../models/User");
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

const firstNameMessage = {
  english: "invalid first name",
  arabic: "الاسم الأول غير صالح",
  turkish: "Geçersiz ilk ad",
  french: "Prénom invalide",
  german: "Ungültiger vorname",
};
const lastNameMessage = {
  english: "Invalid last name",
  arabic: "الاسم الأخير غير صالح",
  turkish: "Geçersiz soyadı",
  french: "Nom de famille invalide",
  german: "Ungültiger nachname",
};
const emailMessageExist = {
  english: "Email exists already, please pick a different one.",
  arabic: "البريد الإلكتروني موجود بالفعل ، يرجى اختيار بريد آخر.",
  turkish: "E-posta zaten var, lütfen farklı bir tane seçin.",
  french: "L'e-mail existe déjà, veuillez en choisir un autre.",
  german: "E-Mail existiert bereits, bitte wählen Sie eine andere aus.",
};
const emailMessage = {
  english: "Invalid email",
  arabic: "خطأ في البريد الإلكتروني",
  turkish: "Geçersiz e-posta",
  french: "Email invalide",
  german: "Ungültige E-Mail",
};
const passwordMessage = {
  english: "Password should be between 5 and 30 characters long",
  arabic: "يجب أن يتراوح طول كلمة المرور بين ٥ و ۳۰ حرف",
  turkish: "şifre 5 ila 30 karakter uzunluğunda olmalıdır",
  french: "Le mot de passe doit contenir entre 5 et 30 caractères",
  german: "Passwort sollte zwischen 5 und 30 Zeichen lang sein",
};
const birthDateMessage = {
  english: "Invalid birth date",
  arabic: "خطأ في تاريخ الميلاد",
  turkish: "Geçersiz doğum tarihi",
  french: "Date de naissance invalide",
  german: "Ungültiges geburtsdatum",
};
const genderMessage = {
  english: "invalid gender",
  arabic: "خطأ في الجنس",
  turkish: "Geçersiz cinsiyet",
  french: "Genre incompatible",
  german: "Ungültiges Geschlecht",
};

router.post(
  "/register",
  [
    body("firstName", firstNameMessage).exists().isAlphanumeric(),
    body("lastName", lastNameMessage).exists().isAlphanumeric(),
    check("email", emailMessage)
      .normalizeEmail()
      .isEmail()
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) return Promise.reject(emailMessageExist);
      }),
    body("password", passwordMessage)
      .exists()
      .isLength({ min: 5, max: 30 })
      .trim(),
    body("birthDate", birthDateMessage).exists().isDate(),
    body("gender", genderMessage).exists().isString(),
  ],
  userController.register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage({ emailMessage }).normalizeEmail(),
    body("password", passwordMessage).isLength({ min: 5, max: 30 }).trim(),
  ],
  userController.login
);

router.post(
  "/profilePhoto",
  auth,
  upload.single("profilePhoto"),
  userController.setProfilePhoto
);

router.post(
  "/coverImage",
  auth,
  upload.single("coverImage"),
  userController.setCoverImage
);

router.post(
  "/personalInfo",
  [
    body("location", "invalid location")
      .isString()
      .optional({ nullable: true }),
    body("religion", "invalid religion")
      .isString()
      .optional({ nullable: true }),
    body("study", "invalid study").isString().optional({ nullable: true }),
    body("work", "invalid work").isString().optional({ nullable: true }),
    body("bio", "invalid bio").isString().optional({ nullable: true }),
    body("gender", "invalid gender").isString().optional({ nullable: true }),
    body("birthDate", "invalid birthYear")
      .isNumeric()
      .optional({ nullable: true }),
    body("socialCondition", "invalid social condition")
      .isString()
      .optional({ nullable: true }),
  ],
  auth,
  userController.addPersonalInfo
);

router.post("/darkMode", auth, userController.changMode);

router.post("/logout", auth, userController.logout);

router.get("/myProfile", auth, userController.getMyProfile);

router.get("/profile/:id", auth, userController.getProfile);

router.get("/suggestedUsers", auth, userController.suggestUsers);

router.get("/searchUsers", auth, userController.searchUsers);

router.put(
  "/profile",
  [
    body("location", "invalid location")
      .isString()
      .optional({ nullable: true }),
    body("religion", "invalid religion")
      .isString()
      .optional({ nullable: true }),
    body("study", "invalid study").isString().optional({ nullable: true }),
    body("work", "invalid work").isString().optional({ nullable: true }),
    body("bio", "invalid bio").isString().optional({ nullable: true }),
    body("gender", "invalid gender").isString().optional({ nullable: true }),
    body("socialCondition", "invalid social condition")
      .isString()
      .optional({ nullable: true }),
  ],
  auth,
  userController.updatePersonalInfo
);

router.put(
  "/changePassword",
  [
    body("newPassword", "password should be between 5 and 30 characters long")
      .exists()
      .isLength({ min: 5, max: 30 })
      .trim(),
  ],
  auth,
  userController.changePassword
);

router.delete("/mainProfilePhoto", auth, userController.deleteMainProfilePhoto);

router.delete("/coverImage", auth, userController.deleteCoverImage);

router.delete(
  "/oldProfilePhoto/:id",
  auth,
  userController.deleteOldProfilePhoto
);

router.delete("/personalInfo", auth, userController.deletePersonalInfo);

module.exports = router;
