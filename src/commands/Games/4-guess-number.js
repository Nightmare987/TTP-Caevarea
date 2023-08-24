const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const guessSchema = require("../../Schemas.js/guess");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-the-number")
    .setDescription("Play guess the number")
    .addIntegerOption((option) =>
      option
        .setName("max")
        .setDescription("The max number to play with")
        .setMinValue(40)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("guess")
        .setDescription("The number your guessing")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const max = interaction.options.getInteger("max");
    const guess = interaction.options.getInteger("guess");

    if (guess > max) {
      return interaction.reply({
        content: `${interaction.user} your guess, **${guess}**, is greater than your set max, ${max}...`,
      });
    }

    let data = await guessSchema.findOne({ UserID: interaction.user.id });
    if (!data) {
      await guessSchema.create({
        UserID: interaction.user.id,
        Points: 500,
        Maxes: 0,
        Wins: 0,
        GW: 0,
        Gained: 500,
        Loses: 0,
        GL: 0,
        Lost: 0,
      });
      data = await guessSchema.findOne({ UserID: interaction.user.id });
    }

    const random = Math.floor(Math.random() * (max - 0 + 1));
    const dif = max * 0.2;
    const difference = Math.floor(dif);
    let highest = random + difference;
    let lowest = random - difference;

    if (highest > max) {
      const change = highest - max;
      lowest = lowest - change;
      highest = max;
    }
    if (lowest < 0) {
      const change = lowest * -1;
      highest = highest + change;
      lowest = 0;
    }

    const extraDif = max * 0.1;
    const extraDifference = Math.floor(extraDif);
    let extraHighest = random + extraDifference;
    let extraLowest = random - extraDifference;

    if (extraHighest > max) {
      const change = extraHighest - max;
      extraLowest = extraLowest - change;
      extraHighest = max;
    }
    if (extraLowest < 0) {
      const change = extraLowest * -1;
      extraHighest = extraHighest + change;
      extraLowest = 0;
    }

    let score = "";
    const ll = max * 0.3;
    const loseScore = Math.floor(ll);
    const embed = new EmbedBuilder()
      .setThumbnail(`${interaction.member.displayAvatarURL()}`)
      .setDescription(`**Guess: ${guess}**`)
      .addFields(
        { name: "Max", value: `${max}`, inline: true },
        { name: "Jackpot", value: `${random}`, inline: true },
        { name: "\u200B", value: "\u200B", inline: true },
        { name: "Lowest", value: `${lowest}`, inline: true },
        { name: "Lowest - Extra", value: `${extraLowest}`, inline: true },
        { name: "\u200B", value: "\u200B", inline: true },
        {
          name: "Highest - Extra",
          value: `${extraHighest}`,
          inline: true,
        },
        { name: "Highest", value: `${highest}`, inline: true },
        { name: "\u200B", value: "\u200B", inline: true }
      )
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });
    if (guess > lowest && guess < highest) {
      if (guess === random) {
        score = max * 3;
        const memberName = interaction.member.displayName.toUpperCase();
        embed.setColor("#ffd700");
        embed.setTitle(`${memberName} HAS WON THE JACKPOT!`);
      } else if (guess > extraLowest && guess < extraHighest) {
        score = max;
        embed.setColor("#ffd700");
        embed.setTitle(
          `${interaction.member.displayName} has won in the extra range!`
        );
      } else {
        score = max * 0.5;
        embed.setColor("#ffd700");
        embed.setTitle(`${interaction.member.displayName} has won!`);
      }
      data.Points = data.Points + score;
      data.Gained = data.Gained + score;
      data.Wins = data.Wins + 1;
      data.Maxes = data.Maxes + max;
      data.save();
      embed.addFields(
        { name: "Points Gained", value: `${score}`, inline: true },
        {
          name: "Total Points",
          value: `${data.Points}`,
          inline: true,
        }
      );
      return interaction.reply({
        content: `${interaction.user}`,
        embeds: [embed],
      });
    } else {
      data.Points = data.Points - loseScore;
      data.Loses = data.Loses + 1;
      data.Lost = data.Lost + loseScore;
      data.Maxes = data.Maxes + max;
      data.save();
      embed.setColor("#a42a04");
      embed.setTitle(`${interaction.member.displayName} has lost`);

      embed.addFields(
        { name: "Points Lost", value: `${loseScore}`, inline: true },
        {
          name: "Total Points",
          value: `${data.Points}`,
          inline: true,
        }
      );

      return interaction.reply({
        content: `${interaction.user}`,
        embeds: [embed],
      });
    }
  },
};
