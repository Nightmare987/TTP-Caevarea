const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ContextMenuCommandBuilder,
  ApplicationCommandType,
} = require("discord.js");
const recruitSchema = require("../../Schemas.js/recruits");
const {
  values,
  canvasTotal,
  canvasSession,
  pageYes,
} = require("../../variables");

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName("Check-Recruit")
    .setType(ApplicationCommandType.Message),

  async execute(interaction) {
    const member = interaction.member;
    const user = interaction.targetMessage.member;
    const userName = user.user.username;
    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    }
    if (!user.roles.cache.has(values.recruitRole)) {
      return interaction.reply({
        content: "This user does not have the recruit role",
        ephemeral: true,
      });
    }

    const data = await recruitSchema.findOne({ RecruitID: user.id });
    if (!data) {
      return interaction.reply({
        content: "This recruit does not have any sessions",
        ephemeral: true,
      });
    }

    const emoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "loading"
    );
    const userIcon = user.displayAvatarURL({ extension: "png" });

    const loadEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`${emoji} Fetching ${user}'s data ${emoji}`);

    await interaction.reply({
      embeds: [loadEmbed],
      files: [],
      ephemeral: true,
    });

    const tryoutAmount = data.Tryouts.length;
    let vibeTotal;
    let skillTotal;
    let strategyTotal;
    if (tryoutAmount === 3) {
      vibeTotal =
        data.Tryouts[0].Vibe + data.Tryouts[1].Vibe + data.Tryouts[2].Vibe;
      skillTotal =
        data.Tryouts[0].Skill + data.Tryouts[1].Skill + data.Tryouts[2].Skill;
      strategyTotal =
        data.Tryouts[0].Strategy +
        data.Tryouts[1].Strategy +
        data.Tryouts[2].Strategy;
    } else if (tryoutAmount === 2) {
      vibeTotal = data.Tryouts[0].Vibe + data.Tryouts[1].Vibe;
      skillTotal = data.Tryouts[0].Skill + data.Tryouts[1].Skill;
      strategyTotal = data.Tryouts[0].Strategy + data.Tryouts[1].Strategy;
    } else {
      vibeTotal = data.Tryouts[0].Vibe;
      skillTotal = data.Tryouts[0].Skill;
      strategyTotal = data.Tryouts[0].Strategy;
    }

    const contents = data.Tryouts;
    let p = [];
    if (tryoutAmount !== 1) {
      const attachmentTotal = await canvasTotal(
        userName,
        userIcon,
        vibeTotal,
        skillTotal,
        strategyTotal
      );
      p.push(attachmentTotal);
    }

    for (const content of contents) {
      const tryoutNum = content.TryoutNum;
      const recruiterIdData = content.RecruiterID;
      const vibe = content.Vibe;
      const skill = content.Skill;
      const strategy = content.Strategy;
      const comment = content.Comment;
      const total = content.Total;

      const recruiter = await interaction.guild.members.fetch(recruiterIdData);
      const recruiterName = recruiter.user.username;
      const attachmentSession = await canvasSession(
        userName,
        recruiterName,
        tryoutNum,
        userIcon,
        vibe,
        skill,
        strategy,
        comment
      );

      p.push(attachmentSession);
    }
    const docs = await recruitSchema.find();

    const options = docs.map((doc) => {
      return new StringSelectMenuOptionBuilder()
        .setLabel(`${doc.RecruitName}`)
        .setValue(`${doc.RecruitID}`);
    });
    options.push(
      new StringSelectMenuOptionBuilder()
        .setLabel("All Recruits")
        .setDescription("Shows a list of all current recruits")
        .setValue("all")
    );
    const row1 = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("check")
        .setPlaceholder("Select a recruit...")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(options)
    );

    await pageYes(p, interaction, row1);
  },
};
