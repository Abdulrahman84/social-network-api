const path = require("path");
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
const server = require("http").createServer(app);
const options = { cors: { origin: "*" } };
const io = require("socket.io")(server, options);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(userRouter);
app.use(postRouter);
app.use(followRouter);
app.use(commentRouter);

app.get("/", (req, res) => res.send("Hi There"));

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err, res) => {
    server.listen(port);
    console.log("connected " + port);
  }
);

io.on("connection", (socket) => {
  console.log("new WS");
  socket.emit("test", { welcome: "hello from server", name: "abdulrahman" });
  socket.on("addComment", (data) => {
    socket.emit("addComment", data);
  });
});

// io.sockets.on("connection", function (socket) {
//   console.log("client connect");
//   socket.on("echo", function (data) {
//     io.sockets.emit("message", data);
//   });
// });

require("./routes/comment")(app, io);
