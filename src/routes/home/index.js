const express = require("express");
const router = express.Router();
const HomeController = require("@controllers/HomeController");

router.get("/all", HomeController.getAll);

module.exports = router;
