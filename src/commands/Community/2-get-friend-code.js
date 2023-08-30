const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const friendSchema = require("../../Schemas.js/friend");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("friend-code-get")
    .setDescription("Get your or another users friend code")
    .addStringOption((option) =>
      option
        .setName("user")
        .setDescription("The user to get the friend code for")
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const docs = await friendSchema.find();

    let choices = [];
    await docs.forEach(async (doc) => {
      choices.push({ name: doc.UserName, id: doc.UserID });
    });

    const filtered = choices.filter((choice) =>
      choice.name.toLowerCase().includes(value)
    );

    if (!interaction) return;

    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.id }))
    );
  },

  async execute(interaction) {
    const userString = interaction.options.getString("user");
    const user = await interaction.guild.members.fetch(userString);

    if (userString === null) {
      const data = await friendSchema.findOne({ UserID: interaction.user.id });
      if (!data) {
        interaction.reply({
          content: `You do not have a friend code set. Use </friend-code-set:1134589356695355525> to set one`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `<@${interaction.user.id}>: **${data.Code}**`,
        });
      }
    } else {
      const data = await friendSchema.findOne({ UserID: user.id });
      if (!data) {
        interaction.reply({
          content: `${user} does not have a friend code set`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `${user}: **${data.Code}**`,
          ephemeral: true,
        });
      }
    }
  },
};
