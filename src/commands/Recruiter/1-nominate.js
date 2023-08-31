const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const pollSchema = require("../../Schemas.js/votes");
const { values } = require("../../variables");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("nominate")
    .setDescription("Create a poll to nominate a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user that this nomination is for")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.options.getMember("user");
    const userMem = interaction.member;
    const user = member.id;
    const interactor = interaction.user.id;

    if (!userMem.roles.cache.has(values.recruiterRole))
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
    if (
      member.roles.cache.hasAny(
        values.nomineeRole,
        values.recruitRole,
        values.memberRole
      )
    ) {
      return interaction.reply({
        content: `<@${user}> is already a <@&${values.nomineeRole}>, <@&${values.recruitRole}>, or <@&${values.memberRole}>`,
        ephemeral: true,
      });
    }

    member.roles.add(values.nomineeRole);

    const startMessage = await interaction.reply({
      content: `start`,
      ephemeral: true,
    });
    setTimeout(() => startMessage.delete(), 100);

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("New Recruit Nomination")
      .addFields(
        { name: "Nominee", value: `> <@${user}>`, inline: false },
        { name: "Initiator", value: `> ${interaction.user}`, inline: false },
        { name: "Upvotes", value: `> **No votes**`, inline: true },
        { name: "Downvotes", value: `> **No votes**`, inline: true }
      )
      .setTimestamp();

    let votebutton;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("up")
        .setLabel("Upvote")
        .setEmoji("📈")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("down")
        .setLabel("Downvote")
        .setEmoji("📉")
        .setStyle(ButtonStyle.Primary),

      (votebutton = new ButtonBuilder()
        .setCustomId("votes")
        .setLabel("Votes")
        .setEmoji("📃")
        .setStyle(ButtonStyle.Success)),
      new ButtonBuilder()
        .setCustomId("nominate")
        .setLabel("Nominate")
        .setEmoji("🏁")
        .setStyle(ButtonStyle.Secondary)
    );

    const massage = await interaction.channel.send({
      content: `<@&${values.recruiterRole}>`,
      embeds: [embed],
      components: [buttons],
    });
    await massage.pin();

    await pollSchema.create({
      Msg: massage.id,
      Nominee: user,
      Upvote: 0,
      Downvote: 0,
      Upmembers: [],
      Downmembers: [],
      Owner: interactor,
      Guild: interaction.guild.id,
    });
  },
};
