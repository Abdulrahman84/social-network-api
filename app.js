require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const followRouter = require("./routes/follow");
const commentRouter = require("./routes/comment");
const notificationRouter = require("./routes/notification");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`connected on port: ${port}`);

    const server = app.listen(port);
    const options = { cors: { origin: "*" } };
    const io = require("socket.io")(server, options);

    app.use(userRouter);
    app.use(followRouter);
    app.use(commentRouter);
    app.use(notificationRouter);
    app.use(postRouter);

    app.get("/", (req, res) => res.send("Hi There"));

    app.use("*", (req, res) => {
      res.status(404).send({ error: "page not found" });
    });

    io.use((socket, next) => {
      if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(
          socket.handshake.query.token,
          process.env.JWT_SECRET,
          (err, decoded) => {
            if (err) return new Error("Authentication error");
            socket.decoded = decoded;
            next();
          }
        );
      } else {
        return new Error("Authentication error");
      }
    });

    io.on("connection", (socket) => {
      require("./real-time/comment")(io, socket);
      require("./real-time/reaction")(io, socket);
      require("./real-time/follow")(io, socket);
    });
  });

