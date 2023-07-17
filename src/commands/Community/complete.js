const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("complete")
    .setDescription("Complete a tryouts for a recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to complete the tryout for")
        .setRequired(true)
    ),

  async execute(interaction) {
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

    if (!member.roles.cache.has("1127338436571955230")) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (!data) {
      interaction.reply({
        content: `${recruitName} is not a recruit, or does not have any tryout sessions`,
        ephemeral: true,
      });
    } else if (data.Tryouts.length != 3) {
      interaction.reply({
        content: `**${recruitName}** has not completed their tryout. They currently have **${data.Tryouts.length}** sessions completed.`,
      });
    } else {
      const totalTotal =
        data.Tryouts[0].Total + data.Tryouts[1].Total + data.Tryouts[2].Total;

      const contents = data.Tryouts;

      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle(`Final Tryout Results for ${recruitName}`)
        .setAuthor({
          name: `${recruiterName}`,
          iconURL: `${recruiterIcon}`,
        })
        .setDescription(`Here are all three of ${recruitName}'s sessions`)
        .setThumbnail(`${recruitIcon}`);

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
        .setTitle("Final Tryout Score")
        .setDescription(`**${totalTotal}**`)
        .setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
        });

      await recruitSchema.findOneAndDelete({
        RecruitID: recruitID,
      });

      const final = await interaction.reply({
        embeds: [embed, totalEmbed],
        fetchReply: true,
      });
      final.pin();
    }
  },
};
