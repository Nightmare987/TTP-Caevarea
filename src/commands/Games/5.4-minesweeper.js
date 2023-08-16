const { SlashCommandBuilder } = require("discord.js");
const { Minesweeper } = require("discord-gamecord");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minesweeper")
    .setDescription("Play Minesweeper")
    .addIntegerOption((option) =>
      option
        .setName("mine-amount")
        .setDescription("The amount of mines on the map --- 25 blocks")
        .setRequired(true)
        .setMinValue(3)
        .setMaxValue(18)
    ),
  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const Game = new Minesweeper({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Minesweeper",
        color: "#5865F2",
        description: "Click on the buttons to reveal the blocks except mines.",
      },
      emojis: { flag: "🚩", mine: "💣" },
      mines: interaction.options.getInteger("mine-amount"),
      timeoutTime: 60000,
      winMessage: "You won the Game! You successfully avoided all the mines.",
      loseMessage: "You lost the Game! Beaware of the mines next time.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
