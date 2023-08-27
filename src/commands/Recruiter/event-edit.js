const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventsSchema = require("../../Schemas.js/events");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-edit")
    .setDescription("Edit a event - use in event's channel")
    .addStringOption((option) =>
      option
        .setName("event-name")
        .setDescription("What to change the event's name to")
    )
    .addStringOption((option) =>
      option
        .setName("event-date")
        .setDescription("What to change the event's date to")
    )
    .addStringOption((option) =>
      option
        .setName("event-message")
        .setDescription(
          "What to change the event's message to - leaving empty will not remove the current message (if any)"
        )
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const eventName = interaction.options.getString("event-name");
    const eventDate = interaction.options.getString("event-date");
    const eventMessage = interaction.options.getString("message");

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
        content: `This channel is not an event channel`,
        ephemeral: true,
      });
    } else {
      if (interaction.user.id !== data.Owner) {
        return interaction.reply({
          content: `You cannot use this command as you are not the owner of this event`,
          ephemeral: true,
        });
      }
      if (eventName === null && eventDate === null && eventMessage === null) {
        return interaction.reply({
          content: `You did not provide any changes`,
          ephemeral: true,
        });
      }
      const fetchMessage = await interaction.channel.messages.fetch(
        data.MessageID
      );
      const copyEmbed = EmbedBuilder.from(fetchMessage.embeds[0]);

      if (eventName !== null) {
        data.EventName = eventName;
        copyEmbed.setTitle(`${eventName}`);
        // fetched roles
        const partRole = await interaction.guild.roles.fetch(data.PartRole);
        const subRole = await interaction.guild.roles.fetch(data.SubRole);
        // edit roles
        partRole.setName(`${eventName} Participant`);
        subRole.setName(`${eventName} Sub`);
        interaction.channel.setName(`${eventName}`);
      }

      if (eventDate !== null) {
        copyEmbed.setDescription(
          `**Date: ${eventDate}**\n**Size: ${data.Size}**`
        );
        data.EventDate = eventDate;
      }

      if (eventMessage !== null) {
        copyEmbed.setFields(
          { name: `Creator`, value: `<@${data.Owner}>` },
          { name: `Message`, value: `${eventMessage}` }
        );
      }

      data.save();

      fetchMessage.edit({ embeds: [copyEmbed] });
      interaction.reply({
        content: `Your changes have been made: ${fetchMessage.url}`,
        ephemeral: true,
      });
    }
  },
};
