const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const recruitSchema = require("../../Schemas.js/recruits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Create a new recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to input scores for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const recruit = interaction.options.getUser("recruit");
    const recruitID = recruit.id;
    let data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });
    console.log(data.Tryouts.length);
  },
};
