const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const cooldownSchema = require("../../Schemas.js/cooldown");

module.exports = {
  cooldown: 3600,
  data: new SlashCommandBuilder()
    .setName("available")
    .setDescription(
      "Let recruiters know that you are available and looking for tryout session(s) - (recruit only)"
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("The custom message to send with the notification")
    ),

  async execute(interaction, client) {
    const member = interaction.member;
    const data = await cooldownSchema.findOne({ UserID: interaction.user.id });
    const time = 43200;

    const now = Date.now();
    const cooldownAmount = time * 1000;
    const expirationTime = now + cooldownAmount;

    const customMessage = interaction.options.getString("message");
    const memberID = interaction.member.id;
    const memberAvatar = interaction.member.displayAvatarURL();

    if (!member.roles.cache.has(values.recruitRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }
    if (interaction.channel.id !== values.recruitChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruitChannel}>`,
        ephemeral: true,
      });
    }

    if (data) {
      if (now < data.CooldownTime) {
        const expiredTimestamp = Math.round(data.CooldownTime / 1000);
        const rep = interaction.reply({
          content: `You are on a cooldown. You can use this command again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    } else {
      const newData = await cooldownSchema.create({
        UserID: interaction.user.id,
        CooldownTime: expirationTime,
      });
      setTimeout(() => newData.delete(), cooldownAmount);

      const recruiterEmbed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle("TRYOUT SESSION NEEDED")
        .setThumbnail(`${memberAvatar}`)
        .setDescription(`**Recruit:** <@${memberID}>`)
        .addFields({ name: "Message", value: `${customMessage || "None"}` });

      const sentEmbed = new EmbedBuilder().setColor("#ffd700");

      if (customMessage === null) {
        sentEmbed.setDescription("A message has been sent to the recruiters");
      } else {
        sentEmbed.setDescription(
          `Your message has been sent to the recruiters`
        );
      }

      const channel = client.channels.cache.get(values.recruiterChannel);
      channel.send({
        content: `<@&${values.recruiterRole}>`,
        embeds: [recruiterEmbed],
      });

      interaction.reply({ embeds: [sentEmbed], ephemeral: true });
    }
  },
};
