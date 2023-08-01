const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const pollSchema = require("../../Schemas.js/votes");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nomination-terminate")
    .setDescription("Delete a nomination poll via its main message's link")
    .addStringOption((option) =>
      option
        .setName("message-link")
        .setDescription("The message link for the poll")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("The reasoning for deleting this poll")
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    const messageLink = interaction.options.getString("message-link");
    const reason = interaction.options.getString("reason");

    const split = messageLink.split("/");
    const id = split[split.length - 1];

    const data = await pollSchema.findOne({ Msg: id });

    const message1 = await interaction.channel.messages.fetch(id);
    const nominee = await interaction.guild.members.fetch(data.Nominee);

    const messageTitle = message1.embeds[0].title;

    const redEmbed = new EmbedBuilder().setColor("#a42a04");

    if (!member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }
    if (interaction.user.id !== data.Owner) {
      redEmbed.setDescription(
        `Only <@${data.Owner}> can use </nomination-delete:1134350660079472732> for this nomination poll`
      );
      return interaction.reply({ embeds: [redEmbed], ephemeral: true });
    }
    if (messageTitle !== "New Recruit Nomination") {
      redEmbed.setDescription(
        "This is either not a poll, or not the polls main message"
      );
      return interaction.reply({ embeds: [redEmbed], ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(`${nominee.displayName}'s Nomination Termination Confirmation`)
      .setDescription(
        `Confirm termination for <@${nominee.id}>'s nomination. This action cannot be undone.`
      )
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Primary)
    );

    const confirmMessage = await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });

    const collector = confirmMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
    });

    collector.on("collect", (i) => {
      if (i.customId === "confirm") {
        const greenEmbed = new EmbedBuilder()
          .setColor("#a42a04")
          .setTitle("A Nomination Poll has been terminated")
          .addFields(
            {
              name: "Initiator",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            { name: "Nominee", value: `<@${data.Nominee}>`, inline: true },
            { name: "Reason", value: `**${reason}**`, inline: false }
          );

        confirmMessage.delete();
        message1.delete();

        interaction.channel.send({
          content: `<@&${values.recruiterRole}>`,
          embeds: [greenEmbed],
        });
      }
      if (i.customId === "cancel") {
        const cancelEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(
            `Termination for <@${nominee.id}>'s nomination has been cancelled`
          )
          .setFooter({
            text: "Created By: xNightmid",
            iconURL:
              "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
          });
        interaction.editReply({
          embeds: [cancelEmbed],
          components: [],
          ephemeral: true,
        });
      }
    });
  },
};
