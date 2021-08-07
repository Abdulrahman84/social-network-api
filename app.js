require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const followRouter = require("./routes/follow");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = app.listen(port);
const options = { cors: { origin: "*" } };
const io = require("socket.io")(server, options);

require("./routes/comment")(io);

app.use(userRouter);
app.use(postRouter);
app.use(followRouter);

app.get("/", (req, res) => res.send("Hi There"));

io.use((socket, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    jwt.verify(
      socket.handshake.query.token,
      process.env.JWT_SECRET,
      (err, decoded) => {
        if (err) return next(new Error("Authentication error"));
        socket.decoded = decoded;
        next();
      }
    );
  } else {
    next(new Error("Authentication error"));
  }
});

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err, res) => {
    console.log("connected " + port);
  }
);
