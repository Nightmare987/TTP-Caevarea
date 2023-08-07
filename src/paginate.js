const { EmbedBuilder } = require("@discordjs/builders");
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
    .setCustomId("prev")
    .setEmoji("◀️")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const none = new ButtonBuilder()
    .setCustomId("none")
    .setEmoji("⏹️")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(true);

  const next = new ButtonBuilder()
    .setCustomId("next")
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

    if (i.customId == "prev") {
      if (index > 0) index--;
    } else if (i.customId == "none") {
      index = 0;
    } else if (i.customId == "next") {
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

module.exports = { pages };
