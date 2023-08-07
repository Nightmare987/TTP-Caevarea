const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const { pages } = require("../../paginate");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("guess-info")
    .setDescription("Get additional info on the guess commands"),

  async execute(interaction, client) {
    const embed1 = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Guess-the-number: Command")
      .setDescription(`Next Page: ***Guess-the-number: Results***`)
      .addFields(
        {
          name: "Max",
          value: `The max of the guess game is the number that the game with go up until. In the example below, the max is 200. Therefore, <@${client.user.id}> will only select a random number from 0 - 200.`,
        },
        {
          name: "Guess",
          value: `This is your guess of the number that the bot randomly chooses between 0 and the max`,
        }
      )
      .setImage(
        "https://cdn.discordapp.com/attachments/1132139803555680306/1138220073476169819/Screen_Shot_2023-08-05_at_8.33.59_PM.png"
      )
      .setFooter({
        text: "Created By: xNightmid             Page: 1/4",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });

    const embed2 = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Guess-the-number: Results")
      .setDescription(
        `Next Page: ***Guess-the-number: Additional Information***`
      )
      .addFields({
        name: "Points",
        value: `*See page 4 for point calculations*
        The points you may gain or lose are based off your \`Guess\`(G) in comparison to 5 stages of your \`Max\`:
          \`Jackpot\`(J), \`Lowest\`(L), \`Lowest - Extra\`(LE), \`Highest - Extra\`(HE), and \`Highest\`(H).
          **MidZone: \`L\` - \`H\`**
          > The range in which you can get points. If your guess is outside of this range, you will lose points.
          **Goldylock Zone\`LE\` - \`HE\`**
          > This range is in the \`MidZone\`. If your guess is in this zone, you will gain extra points
          **Nightmare Valley\`0\` - \`L\`, \`H\` - \`Max\` **
          > If your \`guess\` is in either of these 1/2 ranges(depends on the \`J\`), you will lose some amount of points`,
      })
      .setImage(
        "https://cdn.discordapp.com/attachments/1132139803555680306/1138220087137017916/guess-showcase.jpg"
      )
      .setFooter({
        text: "Created By: xNightmid             Page: 2/4",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });

    const embed3 = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Guess-the-number: Additional Information")
      .setDescription(`Next Page: ***Guess-the-number: Zones Visualized***`)
      .addFields({
        name: "Conversions",
        value: `If the jackpot is close enough to 0 or the set \`Max\`, the ranges might get cut short. In this situation, the parts that are under \`0\`, or over \`Max\` will be added to the other side of the number line`,
      })
      .setImage(
        "https://cdn.discordapp.com/attachments/1132139803555680306/1138220100437160018/over-under-showcase.jpg"
      )
      .setFooter({
        text: "Created By: xNightmid             Page: 3/4",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });

    const embed4 = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("Guess-the-number: Point Calulation & Zones Visualized")
      .setDescription("**See image below for zone visualization**")
      .addFields({
        name: "Point Calculations",
        value: `**Nightmare Valley:** subtract \`Max * 0.3\`, from your total points
        **MidZone:** add \`Max * 0.5\` to your total points
        **Goldylock Zone:** add the \`max\` to your total points
        **Jackpot:** add \`Max * 3\` to your total points`,
      })
      .setImage(
        "https://cdn.discordapp.com/attachments/1132139803555680306/1138220117965144205/zone-showcase.jpg"
      )
      .setFooter({
        text: "Created By: xNightmid             Page 4/4",
        iconURL:
          "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
      });

    const p = [embed1, embed2, embed3, embed4];
    await pages(p, interaction);
  },
};
