const { SlashCommandBuilder } = require("discord.js");
const { Connect4 } = require(`discord-gamecord`);
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect-4")
    .setDescription("Challenge someone to play Connect-4")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you wish to play against")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const Game = new Connect4({
      message: interaction,
      isSlashGame: true,
      opponent: interaction.options.getUser("user"),
      embed: {
        title: "Connect4 Game",
        statusTitle: "Status",
        color: "#5865F2",
      },
      emojis: {
        board: "⚪",
        player1: "🔴",
        player2: "🟡",
      },
      mentionUser: true,
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      turnMessage: "{emoji} | Its turn of player **{player}**.",
      winMessage: "{emoji} | **{player}** won the Connect4 Game.",
      tieMessage: "The Game tied! No one won the Game!",
      timeoutMessage: "The Game went unfinished! No one won the Game!",
      playerOnlyMessage: "Only {player} and {opponent} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
