const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const eventsSchema = require("../../Schemas.js/events");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-transfer-ownership")
    .setDescription("Transfer ownership for a event - use in event's channel")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to transfer ownership to")
        .setRequired(true)
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
        content: `This channel is not an event channel`,
        ephemeral: true,
      });
    } else {
      if (interaction.user.id !== data.Owner) {
        return interaction.reply({
          content: `You are not the owner of **${data.EventName}**, and therefore cannot transfer ownership`,
          ephemeral: true,
        });
      }
      const newOwner = interaction.options.getUser("user");
      const fetchMessage = await interaction.channel.messages.fetch(
        data.MessageID
      );
      const copyEmbed = EmbedBuilder.from(fetchMessage.embeds[0]);
      const replace = { name: `Owner`, value: `${newOwner}` };
      copyEmbed.spliceFields(0, 1, replace);
      data.Owner = newOwner.id;
      data.save();

      fetchMessage.edit({ embeds: [copyEmbed] });
      await interaction.reply({
        content: `${newOwner}, you have been given ownership over this event by ${interaction.user}`,
      });
    }
  },
};
