require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const followRouter = require("./routes/follow");
// const commentRouter = require("./routes/comment");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(postRouter);
app.use(followRouter);
// app.use(commentRouter);

app.get("/", (req, res) => res.send("Hi there"));

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    app.listen(port);
    console.log("connected " + port);
  }
);
