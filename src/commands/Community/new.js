const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const completeSchema = require("../../Schemas.js/completeSchema");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("new")
    .setDescription("Create a new recruit")
    .addUserOption((option) =>
      option
        .setName("recruit")
        .setDescription("The user to make a recruit")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.member;
    const roleID = "1129587595211460669";

    const recruit = interaction.options.getMember("recruit");
    const recruitID = recruit.id;
    const recruitName = recruit.displayName;
    const recruitIcon = recruit.displayAvatarURL();

    const recruiterID = interaction.member.id;
    const recruiterName = interaction.member.displayName;
    const recruiterIcon = interaction.member.displayAvatarURL();

    //// MAKE A NEW COMMAND FOR CREATING A NEW RECRUIT(ADD ROLE) AND MAKE INPUT CHECK IF THE USER HAS THAT ROLE
    //// ALSO MAKE THE COMPLETE COMMAND REMOVE THE ROLE AND SEND A DM EMBED, GIVE NEW ROLE, ETC
    let datta = await completeSchema.findOne({
      Something: "not empty",
    });

    if (!member.roles.cache.has("1127338436571955230")) {
      interaction.reply({
        content: "You do not have permsission to use this command",
        ephemeral: true,
      });
    } else if (recruit.roles.cache.has(roleID)) {
      const embed = new EmbedBuilder()
        .setColor("#a42a04")
        .setDescription(`**${recruitName}** is already a recruit`);
      interaction.reply({ embeds: [embed] });
    } else {

      const recruitt = {
        RecruitID: recruitID,
      };
      datta.Recruits.push(recruitt);
      datta.save();

      recruit.roles.add(roleID);

      const embed = new EmbedBuilder()
        .setDescription(`**${recruitName}** has been added as a recruit`)
        .setColor("#ffd700");
      interaction.reply({ embeds: [embed] });
    }
  },
};
