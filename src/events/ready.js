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

    const activities = [
      "Wiping with 2ply toilet paper",
      "Its in the bag!!",
      "The Terrible Players",
      "Hup 2 3 4. Keep on wiping!!",
    ];
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
    }, 10000);
  },
};
