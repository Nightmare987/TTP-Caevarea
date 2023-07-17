const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const todoSchema = require("../../Schemas.js/todo");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("todo")
    .setDescription("Manage your to-do list!")
    .setDMPermission(true)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a task to your to-do list")
        .addStringOption((option) =>
          option
            .setName("task")
            .setDescription("The task to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("complete")
        .setDescription("Complete a task from your to-do list")
        .addIntegerOption((option) =>
          option
            .setName("number")
            .setDescription("The task number that you finished")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("list").setDescription("Check your to-do list")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clear all your tasks from your to-do list")
    ),

  async execute(interaction) {

    const { options, user, member } = interaction;

    const sub = options.getSubcommand(["add", "list", "complete", "clear"]);
    const task = options.getString("task");
    const taskId = options.getInteger("number") - 1;
    const taskDate = new Date(
      interaction.createdTimestamp
    ).toLocaleDateString();

    switch (sub) {
      case "add":
        todoSchema.findOne(
          { UserID: interaction.member.id },
          async (err, data) => {
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
          }
        );

        break;
      case "list":
        todoSchema.findOne(
          { UserID: interaction.member.id },
          async (err, data) => {
            if (err) throw err;

            if (data) {
              const loadembeds = new EmbedBuilder()
                .setDescription(`⏳ Fetching your to-do list...`)
                .setColor("#ffd700");

              await interaction.reply({ embeds: [loadembeds], ephemeral: true });

              const nembed = new EmbedBuilder()
                .setColor("#ffd700")
                .setTitle(`📝 Here's your to-do list!`)
                .setDescription(
                  `${data.Content.map(
                    (w, i) =>
                      `> Task #${i + 1}:
                                    **${w.Task}**
                            *Date Added: ${w.Date}*\n\n
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
          }
        );

        break;
      case "complete":
        todoSchema.findOne(
          { UserID: interaction.member.id },
          async (err, data) => {
            if (err) throw err;

            if (data) {
              const loadembedsf = new EmbedBuilder()
                .setDescription(
                  `⏳ Completing task #${taskId + 1} off of your to-do list...`
                )
                .setColor("#ffd700");

              await interaction.reply({ embeds: [loadembedsf], ephemeral: true });

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

              await interaction.reply({ embeds: [loadembedsff], ephemeral: true });

              const nodt = new EmbedBuilder()
                .setColor("#a42a04")
                .setDescription(`❗\`You don't have a task to remove!\``);

              await interaction.editReply({ embeds: [nodt], ephemeral: true });
            }
          }
        );
        break;
      case "clear":
        todoSchema.findOne(
          { UserID: interaction.member.id },
          async (err, data) => {
            if (err) throw err;

            if (data) {
              const loadembedsff = new EmbedBuilder()
                .setDescription(`⏳ Clearing your to-do list...`)
                .setColor("#ffd700");

              await interaction.reply({ embeds: [loadembedsff], ephemeral: true });

              await todoSchema.findOneAndDelete({
                nUserID: interaction.member.id,
              });
              const asdfasdf = new EmbedBuilder()
                .setColor("#ffd700")
                .setDescription(`✔ Success!\n➥ Deleted your to-do list!`);

              await interaction.editReply({ embeds: [asdfasdf], ephemeral: true });
            } else {
              const loademdbedsff = new EmbedBuilder()
                .setDescription(`⏳ Checking your to-do list...`)
                .setColor("#ffd700");

              await interaction.reply({ embeds: [loademdbedsff], ephemeral: true });

              const ssss = new EmbedBuilder()
                .setDescription(`❗\`You have no to-do list to clear!\``)
                .setColor("#a42a04");

              await interaction.editReply({ embeds: [ssss], ephemeral: true });
            }
          }
        );
        break;
    }
  },
};
