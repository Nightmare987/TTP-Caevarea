const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Create a new recruit"),

  async execute(interaction, client) {
    interaction.reply(`${values.test1}\n\n${values.test2}`);
  },
};