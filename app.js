// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const socketio = require("socket.io");
// const http = require("http");

// const userRouter = require("./routes/user");
// const postRouter = require("./routes/post");
// const followRouter = require("./routes/follow");
// const commentRouter = require("./routes/comment");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(userRouter);
// app.use(postRouter);
// app.use(followRouter);
// app.use(commentRouter);

// app.get("/", (req, res) => res.send("Hi There"));

// const server = http.createServer(app);

// server.listen(port);
// mongoose.connect(
//   process.env.MONGODB_URI,
//   { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
//   (err, res) => {
//     // app.set("socketIo", io);
//     console.log("connected " + port);
//   }
// );

const app = require("express")();
const httpServer = require("http").createServer(app);
const options = { cors: { origin: "*" } };
const io = require("socket.io")(httpServer, options);

io.on("connection", (socket) => {
  console.log("new WS");
  socket.emit("test", { welcome: "hello from server", name: "abdulrahman" });
});
httpServer.listen(3000);
