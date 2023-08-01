const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const cooldownSchema = require("../../Schemas.js/cooldown");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-cooldown")
    .setDescription(
      "(not ready yet) Removes the coodlown for the /available command for a specified user"
    )
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to remove the coodlown for")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;
    const recruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;

    const data = await cooldownSchema.findOne({ UserID: recruitID });

    if (!member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }
    if (!recruit.roles.cache.has(values.recruitRole)) {
      const recruitEmbed = new EmbedBuilder()
        .setDescription(`<@${recruitID}> is not a <@&${values.recruitRole}>`)
        .setColor("#a42a04");

      return interaction.reply({ embeds: [recruitEmbed], ephemeral: true });
    }

    if (!data) {
      const noEmbed = new EmbedBuilder()
        .setDescription(
          `<@${recruitID}> is not on a cooldown for </available:1133279217946210394>`
        )
        .setColor("#a42a04");

      interaction.reply({ embeds: [noEmbed], ephemeral: true });
    } else {
      data.delete();

      const deletedEmbed = new EmbedBuilder()
        .setDescription(
          `I have deleted <@${recruitID}>'s cooldown for </available:1133279217946210394>`
        )
        .setColor("#ffd700");

      interaction.reply({ embeds: [deletedEmbed] });
    }
  },
};
