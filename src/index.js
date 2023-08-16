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
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ComponentType,
  PermissionFlagsBits,
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
const counting = require("./Schemas.js/counting");
const allRecruitsSchema = require("./Schemas.js/all-recruits");
const eventsSchema = require("./Schemas.js/events");

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
    mentionable: false,
  });

  await guild.roles.create({
    name: "Nominee",
    color: "#C0C0C0",
    mentionable: true,
  });
  const roles = [
    "-------------T-Sessions-------------",
    "1 T-Session",
    "2 T-Sessions",
    "3 T-Sessions",
  ];
  await roles.forEach(async (role) => {
    await guild.roles.create({
      name: role,
      color: "#C0C0C0",
      mentionable: false,
    });
  });

  guild.members.addRole({ user: "1127094913746612304", role: role });
});

// handle autocomplete
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (err) {
      return;
    }
  }
});

// when recruit role is added or removed
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (
    oldMember.roles.cache.has(values.recruitRole) &&
    !newMember.roles.cache.has(values.recruitRole)
  ) {
    const data = await allRecruitsSchema.findOne({
      RecruitID: newMember.user.id,
    });
    await data.delete();
  } else if (
    !oldMember.roles.cache.has(values.recruitRole) &&
    newMember.roles.cache.has(values.recruitRole)
  ) {
    await allRecruitsSchema.create({
      RecruitID: newMember.user.id,
      RecruitName: newMember.user.username,
    });
  } else return;
});

// COUTNING
client.on("messageCreate", async (message) => {
  if (!message.guild) return;
  if (message.author.bot) return;

  const number = Number.parseInt(message.content);
  if (Number.isNaN(number)) return;

  const data = await counting.findOne({ Guild: message.guild.id });
  if (!data) {
    return;
  } else {
    if (message.channel.id !== values.CountingChannel) return;

    if (data.LastUser === message.author.id) {
      const embed = new EmbedBuilder()
        .setColor("#a42a04")
        .setDescription(
          `<@${message.author.id}> You may not count after your own count`
        );
      const alert = await message.reply({ embeds: [embed] });
      message.delete();

      setTimeout(async () => {
        alert.delete();
      }, 3000);
    } else if (number !== data.Number) {
      const oldNumber = data.Number;
      data.LastUser = "";
      data.Number = 1;
      data.save();
      message.react("❌");
      const embed = new EmbedBuilder()
        .setColor("#a42a04")
        .setDescription(
          `<@${message.author.id}> counted **${number}** but should have counted **${oldNumber}**. The count has restarted and the next number is now **1**`
        );
      await message.reply({ embeds: [embed] });
    } else {
      await message.react("✅");
      data.LastUser = message.author.id;
      data.Number++;
      await data.save();
    }
  }
});

