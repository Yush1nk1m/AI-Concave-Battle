const express = require("express");
const { sendChat, useTurn } = require("../controllers/game");

const router = express.Router();

router.post("/chat", sendChat);

router.post("/turn", useTurn);

module.exports = router;