const {
  Interaction,
  PermissionsBitField,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Collection,
  AttachmentBuilder,
} = require("discord.js");
const { makeFile } = require("../variables");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    const dmEmbed = new EmbedBuilder()
      .setDescription("**Caevarea cannot be used in DMs**")
      .setColor("#A42A04");
    if (!interaction.guild && !interaction.isButton()) {
      return interaction.reply({
        embeds: [dmEmbed],
        ephemeral: true,
      });
    }

    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.log(`\x1b[31m${error.stack}\x1b[0m`);

      const [fileName, filePath] = makeFile(error.stack);

      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });

      if (fileName && filePath) {
        const dmEmbed = new EmbedBuilder()
          .setColor("Red")
          .setTitle("Error Occured")
          .setFields(
            {
              name: `Command`,
              value: `</${interaction.commandName}:${interaction.commandId}>`,
            },
            { name: `File Name`, value: `\`\`\`${fileName}\`\`\`` },
            { name: `File Path`, value: `\`\`\`${filePath}\`\`\`` }
          );
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("fileDel")
            .setEmoji("🚮")
            .setStyle(ButtonStyle.Danger)
        );
        const attachment = new AttachmentBuilder(filePath, { name: fileName });
        const me = await interaction.guild.members.fetch("943623503624667237");
        me.send({ embeds: [dmEmbed], files: [attachment], components: [row] });
      }
    }
  },
};
