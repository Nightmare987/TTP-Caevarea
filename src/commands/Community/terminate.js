const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const completeSchema = require("../../Schemas.js/completeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("terminate")
    .setDescription("Check all tryouts for a recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to check scores for")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const recruit = interaction.options.getUser("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.username;
    const recruitIcon = recruit.avatarURL();

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });

    if (member.roles.cache.has((role) => role.id === "1127338436571955230")) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (!data) {
      interaction.reply({
        content: `**${recruit}** is not a recruit`,
        ephemeral: true,
      });
    } else {
      const tryoutAmount = data.Tryouts.length;

      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle(`${recruitName}'s Tryout Termination Confirmation`)
        .setDescription(
          `Confirm termination for ${recruit}'s tryout and ${tryoutAmount} session(s). This action cannot be undone.`
        )
        .setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
        });

      const confirm = new ButtonBuilder()
        .setCustomId("confirm")
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Danger);

      const cancel = new ButtonBuilder()
        .setCustomId("cancel")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(confirm, cancel);

      const confirmMessage = await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });

      const collector = confirmMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      const channelIDD = interaction.channelId;
      const channel = client.channels.cache.get(channelIDD);

      collector.on("collect", (i) => {
        if (i.customId === "confirm") {
          data.delete();
          confirmMessage.delete();
          const confirmEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(`${recruit} tryouts have been terminated by <@${interaction.user.id}>`)
            .setFooter({
              text: "Created By: xNightmid",
              iconURL:
                "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
            });
          channel.send({ content: '<@&1127338436571955230>', embeds: [confirmEmbed] });
        } 
        if (i.customId === "cancel") {
          const cancelEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(`Termination for ${recruit} has been cancelled`)
            .setFooter({
              text: "Created By: xNightmid",
              iconURL:
                "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
            });
          confirmMessage.edit({ embeds: [cancelEmbed], components: [], ephemeral: true });
        }
      });
    }
  },
};
