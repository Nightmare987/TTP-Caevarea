const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventsSchema = require("../../../Schemas.js/events");
const { values } = require("../../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-complete")
    .setDescription("Complete a event - use in event's channel"),
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
          content: `You cannot use this command as you are not the owner of ${interaction.channel}`,
          ephemeral: true,
        });
      }

      const fetchMessage = await interaction.channel.messages.fetch(
        data.MessageID
      );

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
      data.delete();

      const embed = fetchMessage.embeds[0];
      const embedFinal = new EmbedBuilder()
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

      const logChannel = await interaction.guild.channels.fetch(
        values.EventsLogChannel
      );
      interaction.channel.delete();
      logChannel.send({
        embeds: [embed, embedFinal],
      });
    }
  },
};
