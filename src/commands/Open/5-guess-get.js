const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const guessSchema = require("../../Schemas.js/guess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-get")
    .setDescription("Get your or another users guess game data")
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to get the data for")
    ),

  async execute(interaction) {
    const user = interaction.options.getMember("user");

    if (user === null) {
      const data = await guessSchema.findOne({ UserID: interaction.user.id });
      if (!data) {
        interaction.reply({
          content: `You have not played the guess game. Use </guess-the-number:1136498625183227924> to play`,
          ephemeral: true,
        });
      } else {
        const games = data.Wins + data.Loses;
        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(
            `${interaction.member.displayName.toUpperCase()}'S GUESS GAME DATA`
          )
          .addFields(
            { name: `Games`, value: `${games}`, inline: true },
            { name: `Points`, value: `${data.Points}`, inline: true },
            { name: `Maxes`, value: `${data.Maxes}`, inline: true },
            { name: `Wins`, value: `${data.Wins}`, inline: true },
            { name: `Points Gained`, value: `${data.Gained}`, inline: true },
            { name: `\u200B`, value: `\u200B`, inline: true },
            { name: `Loses`, value: `${data.Loses}`, inline: true },
            { name: `Points Lost`, value: `${data.Lost}`, inline: true }
          );
        const statEmbed = new EmbedBuilder().setColor("#ffd700").addFields(
          {
            name: `Avg. MPG   |`,
            value: `${Number((data.Maxes / games).toFixed(2))}`,
            inline: true,
          },
          {
            name: `Avg. GPPG   |`,
            value: `${Number((data.Gained / data.Wins).toFixed(2))}`,
            inline: true,
          },
          {
            name: `Avg. LPPG`,
            value: `${Number((data.Lost / data.Loses).toFixed(2))}`,
            inline: true,
          },
          {
            name: `Win Rate`,
            value: `${Number((data.Wins / games).toFixed(2))}`,
            inline: true,
          },
          {
            name: `Lose Rate`,
            value: `${Number((data.Loses / games).toFixed(2))}`,
            inline: true,
          }
        );
        interaction.reply({
          content: `<@${interaction.user.id}>`,
          embeds: [embed, statEmbed],
        });
      }
    } else {
      const data = await guessSchema.findOne({ UserID: user.id });
      if (!data) {
        interaction.reply({
          content: `${user} has not played the guess game`,
          ephemeral: true,
        });
      } else {
        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(`${user.displayName.toUpperCase()}'S GUESS GAME DATA`)
          .addFields(
            { name: `Total Games`, value: `${data.Games}`, inline: true },
            { name: `Points`, value: `${data.Points}`, inline: true },
            { name: `\u200B`, value: `\u200B`, inline: true },
            { name: `Wins`, value: `${data.Wins}`, inline: true },
            { name: `Loses`, value: `${data.Loses}`, inline: true }
          );
        const statEmbed = new EmbedBuilder().setColor("#ffd700").addFields(
          {
            name: `Avg. Points Per Game`,
            value: `${data.Points / data.Games}`,
            inline: true,
          },
          {
            name: `Avg. Max Per Game`,
            value: `${data.Maxes / data.Games}`,
            inline: true,
          },
          { name: `\u200B`, value: `\u200B`, inline: true },
          {
            name: `Win Rate`,
            value: `${data.Wins / data.Games}`,
            inline: true,
          },
          {
            name: `Lose Rate`,
            value: `${data.Loses / data.Games}`,
            inline: true,
          }
        );
        interaction.reply({
          embeds: [embed, statEmbed],
          ephemeral: true,
        });
      }
    }
  },
};
