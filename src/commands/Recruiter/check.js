const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const allRecruitsSchema = require("../../Schemas.js/all-recruits");
const { values, pages } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check")
    .setDescription("See all recruits or check tryouts for a specific one")
    .addStringOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to check scores for")
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const docs = await recruitSchema.find();

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

  async execute(interaction) {
    const member = interaction.member;

    const recruitString = interaction.options.getString("recruit");
    if (recruitString === "no-sessions") return;

    const recruiterID = member.id;
    const recruiterName = member.displayName;
    const recruiterIcon = member.displayAvatarURL();

    let data;
    let recruit;
    let recruitName;
    let recruitIcon;
    if (recruitString !== null) {
      recruit = await interaction.guild.members.fetch(recruitString);
      recruitName = recruit.displayName;
      recruitIcon = recruit.displayAvatarURL();
      data = await recruitSchema.findOne({
        RecruitID: recruitString,
      });
      if (!recruit.roles.cache.has(values.recruitRole))
        return interaction.reply({
          content: `${recruit} is not a recruit`,
          ephemeral: true,
        });
    } else {
      data = await allRecruitsSchema.find();
    }

    const icon = interaction.guild.iconURL();

    if (!member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });

    if (recruitString === null) {
      let description = "";
      await data.forEach(async (doc) => {
        description += `\n> <@${doc.RecruitID}>`;
      });
      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle("All Recruits")
        .setDescription(description);
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      const tryoutAmount = data.Tryouts.length;
      let totalTotal;
      if (tryoutAmount === 3) {
        totalTotal =
          data.Tryouts[0].Total + data.Tryouts[1].Total + data.Tryouts[2].Total;
      } else if (tryoutAmount === 2) {
        totalTotal = data.Tryouts[0].Total + data.Tryouts[1].Total;
      } else {
        totalTotal = data.Tryouts[0].Total;
      }

      const contents = data.Tryouts;
      let p = [];

      for (const content of contents) {
        const tryoutNum = content.TryoutNum;
        const recruiterIdData = content.RecruiterID;
        const tryoutDate = content.Date;
        const vibe = content.Vibe;
        const skill = content.Skill;
        const strategy = content.Strategy;
        const comment = content.Comment;
        const total = content.Total;

        const embed = new EmbedBuilder()
          .setColor("#ffd700")
          .addFields(
            { name: "Session #", value: `**${tryoutNum}**`, inline: true },
            { name: "Date", value: `**${tryoutDate}**`, inline: true },
            {
              name: "Recruiter",
              value: `<@${recruiterIdData}>`,
              inline: true,
            },
            { name: "Vibe", value: `${vibe}`, inline: true },
            { name: "Skill", value: `${skill}`, inline: true },
            { name: "Strategy", value: `${strategy}`, inline: true },
            { name: "Comment", value: `${comment}` },
            {
              name: "Session Total:",
              value: `${total}`,
            }
          )
          .setThumbnail(`${recruitIcon}`);

        if (tryoutAmount === 3) {
          embed.setFooter({
            text: `Page: ${tryoutNum}/${tryoutAmount + 1}`,
          });
          embed.setTitle(`**Final Sessions for ${recruitName}**`);
        } else if (tryoutAmount === 2) {
          embed.setFooter({
            text: `Page: ${tryoutNum}/${tryoutAmount + 1}`,
          });
          embed.setTitle(
            `**Current Sessions for ${recruitName}: ${tryoutAmount}**`
          );
        } else {
          embed.setFooter({
            text: `Page: ${tryoutNum}/${tryoutAmount}`,
          });
          embed.setTitle(`**First Session for ${recruitName}**`);
        }

        p.push(embed);
      }

      if (tryoutAmount !== 1) {
        const totalEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`**${totalTotal}**`)
          .setThumbnail(`${recruitIcon}`)
          .setFooter({
            text: `Page: ${tryoutAmount + 1}/${tryoutAmount + 1}`,
          });
        if (tryoutAmount === 3) {
          totalEmbed.setTitle("**Final Tryout Score**");
        } else {
          totalEmbed.setTitle("**Current Tryout Score**");
        }

        p.push(totalEmbed);
      }

      await pages(p, interaction);
    }
  },
};
