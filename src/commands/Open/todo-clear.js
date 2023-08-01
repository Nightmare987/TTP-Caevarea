const { EmbedBuilder, SlashCommandBuilder, blockQuote } = require("discord.js");
const todoSchema = require("../../Schemas.js/todo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo-clear")
    .setDescription("Clear all your tasks from your to-do list"),
  async execute(interaction) {
    const { options, user, member } = interaction;

    todoSchema.findOne({ UserID: interaction.member.id }, async (err, data) => {
      if (err) throw err;

      if (data) {
        const loadembedsff = new EmbedBuilder()
          .setDescription(`⏳ Clearing your to-do list...`)
          .setColor("#ffd700");

        await interaction.reply({
          embeds: [loadembedsff],
          ephemeral: true,
        });

        await todoSchema.findOneAndDelete({
          nUserID: interaction.member.id,
        });
        const asdfasdf = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(`✔ Success!\n➥ Deleted your to-do list!`);

        await interaction.editReply({
          embeds: [asdfasdf],
          ephemeral: true,
        });
      } else {
        const loademdbedsff = new EmbedBuilder()
          .setDescription(`⏳ Checking your to-do list...`)
          .setColor("#ffd700");

        await interaction.reply({
          embeds: [loademdbedsff],
          ephemeral: true,
        });

        const ssss = new EmbedBuilder()
          .setDescription(`❗\`You have no to-do list to clear!\``)
          .setColor("#a42a04");

        await interaction.editReply({ embeds: [ssss], ephemeral: true });
      }
    });
  },
};
