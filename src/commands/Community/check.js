const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const completeSchema = require("../../Schemas.js/completeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("Check all tryouts for a recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to check scores for")
    ),

  async execute(interaction) {
    const member = interaction.member;

    const recruit = interaction.options.getUser("recruit");

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const icon = interaction.guild.iconURL();

    const datta = await completeSchema.findOne({ Something: "not empty" });

    if (!member.roles.cache.has("1127338436571955230")) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (recruit === null) {
      if (datta.Recruits.length === 0) {
        interaction.reply({
          content: "There are no recruits at the current moment",
          ephemeral: true,
        });
      } else {
        const contents = datta.Recruits;
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
    } else {
      const recruitID = recruit.id;
      const recruitName = recruit.username;
      const recruitIcon = recruit.avatarURL();
      const data = await recruitSchema.findOne({
        RecruitID: recruitID,
      });
      if (!data) {
        interaction.reply({
          content: `**${recruitName}** is not a recruit. Use </tryout-input:1127321316249317427> to make them one`,
          ephemeral: true,
        });
      } else {
        const tryoutAmount = data.Tryouts.length;
        let totalTotal;
        if (tryoutAmount === 3) {
          totalTotal =
            data.Tryouts[0].Total +
            data.Tryouts[1].Total +
            data.Tryouts[2].Total;
        } else if (tryoutAmount === 2) {
          totalTotal = data.Tryouts[0].Total + data.Tryouts[1].Total;
        } else {
          totalTotal = data.Tryouts[0].Total;
        }

        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(`Current Sessions for ${recruitName}`)
          .setAuthor({
            name: `${recruiterName}`,
            iconURL: `${recruiterIcon}`,
          })
          .setThumbnail(`${recruitIcon}`);

        if (tryoutAmount !== 3) {
          embed.setDescription(
            "Use </input:1128111165764010078> to add more tryouts"
          );
        } else {
          embed.setDescription(
            "All 3 tryouts are complete, you can use </complete:1128111165764010077> to complete the tryout process."
          );
        }

        const contents = data.Tryouts;

        for (const content of contents) {
          const tryoutNum = content.TryoutNum;
          const recruiterNameData = content.RecruiterName;
          const tryoutDate = content.Date;
          const vibe = content.Vibe;
          const skill = content.Skill;
          const strategy = content.Strategy;
          const total = content.Total;

          embed.addFields(
            { name: "\u200B", value: "\u200B" },
            { name: "Session #", value: `**${tryoutNum}**`, inline: true },
            { name: "Date", value: `**${tryoutDate}**`, inline: true },
            {
              name: "Recruiter",
              value: `**${recruiterNameData}**`,
              inline: true,
            },
            { name: "Vibe", value: `${vibe}`, inline: true },
            { name: "Skill", value: `${skill}`, inline: true },
            { name: "Strategy", value: `${strategy}`, inline: true },
            { name: "Session Total:", value: `${total}` }
          );
        }

        const totalEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`**${totalTotal}**`)
          .setFooter({
            text: "Created By: xNightmid",
            iconURL:
              "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
          });
        if (tryoutAmount === 3) {
          totalEmbed.setTitle("Final Tryout Score");
        } else {
          totalEmbed.setTitle("Current Tryout Score");
        }

        if (tryoutAmount === 1) {
          interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
          interaction.reply({ embeds: [embed, totalEmbed], ephemeral: true });
        }
      }
    }
  },
};
