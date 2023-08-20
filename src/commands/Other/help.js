const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Display available commands for a topic"),

  async execute(interaction) {
    const row1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("help")
        .setPlaceholder("Select a topic...")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("Community")
            .setValue("Community")
            .setDescription("Commands open to everyone")
            .setEmoji("🥇"),

          new StringSelectMenuOptionBuilder()
            .setLabel("Games")
            .setValue("Games")
            .setDescription("Game commands")
            .setEmoji("🎮"),

          new StringSelectMenuOptionBuilder()
            .setLabel("Recruiter")
            .setValue("Recruiter")
            .setDescription("Commands for recruiters")
            .setEmoji("👨‍💻")
        )
    );

    const finalEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription("Select a topic to see its commands");
    interaction.reply({
      embeds: [finalEmbed],
      components: [row1],
      ephemeral: true,
    });
  },
};
