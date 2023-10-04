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

const fs = require("fs");
const path = require("path");
function makeFile(error) {
  const folderPath = "./src/errors/";

  // format date
  const now = new Date();
  now.setHours(now.getHours() - 5); // Adjust to Central Standard Time (CST)
  const isoString = now.toISOString();

  // Extract date and time components
  const [datePart, timePart] = isoString.split("T");
  let [date, time] = [datePart, timePart.split(".")[0]];
  date = date.slice(5);

  // Format the time in 12-hour format
  const [hour, minute, second] = time.split(":");
  const ampm = parseInt(hour) >= 12 ? "PM" : "AM";
  const formattedHour = parseInt(hour) % 12 || 12;

  // Create the custom formatted string
  const fileName = `${date} T-${formattedHour}-${minute}-${second}${ampm}.txt`;

  //const fileName = `${currentdate.getDay()}-${currentdate.getMonth()}-${currentdate.getFullYear()}---${currentdate.getHours()}-${currentdate.getMinutes()}-${currentdate.getSeconds()}.txt`;
  // Create a file in the specified folder and write the error message to it
  const filePath = path.join(folderPath, fileName);
  const errStr = error.toString();
  fs.writeFile(filePath, errStr, (err) => {
    if (err) {
      console.error("Error writing error message to file:", err);
    } else {
      console.log(
        `\x1b[1m\x1b[32mError message saved to:   ${filePath}\x1b[0m`
      );
    }
  });
  return [fileName, filePath];
}

const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  AttachmentBuilder,
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

async function pageYes(pages, interaction, more) {
  if (!interaction) throw new Error("Provide an interaction argument");
  if (!pages) throw new Error("Provide a page argument");
  if (!Array.isArray(pages)) throw new Error("Pages must be an array");

  if (pages.length === 1) {
    const page = await interaction.editReply({
      files: pages,
      embeds: [],
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

  const currentPage = await interaction.editReply({
    files: [pages[index]],
    embeds: [],
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
        files: [pages[index]],
        components: [buttonRow, more],
      })
      .catch(null);
  });
}
/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
// CANVAS
const { createCanvas, loadImage } = require("canvas");
const Font = require("canvas").registerFont("./src/arial-font.ttf", {
  family: "MyArial",
});

async function canvasSession(
  recruitName,
  recruiter,
  sessionNum,
  avatarUrl,
  vibeScore,
  skillScore,
  strategyScore,
  comment
) {
  const canvas = createCanvas(939, 624);
  const ctx = canvas.getContext("2d");

  function x(base) {
    const ratio = base / 3756;
    return canvas.width * ratio;
  }

  function y(base) {
    const ratio = base / 2496;
    return canvas.height * ratio;
  }

  const normalFontSize = y(150);

  function TextSpacement(base) {
    return base + y(200);
  }

  // Function to split text into lines and render them
  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const testWidth = context.measureText(testLine).width;
      if (testWidth > maxWidth && i > 0) {
        context.fillText(line, x, y);
        line = words[i] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }

    context.fillText(line, x, y);
  }

  function roundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Function to calculate the text width
  function getTextWidth(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  // background
  const bgImage = await loadImage("./src/vines.png");
  const hRatio = canvas.width / bgImage.width;
  const vRatio = canvas.height / bgImage.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - bgImage.width * ratio) / 2;
  const centerShift_y = (canvas.height - bgImage.height * ratio) / 2;
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    centerShift_x,
    centerShift_y,
    bgImage.width * ratio,
    bgImage.height * ratio
  );
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.70)";
  ctx.fill();

  //avatar
  const avatarImage = await loadImage(avatarUrl);

  ctx.save();
  roundedRect(ctx, x(2506), y(150), x(1100), y(1100), 0.03 * x(1100));
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(x(2506), y(150), x(1100), y(1100));
  ctx.restore();

  ctx.save();
  roundedRect(ctx, x(2556), y(200), x(1000), y(1000), 0.03 * x(1000));
  ctx.clip();
  ctx.drawImage(avatarImage, x(2556), y(200), x(1000), y(1000));
  ctx.restore();

  // title
  // Define text properties
  ctx.font = `bold ${y(300)}px MyArial`;
  ctx.shadowOffsetX = x(-15);
  ctx.shadowOffsetY = y(15);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "White";
  // add text
  ctx.fillText(`Session #: ${sessionNum}`, x(150), y(150));

  // recruit name
  let maxWidth = x(800); // Maximum width for the text
  // Adjust font size to fit within maxWidth
  let recruitNameFontSize = y(300);
  while (
    getTextWidth(recruitName, `bold ${recruitNameFontSize}px MyArial`) >
    maxWidth
  ) {
    recruitNameFontSize--;
  }
  ctx.font = `bold ${recruitNameFontSize}px MyArial`;
  ctx.fillText(recruitName, x(2556 + 100), y(1200 + 50));

  // recruiter
  ctx.font = `bold ${normalFontSize}px MyArial`;
  ctx.fillText(`Recruiter: ${recruiter}`, x(150), y(550));

  // scores
  const yScoresHeaders = y(800);
  const yScores = TextSpacement(yScoresHeaders);
  const spacing = x(700);
  const xVibeStart = x(150);
  const xSkillStart = xVibeStart + spacing;
  const xStrategyStart = xSkillStart + spacing;
  // headers
  ctx.fillText("Vibe", xVibeStart, yScoresHeaders);
  ctx.fillText("Skill", xSkillStart, yScoresHeaders);
  ctx.fillText("Strategy", xStrategyStart, yScoresHeaders);
  ctx.font = `${normalFontSize}px MyArial`;
  ctx.fillText(vibeScore, xVibeStart, yScores);
  ctx.fillText(skillScore, xSkillStart, yScores);
  ctx.fillText(strategyScore, xStrategyStart, yScores);
  // total score
  ctx.font = `bold ${normalFontSize}px MyArial`;
  ctx.fillText(
    `Total: ${vibeScore + skillScore + strategyScore}`,
    x(150),
    TextSpacement(yScores) + y(50)
  );

  // comment
  const yComment = y(1500);
  ctx.fillText("Comment", x(150), yComment);
  const lineHeight = y(160); // Height between lines

  // Call the wrapText function to render the wrapped text
  ctx.font = `${normalFontSize}px MyArial`;
  maxWidth = x(3600);
  wrapText(ctx, comment, x(150), TextSpacement(yComment), maxWidth, lineHeight);

  const buffer = canvas.toBuffer("image/png");
  return new AttachmentBuilder(buffer, {
    name: `${recruitName}-session_${sessionNum}.png`,
  });
}
/**
 *
 *
 *
 */
