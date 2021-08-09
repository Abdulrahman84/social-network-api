const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    image: String,
    location: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cloudinary_id: String,
  },
  {
    timestamps: true,
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

postSchema.virtual("reactions", {
  ref: "Reaction",
  localField: "_id",
  foreignField: "post",
});

module.exports = mongoose.model("Post", postSchema);
