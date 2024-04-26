const express = require("express");

const { renderMain } = require("../controllers/page");

const router = express.Router();

// GET / route
router.get("/", renderMain);

module.exports = router;