async function canvasTotal(
  recruitName,
  avatarUrl,
  vibeTotalScore,
  skillTotalScore,
  strategyTotalScore
) {
  const canvas = createCanvas(939, 350);
  const ctx = canvas.getContext("2d");

  function x(base) {
    const ratio = base / 3756;
    return canvas.width * ratio;
  }

  function y(base) {
    const ratio = base / 1400;
    return canvas.height * ratio;
  }

  const normalFontSize = y(150);

  function TextSpacement(base) {
    return base + y(200);
  }

  function roundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Function to calculate the text width
  function getTextWidth(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  // background
  const bgImage = await loadImage("./src/vines.png");
  const hRatio = canvas.width / bgImage.width;
  const vRatio = canvas.height / bgImage.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - bgImage.width * ratio) / 2;
  const centerShift_y = (canvas.height - bgImage.height * ratio) / 2;
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    centerShift_x,
    centerShift_y,
    bgImage.width * ratio,
    bgImage.height * ratio
  );
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.70)";
  ctx.fill();

  //avatar
  const avatarImage = await loadImage(avatarUrl);

  ctx.save();
  roundedRect(ctx, x(150), y(150), x(1100), y(1100), 0.03 * x(1100));
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(x(150), y(150), x(1100), y(1100));
  ctx.restore();

  ctx.save();
  roundedRect(ctx, x(200), y(200), x(1000), y(1000), 0.03 * x(1000));
  ctx.clip();
  ctx.drawImage(avatarImage, x(200), y(200), x(1000), y(1000));
  ctx.restore();

  // title
  // Define text properties
  ctx.shadowOffsetX = x(-15);
  ctx.shadowOffsetY = y(15);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "White";
  // add text
  let maxWidth = x(2000);
  let titleFontSize = y(300);
  while (
    getTextWidth(`${recruitName}'s Totals`, `bold ${titleFontSize}px MyArial`) >
    maxWidth
  ) {
    titleFontSize--;
  }
  ctx.font = `bold ${titleFontSize}px MyArial`;
  ctx.fillText(`${recruitName}'s Totals`, x(1350), y(225));

  // total points
  ctx.font = `bold ${normalFontSize}px MyArial`;
  ctx.fillText(
    `Total Points: ${vibeTotalScore + skillTotalScore + strategyTotalScore}`,
    x(1350),
    y(525)
  );

  // inidivisual totals
  const yScoresHeaders = y(775);
  const yScores = TextSpacement(yScoresHeaders);
  const spacing = x(700);
  const xVibeStart = x(1350);
  const xSkillStart = xVibeStart + spacing;
  const xStrategyStart = xSkillStart + spacing;
  // headers
  ctx.fillText("Vibe", xVibeStart, yScoresHeaders);
  ctx.fillText("Skill", xSkillStart, yScoresHeaders);
  ctx.fillText("Strategy", xStrategyStart, yScoresHeaders);
  ctx.font = `${normalFontSize}px MyArial`;
  ctx.fillText(vibeTotalScore, xVibeStart, yScores);
  ctx.fillText(skillTotalScore, xSkillStart, yScores);
  ctx.fillText(strategyTotalScore, xStrategyStart, yScores);

  const buffer = canvas.toBuffer("image/png");
  return new AttachmentBuilder(buffer, {
    name: `${recruitName}-totals_data.png`,
  });
}
/**
 *
 *
 *
 *
 *
 *
 *
 */

