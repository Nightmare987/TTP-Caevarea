const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  cooldown: 3600,
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Pings all recruits with a custom message")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The custom message to send with the notification")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const customMessage = interaction.options.getString("message");
    const memberID = member.id;

    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }

    const recruitEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("RECRUITER ANNOUNCEMENT")
      .setDescription(`**Author:** ${member}`)
      .addFields({ name: "Message", value: `${customMessage}` });

    const sentEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(
        `You have pinged all recruits in <#${values.recruitChannel}> with the following embed ⬇️`
      );

    const channel = interaction.guild.channels.fetch(values.recruitChannel);
    channel.send({
      content: `<@&${values.recruitRole}>`,
      embeds: [recruitEmbed],
    });

    interaction.reply({ embeds: [sentEmbed, recruitEmbed], ephemeral: true });
  },
};
