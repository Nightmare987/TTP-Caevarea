const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Hangman } = require(`discord-gamecord`);
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hangman")
    .setDescription("Play Hangman"),

  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const Game = new Hangman({
      message: interaction,
      embed: {
        title: `Hangman`,
        color: `#5865F2`,
      },
      hangman: {
        hat: "🎩",
        head: `👨‍🦰`,
        shirt: `👕`,
        pants: `🩳`,
        boots: `🥾🥾`,
      },
      timeoutTime: 60000,
      timeWords: "all",
      winMessage: `You won! The word was **{word}**`,
      loseMessage: `You lost! The word was **{word}**`,
      playerOnlyMessage: `Only {player} can use these buttons`,
    });

    Game.startGame();
    Game.on(`gameOver`, (result) => {
      return;
    });
  },
};
