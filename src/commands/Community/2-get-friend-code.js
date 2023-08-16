const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const friendSchema = require("../../Schemas.js/friend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("friend-code-get")
    .setDescription("Get your or another users friend code")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the friend code for")
    ),

  async execute(interaction) {
    const user = interaction.options.getMember("user");

    if (user === null) {
      const data = await friendSchema.findOne({ UserID: interaction.user.id });
      if (!data) {
        interaction.reply({
          content: `You do not have a friend code set. Use </friend-code-set:1134589356695355525> to set one`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `<@${interaction.user.id}>: **${data.Code}**`,
        });
      }
    } else {
      const data = await friendSchema.findOne({ UserID: user.id });
      if (!data) {
        interaction.reply({
          content: `${user} does not have a friend code set`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `${user}: **${data.Code}**`,
          ephemeral: true,
        });
      }
    }
  },
};
