const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const friendSchema = require("../../Schemas.js/friend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete-friend-code")
    .setDescription("Delete your friend code"),

  async execute(interaction) {
    const data = await friendSchema.findOne({ UserID: interaction.user.id });

    if (!data) {
      interaction.reply({
        content: `You do not have a friend code set`,
        ephemeral: true,
      });
    } else {
      const friendCode = data.Code;
      data.delete();
      interaction.reply({
        content: `Your friend code(**${friendCode}**) has been deleted`,
        ephemeral: true,
      });
    }
  },
};
