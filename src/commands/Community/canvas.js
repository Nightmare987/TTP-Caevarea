const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("canvas")
    .setDescription("test canvas"),

  async execute(interaction, client) {
    interaction.reply({ content: "Creating canvas", ephemeral: true });
    
    const canvas = createCanvas(3756, 2496);
    const ctx = canvas.getContext("2d");

    // background
    const bgImage = await loadImage("./src/stone-wall.png");
    // center fill
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

    const buffer = canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer, { name: "image.png" });

    interaction.editReply({ conent: "", files: [attachment], ephemeral: true });
  },
};
