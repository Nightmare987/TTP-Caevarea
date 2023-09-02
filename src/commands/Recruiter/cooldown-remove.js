const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { values } = require("../../variables");
const cooldownSchema = require("../../Schemas.js/cooldown");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-cooldown")
    .setDescription(
      "Removes the coodlown for the /available command for a specified user"
    )
    .addStringOption((option) =>
      option
        .setName("recruit")
        .setDescription("The recruit to remove the coodlown for")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction) {
    const value = interaction.options.getFocused().toLowerCase();
    const docs = await cooldownSchema.find();

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

  async execute(interaction, client) {
    const member = interaction.member;
    const recruitString = interaction.options.getString("recruit");
    const recruit = await interaction.guild.members.fetch(recruitString);
    const recruitID = recruit.id;

    const data = await cooldownSchema.findOne({ UserID: recruitID });

    if (!member.roles.cache.has(values.recruiterRole))
      return interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    if (interaction.channel.id !== values.recruiterChannel) {
      return interaction.reply({
        content: `This command can only be used in <#${values.recruiterChannel}>`,
        ephemeral: true,
      });
    }
    if (!recruit.roles.cache.has(values.recruitRole)) {
      const recruitEmbed = new EmbedBuilder()
        .setDescription(`<@${recruitID}> is not a <@&${values.recruitRole}>`)
        .setColor("#a42a04");

      return interaction.reply({ embeds: [recruitEmbed], ephemeral: true });
    }

    if (!data) {
      const noEmbed = new EmbedBuilder()
        .setDescription(
          `<@${recruitID}> is not on a cooldown for </available:1133279217946210394>`
        )
        .setColor("#a42a04");

      interaction.reply({ embeds: [noEmbed], ephemeral: true });
    } else {
      data.delete();

      const deletedEmbed = new EmbedBuilder()
        .setDescription(
          `I have deleted <@${recruitID}>'s cooldown for </available:1133279217946210394>`
        )
        .setColor("#ffd700");

      interaction.reply({ embeds: [deletedEmbed] });
    }
  },
};
