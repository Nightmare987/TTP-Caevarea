const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const allRecruitsSchema = require("../../../Schemas.js/all-recruits");
const recruitSchema = require("../../../Schemas.js/recruits");
const { values, canvasSession } = require("../../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("input")
    .setDescription("Input scores for a recruit")
    .addStringOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to input scores for")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption((option) =>
      option
        .setName("vibe")
        .setDescription("The recruits vibe score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("skill")
        .setDescription("The recruits skill score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("strategy")
        .setDescription("The recruits strategy score --- /5")
        .setMinValue(0)
        .setMaxValue(5)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("comment")
        .setDescription("A comment for this session - Optional")
        .setMaxLength(175)
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
    const recruitName = recruit.user.username;
    const recruitIcon = recruit.displayAvatarURL({ extension: "png" });

    const recruiterID = interaction.user.id;
    const recruiterName = interaction.user.username;
    const recruiterIcon = interaction.user.avatarURL();

    const vibe = interaction.options.getNumber("vibe");
    const skill = interaction.options.getNumber("skill");
    const strategy = interaction.options.getNumber("strategy");
    const comment = interaction.options.getString("comment") || "None";

    const total = vibe + skill + strategy;

    const redEmbed = new EmbedBuilder().setColor("#a42a04");

    if (!member.roles.cache.has(values.recruiterRole)) {
      redEmbed.setDescription(
        "You do not have permsission to use this command"
      );
      return interaction.reply({
        embeds: [redEmbed],
        ephemeral: true,
      });
    }
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }
    if (!recruit.roles.cache.has(values.recruitRole)) {
      redEmbed.setDescription(`**${recruit}** is not a recruit`);
      return interaction.reply({ embeds: [redEmbed], ephemeral: true });
    }

    let data = await recruitSchema.findOne({
      RecruitID: recruitID,
    });

    let tryoutAmount;
    if (!data) {
      tryoutAmount = 0;
    } else {
      tryoutAmount = data.Tryouts.length;
    }

    if (tryoutAmount === 3) {
      redEmbed.setDescription(`**${recruit}** already has 3 sessions inputted`);
      return interaction.reply({
        embeds: [redEmbed],
        ephemeral: true,
      });
    }

    const emoji = interaction.guild.emojis.cache.find(
      (emoji) => emoji.name === "loading"
    );

    const creatingEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`${emoji} Inputting data for ${recruit} ${emoji}`);
    await interaction.reply({
      embeds: [creatingEmbed],
      fetchReply: true,
    });

    if (!data) {
      data = new recruitSchema({
        RecruitID: recruitID,
        RecruitName: recruitName,
        Tryouts: [
          {
            TryoutNum: tryoutAmount + 1,
            RecruiterID: recruiterID,
            RecruiterName: recruiterName,
            Vibe: vibe,
            Skill: skill,
            Strategy: strategy,
            Total: total,
            Comment: comment,
          },
        ],
      });
    } else {
      const recruitTryouts = {
        TryoutNum: tryoutAmount + 1,
        RecruiterID: recruiterID,
        RecruiterName: recruiterName,
        Vibe: vibe,
        Skill: skill,
        Strategy: strategy,
        Total: total,
        Comment: comment,
      };
      data.Tryouts.push(recruitTryouts);
    }
    data.save();

    if (tryoutAmount === 0) {
      recruit.roles.add(values.TS1Role);
    } else if (tryoutAmount === 1) {
      recruit.roles.add(values.TS2Role);
    } else {
      recruit.roles.add(values.TS3Role);
    }

    const attachment = await canvasSession(
      recruitName,
      recruiterName,
      tryoutAmount + 1,
      recruitIcon,
      vibe,
      skill,
      strategy,
      comment
    );

    await interaction.editReply({ embeds: [], files: [attachment] });

    if (tryoutAmount === 2) {
      let totalTotal =
        data.Tryouts[0].Total + data.Tryouts[1].Total + data.Tryouts[2].Total;
      await interaction.channel.send({
        content: `${recruit} has completed their third session and finished with a total score of **${totalTotal}**. Use </check:1148395148535931030> to see their final data.`,
      });
    }
  },
};
