const { EmbedBuilder, SlashCommandBuilder, blockQuote } = require("discord.js");
const todoSchema = require("../../Schemas.js/todo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo-complete")
    .setDescription("Complete a task from your to-do list")
    .addIntegerOption((option) =>
      option
        .setName("number")
        .setDescription("The task number that you finished")
        .setRequired(true)
    ),

  async execute(interaction) {
    const { options, user, member } = interaction;

    const taskId = options.getInteger("number") - 1;

    todoSchema.findOne({ UserID: interaction.member.id }, async (err, data) => {
      if (err) throw err;

      if (data) {
        const loadembedsf = new EmbedBuilder()
          .setDescription(
            `⏳ Completing task #${taskId + 1} off of your to-do list...`
          )
          .setColor("#ffd700");

        await interaction.reply({
          embeds: [loadembedsf],
          ephemeral: true,
        });

        data.Content.splice(taskId, 1);
        data.save();
        const asdf = new EmbedBuilder()
          .setColor("#ffd700")
          .setThumbnail(interaction.member.displayAvatarURL())
          .setDescription(`Nice, task #${taskId + 1} is now completed!`);

        interaction.editReply({ embeds: [asdf], ephemeral: true });
      } else if (data.Content === null) {
        const loadembedsff = new EmbedBuilder()
          .setDescription(`⏳ Checking your to-do list...`)
          .setColor("#ffd700");

        await interaction.reply({
          embeds: [loadembedsff],
          ephemeral: true,
        });

        const nodt = new EmbedBuilder()
          .setColor("#a42a04")
          .setDescription(`❗\`You don't have a task to remove!\``);

        await interaction.editReply({ embeds: [nodt], ephemeral: true });
      }
    });
  },
};
