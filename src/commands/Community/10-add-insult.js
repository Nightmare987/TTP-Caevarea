const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const insultSchema = require("../../Schemas.js/insult");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-insult")
    .setDescription("Add a insult to the list")
    .addStringOption((option) =>
      option
        .setName("insult")
        .setDescription("The insult you wish to add to the list")
        .setMinLength(9)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(values.memberRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }

    const insult = interaction.options.getString("insult");
    const user = interaction.user.id;

    insultSchema.create({
      UserID: user,
      Insult: insult,
    });

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`Your insult has been added to the list`)
      .addFields({ name: "Insult", value: `${insult}` });

    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
