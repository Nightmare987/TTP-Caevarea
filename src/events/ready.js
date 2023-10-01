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
        `\x1b[1m\x1b[32mDatabase Connecting: ${progressBar(progress)}\x1b[0m`
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
        `\x1b[1m\x1b[32mDatabase Connecting: ${progressBar(progress)}\x1b[0m`
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

    // set activity and presence
    const activities = [
      "Made by xNightmid",
      "Snipey Snipey Bulldogs",
      "The Third Party",
      "These jits 🤦‍♂️",
      "Wiping with 2ply toilet paper 🧻",
      "Flying V Formation 🦅",
      "Taino time 😎",
      "Yoink!",
      "Its in the bag!!",
      "The Terrible Players",
      "Call me the pizza man...",
      "...because I always deliver",
      "Oi dickhead 🐷",
      "Yo lads I'll be back in 15mins...",
      "Don't tempt me with a good time!",
      "Hup 2 3 4. Keep on wiping!!",
      "Alright lads.....",
      "Where’s G? I’m on tower!",
      "💸 Tax The Poor 💸",
      "🏃🏻‍♂️💨 Dipoot! Dipoot! 🏃🏻‍♂️💨",
    ];
    /*
// random
setInterval(() => {
  const choice = activities[Math.floor(Math.random() * activities.length)];
  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: "irrelevant",
        state: `${choice}`,
      },
    ],
    status: "dnd",
  });
}, 6000); */

    //in order of list
    let currentIndex = 0; // Initialize the index to 0
    setInterval(() => {
      client.user.setPresence({
        activities: [
          {
            type: ActivityType.Custom,
            name: "irrelevant",
            state: `${activities[currentIndex]}`,
          },
        ],
        status: "dnd",
      });

      // Increment the currentIndex
      currentIndex++;

      // Reset the index if it goes beyond the array length
      if (currentIndex >= activities.length) {
        currentIndex = 0;
      }
    }, 6000);

    console.log(
      "\x1b[1m\x1b[33m--------------------------------------------------\n   <{=========}---Caevarea Ready---{=========}>\n--------------------------------------------------\n\x1b[0m"
    );
  },
};
