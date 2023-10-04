const express = require("express");
const app = express();
const cors = require("cors");
require("module-alias/register");
const routes = require("./src/routes");

app.use(cors());
app.use(routes);

// Start server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
