const values = {
  recruiterRole: "1127338436571955230",
  recruiterChannel: "1134320598617686107",
  recruitRole: "1129587595211460669",
  recruitChannel: "1133279577318367242",
  memberRole: "1130668005785878561",
  nomineeRole: "1134250293643726899",
  tryoutsHeaderRole: "1131749408657121351",
  TS1Role: "1131749409936375910",
  TS2Role: "1131749410850738326",
  TS3Role: "1131749411249205249",
  GamesChannel: "1138277700944023582",
  CountingChannel: "1138174873412325457",
  EventsCategory: "1141135709953073173",
  EventsLogChannel: "1141163495539359836",
};

const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} = require("discord.js");

async function pages(pages, interaction) {
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

  const currentPage = await interaction.editReply({
    embeds: [pages[index]],
    components: [buttonRow],
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
        components: [buttonRow],
      })
      .catch(null);
  });
}

module.exports = { values, pages };
