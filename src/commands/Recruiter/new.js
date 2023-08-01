const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new")
    .setDescription("Create a new recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The user to make a recruit")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const recruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.displayName;
    const recruitIcon = recruit.displayAvatarURL();

    const recruiterID = member.id;
    const recruiterName = member.displayName;
    const recruiterIcon = member.displayAvatarURL();

    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    }
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }
    if (recruit.roles.cache.has(values.recruitRole)) {
      const embed = new EmbedBuilder()
        .setColor("#a42a04")
        .setDescription(`**${recruitName}** is already a recruit`);
      return interaction.reply({ embeds: [embed] });
    }
    recruit.roles.add(values.recruitRole);
    recruit.roles.add(values.tryoutsHeaderRole);

    const embed = new EmbedBuilder()
      .setDescription(`**${recruitName}** has been added as a recruit`)
      .setColor("#ffd700");
    interaction.reply({ embeds: [embed] });
  },
};
