const { EmbedBuilder, SlashCommandBuilder, blockQuote } = require("discord.js");
const todoSchema = require("../../Schemas.js/todo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo-add")
    .setDescription("Add a task to your to-do list")
    .addStringOption((option) => option
      .setName("task")
      .setDescription("The task to add")
      .setRequired(true)
    ),

  async execute(interaction) {
    const { options, user, member } = interaction;

    const task = options.getString("task");
    const taskDate = new Date(
      interaction.createdTimestamp
    ).toLocaleDateString();

    todoSchema.findOne({ UserID: interaction.member.id }, async (err, data) => {
      if (err) throw err;

      if (!data) {
        data = new todoSchema({
          UserID: interaction.member.id,
          Content: [
            {
              Task: task,
              Date: taskDate,
            },
          ],
        });
      } else {
        const taskContent = {
          Task: task,
          Date: taskDate,
        };
        data.Content.push(taskContent);
      }
      data.save();

      try {
        const loadembeds = new EmbedBuilder()
          .setDescription(`⏳ Adding **${task}** to your to-do list...`)
          .setColor("#ffd700");

        await interaction.reply({ embeds: [loadembeds], ephemeral: true });

        const asdfembed = new EmbedBuilder()
          .setColor("#ffd700")
          .setDescription(
            `✔ Success! **${task}** was added to your to-do list!`
          );

        interaction.editReply({ embeds: [asdfembed], ephemeral: true });
      } catch (err) {
        console.log(err);
      }
    });
  },
};
