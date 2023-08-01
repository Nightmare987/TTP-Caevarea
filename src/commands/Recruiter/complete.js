const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("complete")
    .setDescription("Complete a tryouts for a recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to complete the tryout for")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("passed")
        .setDescription("If the recruit has passed the tryout process, or not")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const passed = interaction.options.getBoolean("passed");
    const channelSend = client.channels.cache.get(interaction.channel.id);

    const recruit = interaction.options.getUser("recruit");
    const memRecruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.username;
    const recruitIcon = recruit.avatarURL();

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
    if (!memRecruit.roles.cache.has(values.recruitRole))
      return interaction.reply({
        content: `${memRecruit} is not a recruit`,
        ephemeral: true,
      });

    if (!data)
      return interaction.reply({
        content: `${recruitName} is not a recruit, or does not have any tryout sessions`,
        ephemeral: true,
      });
    if (data.Tryouts.length !== 3)
      return interaction.reply({
        content: `**${recruitName}** has not completed their tryout. They currently have **${data.Tryouts.length}** sessions completed.`,
      });

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
    let status;
    if (passed === false) {
      status = "Denied";
    } else {
      status = "Accepted";
    }
    const totalEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Final Tryout Score and Status")
      .addFields(
        { name: "Tryout Total", value: `${totalTotal}`, inline: true },
        { name: "Tryout Status", value: `**${status}**`, inline: true }
      )
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

    memRecruit.roles.remove(values.recruitRole);
    memRecruit.roles.remove(values.tryoutsHeaderRole);
    memRecruit.roles.remove(values.TS1Role);
    memRecruit.roles.remove(values.TS2Role);
    memRecruit.roles.remove(values.TS3Role);

    const dmEmbed = new EmbedBuilder()
      .setColor("#4169E1")
      .setTitle("TTP TRYOUT COMPLETED")
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });
    if (passed === false) {
      dmEmbed.setDescription(
        "We are sorry to say that you have been denied of becoming a member after completing your tryout"
      );
    } else {
      memRecruit.roles.add(values.memberRole);
      dmEmbed.setDescription(
        "We are glad to say that you have been accepted as a member of TTP. Welcome to the family"
      );
    }
    client.users.send(recruitID, { embeds: [dmEmbed] });
  },
};
