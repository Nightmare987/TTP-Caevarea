const {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
  MessageManager,
  Embed,
  Collection,
  Events,
  AuditLogEvent,
  Partials,
  ChannelType,
  TextInputStyle,
  ButtonStyle,
  time,
} = require(`discord.js`);
const fs = require("fs");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
const recruitSchema = require("./Schemas.js/recruits");

client.commands = new Collection();

require("dotenv").config();

const functions = fs
  .readdirSync("./src/functions")
  .filter((file) => file.endsWith(".js"));
const eventFiles = fs
  .readdirSync("./src/events")
  .filter((file) => file.endsWith(".js"));
const commandFolders = fs.readdirSync("./src/commands");

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./src/events");
  client.handleCommands(commandFolders, "./src/commands");
  client.login(process.env.token);
})();

client.on("guildCreate", async (guild) => {
  const role = await guild.roles.create({
    name: "Better Caevarea",
    color: "#4169E1",
  });
  
  await guild.roles.create({
    name: "-------------T-Sessions-------------",
    color: "#C0C0C0",
    mentionable: false,
  });

  await guild.roles.create({
    name: "1 T-Session",
    color: "#C0C0C0",
    mentionable: false,
  });

  await guild.roles.create({
    name: "2 T-Sessions",
    color: "#C0C0C0",
    mentionable: false,
  });

  await guild.roles.create({
    name: "3 T-Sessions",
    color: "#C0C0C0",
    mentionable: false,
  });

  guild.members.addRole({ user: "1127094913746612304", role: role });
});
