const values = {
  recruiterRole: "855569911056302090",
  recruiterChannel: "875595683078500362",
  recruitRole: "893310092194246696",
  recruitChannel: "855573183998722108",
  memberRole: "855569315473391676",
  nomineeRole: "1144020830758645800",
  tryoutsHeaderRole: "1144020832327319674",
  TS1Role: "1144020833740795914",
  TS2Role: "1144020834449637426",
  TS3Role: "1144020835468857365",
  GamesChannel: "1144021177254281406",
  EventsCategory: "868243382810574859",
  EventsLogChannel: "1144022193873891429",
};

const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
} = require("discord.js");

async function pages(pages, interaction, more) {
  if (!interaction) throw new Error("Provide an interaction argument");
  if (!pages) throw new Error("Provide a page argument");
  if (!Array.isArray(pages)) throw new Error("Pages must be an array");

  await interaction.deferReply({ ephemeral: true });

  if (pages.length === 1) {
    const page = await interaction.editReply({
      embeds: pages,
      components: [],
      ephemeral: true,
      fetchReply: true,
    });

    return page;
  }
  const prev = new ButtonBuilder()
    .setCustomId("page-prev")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const none = new ButtonBuilder()
    .setCustomId("page-none")
    .setEmoji("⏹️")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const next = new ButtonBuilder()
    .setCustomId("page-next")
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Primary);

  const buttonRow = new ActionRowBuilder().addComponents(prev, none, next);
  let index = 0;

  let currentPage;
  if (!more) {
    currentPage = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttonRow],
      ephemeral: true,
      fetchReply: true,
    });
  } else {
    currentPage = await interaction.editReply({
      embeds: [pages[index]],
      components: [buttonRow, more],
      ephemeral: true,
      fetchReply: true,
    });
  }

  const collector = await currentPage.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id)
      return await i.reply({
        content: "You can't use these buttons",
        ephemeral: true,
      });

    if (i.customId == "page-prev") {
      if (index > 0) index--;
    } else if (i.customId == "page-none") {
      index = 0;
    } else if (i.customId == "page-next") {
      if (index < pages.length - 1) index++;
    }

    if (index == 0) prev.setDisabled(true);
    else prev.setDisabled(false);

    if (index == 0) none.setDisabled(true);
    else none.setDisabled(false);

    if (index == pages.length - 1) next.setDisabled(true);
    else next.setDisabled(false);

    if (!more) {
      await i
        .update({
          embeds: [pages[index]],
          components: [buttonRow],
        })
        .catch(null);
    } else {
      await i
        .update({
          embeds: [pages[index]],
          components: [buttonRow, more],
        })
        .catch(null);
    }
  });
}

async function pageYes(pages, interaction, more, add) {
  if (!interaction) throw new Error("Provide an interaction argument");
  if (!pages) throw new Error("Provide a page argument");
  if (!Array.isArray(pages)) throw new Error("Pages must be an array");

  if (pages.length === 1) {
    const page = await interaction.update({
      embeds: pages,
      components: [more],
      ephemeral: true,
      fetchReply: true,
    });

    return page;
  }
  const prev = new ButtonBuilder()
    .setCustomId("page-prev")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const none = new ButtonBuilder()
    .setCustomId("page-none")
    .setEmoji("⏹️")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const next = new ButtonBuilder()
    .setCustomId("page-next")
    .setEmoji("▶️")
    .setStyle(ButtonStyle.Primary);

  const buttonRow = new ActionRowBuilder().addComponents(prev, none, next);
  let index = 0;

  const loadEmbed = new EmbedBuilder()
    .setColor("#ffd700")
    .setDescription(`Loading ${add}'s data...`);

  await interaction.update({
    embeds: [loadEmbed],
    components: [buttonRow, more],
  });

  const currentPage = await interaction.editReply({
    embeds: [pages[index]],
    components: [buttonRow, more],
    ephemeral: true,
    fetchReply: true,
  });

  const collector = await currentPage.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== interaction.user.id)
      return await i.reply({
        content: "You can't use these buttons",
        ephemeral: true,
      });

    if (i.customId == "page-prev") {
      if (index > 0) index--;
    } else if (i.customId == "page-none") {
      index = 0;
    } else if (i.customId == "page-next") {
      if (index < pages.length - 1) index++;
    }

    if (index == 0) prev.setDisabled(true);
    else prev.setDisabled(false);

    if (index == 0) none.setDisabled(true);
    else none.setDisabled(false);

    if (index == pages.length - 1) next.setDisabled(true);
    else next.setDisabled(false);

    await i
      .update({
        embeds: [pages[index]],
        components: [buttonRow, more],
      })
      .catch(null);
  });
}

module.exports = { values, pages, pageYes };
