const Agenda = require("agenda");
const User = require("../src/models/User");
require("dotenv").config({ path: "../development/.env" });
const mongoConnectionString = process.env.MONGODB_URI;

const agenda = new Agenda({
  db: { address: mongoConnectionString, collection: "jobs" },
});

// Define the job for deleting unconfirmed users
agenda.define("delete unconfirmed user", async (job) => {
  const { email, confirmationToken } = job.attrs.data;

  console.log(`Executing job for email: ${email}`); // Add debug log

  const user = await User.findOne({
    email,
    confirmationToken,
    isConfirmed: false,
  });

  if (user) {
    console.log(`Deleting unconfirmed account for email: ${email}`);
    await User.deleteOne({ email });
  } else {
    console.log(`No unconfirmed user found for email: ${email}`);
  }
});

agenda.on("start", (job) => {
  console.log(`Job ${job.attrs.name} started`);
});

agenda.on("complete", (job) => {
  console.log(`Job ${job.attrs.name} completed`);
});

module.exports = agenda;
