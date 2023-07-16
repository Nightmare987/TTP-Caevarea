const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const completeSchema = require("../../Schemas.js/completeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("input")
    .setDescription("Input scores for a recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to input scores for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("vibe")
        .setDescription("The recruits vibe score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("skill")
        .setDescription("The recruits skill score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("strategy")
        .setDescription("The recruits strategy score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const recruit = interaction.options.getUser("recruit");
    const memRecruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.username;
    const recruitIcon = recruit.avatarURL();

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const vibe = interaction.options.getInteger("vibe");
    const skill = interaction.options.getInteger("skill");
    const strategy = interaction.options.getInteger("strategy");
    const total = vibe + skill + strategy;

    //// MAKE A NEW COMMAND FOR CREATING A NEW RECRUIT(ADD ROLE) AND MAKE INPUT CHECK IF THE USER HAS THAT ROLE
    //// ALSO MAKE THE COMPLETE COMMAND REMOVE THE ROLE AND SEND A DM EMBED, GIVE NEW ROLE, ETC

    let data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });
    let datta = await completeSchema.findOne({
      Something: "not empty",
    });

    const channelID = interaction.channel.id;

    let tryoutAmount;
    if (!data) {
      tryoutAmount = 0;
    } else {
      tryoutAmount = data.Tryouts.length;
    }

    const redEmbed = new EmbedBuilder()
      .setColor("#a42a04")
      .setDescription(`**${recruitName}** is already a recruit`);

    const greenEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`**${recruitName}** is already a recruit`);

    if (!member.roles.cache.has("1127338436571955230")) {
      redEmbed.setDescription(
        "You do not have permsission to use this command"
      );
      interaction.reply({
        embeds: [redEmbed],
        ephemeral: true,
      });
    } else if (!memRecruit.roles.cache.has("1129587595211460669")) {
      redEmbed.setDescription(
        `**${recruitName}** is not a recruit. Use </new:1129615832218095666> to make them one`
      );
      interaction.reply({ embeds: [redEmbed], ephemeral: true });
    } else if (tryoutAmount === 3) {
      redEmbed.setDescription(
        `**${recruitName}** already has 3 sessions inputted`
      );
      interaction.reply({
        embeds: [redEmbed],
        ephemeral: true,
      });
    } else {
      const tryoutDate = new Date(
        interaction.createdTimestamp
      ).toLocaleDateString();

      if (!data) {
        data = new recruitSchema({
          RecruitID: recruitID,
          RecruitName: recruitName,
          BeginDate: tryoutDate,
          Tryouts: [
            {
              TryoutNum: tryoutAmount + 1,
              RecruiterID: recruiterID,
              RecruiterName: recruiterName,
              Date: tryoutDate,
              Vibe: vibe,
              Skill: skill,
              Strategy: strategy,
              Total: total,
            },
          ],
        });
        const recruitt = {
          RecruitID: recruitID,
        };
        datta.Recruits.push(recruitt);
        datta.save();
      } else {
        const recruitTryouts = {
          TryoutNum: tryoutAmount + 1,
          RecruiterID: recruiterID,
          RecruiterName: recruiterName,
          Date: tryoutDate,
          Vibe: vibe,
          Skill: skill,
          Strategy: strategy,
          Total: total,
        };
        data.Tryouts.push(recruitTryouts);
      }
      data.save();

      const embed = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle(`New Session Input for ${recruitName}`)
        .setAuthor({
          name: `${recruiterName}`,
          iconURL: `${recruiterIcon}`,
        })
        .setThumbnail(`${recruitIcon}`)
        .addFields(
          { name: "Session #", value: `${tryoutAmount + 1}` },
          { name: "Recruiter", value: `<@${recruiterID}>`, inline: true },
          { name: "Recruit", value: `<@${recruitID}>`, inline: true },
          { name: "\u200B", value: "\u200B", inline: true },
          { name: "Vibe", value: `${vibe}`, inline: true },
          { name: "Skill", value: `${skill}`, inline: true },
          { name: "Strategy", value: `${strategy}`, inline: true },
          { name: "Session Total", value: `${total}` }
        )
        .setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
        });

      interaction.reply({ embeds: [embed] });

      const channel = client.channels.cache.get(channelID);
      if (tryoutAmount === 2) {
        let totalTotal =
          data.Tryouts[0].Total + data.Tryouts[1].Total + data.Tryouts[2].Total;
        await channel.send({
          content: `<@&1127338436571955230> **${recruitName}** has completed their third session and finished with a total score of **${totalTotal}**. Use </tryout-check:1127738924392005692> to see their final score.`,
        });
      }
    }
  },
};
