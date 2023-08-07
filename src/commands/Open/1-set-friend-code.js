const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const friendSchema = require("../../Schemas.js/friend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("friend-code-set")
    .setDescription("Set your friend code")
    .addStringOption((option) =>
      option
        .setName("friend-code")
        .setDescription("Your friend code: XXXX-YYYY-ZZZZ-A")
        .setMinLength(16)
        .setMaxLength(16)
        .setRequired(true)
    ),

  async execute(interaction) {
    const friendCode = interaction.options.getString("friend-code");

    if (/([A-Za-z0-9]+(-[A-Za-z0-9]+)+)/.test(friendCode) === false) {
      interaction.reply({
        content: `Your input, **${friendcode}**, was not valid`,
      });
    } else {
      const data = await friendSchema.findOne({ UserID: interaction.user.id });

      if (data) {
        interaction.reply({
          content: `You already have a friend code set: **${data.Code}**`,
          ephemeral: true,
        });
      } else {
        const friendCodeUp = friendCode.toUpperCase();
        friendSchema.create({
          UserID: interaction.user.id,
          Code: friendCodeUp,
        });
        interaction.reply({
          content: `Your friend code has been set to **${friendCodeUp}**. Everyone may now use </friend-code-get:1134589356695355524> to see your friend code`,
          ephemeral: true,
        });
      }
    }
  },
};
