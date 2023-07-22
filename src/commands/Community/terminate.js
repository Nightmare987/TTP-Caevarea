const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const { values } = require("../../variables");

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
    const memRecruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.username;
    const memRecruitName = memRecruit.displayName;
    const recruitIcon = recruit.avatarURL();

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });

    if (!member.roles.cache.has(values.recruiterRole)) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (!data) {
      if (memRecruit.roles.cache.has(values.recruitRole)) {
        memRecruit.roles.remove(values.recruitRole);
        memRecruit.roles.remove(values.tryoutsHeaderRole);
        memRecruit.roles.remove(values.TS1Role);
        memRecruit.roles.remove(values.TS2Role);
        memRecruit.roles.remove(values.TS3Role);
        interaction.reply(
          `${recruit} is no longer a recruit. They did not have any tryout sessions`
        );
      } else {
        interaction.reply({
          content: `**${recruit}** does not have the <@&1129587595211460669> role`,
          ephemeral: true,
        });
      }
    } else {
      const tryoutAmount = data.Tryouts.length;

      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle(`${memRecruitName}'s Tryout Termination Confirmation`)
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

          memRecruit.roles.remove(values.recruitRole);
          memRecruit.roles.remove(values.tryoutsHeaderRole);
          memRecruit.roles.remove(values.TS1Role);
          memRecruit.roles.remove(values.TS2Role);
          memRecruit.roles.remove(values.TS3Role);

          confirmMessage.delete();
          const confirmEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(
              `${recruit}'s tryouts have been terminated by <@${interaction.user.id}>`
            );
          channel.send({
            content: `<@&${values.recruiterRole}>`,
            embeds: [confirmEmbed],
          });
        }
        if (i.customId === "cancel") {
          const cancelEmbed = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(
              `Termination for ${recruit}'s tryout has been cancelled`
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
    }
  },
};
