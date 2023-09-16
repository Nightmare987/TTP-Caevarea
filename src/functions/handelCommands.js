const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

const clientId = "1127094913746612304";
const guildId = "855072789987459123";

module.exports = (client) => {
  client.handleCommands = async (commandFolders, path) => {
    client.commandArray = [];
    for (folder of commandFolders) {
      if (folder === "Recruiter") {
        const ff = fs.readdirSync(`${path}/${folder}`);
        for (let f of ff) {
          const commandFiles = fs
            .readdirSync(`${path}/${folder}/${f}`)
            .filter((file) => file.endsWith(".js"));
          for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${f}/${file}`);
            client.commands.set(command.data.name, command);
            client.commandArray.push(command.data.toJSON());
          }
        }
      } else {
        const commandFiles = fs
          .readdirSync(`${path}/${folder}`)
          .filter((file) => file.endsWith(".js"));
        for (const file of commandFiles) {
          const command = require(`../commands/${folder}/${file}`);
          client.commands.set(command.data.name, command);
          client.commandArray.push(command.data.toJSON());
        }
      }
    }

    const rest = new REST({
      version: "9",
    }).setToken(process.env.token);

    (async () => {
      try {
        console.log(
          "\x1b[1m\x1b[34mStarted refreshing application (/) commands.\x1b[0m"
        );

        await rest.put(Routes.applicationCommands(clientId), {
          body: client.commandArray,
        });

        console.log(
          "\x1b[1m\x1b[34mSuccessfully reloaded application (/) commands.\x1b[0m"
        );
      } catch (error) {
        console.error(error);
      }
    })();
  };
};
