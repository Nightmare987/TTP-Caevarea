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
    .setName("test")
    .setDescription("Check all tryouts for a recruit"),

  async execute(interaction, client) {
    const member = interaction.member;

    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const icon = interaction.guild.iconURL();

    const data = await completeSchema.findOne({ Something: "not empty" });

    if (member.roles.cache.has((role) => role.id === "1127338436571955230")) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (data.Recruits.length === 0) {
      interaction.reply({ content: "There are no recruits at the current moment", ephemeral: true});
    } else {
      const contents = data.Recruits;
      let description = "";
      for (const content of contents) {
        const recruit = content.RecruitID;

        description += `\n<@${recruit}>`;
      }
      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle(`Current Recruits`)
        .setAuthor({
          name: `${recruiterName}`,
          iconURL: `${recruiterIcon}`,
        })
        .setDescription(`${description}`)
        .setThumbnail(`${icon}`)
        .setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1120117446922215425/1120530224677920818/NMD-logo_less-storage.png",
        });

      interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
