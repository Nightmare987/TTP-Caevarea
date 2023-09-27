const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const insultSchema = require("../../Schemas.js/insult");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("all-insults")
    .setDescription("See a list of all current insults"),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(values.memberRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }

    const data = await insultSchema.find();

    const insultPromises = data.map(async (doc) => {
      const maker = await interaction.guild.members.fetch(doc.UserID);
      return `\n> **${doc.Insult}**\n> Created By: ${maker}`;
    });

    const insultList = await Promise.all(insultPromises);

    const description = insultList.join("\n");

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(`Current List of Insults (${data.length})`)
      .setDescription(description);
    interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
