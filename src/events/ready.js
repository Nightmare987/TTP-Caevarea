const mongoose = require("mongoose");
const mongodbURL = process.env.MONGODBURL;
const { ActivityType } = require("discord.js");

function progressBar(progress) {
  const width = 20;
  const percentage = Math.floor((progress / 100) * width);
  const progressBar = `${"=".repeat(percentage)}${" ".repeat(
    width - percentage
  )}`;
  if (progress !== 100) {
    return `[${progressBar}] ${progress}%  |`;
  } else {
    return `[${progressBar}] ${progress}% |`;
  }
}

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    if (!mongodbURL) return;

    let progress = 10;
    const progressUpdateInterval = 10; // Increase to set more frequent updates
    const maxProgress50 = 50;
    const maxProgress100 = 100;

    console.log(
      `\x1b[1m\x1b[32m--------------------------------------------------\x1b[0m`
    );

    while (progress <= maxProgress50) {
      console.log(
        `\x1b[1;2m\x1b[32mDatabase Connecting: ${progressBar(progress)}\x1b[0m`
      );
      await new Promise((resolve) => setTimeout(resolve, 75));
      progress += progressUpdateInterval;
    }

    await mongoose.connect(mongodbURL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    while (progress <= maxProgress100) {
      console.log(
        `\x1b[1;2m\x1b[32mDatabase Connecting: ${progressBar(progress)}\x1b[0m`
      );
      await new Promise((resolve) => setTimeout(resolve, 75));
      progress += progressUpdateInterval;
    }
    console.log(
      `\x1b[1m\x1b[32m--------------------------------------------------\x1b[0m`
    );

    if (mongoose.connect) {
      console.log(
        "\x1b[1m\x1b[32mDatabase Connection Complete ✅\n--------------------------------------------------\x1b[0m\n"
      );
    }

    console.log(
      "\x1b[1m\x1b[33m--------------------------------------------------\n   <{=========}---Caevarea Ready---{=========}>\n--------------------------------------------------\n\x1b[0m"
    );
  },
};