// BUTTON HANDLER
client.on("interactionCreate", async (interaction) => {
  // to edit a button via its customId
  /* const row1 = ActionRowBuilder.from(interaction.message.components[0]);
          row1.components
            .find((button) => button.data.custom_id === "reg")
            .setDisabled(false);
          interaction.update({ components: [row1] }); */
  if (interaction.isButton) {
    const id = interaction.customId;
    if (
      id === "regPart" ||
      id === "regSub" ||
      id === "unreg" ||
      id === "list" ||
      id === "complete"
    ) {
      const row1 = ActionRowBuilder.from(interaction.message.components[0]);
      const regPartButton = row1.components.find(
        (button) => button.data.custom_id === "regPart"
      );
      const title = interaction.message.embeds[0].title;
      const data = await eventsSchema.findOne({ EventName: title });
      const partRole = await interaction.guild.roles.fetch(data.PartRole);
      const subRole = await interaction.guild.roles.fetch(data.SubRole);
      if (!data) {
        interaction.message.delete();
        interaction.reply({
          content: "This event no longer exists",
          ephemeral: true,
        });
      } else {
        // register Participant
        if (id === "regPart") {
          if (data.Participants.includes(interaction.user.id)) {
            interaction.reply({
              content: `You are already registered for this event`,
              ephemeral: true,
            });
          } else {
            if (data.Subs.includes(interaction.user.id)) {
              interaction.member.roles.remove(subRole);
              data.Subs.pull(interaction.user.id);
            }
            interaction.member.roles.add(partRole);
            data.Participants.push(interaction.user.id);
            data.save();
            if (data.Participants.length === data.Size) {
              const row1 = ActionRowBuilder.from(
                interaction.message.components[0]
              );
              row1.components
                .find((button) => button.data.custom_id === "regPart")
                .setDisabled(true);
              await interaction.update({ components: [row1] });
              await interaction.followUp({
                content: `${interaction.user} has been registered as a **participant** for **${data.EventName}**`,
              });
            } else {
              await interaction.reply({
                content: `${interaction.user} has been registered as a **participant** for **${data.EventName}**`,
              });
            }
          }
        }
        // Register Sub
        if (id === "regSub") {
          if (data.Subs.includes(interaction.user.id)) {
            interaction.reply({
              content: `You are already registered as a **sub** for this event`,
              ephemeral: true,
            });
          } else if (data.Participants.includes(interaction.user.id)) {
            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("Confirm")
                .setCustomId("confirm")
                .setStyle(ButtonStyle.Success),

              new ButtonBuilder()
                .setLabel("Cancel")
                .setCustomId("cancel")
                .setStyle(ButtonStyle.Danger)
            );
            const embed = new EmbedBuilder()
              .setColor("#ffd700")
              .setTitle("Switch-To-Sub Confirmation")
              .setDescription(
                "Are you sure you wish to switch from being a **participant** to a **sub**? You will be placed at the bottom of the sub list."
              );
            const msg = await interaction.reply({
              embeds: [embed],
              components: [row],
              ephemeral: true,
            });

            // collectors
            const collector = msg.createMessageComponentCollector({
              componentType: ComponentType.Button,
              time: 30000,
            });

            collector.on("collect", async (i) => {
              if (i.customId === "confirm") {
                if (regPartButton.data.disabled) {
                  if (data.Subs.length === 0) {
                    regPartButton.setDisabled(false);
                    await interaction.update({ components: [row1] });
                    await i.followUp(
                      `${i.user} has been moved from being a **participant** to a **sub** for **${data.EventName}**`
                    );
                  } else {
                    const next = data.Subs[0];
                    const userNext = await i.guild.members.fetch(next);
                    data.Subs.pull(next);
                    userNext.roles.remove(data.SubRole);
                    data.Participants.push(next);
                    userNext.roles.add(data.PartRole);
                    await interaction.reply(
                      `${i.user} has been moved from being a **participant** to a **sub** for **${data.EventName}**`
                    );
                    await i.followUp({
                      content: `<@${next}>, you have been promoted from a **sub** to a **participant** of **${data.EventName}**`,
                    });
                  }
                  data.Participants.pull(i.user.id);
                  i.member.roles.remove(partRole);
                  data.Subs.push(i.user.id);
                  i.member.roles.remove(subRole);

                  collector.stop(i.customId);
                } else {
                  data.Participants.pull(interaction.user.id);
                  interaction.member.roles.remove(partRole);
                  data.Subs.push(interaction.user.id);
                  interaction.member.roles.add(subRole);
                  await interaction.followUp(
                    `${i.user} has been moved from being a **participant** to a **sub** for **${data.EventName}**`
                  );
                  data.save();
                  collector.stop(i.customId);
                }
              } else if (i.customId === "cancel") {
                collector.stop(i.customId);
              }
            });
            collector.on("end", async (collected, reason) => {
              msg.delete();
            });
          } else {
            interaction.member.roles.add(subRole);
            data.Subs.push(interaction.user.id);
            data.save();
            interaction.reply({
              content: `${interaction.user} has been registered as a **sub** for **${data.EventName}**`,
            });
          }
        }
        // unregister
        if (id === "unreg") {
          if (data.Subs.includes(interaction.user.id)) {
            interaction.member.roles.remove(subRole);
            data.Subs.pull(interaction.user.id);
            data.save();
            interaction.reply({
              content: `${interaction.user} has been **un**registered as a **sub** for **${data.EventName}**`,
            });
          } else if (data.Participants.includes(interaction.user.id)) {
            interaction.member.roles.remove(partRole);
            data.Participants.pull(interaction.user.id);

            if (regPartButton.data.disabled) {
              if (data.Subs.length === 0) {
                regPartButton.setDisabled(false);
                await interaction.update({ components: [row1] });
                interaction.followUp({
                  content: `${interaction.user} has been **un**registered as a **participant** for **${data.EventName}**`,
                });
              } else {
                const next = data.Subs[0];
                const userNext = await interaction.guild.members.fetch(next);
                data.Subs.pull(next);
                userNext.roles.remove(data.SubRole);
                data.Participants.push(next);
                userNext.roles.add(data.PartRole);
                await interaction.reply({
                  content: `${interaction.user} has been **un**registered as a **participant** for **${data.EventName}**`,
                });
                await interaction.followUp({
                  content: `<@${next}>, you have been moved from a **sub** to a **participant** of **${data.EventName}**`,
                });
              }
            } else {
              interaction.reply({
                content: `${interaction.user} has been **un**registered as a **participant** for **${data.EventName}**`,
              });
            }
            data.save();
          } else {
            interaction.reply({
              content: `Your are not registered for this event`,
              ephemeral: true,
            });
          }
        }
        // list
        if (id === "list") {
          let participants = [];
          await data.Participants.forEach(async (member) => {
            participants.push(`<@${member}>`);
          });

          let subs = [];
          await data.Subs.forEach(async (member) => {
            subs.push(`<@${member}>`);
          });

          const embed = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle(`${data.EventName} List`)
            .addFields(
              {
                name: `Participants (${participants.length})`,
                value: `> ${
                  participants.join("\n> ").slice(0, 1020) || "No participants"
                }`,
                inline: true,
              },
              {
                name: `Subs (${subs.length})`,
                value: `> ${subs.join("\n> ").slice(0, 1020) || "No Subs"}`,
                inline: true,
              }
            );

          await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        // complete
        if (id === "complete") {
          if (interaction.user.id !== data.Owner) {
            return interaction.reply({
              content: `Only <@${data.Owner}> can complete this event`,
              ephemeral: true,
            });
          } else {
            let participants = [];
            await data.Participants.forEach(async (member) => {
              participants.push(`<@${member}>`);
            });

            let subs = [];
            await data.Subs.forEach(async (member) => {
              subs.push(`<@${member}>`);
            });

            interaction.guild.roles.delete(data.PartRole);
            interaction.guild.roles.delete(data.SubRole);
            const eventName = data.EventName;
            data.delete();

            const embed = interaction.message.embeds[0];
            const embedFinal = new EmbedBuilder()
              .setColor("#ffd700")
              .setTitle(`${data.EventName} List`)
              .addFields(
                {
                  name: `Participants (${participants.length})`,
                  value: `> ${
                    participants.join("\n> ").slice(0, 1020) ||
                    "No participants"
                  }`,
                  inline: true,
                },
                {
                  name: `Subs (${subs.length})`,
                  value: `> ${subs.join("\n> ").slice(0, 1020) || "No Subs"}`,
                  inline: true,
                }
              );

            const logChannel = await interaction.guild.channels.fetch(
              values.EventsLogChannel
            );
            interaction.channel.delete();
            logChannel.send({
              embeds: [embed, embedFinal],
            });
          }
        }
      }
    }
  }
});
