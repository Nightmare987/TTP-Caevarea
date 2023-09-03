const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventsSchema = require("../../Schemas.js/events");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-clear")
    .setDescription(
      "Clear parts and subs for a event - use in event's channel"
    ),
  async execute(interaction, client) {
    const member = interaction.member;

    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }

    const data = await eventsSchema.findOne({
      ChannelID: interaction.channelId,
    });

    if (!data) {
      return interaction.reply({
        content: `${interaction.channel} is not an event channel`,
        ephemeral: true,
      });
    } else {
      if (interaction.user.id !== data.Owner) {
        return interaction.reply({
          content: `You are not the owner of **${data.EventName}**, and therefore cannot clear the event`,
          ephemeral: true,
        });
      }

      if (data.Participants.length === 0 && data.Subs.length === 0) {
        return interaction.reply({
          content: `**${data.EventName}** has zero participants and subs, therefore it cannot be cleared`,
          ephemeral: true,
        });
      }

      if (data.Participants.length !== 0) {
        const partRole = await interaction.guild.roles.fetch(data.PartRole);
        data.Participants.forEach(async (member) => {
          const partMember = await interaction.guild.members.fetch(member);
          partMember.roles.remove(partRole);
        });
        data.Participants = [];
      }

      if (data.Subs.length !== 0) {
        const subRole = await interaction.guild.roles.fetch(data.SubRole);
        data.Subs.forEach(async (member) => {
          const subMember = await interaction.guild.members.fetch(member);
          subMember.roles.remove(subRole);
        });
        data.Subs = [];
      }
      data.save();

      interaction.reply({
        content: `${interaction.user} has cleared **${data.EventName}**'s participants and subs`,
      });
    }
  },
};
