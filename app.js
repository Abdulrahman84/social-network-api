require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const followRouter = require("./routes/follow");
const commentRouter = require("./routes/comment");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(userRouter);
app.use(postRouter);
app.use(followRouter);
app.use(commentRouter);

app.get("/", (req, res) => res.send("Hi There"));

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err, res) => {
    const server = app.listen(port);
    const io = require("socket.io")(server, {
      cors: {
        origin: ["http://localhost:4200", "http://localhost:4200/one"],
      },
    });
    app.set("socketIo", io);
    console.log("connected " + port);
    console.log(err);
  }
);
