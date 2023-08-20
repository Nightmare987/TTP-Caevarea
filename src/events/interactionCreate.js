const {
  Interaction,
  PermissionsBitField,
  EmbedBuilder,
  Collection,
} = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const member = interaction.member;
    const commandID = interaction.commandId;
    const commandNAME = interaction.commandName;

    const dmEmbed = new EmbedBuilder()
      .setDescription("**Caevarea cannot be used DMs**")
      .setColor("#A42A04");
    if (!interaction.guild)
      return interaction.reply({
        embeds: [dmEmbed],
        ephemeral: true,
      });

    if (!interaction.isCommand()) return;

    interaction.channel.sendTyping();

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.log(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
