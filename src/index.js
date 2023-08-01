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
const Discord = require("discord.js");
const fs = require("fs");
const client = new Client({
  allowedMentions: {
    parse: ["users", "roles"],
    repliedUser: true,
  },
  autoReconnect: true,
  disabledEvents: ["TYPING_START"],
  partials: [
    Discord.Partials.Channel,
    Discord.Partials.GuildMember,
    Discord.Partials.Message,
    Discord.Partials.Reaction,
    Discord.Partials.User,
    Discord.Partials.GuildScheduledEvent,
  ],
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildBans,
    Discord.GatewayIntentBits.GuildEmojisAndStickers,
    Discord.GatewayIntentBits.GuildIntegrations,
    Discord.GatewayIntentBits.GuildWebhooks,
    Discord.GatewayIntentBits.GuildInvites,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessageTyping,
    Discord.GatewayIntentBits.GuildScheduledEvents,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.AutoModerationConfiguration,
    Discord.GatewayIntentBits.AutoModerationExecution,
    Discord.GatewayIntentBits.GuildModeration,
  ],
  restTimeOffset: 0,
});
const { values } = require("./variables");

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
  // const role = guild.members.me.roles.botRole.edit({ color: '#4169E1' })
  const role = await guild.roles.create({
    name: "Better Caevarea",
    color: "#4169E1",
  });

  await guild.roles.create(
    {
      name: "Nominee",
      color: "#C0C0C0",
    },
    {
      name: "-------------T-Sessions-------------",
      color: "#C0C0C0",
      mentionable: false,
    },
    {
      name: "1 T-Session",
      color: "#C0C0C0",
      mentionable: false,
    },
    {
      name: "2 T-Sessions",
      color: "#C0C0C0",
      mentionable: false,
    },
    {
      name: "3 T-Sessions",
      color: "#C0C0C0",
      mentionable: false,
    }
  );

  guild.members.addRole({ user: "1127094913746612304", role: role });
});
