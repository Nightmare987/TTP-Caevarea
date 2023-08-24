const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { Wordle } = require(`discord-gamecord`);
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wordle")
    .setDescription("Play Wordle"),

  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const Game = new Wordle({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: `Wordle`,
        color: "#5865F2",
      },
      customWord: null,
      timeoutTime: 60000,
      winMessage: "You won! The word was **{word}**",
      loseMessage: "You lost! The word was **{word}**",
      playerOnlyMessage: "Only {player} cam ise these buttons",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
