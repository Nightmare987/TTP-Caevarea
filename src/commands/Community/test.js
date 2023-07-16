const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Check all tryouts for a recruit"),

  async execute(interaction) {
    //1129587595211460669
    const role = interaction.guild.roles.cache
      .get("1129587595211460669")
      .members.map((r) => `<@${r.user.id}>`);
    console.log(role);
  },
};
