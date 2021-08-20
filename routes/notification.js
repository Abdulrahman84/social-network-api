const express = require("express");

const notificationController = require("../controllers/notificationController");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/myNotifications", auth, notificationController.myNotification);

module.exports = router;
