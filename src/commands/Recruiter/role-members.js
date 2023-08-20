const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role-members")
    .setDescription("See all the users that have a role")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to check members for")
        .setRequired(true)
    ),
  async execute(interaction) {
    if (!interaction.member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });

    const role = interaction.options.getRole("role");

    const laodEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`🏁 Fetching ${role}s members...`);
    await interaction.reply({ embeds: [laodEmbed], ephemeral: true });

    const members = await role.members;
    let allMembers = "";
    await members.forEach(async (member) => {
      allMembers += `\n> <@${member.id}> (${member.user.tag})`;
    });
    const finalEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(`${role.name}'s Members`)
      .setDescription(allMembers);
    interaction.editReply({ embeds: [finalEmbed] });
  },
};
