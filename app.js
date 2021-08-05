const path = require("path");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const followRouter = require("./routes/follow");
// const commentRouter = require("./controllers/commentController");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   if (req.method === "OPTIONS") {
//     res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE");
//     res.status(200).json({});
//   }
//   next();
// });

const server = app.listen(port);
const options = { cors: { origin: "*" } };
const io = require("socket.io")(server, options);
require("./routes/comment")(io);

app.use(userRouter);
app.use(postRouter);
app.use(followRouter);
// app.use(commentRouter);

app.get("/", (req, res) => res.send("Hi There"));

io.on("connection", (socket) => {
  console.log("new WS");
  socket.emit("test", { welcome: "hello from server", name: "abdulrahman" });
});

mongoose.connect(
  process.env.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  (err, res) => {
    console.log("connected " + port);
  }
);
