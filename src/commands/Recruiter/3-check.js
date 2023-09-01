const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const { values, pages } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("See all recruits or check tryouts for a specific one"),

  async execute(interaction) {
    const member = interaction.member;
    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
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
        .setDescription("Shows a list of all current recruits")
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

    const finalEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(
        "Select a recruit to see their sessions, or *All recruits* to see all recruits"
      );
    interaction.reply({
      embeds: [finalEmbed],
      components: [row1],
      ephemeral: true,
    });
  },
};
