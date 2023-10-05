const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const cors = require("cors");
const auth = require("./authentication");
const questions = require("./questions");
const home = require("./home");
const GlobalMiddleware = require("../middleware/GlobalMiddleware");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Auth route
app.use("/api/auth", auth);
// Home route
app.use("/api/home", home);

// Middleware global, why "/auth" not use this middleware because it not requires middleware
app.use(GlobalMiddleware.check);

// Questions route
app.use("/api/questions", questions);

module.exports = app;
