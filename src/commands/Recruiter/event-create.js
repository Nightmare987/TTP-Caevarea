const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const eventsSchema = require("../../Schemas.js/events");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("event-create")
    .setDescription("Create a event")
    .addStringOption((option) =>
      option
        .setName("event-name")
        .setDescription("The name of the event - Ex. Sunday Funday")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("event-date")
        .setDescription(
          "The date and time of this event - Ex. August 20th @ 9est"
        )
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("event-size")
        .setDescription("The amount of people that can register before subs")
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(24)
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription(
          "The message to send with the event creation - Optional"
        )
    ),

  async execute(interaction, client) {
    const member = interaction.member;

    const eventName = interaction.options.getString("event-name");
    const eventDate = interaction.options.getString("event-date");
    const eventSize = interaction.options.getInteger("event-size");
    const eventMessage = interaction.options.getString("message");

    if (!member.roles.cache.has(values.recruiterRole)) {
      return interaction.reply({
        content: `You do not have permsission to use this command`,
        ephemeral: true,
      });
    }

    const loadEmbed = new EmbedBuilder()
      .setColor("#ffd700")
      .setDescription(`Creating **${eventName}**...`);

    interaction.reply({ embeds: [loadEmbed], ephemeral: true });

    const partRole = await interaction.guild.roles.create({
      name: `${eventName} Participant`,
      color: "#C0C0C0",
    });
    const subRole = await interaction.guild.roles.create({
      name: `${eventName} Sub`,
      color: "#C0C0C0",
    });

    // embed
    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle(`${eventName}`)
      .setDescription(`**Date: ${eventDate}**\n**Size: ${eventSize}**`)
      .addFields({
        name: "Creator",
        value: `${interaction.user}`,
        inline: false,
      })
      .setThumbnail(`${interaction.guild.iconURL()}`);

    if (eventMessage !== null) {
      embed.setFields(
        { name: `Creator`, value: `${member}` },
        { name: `Message`, value: `${eventMessage}` }
      );
    }
    //buttons
    const registerPart = new ButtonBuilder()
      .setLabel("Reg-Participant")
      .setCustomId("regPart")
      .setStyle(ButtonStyle.Primary);
    const registerSub = new ButtonBuilder()
      .setLabel("Reg-Sub")
      .setCustomId("regSub")
      .setStyle(ButtonStyle.Primary);
    const unregister = new ButtonBuilder()
      .setLabel("Unregister")
      .setCustomId("unreg")
      .setStyle(ButtonStyle.Danger);
    const list = new ButtonBuilder()
      .setLabel("List")
      .setEmoji("📃")
      .setCustomId("list")
      .setStyle(ButtonStyle.Success);
    const complete = new ButtonBuilder()
      .setLabel("Complete")
      .setEmoji("✅")
      .setCustomId("complete")
      .setStyle(ButtonStyle.Secondary);
    // row
    const row = new ActionRowBuilder().addComponents(
      registerPart,
      registerSub,
      unregister,
      list,
      complete
    );

    // create channel
    const channel = await interaction.guild.channels.create({
      name: `${eventName}`,
      type: ChannelType.GuildText,
      parent: values.EventsCategory,
      permissionOverwrites: [
        {
          id: values.memberRole,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    loadEmbed.setDescription(`**${eventName}** has been created: ${channel}`);

    interaction.editReply({
      embeds: [loadEmbed],
    });
    const msg = await channel.send({
      content: `<@&${values.memberRole}>`,
      embeds: [embed],
      components: [row],
    });
    msg.pin();

    await eventsSchema.create({
      MessageID: msg.id,
      EventName: eventName,
      EventDate: eventDate,
      ChannelID: channel.id,
      Owner: interaction.user.id,
      PartRole: partRole.id,
      SubRole: subRole.id,
      Size: eventSize,
      Participants: [],
      Subs: [],
    });
  },
};
