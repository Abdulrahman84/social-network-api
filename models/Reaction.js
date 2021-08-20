const mongoose = require("mongoose");

const reactSchema = new mongoose.Schema({
  reaction: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
});

const Reaction = mongoose.model("Reaction", reactSchema);

module.exports = Reaction;
