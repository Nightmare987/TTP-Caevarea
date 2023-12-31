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
  ActivityType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
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
const {
  values,
  pages,
  pageYes,
  canvasTotal,
  canvasSession,
  canvasWelcome,
} = require("./variables");
const allRecruitsSchema = require("./Schemas.js/all-recruits");
const recruitSchema = require("./Schemas.js/recruits");
const eventsSchema = require("./Schemas.js/events");
const pollSchema = require("./Schemas.js/votes");

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
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
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
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// on bot guild join
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
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// on member guild join
client.on("guildMemberAdd", async (member) => {
  member.roles.add("870394957746307072");
  const welcomeAttachment = await canvasWelcome(member);
  const welcomeChannel = await member.guild.channels.fetch(
    values.WelcomeChannel
  );
  welcomeChannel.send({ files: [welcomeAttachment] });
});
// on member guild leave
client.on("guildMemberRemove", async (member) => {
  const welcomeChannel = await member.guild.channels.fetch(
    values.WelcomeChannel
  );
  welcomeChannel.send({
    content: `**${member.user.username}** has left the server`,
  });
});
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// on channel delete if channel is in events category and is deleted not by bot
client.on("channelDelete", async (channel) => {
  if (channel.parentId !== `${values.EventsCategory}`) return;
  const data = await eventsSchema.findOne({ ChannelID: channel.id });
  if (!data) {
    return;
  } else {
    channel.guild.roles.delete(data.PartRole);
    channel.guild.roles.delete(data.SubRole);
    data.delete();
  }
});
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// when recruit role is added or removed
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  if (
    oldMember.roles.cache.has(values.recruitRole) &&
    !newMember.roles.cache.has(values.recruitRole)
  ) {
    // on remove
    const fetchedLogs = await newMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberRoleUpdate,
      limit: 1,
    });
    const firstEntry = fetchedLogs.entries.first();
    const executorID = firstEntry.executorId;
    const targetID = firstEntry.targetId;

    const data = await allRecruitsSchema.findOne({
      RecruitID: newMember.user.id,
    });
    data.delete();
    if (
      executorID !== "1127094913746612304" &&
      targetID !== "1127094913746612304"
    ) {
      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setDescription(
          `<@${executorID}> has removed ${newMember}'s <@&${values.recruitRole}> role. They have been removed from all recruits, but their sessions (if they had any) have not been deleted. Add them back as a recruit, then use </terminate:1128111165764010079> to delete their data.`
        );
      const channel = client.channels.cache.get(values.recruiterChannel);
      channel.send({ embeds: [embed] });
    }
  } else if (
    !oldMember.roles.cache.has(values.recruitRole) &&
    newMember.roles.cache.has(values.recruitRole)
  ) {
    // on add
    const fetchedLogs = await newMember.guild.fetchAuditLogs({
      type: AuditLogEvent.MemberRoleUpdate,
      limit: 1,
    });
    const firstEntry = fetchedLogs.entries.first();
    const executorID = firstEntry.executorId;
    const targetID = firstEntry.targetId;
    await allRecruitsSchema.create({
      RecruitID: newMember.user.id,
      RecruitName: newMember.user.username,
    });
    newMember.roles.add(values.tryoutsHeaderRole);
    if (
      executorID !== "1127094913746612304" &&
      targetID !== "1127094913746612304"
    ) {
      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setDescription(
          `<@${executorID}> has given ${newMember} the <@&${values.recruitRole}> role`
        );
      const channel = client.channels.cache.get(values.recruiterChannel);
      channel.send({ embeds: [embed] });
    }
  } else {
    return;
  }
});
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// when nomination is deleted
client.on("messageDelete", async (message) => {
  if (!message.embeds.length) return;
  if (message.embeds[0].title !== "New Recruit Nomination") return;
  const docs = await pollSchema.find();
  let choices = [];
  await docs.forEach(async (doc) => {
    choices.push(doc.Msg);
  });
  if (!choices.includes(message.id)) return;
  const deleteMessage = await message.channel.messages.fetch({
    after: message.id,
    limit: 1,
  });
  const data = await pollSchema.findOne({ Msg: message.id });
  const member = await message.guild.members.fetch(data.Nominee);
  deleteMessage.first().delete();
  data.delete();
  member.roles.remove(values.nomineeRole);
});
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// BUTTON HANDLER and SELECT MENU HANDLER
client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const id = interaction.customId;
    // EVENT CREATE REGISTERING
    if (
      id === "regPart" ||
      id === "regSub" ||
      id === "unreg" ||
      id === "list"
    ) {
      const row1 = ActionRowBuilder.from(interaction.message.components[0]);
      const regPartButton = row1.components.find(
        (button) => button.data.custom_id === "regPart"
      );
      const data = await eventsSchema.findOne({
        MessageID: interaction.message.id,
      });
      const partRole = await interaction.guild.roles.fetch(data.PartRole);
      const subRole = await interaction.guild.roles.fetch(data.SubRole);
      if (data) {
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
              fetchReply: true,
            });

            // collectors
            const collector = msg.createMessageComponentCollector({
              componentType: ComponentType.Button,
              time: 60000,
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
                  i.member.roles.add(subRole);
                } else {
                  data.Participants.pull(interaction.user.id);
                  interaction.member.roles.remove(partRole);
                  data.Subs.push(interaction.user.id);
                  interaction.member.roles.add(subRole);
                  await interaction.followUp(
                    `${i.user} has been moved from being a **participant** to a **sub** for **${data.EventName}**`
                  );
                  data.save();
                }
              }
              collector.stop(i.customId);
            });
            collector.on("end", async (collected, reason) => {
              interaction.deleteReply();
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
              content: `You are not registered for this event`,
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
      }
      /**
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       */
      // NOMINATION VOTING
    } else if (
      id === "up" ||
      id === "down" ||
      id === "votes" ||
      id === "nominate"
    ) {
      const buttons = ActionRowBuilder.from(interaction.message.components[0]);
      const nomineeID =
        interaction.message.embeds[0].fields[0].value.match(/\d+/g)[0];
      const data = await pollSchema.findOne({
        Nominee: nomineeID,
      });
      const msg = await interaction.message;
      const member = await interaction.guild.members.fetch(data.Nominee);
      async function CheckVotes() {
        member.roles.remove(values.nomineeRole);
        msg.delete();
        const dmEmbed = new EmbedBuilder()
          .setColor("#4169E1")
          .setTitle("TTP NOMINATION COMPLETED")
          .setFooter({
            text: "Created By: xNightmid",
            iconURL:
              "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
          });
        const nomCompleteEmbed1 = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle("Nomination Process Complete")
          .addFields(
            { name: `Nominee`, value: `<@${data.Nominee}>`, inline: true },
            { name: `Initiator`, value: `<@${data.Owner}>`, inline: true }
          );
        if (data.Upvote > data.Downvote) {
          dmEmbed.setDescription(
            `Congratulations! You have passed the TTP nomination process and are now a official recruit!`
          );
          nomCompleteEmbed1.addFields({
            name: `Outcome`,
            value: `Accepted`,
          });
          member.roles.add(values.recruitRole);
          member.roles.add(values.tryoutsHeaderRole);
        } else {
          dmEmbed.setDescription(
            `Unfortunately, the recruiters at TTP have decided that this is not the right fit. Therefore you did not pass the TTP nomination process, and connot continue the recruitment process. Please feel free to stay in the discord server for casual communication and fun.`
          );
          nomCompleteEmbed1.addFields({
            name: `Outcome`,
            value: `Rejected`,
          });
        }

        let upvoters = [];
        await data.Upmembers.forEach(async (member) => {
          upvoters.push(`<@${member}>`);
        });

        let downvoters = [];
        await data.Downmembers.forEach(async (member) => {
          downvoters.push(`<@${member}>`);
        });

        const nomCompleteEmbed2 = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle("Nomination Votes")
          .addFields(
            {
              name: `Upvoters (${upvoters.length})`,
              value: `> ${
                upvoters.join("\n> ").slice(0, 1020) || "No upvoters"
              }`,
              inline: true,
            },
            {
              name: `Downvoters (${downvoters.length})`,
              value: `> ${
                downvoters.join("\n> ").slice(0, 1020) || "No downvoters"
              }`,
              inline: true,
            }
          );
        data.delete();
        interaction.channel.send({
          content: `<@&${values.recruiterRole}>`,
          embeds: [nomCompleteEmbed1, nomCompleteEmbed2],
        });
        client.users.send(member, { embeds: [dmEmbed] });
      }

      if (id === "up") {
        if (data.Upmembers.includes(interaction.user.id)) {
          return await interaction.reply({
            content: `You have already upvoted on this poll`,
            ephemeral: true,
          });
        } else {
          let downvotes = data.Downvote;
          if (data.Downmembers.includes(interaction.user.id)) {
            downvotes = downvotes - 1;
          }
          const newEmbed = EmbedBuilder.from(msg.embeds[0]).setFields(
            { name: `Nominee`, value: `> <@${data.Nominee}>` },
            { name: `Initiator`, value: `> <@${data.Owner}>` },
            {
              name: `Upvotes`,
              value: `> **${data.Upvote + 1}** Votes`,
              inline: true,
            },
            {
              name: `Downvotes`,
              value: `> **${downvotes}** Votes`,
              inline: true,
            }
          );

          data.Upvote++;

          if (data.Downmembers.includes(interaction.user.id)) {
            data.Downvote = data.Downvote - 1;
          }

          data.Upmembers.push(interaction.user.id);
          data.Downmembers.pull(interaction.user.id);
          data.save();

          await interaction.update({
            embeds: [newEmbed],
            components: [buttons],
          });
        }
      }

      if (id === "down") {
        if (data.Downmembers.includes(interaction.user.id)) {
          return await interaction.reply({
            content: `You have already downvoted on this poll`,
            ephemeral: true,
          });
        } else {
          let upvotes = data.Upvote;
          if (data.Upmembers.includes(interaction.user.id)) {
            upvotes = upvotes - 1;
          }
          const newEmbed = EmbedBuilder.from(msg.embeds[0]).setFields(
            { name: `Nominee`, value: `> <@${data.Nominee}>` },
            { name: `Initiator`, value: `> <@${data.Owner}>` },
            {
              name: `Upvotes`,
              value: `> **${upvotes}** Votes`,
              inline: true,
            },
            {
              name: `Downvotes`,
              value: `> **${data.Downvote + 1}** Votes`,
              inline: true,
            }
          );

          await interaction.update({
            embeds: [newEmbed],
            components: [buttons],
          });

          data.Downvote++;

          if (data.Upmembers.includes(interaction.user.id)) {
            data.Upvote = data.Upvote - 1;
          }

          data.Downmembers.push(interaction.user.id);
          data.Upmembers.pull(interaction.user.id);
          data.save();
        }
      }

      if (id === "votes") {
        let upvoters = [];
        await data.Upmembers.forEach(async (member) => {
          upvoters.push(`<@${member}>`);
        });

        let downvoters = [];
        await data.Downmembers.forEach(async (member) => {
          downvoters.push(`<@${member}>`);
        });

        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle("Nomination Votes")
          .addFields(
            {
              name: `Upvoters (${upvoters.length})`,
              value: `> ${
                upvoters.join("\n> ").slice(0, 1020) || "No upvoters"
              }`,
              inline: true,
            },
            {
              name: `Downvoters (${downvoters.length})`,
              value: `> ${
                downvoters.join("\n> ").slice(0, 1020) || "No downvoters"
              }`,
              inline: true,
            }
          );

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      if (id === "nominate") {
        if (interaction.user.id !== data.Owner) {
          const notYouEmbed = new EmbedBuilder()
            .setColor("#a42a04")
            .setDescription(`Only <@${data.Owner}> can use this button`);
          await interaction.reply({
            embeds: [notYouEmbed],
            ephemeral: true,
          });
        } else if (data.Upvote === data.Downvote) {
          const equalEmbed = new EmbedBuilder()
            .setColor("#a42a04")
            .setDescription(
              `The upvotes and downvotes for ${member} are equal, therefor a decision could not be made. `
            );
          interaction.reply({
            embeds: [equalEmbed],
            ephemeral: true,
          });
        } else {
          CheckVotes();
        }
      }
      /**
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       */
      // ERROR FILE DELETE
    } else if (id === "fileDel") {
      // delete file
      const message = interaction.message;
      const path = `./src/errors/${message.embeds[0].fields[1].value.slice(
        3,
        -3
      )}`;
      fs.unlink(path, (err) => {
        if (err) {
          return;
        }
      });

      await message.delete();

      console.log(
        `\x1b[1m\x1b[32mError file deleted:   ${path.slice(2)}\x1b[0m`
      );
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
  } else if (interaction.isRoleSelectMenu()) {
    // CHECK ROLE MEMBERS
    if (interaction.customId === "roles") {
      const roles = interaction.roles;
      if (roles.size === 1) {
        const role = await interaction.guild.roles.fetch(
          interaction.roles.first().id
        );
        const loadEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`Loading ${role}'s members`);
        await interaction.update({ embeds: [loadEmbed] });

        const members = await role.members;
        let allMembers = "";

        await members.forEach(async (member) => {
          allMembers += `\n> <@${member.id}> (${member.user.tag})`;
        });
        if (allMembers === "") {
          allMembers = "No members";
        }
        const finalEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(`${role.name}'s Members(${role.members.size})`);

        if (allMembers.length > 4096) {
          const lines = allMembers.split("\n");
          let chars = 0;

          const line = lines.findIndex((l) => {
            chars += l.length;
            if (chars > 4000) return l;
          });

          const str2 = lines.splice(line).join("\n");
          const str1 = lines.join("\n");

          finalEmbed.setDescription(str1);
          const secondEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle(`${role.name}'s Members Continuation`)
            .setDescription(str2);

          interaction.editReply({ embeds: [finalEmbed, secondEmbed] });
        } else {
          finalEmbed.setDescription(allMembers);
          interaction.editReply({ embeds: [finalEmbed] });
        }
      } else {
        const loadEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`Loading members`);
        await interaction.update({ embeds: [loadEmbed] });

        let description = "";
        await roles.forEach(async (roleID) => {
          let allMembers = "";
          await roleID.members.forEach(async (member) => {
            allMembers += `\n> <@${member.id}> (${member.user.tag})`;
          });
          if (allMembers === "") {
            allMembers = "\n> No members";
          }
          description += `\n\n**${roleID.name} (${roleID.members.size})**${allMembers}`;
        });
        const finalEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(`Selected Roles Members`);

        if (description.length > 4096) {
          const lines = description.split("\n");
          let chars = 0;

          const line = lines.findIndex((l) => {
            chars += l.length;
            if (chars > 4000) return l;
          });

          const str2 = lines.splice(line).join("\n");
          const str1 = lines.join("\n");

          finalEmbed.setDescription(str1);
          const secondEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle(`Selected Roles Members Continuation`)
            .setDescription(str2);
          interaction.editReply({ embeds: [finalEmbed, secondEmbed] });
        } else {
          finalEmbed.setDescription(description);
          interaction.editReply({ embeds: [finalEmbed] });
        }
      }
    }
    /**
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     *
     */
  } else if (interaction.isStringSelectMenu()) {
    // HELP COMMAND
    if (interaction.customId === "help") {
      const feature = interaction.values[0];

      if (
        feature === "Recruiter" &&
        !interaction.member.roles.cache.has(values.recruiterRole)
      ) {
        const notAllowed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(
            "You do not have permission to see the Recruiter help page"
          );
        return interaction.update({
          embeds: [notAllowed],
        });
      } else {
        const emoji = interaction.guild.emojis.cache.find(
          (emoji) => emoji.name === "loading"
        );
        const loadembeds = new EmbedBuilder()
          .setDescription(
            `${emoji} Fetching the **${feature}** help list... Stand by ${emoji}`
          )
          .setColor("#ffd700");

        await interaction.update({
          embeds: [loadembeds],
        });

        let description = "";
        const embedTitle = feature.toUpperCase();
        const embed = new EmbedBuilder().setColor("#ffd700").setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1120117446922215425/1120530224677920818/NMD-logo_less-storage.png",
        });

        if (feature === "Recruiter") {
          // system
          let systemDes = "";
          const system = fs
            .readdirSync(`./src/commands/Recruiter/System`)
            .filter((file) => file.endsWith(".js"));
          for (const file of system) {
            let command = require(`./commands/Recruiter/System/${file}`);
            await client.application.commands.fetch();
            const cmd = client.application.commands.cache.find(
              (cmd) => cmd.name === command.data.name
            );

            systemDes += `\n> \n> </${command.data.name}:${cmd.id}>: ${command.data.description}`;
          }

          // other
          let otherDes = "";
          const other = fs
            .readdirSync(`./src/commands/Recruiter/Other`)
            .filter((file) => file.endsWith(".js"));
          for (const file of other) {
            let command = require(`./commands/Recruiter/Other/${file}`);
            await client.application.commands.fetch();
            const cmd = client.application.commands.cache.find(
              (cmd) => cmd.name === command.data.name
            );

            otherDes += `\n> \n> </${command.data.name}:${cmd.id}>: ${command.data.description}`;
          }

          description = `**System(${system.length})**${systemDes}\n\n**Other(${other.length})**${otherDes}`;

          embed.setTitle(
            `CAEVAREA'S ${embedTitle} COMMANDS (${
              system.length + other.length
            })`
          );
        } else {
          const commands = fs
            .readdirSync(`./src/commands/${feature}`)
            .filter((file) => file.endsWith(".js"));
          for (const file of commands) {
            let command = require(`./commands/${feature}/${file}`);
            await client.application.commands.fetch();
            const cmd = client.application.commands.cache.find(
              (cmd) => cmd.name === command.data.name
            );

            description += `\n> \n> </${command.data.name}:${cmd.id}>: ${command.data.description}`;
          }

          embed.setTitle(
            `CAEVAREA'S ${embedTitle} COMMANDS (${commands.length})`
          );
        }

        if (feature === "Games") {
          embed.setDescription(
            `**These commands can only be used in <#${values.GamesChannel}>**${description}`
          );
        } else {
          embed.setDescription(`${description}`);
        }

        interaction.editReply({ embeds: [embed] });
      }

      /**
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       *
       */
    } else if (interaction.customId === "check") {
      // RECRUIT CHECK COMMAND
      const recruitChoice = interaction.values[0];

      let data;
      let recruit;
      let recruitName;
      let recruitIcon;
      if (recruitChoice !== "all") {
        recruit = await interaction.guild.members.fetch(recruitChoice);
        recruitName = recruit.user.username;
        recruitIcon = recruit.displayAvatarURL({ extension: "png" });
        data = await recruitSchema.findOne({
          RecruitID: recruitChoice,
        });
      } else {
        data = await allRecruitsSchema.find();
      }

      if (recruitChoice === "all") {
        const loadEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription("Loading recruits...");
        await interaction.update({ embeds: [loadEmbed] });
        let description = "";
        await data.forEach(async (doc) => {
          description += `\n> <@${doc.RecruitID}>`;
        });
        let embed;
        if (description === "") {
          embed = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(`There are currently no recruits`);
        } else {
          embed = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle(`All Recruits(${data.length})`)
            .setDescription(description);
        }
        const docs = await recruitSchema.find();

        const options = docs.map((doc) => {
          return new StringSelectMenuOptionBuilder()
            .setLabel(`${doc.RecruitName}`)
            .setValue(`${doc.RecruitID}`);
        });
        options.push(
          new StringSelectMenuOptionBuilder()
            .setLabel("All Recruits")
            .setValue("all")
        );

        const row1 = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("check")
            .setPlaceholder("Select a recruit...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(options)
        );
        return interaction.editReply({
          embeds: [embed],
          components: [row1],
          files: [],
        });
      } else {
        const emoji = interaction.guild.emojis.cache.find(
          (emoji) => emoji.name === "loading"
        );

        const loadEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`${emoji} Fetching ${recruit}'s data ${emoji}`);

        await interaction.update({
          embeds: [loadEmbed],
          files: [],
        });

        let row1;
        if (interaction.message.components.length === 1) {
          row1 = ActionRowBuilder.from(interaction.message.components[0]);
        } else {
          row1 = ActionRowBuilder.from(interaction.message.components[1]);
        }

        const tryoutAmount = data.Tryouts.length;
        let vibeTotal;
        let skillTotal;
        let strategyTotal;
        if (tryoutAmount === 3) {
          vibeTotal =
            data.Tryouts[0].Vibe + data.Tryouts[1].Vibe + data.Tryouts[2].Vibe;
          skillTotal =
            data.Tryouts[0].Skill +
            data.Tryouts[1].Skill +
            data.Tryouts[2].Skill;
          strategyTotal =
            data.Tryouts[0].Strategy +
            data.Tryouts[1].Strategy +
            data.Tryouts[2].Strategy;
        } else if (tryoutAmount === 2) {
          vibeTotal = data.Tryouts[0].Vibe + data.Tryouts[1].Vibe;
          skillTotal = data.Tryouts[0].Skill + data.Tryouts[1].Skill;
          strategyTotal = data.Tryouts[0].Strategy + data.Tryouts[1].Strategy;
        } else {
          vibeTotal = data.Tryouts[0].Vibe;
          skillTotal = data.Tryouts[0].Skill;
          strategyTotal = data.Tryouts[0].Strategy;
        }

        const contents = data.Tryouts;
        let p = [];
        if (tryoutAmount !== 1) {
          const attachmentTotal = await canvasTotal(
            recruitName,
            recruitIcon,
            vibeTotal,
            skillTotal,
            strategyTotal
          );
          p.push(attachmentTotal);
        }

        for (const content of contents) {
          const tryoutNum = content.TryoutNum;
          const recruiterIdData = content.RecruiterID;
          const vibe = content.Vibe;
          const skill = content.Skill;
          const strategy = content.Strategy;
          const comment = content.Comment;
          const total = content.Total;

          const recruiter = await interaction.guild.members.fetch(
            recruiterIdData
          );
          const recruiterName = recruiter.user.username;
          const attachmentSession = await canvasSession(
            recruitName,
            recruiterName,
            tryoutNum,
            recruitIcon,
            vibe,
            skill,
            strategy,
            comment
          );

          p.push(attachmentSession);
        }

        await pageYes(p, interaction, row1);
      }
    }
  }
});
