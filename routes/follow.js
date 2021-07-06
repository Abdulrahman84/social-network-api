const express = require("express");

const auth = require("../middleware/auth");
const followController = require("../controllers/followController");

const router = express.Router();

router.post("/follow/:id", auth, followController.follow);

router.get("/myFollowers", auth, followController.getMyFollowers);

router.get("/myFollowings", auth, followController.getMyFollowings);

router.get("/userFollowers/:id", auth, followController.getUsersFollowers);

router.get("/userFollowings/:id", auth, followController.getUsersFollowings);

module.exports = router;
