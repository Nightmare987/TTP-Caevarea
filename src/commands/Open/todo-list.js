const { EmbedBuilder, SlashCommandBuilder, blockQuote } = require("discord.js");
const todoSchema = require("../../Schemas.js/todo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo-list")
    .setDescription("Check your to-do list"),

  async execute(interaction) {
    todoSchema.findOne({ UserID: interaction.member.id }, async (err, data) => {
      if (err) throw err;

      if (data) {
        const loadembeds = new EmbedBuilder()
          .setDescription(`⏳ Fetching your to-do list...`)
          .setColor("#ffd700");

        await interaction.reply({
          embeds: [loadembeds],
          ephemeral: true,
        });

        const nembed = new EmbedBuilder()
          .setColor("#ffd700")
          .setTitle(`📝 Here's your to-do list!`)
          .setDescription(
            `${data.Content.map(
              (w, i) =>
                `> Task #${i + 1}:
                                    > **${w.Task}**
                            > *Date Added: ${w.Date}*\n\n
                            `
            ).join(" ")}`
          )
          .setThumbnail(interaction.member.displayAvatarURL());

        interaction.editReply({ embeds: [nembed], ephemeral: true });
      } else {
        const emptyEmbed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription("Your todo list is empty");

        interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
      }
    });
  },
};
