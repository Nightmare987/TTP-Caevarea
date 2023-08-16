const { SlashCommandBuilder } = require("discord.js");
const { Flood } = require("discord-gamecord");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("flood")
    .setDescription("Play Flood")
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("The difficulty of the game")
        .addChoices(
          { name: "Easy", value: "8" },
          { name: "Medium", value: "13" },
          { name: "Hard", value: "18" }
        )
        .setRequired(true)
    ),
  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const difficulty = Number(interaction.options.getString("difficulty"));

    const Game = new Flood({
      message: interaction,
      isSlashGame: true,
      embed: {
        title: "Flood",
        color: "#5865F2",
      },
      difficulty: difficulty,
      timeoutTime: 60000,
      buttonStyle: "PRIMARY",
      emojis: ["🟥", "⬛️", "🟦", "⬜️", "🟩"],
      winMessage: "You won! You took **{turns}** turns.",
      loseMessage: "You lost! You took **{turns}** turns.",
      playerOnlyMessage: "Only {player} can use these buttons.",
    });

    Game.startGame();
    Game.on("gameOver", (result) => {
      return;
    });
  },
};
