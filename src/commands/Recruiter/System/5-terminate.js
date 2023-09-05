const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");
const recruitSchema = require("../../../Schemas.js/recruits");
const allRecruitsSchema = require("../../../Schemas.js/all-recruits");
const { values } = require("../../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("terminate")
    .setDescription("Terminate/delete a recruits tryouts")
    .addStringOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to check scores for")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const docs = await allRecruitsSchema.find();

    let choices = [];
    await docs.forEach(async (doc) => {
      choices.push({ name: doc.RecruitName, id: doc.RecruitID });
    });

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(value)
    );

    if (!interaction) return;

    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.id }))
    );
  },

  async execute(interaction, client) {
    const member = interaction.member;

    const recruitString = interaction.options.getString("recruit");

    const recruit = await interaction.guild.members.fetch(recruitString);
    const recruitID = recruit.id;
    const recruitName = recruit.displayName;
    const recruitIcon = recruit.displayAvatarURL();

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });

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
    if (!recruit.roles.cache.has(values.recruitRole)) {
      return interaction.reply({
        content: `**${recruit}** is not a <@&${values.recruitRole}>`,
        ephemeral: true,
      });
    }

    if (!data) {
      recruit.roles.remove(values.recruitRole);
      recruit.roles.remove(values.tryoutsHeaderRole);
      recruit.roles.remove(values.TS1Role);
      recruit.roles.remove(values.TS2Role);
      recruit.roles.remove(values.TS3Role);
      return interaction.reply(
        `${recruit} is no longer a recruit. They did not have any tryout sessions`
      );
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
        fetchReply: true,
      });

      const collector = confirmMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
      });

      const channelIDD = interaction.channelId;
      const channel = client.channels.cache.get(channelIDD);

      collector.on("collect", (i) => {
        if (i.customId === "confirm") {
          data.delete();

          recruit.roles.remove(values.recruitRole);
          recruit.roles.remove(values.tryoutsHeaderRole);
          recruit.roles.remove(values.TS1Role);
          recruit.roles.remove(values.TS2Role);
          recruit.roles.remove(values.TS3Role);

          interaction.deleteReply();
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
        collector.stop();
      });
    }
  },
};
