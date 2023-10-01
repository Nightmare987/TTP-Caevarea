const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { values, canvas } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("canvas-session")
    .setDescription("test session-canvas"),

  async execute(interaction, client) {
    await interaction.reply({ content: "Creating canvas", ephemeral: true });
    const comment =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris libero metus, semper nec nibh in, pellentesque ultricies diam. Cras cursus, nisl id pulvinar fringilla, tellus.";

    const attachment = await canvas(
      2,
      interaction.user.avatarURL({ extension: "jpg" }),
      interaction.user.displayName,
      4,
      3.74,
      4.5,
      comment
    );

    interaction.editReply({
      content: "",
      files: [attachment],
    });
  },
};
