const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("Ready!");

    if (!mongodbURL) return;

    await mongoose.connect(mongodbURL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (mongoose.connect) {
      console.log("The database is running");
    }
  },
};
