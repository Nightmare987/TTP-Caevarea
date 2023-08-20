const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder,
} = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-members")
    .setDescription("See all the users that have a role"),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });

    const row1 = new ActionRowBuilder().addComponents(
      new RoleSelectMenuBuilder()
        .setCustomId("roles")
        .setPlaceholder("Select 1 - 10 roles...")
        .setMinValues(1)
        .setMaxValues(10)
    );

    const finalEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription("Select a role to see its members");
    interaction.reply({
      embeds: [finalEmbed],
      components: [row1],
      ephemeral: true,
    });
  },
};