async function canvasStatus(
  recruitName,
  avatarUrl,
  vibeTotalScore,
  skillTotalScore,
  strategyTotalScore,
  status
) {
  const canvas = createCanvas(939, 350);
  const ctx = canvas.getContext("2d");

  function x(base) {
    const ratio = base / 3756;
    return canvas.width * ratio;
  }

  function y(base) {
    const ratio = base / 1400;
    return canvas.height * ratio;
  }

  const normalFontSize = y(150);

  function TextSpacement(base) {
    return base + y(200);
  }

  function roundedRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Function to calculate the text width
  function getTextWidth(text, font) {
    ctx.font = font;
    return ctx.measureText(text).width;
  }

  // background
  const bgImage = await loadImage("./src/vines.png");
  const hRatio = canvas.width / bgImage.width;
  const vRatio = canvas.height / bgImage.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - bgImage.width * ratio) / 2;
  const centerShift_y = (canvas.height - bgImage.height * ratio) / 2;
  ctx.drawImage(
    bgImage,
    0,
    0,
    bgImage.width,
    bgImage.height,
    centerShift_x,
    centerShift_y,
    bgImage.width * ratio,
    bgImage.height * ratio
  );
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.70)";
  ctx.fill();

  //avatar
  const avatarImage = await loadImage(avatarUrl);

  ctx.save();
  roundedRect(ctx, x(150), y(150), x(1100), y(1100), 0.03 * x(1100));
  ctx.clip();
  ctx.fillStyle = "rgba(255, 255, 255, 1)";
  ctx.fillRect(x(150), y(150), x(1100), y(1100));
  ctx.restore();

  ctx.save();
  roundedRect(ctx, x(200), y(200), x(1000), y(1000), 0.03 * x(1000));
  ctx.clip();
  ctx.drawImage(avatarImage, x(200), y(200), x(1000), y(1000));
  ctx.restore();

  // title
  // Define text properties
  ctx.shadowOffsetX = x(-15);
  ctx.shadowOffsetY = y(15);
  ctx.shadowBlur = 0;
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.textBaseline = "hanging";
  ctx.fillStyle = "White";
  // add text
  let maxWidth = x(2000);
  let titleFontSize = y(300);
  while (
    getTextWidth(
      `${recruitName}'s Tryouts`,
      `bold ${titleFontSize}px MyArial`
    ) > maxWidth
  ) {
    titleFontSize--;
  }
  ctx.font = `bold ${titleFontSize}px MyArial`;
  ctx.fillText(`${recruitName}'s Tryouts`, x(1350), y(100));

  // total points
  ctx.font = `bold ${normalFontSize}px MyArial`;
  ctx.fillText(
    `Total Points: ${vibeTotalScore + skillTotalScore + strategyTotalScore}`,
    x(1350),
    y(400)
  );

  // inidivisual totals
  const yScoresHeaders = y(650);
  const yScores = TextSpacement(yScoresHeaders);
  const spacing = x(700);
  const xVibeStart = x(1350);
  const xSkillStart = xVibeStart + spacing;
  const xStrategyStart = xSkillStart + spacing;
  // headers
  ctx.fillText("Vibe", xVibeStart, yScoresHeaders);
  ctx.fillText("Skill", xSkillStart, yScoresHeaders);
  ctx.fillText("Strategy", xStrategyStart, yScoresHeaders);
  ctx.font = `${normalFontSize}px MyArial`;
  ctx.fillText(vibeTotalScore, xVibeStart, yScores);
  ctx.fillText(skillTotalScore, xSkillStart, yScores);
  ctx.fillText(strategyTotalScore, xStrategyStart, yScores);

  // status
  ctx.font = `bold ${normalFontSize}px MyArial`;
  ctx.fillText(`Status: ${status}`, x(1350), yScores + y(250));

  const buffer = canvas.toBuffer("image/png");
  return new AttachmentBuilder(buffer, {
    name: `${recruitName}-totals_data.png`,
  });
}

module.exports = {
  values,
  pages,
  pageYes,
  makeFile,
  canvasSession,
  canvasTotal,
  canvasStatus,
};
