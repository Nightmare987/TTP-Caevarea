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

    const embed = new EmbedBuilder()
      .setTitle("MISSING PERMISSIONS")
      .setColor("#A42A04")
      .setDescription(
        `You do not have permissions to run </${commandNAME}:${commandID}>`
      )
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1120117446922215425/1120530224677920818/NMD-logo_less-storage.png",
      });

    if (!interaction.isCommand()) return;

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
