const cluster = require("cluster");
const os = require("os");
const app = require("./app");
require("dotenv").config({ path: "./../development/.env" });

app.listen(3000, () => {
  console.log(`Worker ${process.pid} started on port 3000`);
});
