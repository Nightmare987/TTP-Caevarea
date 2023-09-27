const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const { values } = require("../../variables");
const insultSchema = require("../../Schemas.js/insult");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("insult")
    .setDescription("Insult a person using the list of insults")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The person you wish to insult")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(values.memberRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }

    const target = interaction.options.getMember("target");
    const data = await insultSchema.find();
    let index = Math.floor(Math.random() * data.length);
    let index2 = index;
    let random = data[index];
    if (random === undefined) {
      return interaction.reply({
        content: "No insults in database",
        ephemeral: true,
      });
    }

    const randomEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription("I have chosen a random insult")
      .setFields({ name: "Insult", value: `**${random.Insult}**` });

    let row;
    if (data.length !== 1) {
      row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("reroll")
          .setLabel("Reroll")
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId("send")
          .setLabel("Send")
          .setStyle(ButtonStyle.Success)
      );
    } else {
      row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("send")
          .setLabel("Send")
          .setStyle(ButtonStyle.Success)
      );
    }

    const reply = await interaction.reply({
      embeds: [randomEmbed],
      components: [row],
      ephemeral: true,
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "reroll") {
        while (index === index2) {
          index = Math.floor(Math.random() * data.length);
        }
        random = data[index];
        index2 = index;
        const embed = EmbedBuilder.from(i.message.embeds[0]);
        embed.setFields({ name: "Insult", value: `**${random.Insult}**` });
        i.update({ embeds: [embed] });
        collector.resetTimer();
      } else if (i.customId === "send") {
        const maker = await interaction.guild.members.fetch(random.UserID);
        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(random.Insult)
          .setFooter({
            text: `${maker.displayName} created this insult prompt`,
          });
        interaction.deleteReply();
        interaction.channel.send({
          content: `${target}, you have been insulted...`,
          embeds: [embed],
        });
        collector.stop();
      }
    });

    collector.on("end", (collected, reason) => {
      if (reason === "time") {
        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription("This interaction timed out");
        interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  },
};
