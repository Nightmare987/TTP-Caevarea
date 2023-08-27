const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("higher-or-lower")
    .setDescription("Play Higher or Lower - option to challenge")
    .addIntegerOption((option) =>
      option
        .setName("max")
        .setDescription("The max number to play with")
        .setMinValue(100)
        .setRequired(true)
    )
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
    const max = interaction.options.getInteger("max");
    const random = Number(Math.floor(Math.random() * (max - 0 + 1)));

    if (opponent === null) {
      let guessesNum = 0;
      let guesses = "";

      const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("Higher or Lower")
        .setDescription("Send a number to guess")
        .addFields(
          { name: "Max", value: `${max}` },
          { name: "Guess", value: "```Guess first```" },
          { name: "Result", value: "```Guess first```" }
        )
        .setFooter({ text: "Send c!stop to stop the game" });

      const msg = await interaction.reply({
        content: `${interaction.user}`,
        embeds: [embed],
      });
      const filter = (m) => m.author.id === interaction.user.id;
      const collector = interaction.channel.createMessageCollector({
        filter: filter,
        time: 60000,
      });

      collector.on("collect", async (m) => {
        if (m.content == "c!stop") {
          const stopEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription("```This game has been stopped```");
          collector.stop();
          m.delete();
          return await msg.edit({
            content: `${interaction.user}`,
            embeds: [stopEmbed],
          });
        }

        const number = Number.parseInt(m.content);
        if (Number.isNaN(number)) return;

        if (number > max) {
          const overEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription("Send a number to guess")
            .addFields(
              { name: "Max", value: `${max}` },
              {
                name: "Guess",
                value: `\`\`\`${number} is greater than ${max}\`\`\``,
              },
              {
                name: "Result",
                value: `\`\`\`${number} is greater than ${max}\`\`\``,
              }
            )
            .setFooter({ text: "Send c!stop to stop the game" });
          m.delete();
          return await msg.edit({
            content: `${interaction.user}`,
            embeds: [overEmbed],
          });
        }

        guessesNum = guessesNum + 1;
        if (guessesNum === 1) {
          guesses += `${number}`;
        } else {
          guesses += `, ${number}`;
        }

        let editEmbed;
        if (number > random) {
          editEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription(
              `Total Guesses: **${guessesNum}**\nGuessed Numbers: **${guesses}**`
            )
            .addFields(
              { name: "Max", value: `${max}` },
              { name: "Guess", value: `\`\`\`${number}\`\`\`` },
              { name: "Result", value: "```Lower```" }
            )
            .setFooter({ text: "Send c!stop to stop the game" });
          collector.resetTimer();
        } else if (number < random) {
          editEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription(
              `Total Guesses: **${guessesNum}**\nGuessed Numbers: **${guesses}**`
            )
            .addFields(
              { name: "Max", value: `${max}` },
              { name: "Guess", value: `\`\`\`${number}\`\`\`` },
              { name: "Result", value: "```Higher```" }
            )
            .setFooter({ text: "Send c!stop to stop the game" });
          collector.resetTimer();
        } else if (number === random) {
          editEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription(
              `Total Guesses: **${guessesNum}**\nGuessed Numbers: **${guesses}**`
            )
            .addFields(
              { name: "Max", value: `${max}` },
              { name: "Guess", value: `\`\`\`${number}\`\`\`` },
              { name: "Result", value: "```You have Won!!```" }
            );
          collector.stop();
        }
        await m.delete();
        await msg.edit({ content: `${interaction.user}`, embeds: [editEmbed] });
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time") {
          const timeEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription(
              "```This game has hit the timer of 1.5mins and has been shut down```"
            );
          await msg.edit({
            content: `${interaction.user}`,
            embeds: [timeEmbed],
          });
        }
      });

      // if there is an opponent
    } else {
      // accept or deny
      if (opponent.id === interaction.user.id)
        return interaction.reply({
          content: "You cannot challenge yourself",
          ephemeral: true,
        });
      const acceptEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("Game Invite")
        .setDescription(
          `${interaction.user} has invited you to play **Higher or Lower** with a max of **${max}**.\nDo you accept or deny?`
        );
      const btn1 = new ButtonBuilder()
        .setLabel("Accept")
        .setCustomId("accept")
        .setStyle(ButtonStyle.Success);
      const btn2 = new ButtonBuilder()
        .setLabel("Deny")
        .setCustomId("reject")
        .setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(btn1, btn2);

      const acceptMsg = await interaction.reply({
        content: `${opponent}`,
        embeds: [acceptEmbed],
        components: [row],
      });
      const acceptCollector = acceptMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000,
      });

      acceptCollector.on("collect", async (i) => {
        if (i.user.id !== opponent.id)
          return i.reply({
            content: "These buttons are not for you",
            ephemeral: true,
          });
        await acceptCollector.stop(i.customId);
      });

      acceptCollector.on("end", async (collected, reason) => {
        if (reason === "time") {
          acceptEmbed.setDescription("```This invite has expired```");
          await acceptMsg.edit({
            content: null,
            embeds: [acceptEmbed],
            components: [],
          });
        }

        if (reason === "reject") {
          await acceptMsg.delete();
          const rejectEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setDescription(
              `${opponent} has denied your invite to play **Higher or Lower** with a max of **${max}**`
            );
          await interaction.channel.send({
            content: `${interaction.user}`,
            embeds: [rejectEmbed],
          });
        }

        if (reason === "accept") {
          await acceptMsg.delete();
          // playing higher or lower 1v1
          let player1Value = "Guess first";
          let player2Value = "Guess first";
          const embed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("Higher or Lower")
            .setDescription("Send a number to guess")
            .addFields(
              { name: "Max", value: `${max}` },
              {
                name: `${interaction.member.displayName}`,
                value: `\`\`\`${player1Value}\`\`\``,
              },
              {
                name: `${opponent.displayName}`,
                value: `\`\`\`${player2Value}\`\`\``,
              },
              { name: "Result", value: "```Both players must guess first```" }
            );

          const msg = await interaction.channel.send({
            content: `${interaction.user}${opponent}`,
            embeds: [embed],
          });
          const filter = (m) =>
            m.author.id === interaction.user.id || m.author.id === opponent.id;
          const collector = interaction.channel.createMessageCollector({
            filter: filter,
            time: 60000,
          });

          collector.on("collect", async (m) => {
            const number = Number.parseInt(m.content);
            if (Number.isNaN(number)) return;
            if (number > max) return;

            if (m.author.id === interaction.user.id) {
              player1Value = number;
            } else {
              player2Value = number;
            }

            const editEmbed = new EmbedBuilder()
              .setColor("#5865F2")
              .setTitle("Higher or Lower")
              .setDescription("Both players must guess")
              .addFields(
                { name: "Max", value: `${max}` },
                {
                  name: `${interaction.member.displayName}`,
                  value: `\`\`\`${player1Value}\`\`\``,
                },
                {
                  name: `${opponent.displayName}`,
                  value: `\`\`\`${player2Value}\`\`\``,
                }
              );
            if (
              player1Value !== "Guess first" &&
              player2Value !== "Guess first"
            ) {
              const diffA = Math.abs(player1Value - random);
              const diffB = Math.abs(player2Value - random);

              let winner;
              if (diffA === diffB) {
                winner =
                  "```Both players are of equal distance away from the jackpot! Its a tie!```";
              } else if (diffA < diffB) {
                winner = `\`\`\`${interaction.member.displayName} is the winner!\`\`\``;
              } else {
                winner = `\`\`\`${opponent.displayName} is the winner!\`\`\``;
              }

              editEmbed.setDescription("This game has ended");
              editEmbed.addFields(
                {
                  name: "Jackpot",
                  value: `${random}`,
                },
                {
                  name: "Result",
                  value: `${winner}`,
                }
              );
              collector.stop();
            } else {
              editEmbed.addFields({
                name: "Result",
                value: "```Both players must guess first```",
              });
            }
            await m.delete();
            await msg.edit({
              content: `${interaction.user}${opponent}`,
              embeds: [editEmbed],
            });
          });

          collector.on("end", async (collected, reason) => {
            if (reason === "time") {
              const timeEmbed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("Higher or Lower")
                .setDescription(
                  "```This game has hit the timer of 1min and has been shut down```"
                );
              await msg.edit({
                content: `${interaction.user}`,
                embeds: [timeEmbed],
              });
            }
          });
        }
      });
    }
  },
};
