const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    if (!mongodbURL) return;

    await mongoose.connect(mongodbURL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (mongoose.connect) {
      console.log("\x1b[1m\x1b[34mThe database is running\x1b[0m");
    }

    console.log(
      "\x1b[1m\x1b[33m<{=========}---Caevarea Ready---{=========}>\x1b[0m"
    );
  },
};
