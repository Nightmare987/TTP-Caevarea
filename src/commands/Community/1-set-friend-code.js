const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const friendSchema = require("../../Schemas.js/friend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-friend-code")
    .setDescription("Set your friend code")
    .addStringOption((option) =>
      option
        .setName("friend-code")
        .setDescription("Your friend code: XXXX-YYYY-ZZZZ-A")
        .setMinLength(16)
        .setMaxLength(16)
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to set the friend code for (recruiter only)")
    ),

  async execute(interaction) {
    const friendCode = interaction.options.getString("friend-code");
    const user = interaction.options.getMember("user");

    if (/([A-Za-z0-9]+(-[A-Za-z0-9]+)+)/.test(friendCode) === false) {
      return interaction.reply({
        content: `Your input, **${friendCode}**, was not valid`,
      });
    }
    if (user === null) {
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
          UserName: interaction.user.tag,
          Code: friendCodeUp,
        });
        interaction.reply({
          content: `Your friend code has been set to **${friendCodeUp}**. Everyone may now use </friend-code-get:1134589356695355524> to see your friend code`,
          ephemeral: true,
        });
      }
    } else {
      if (!interaction.member.roles.cache.has(values.recruiterRole)) {
        return interaction.reply({
          content: "You do not have permsission to use this command",
          ephemeral: true,
        });
      }

      const data = await friendSchema.findOne({ UserID: user.id });

      if (data) {
        interaction.reply({
          content: `${user} already has a friend code set: **${data.Code}**`,
          ephemeral: true,
        });
      } else {
        const friendCodeUp = friendCode.toUpperCase();
        friendSchema.create({
          UserID: user.id,
          Code: friendCodeUp,
        });
        interaction.reply({
          content: `${user}'s friend code has been set to **${friendCodeUp}**. Everyone may now use </friend-code-get:1134589356695355524> to see their friend code`,
          ephemeral: true,
        });
      }
    }
  },
};
