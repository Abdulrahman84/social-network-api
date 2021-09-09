const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePhoto: String,
  cl_profilePhoto_id: String,
  coverImage: String,
  cl_coverImage_id: String,
  previousProfilePhotos: [
    {
      cl_profilePhoto_id: String,
      profilePhoto: String,
    },
  ],
  location: String,
  socialCondition: String,
  study: String,
  work: String,
  religion: String,
  bio: String,
  birthDate: {
    type: Date,
    min: "1950-01-01",
    max: Date.now() - 10,
  },
  gender: String,
  darkMode: {
    type: Boolean,
    defulat: false,
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Follow",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "Follow",
    },
  ],
});

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  return token;
};

const emailMessage = {
  english: "No account found with this email",
  arabic: "لم يتم العثور على حساب مع هذا البريد الإلكتروني",
  turkish: "Bu e-posta ile hesap bulunamadı",
  french: "Aucun compte trouvé avec cet email",
  german: "Kein Konto mit dieser E-Mail gefunden",
};
const passwordMessage = {
  english: "Invalid password",
  arabic: "خطأ في كلمة المرور",
  turkish: "Geçersiz şifre",
  french: "Mot de passe incorrect",
  german: "Ungültiges Passwort",
};
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error(JSON.stringify(emailMessage));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error(JSON.stringify(passwordMessage));
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.deleteExtraInfo = function () {
  const user = this.toObject();

  delete user.password;
  delete user.cl_profilePhoto_id;
  delete user.cl_coverImage_id;

  return user;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
