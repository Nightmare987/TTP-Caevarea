const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const { values } = require("../../variables");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Display available commands")
    .addStringOption((option) =>
      option
        .setName("feature")
        .setDescription(`The feature of commands you need help with`)
        .setRequired(true)
        .addChoices(
          { name: `Community`, value: `Community` },
          { name: `Games`, value: `Games` },
          { name: `Recruiter`, value: `Recruiter` }
        )
    ),

  async execute(interaction, client) {
    const feature = interaction.options.getString("feature");
    const member = interaction.member;

    if (
      feature === "Recruiter" &&
      !member.roles.cache.has(values.recruiterRole)
    ) {
      return interaction.reply({
        content: `You do not have permission to see the help page of these commands`,
        ephemeral: true,
      });
    }
    const loadembeds = new EmbedBuilder()
      .setDescription(`⏳ Fetching the ${feature} help list... Stand by`)
      .setColor("#ffd700");

    await interaction.reply({
      embeds: [loadembeds],
      ephemeral: true,
    });

    const commands = fs
      .readdirSync(`./src/commands/${feature}`)
      .filter((file) => file.endsWith(".js"));
    let description = "";
    for (const file of commands) {
      let command = require(`../${feature}/${file}`);
      await client.application.commands.fetch();
      const cmd = client.application.commands.cache.find(
        (cmd) => cmd.name === command.data.name
      );

      description += `\n\n</${command.data.name}:${cmd.id}>: ${command.data.description}`;
    }

    const embedTitle = feature.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`CAEVAREA'S ${embedTitle} COMMANDS`)
      .setColor("#ffd700")
      .setFooter({
        text: "Created By: xNightmid",
        iconURL:
          "https://cdn.discordapp.com/attachments/1120117446922215425/1120530224677920818/NMD-logo_less-storage.png",
      });

    if (feature === "Games") {
      embed.setDescription(
        `**These commands can only be used in <#${values.GamesChannel}>**${description}`
      );
    } else {
      embed.setDescription(`${description}`);
    }

    interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};
