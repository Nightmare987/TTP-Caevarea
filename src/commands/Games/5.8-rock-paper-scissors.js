const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  CommandInteraction,
} = require("discord.js");
const { values } = require("../../variables");
const { RockPaperScissors } = require("discord-gamecord");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rock-paper-scissors")
    .setDescription("Play Rock Paper Scissors - option to challenge")
    .addUserOption((option) =>
      option
        .setName("opponent")
        .setDescription("The user to challenge(will be solo game if empty)")
    ),
  async execute(interaction, client) {
    if (interaction.channel.id !== values.GamesChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.GamesChannel}>`,
        ephemeral: true,
      });
    }

    const opponent = interaction.options.getMember("opponent") || null;

    if (opponent === null) {
      const rps = ["rock", "paper", "scissors"];
      const random = rps[Math.floor(Math.random() * rps.length)];

      const choiceEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("Rock Paper Scissors")
        .setDescription(`Choose a option`);
      const btn1 = new ButtonBuilder()
        .setLabel("🌑 | Rock")
        .setCustomId("rock")
        .setStyle(ButtonStyle.Primary);
      const btn2 = new ButtonBuilder()
        .setLabel("📃 | Paper")
        .setCustomId("paper")
        .setStyle(ButtonStyle.Primary);
      const btn3 = new ButtonBuilder()
        .setLabel("✂️ | Scissors")
        .setCustomId("scissors")
        .setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(btn1, btn2, btn3);

      const choiceMsg = await interaction.reply({
        content: `${interaction.user}`,
        embeds: [choiceEmbed],
        components: [row],
      });
      const choiceCollector = choiceMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      choiceCollector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id)
          return i.reply({
            content: "These buttons are not for you",
            ephemeral: true,
          });

        const choice = i.customId;
        let outcome;

        // logic
        if (choice === random) outcome = "Its a tie!";
        if (choice === "rock") {
          if (random === "paper") outcome = "Caevarea wins!";
          if (random === "scissors")
            outcome = `${interaction.member.displayName} wins!`;
        }
        if (choice === "paper") {
          if (random === "scissors") outcome = "Caevarea wins!";
          if (random === "rock")
            outcome = `${interaction.member.displayName} wins!`;
        }
        if (choice === "scissors") {
          if (random === "rock") outcome = "Caevarea wins!";
          if (random === "paper")
            outcome = `${interaction.member.displayName} wins!`;
        }

        const endEmbed = new EmbedBuilder()
          .setColor("#5865F2")
          .setTitle("Rock Paper Scissors")
          .addFields(
            {
              name: interaction.member.displayName,
              value: `\`\`\`${choice}\`\`\``,
              inline: true,
            },
            {
              name: "Caevarea",
              value: `\`\`\`${random}\`\`\``,
              inline: true,
            },
            { name: "Result", value: `\`\`\`${outcome}\`\`\``, inline: false }
          );

        choiceCollector.stop();
        await choiceMsg.edit({
          content: `${interaction.user}`,
          embeds: [endEmbed],
          components: [],
        });
      });

      choiceCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
          choiceEmbed.setDescription("```This invite has expired```");
          await choiceMsg.edit({
            content: null,
            embeds: [choiceEmbed],
            components: [],
          });
        }
      });
    } else {
      const Game = new RockPaperScissors({
        message: interaction,
        isSlashGame: true,
        opponent: interaction.options.getUser("opponent"),
        embed: {
          title: "Rock Paper Scissors",
          color: "#5865F2",
          description: "Press a button below to make a choice.",
        },
        buttons: {
          rock: "Rock",
          paper: "Paper",
          scissors: "Scissors",
        },
        emojis: {
          rock: "🌑",
          paper: "📃",
          scissors: "✂️",
        },
        mentionUser: true,
        timeoutTime: 60000,
        buttonStyle: "PRIMARY",
        pickMessage: "You chose {emoji}",
        winMessage: "**{player}** won the Game! Congratulations!",
        tieMessage: "The Game tied! No one won the Game!",
        timeoutMessage: "The Game went unfinished! No one won the Game!",
        playerOnlyMessage:
          "Only {player} and {opponent} can use these buttons.",
      });

      Game.startGame();
      Game.on("gameOver", (result) => {
        return;
      });
    }
  },
};
