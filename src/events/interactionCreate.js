const {
  Interaction,
  PermissionsBitField,
  EmbedBuilder,
  Collection,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const dmEmbed = new EmbedBuilder()
      .setDescription("**Caevarea cannot be used DMs**")
      .setColor("#A42A04");
    if (!interaction.guild)
      return interaction.reply({
        embeds: [dmEmbed],
        ephemeral: true,
      });

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.log(`\x1b[31m${error}\x1b[0m`);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
