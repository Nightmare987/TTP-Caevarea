const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const recruitSchema = require("../../../Schemas.js/recruits");
const { values, canvasStatus, canvasSession } = require("../../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("complete")
    .setDescription("Complete tryouts for a recruit")
    .addStringOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to complete the tryout for")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("passed")
        .setDescription("If the recruit has passed the tryout process, or not")
        .setRequired(true)
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const docs = await recruitSchema.find({ Tryouts: { $size: 3 } });

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

    let status = interaction.options.getBoolean("passed");
    if (status === false) {
      status = "Denied";
    } else {
      status = "Accepted";
    }

    const recruitString = interaction.options.getString("recruit");

    const recruit = await interaction.guild.members.fetch(recruitString);
    const recruitID = recruit.id;
    const recruitName = recruit.user.username;
    const recruitIcon = recruit.user.avatarURL({ extension: "png" });

    const data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });

    if (!recruit.roles.cache.has(values.recruitRole))
      return interaction.reply({
        content: `${recruit} is not a recruit`,
        ephemeral: true,
      });

    if (!data)
      return interaction.reply({
        content: `${recruitName} is not a recruit, or does not have any tryout sessions`,
        ephemeral: true,
      });
    if (data.Tryouts.length !== 3) {
      return interaction.reply({
        content: `**${recruitName}** has not completed their tryout. They currently have **${data.Tryouts.length}** sessions completed.`,
      });
    }

    const emoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "loading"
    );

    const loadEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`${emoji} Completing ${recruit}'s tryout ${emoji}`);

    const final = await interaction.reply({
      embeds: [loadEmbed],
      fetchReply: true,
    });

    const vibeTotal =
      data.Tryouts[0].Vibe + data.Tryouts[1].Vibe + data.Tryouts[2].Vibe;
    const skillTotal =
      data.Tryouts[0].Skill + data.Tryouts[1].Skill + data.Tryouts[2].Skill;
    const strategyTotal =
      data.Tryouts[0].Strategy +
      data.Tryouts[1].Strategy +
      data.Tryouts[2].Strategy;

    const contents = data.Tryouts;

    let attachments = [];
    const attachmentStatus = await canvasStatus(
      recruitName,
      recruitIcon,
      vibeTotal,
      skillTotal,
      strategyTotal,
      status
    );
    attachments.push(attachmentStatus);
    for (const content of contents) {
      const tryoutNum = content.TryoutNum;
      const recruiterNameData = content.RecruiterID;
      const vibe = content.Vibe;
      const skill = content.Skill;
      const strategy = content.Strategy;
      const comment = content.Comment;
      const total = content.Total;

      const recruiter = await interaction.guild.members.fetch(
        recruiterNameData
      );
      const recruiterName = recruiter.user.username;
      const attachmentSession = await canvasSession(
        recruitName,
        recruiterName,
        tryoutNum,
        recruitIcon,
        vibe,
        skill,
        strategy,
        comment
      );
      attachments.push(attachmentSession);
    }

    data.delete();

    await interaction.editReply({
      files: attachments,
      embeds: [],
    });
    final.pin();

    recruit.roles.remove(values.recruitRole);
    recruit.roles.remove(values.tryoutsHeaderRole);
    recruit.roles.remove(values.TS1Role);
    recruit.roles.remove(values.TS2Role);
    recruit.roles.remove(values.TS3Role);

    const dmEmbed = new EmbedBuilder()
      .setColor("#4169E1")
      .setTitle("TTP TRYOUT COMPLETED")
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });
    if (status === "Denied") {
      dmEmbed.setDescription(
        "We are sorry to say that you have been denied of becoming a member after completing your tryout"
      );
    } else {
      recruit.roles.add(values.memberRole);
      dmEmbed.setDescription(
        "Congratulations! We are glad to say that you have been accepted as a member of TTP. Welcome to the family"
      );
      dmEmbed.setImage(
        "https://media.tenor.com/AvRN6GlmzXsAAAAC/the-god-father-marlon-brando.gif"
      );
    }
    client.users.send(recruitID, { embeds: [dmEmbed] });
  },
};
