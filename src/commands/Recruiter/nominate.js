const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");
const pollSchema = require("../../Schemas.js/votes");
const { values } = require("../../variables");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("nominate")
    .setDescription("Create a poll")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user that this nomination is for")
        .setRequired(true)
    ),

  async execute(interaction, client) {
    const member = interaction.options.getMember("user");
    const userMem = interaction.member;
    const user = member.id;
    const interactor = interaction.user.id;

    if (!userMem.roles.cache.has(values.recruiterRole))
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
    if (
      member.roles.cache.hasAny(
        values.nomineeRole,
        values.recruitRole,
        values.memberRole
      )
    ) {
      return interaction.reply({
        content: `<@${user}> is already a <@&${values.nomineeRole}>, <@&${values.recruitRole}>, or <@&${values.memberRole}>`,
        ephemeral: true,
      });
    }

    member.roles.add(values.nomineeRole);

    const startMessage = await interaction.reply({
      content: `start`,
      ephemeral: true,
    });
    setTimeout(() => startMessage.delete(), 100);

    const embed = new EmbedBuilder()
      .setColor("#ffd700")
      .setTitle("New Recruit Nomination")
      .addFields(
        { name: "Nominee", value: `> <@${user}>`, inline: false },
        { name: "Initiator", value: `> ${interaction.user}`, inline: false },
        { name: "Upvotes", value: `> **No votes**`, inline: true },
        { name: "Downvotes", value: `> **No votes**`, inline: true }
      )
      .setTimestamp();

    let votebutton;
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("up")
        .setLabel("Upvote")
        .setEmoji("📈")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("down")
        .setLabel("Downvote")
        .setEmoji("📉")
        .setStyle(ButtonStyle.Primary),

      (votebutton = new ButtonBuilder()
        .setCustomId("votes")
        .setLabel("Votes")
        .setEmoji("📃")
        .setStyle(ButtonStyle.Success)),
      new ButtonBuilder()
        .setCustomId("nominate")
        .setLabel("Nominate")
        .setEmoji("🏁")
        .setStyle(ButtonStyle.Secondary)
    );

    const massage = await interaction.channel.send({
      content: `<@&${values.recruiterRole}>`,
      embeds: [embed],
      components: [buttons],
    });
    await massage.pin();

    await pollSchema.create({
      Msg: massage.id,
      Nominee: user,
      Upvote: 0,
      Downvote: 0,
      Upmembers: [],
      Downmembers: [],
      Owner: interactor,
      Guild: interaction.guild.id,
    });

    /* const data = await pollSchema.findOne({
      Guild: interaction.guild.id,
      Msg: massage.id,
    });

    async function CheckVotes() {
      member.roles.remove(values.nomineeRole);
      massage.delete();
      const dmEmbed = new EmbedBuilder()
        .setColor("#4169E1")
        .setTitle("TTP NOMINATION COMPLETED")
        .setFooter({
          text: "Created By: xNightmid",
          iconURL:
            "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
        });
      const nomCompleteEmbed1 = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle("Nomination Process Complete")
        .addFields(
          { name: `Nominee`, value: `<@${user}>`, inline: true },
          { name: `Initiator`, value: `<@${interactor}>`, inline: true }
        );
      if (data.Upvote > data.Downvote) {
        dmEmbed.setDescription(
          `Nice! You have passed the TTP nomination process and are now a official recruit!`
        );
        nomCompleteEmbed1.addFields({
          name: `Outcome`,
          value: `Accepted`,
        });
        member.roles.add(values.recruitRole);
        member.roles.add(values.tryoutsHeaderRole);
      } else {
        dmEmbed.setDescription(
          `Unfortunately, you did not pass the TTP nomination process.`
        );
        nomCompleteEmbed1.addFields({
          name: `Outcome`,
          value: `Rejected`,
        });
      }

      let upvoters = [];
      await data.Upmembers.forEach(async (member) => {
        upvoters.push(`<@${member}>`);
      });

      let downvoters = [];
      await data.Downmembers.forEach(async (member) => {
        downvoters.push(`<@${member}>`);
      });

      const nomCompleteEmbed2 = new EmbedBuilder()
        .setColor("#ffd700")
        .setTitle("Nomination Votes")
        .addFields(
          {
            name: `Upvoters (${upvoters.length})`,
            value: `> ${upvoters.join("\n> ").slice(0, 1020) || "No upvoters"}`,
            inline: true,
          },
          {
            name: `Downvoters (${downvoters.length})`,
            value: `> ${
              downvoters.join("\n> ").slice(0, 1020) || "No downvoters"
            }`,
            inline: true,
          }
        );
      interaction.channel.send({
        content: `<@&${values.recruiterRole}>`,
        embeds: [nomCompleteEmbed1, nomCompleteEmbed2],
      });
      client.users.send(user, { embeds: [dmEmbed] });
    }

    // timerrr
    setTimeout(async () => {
      if (data.Upvote === data.Downvote) {
        massage.edit({ components: [buttons.setComponents(votebutton)] });
        const equalEmbed = new EmbedBuilder()
          .setColor("#e8ac01")
          .setTitle(
            `The votes for ${member.displayName}'s nomination are equal, therefor a automatic decision could not be made`
          )
          .setDescription(
            `<@${interactor}>, you may now use one of the buttons below to accept or reject <@${user}>`
          );
        const choiceButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("accept")
            .setLabel("✅ Accept")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("reject")
            .setLabel("❎ Reject")
            .setStyle(ButtonStyle.Danger)
        );
        const timerChoice = await interaction.channel.send({
          content: `<@${interactor}> <@&${values.recruiterRole}>`,
          embeds: [equalEmbed],
          components: [choiceButtons],
        });
        const collector1 = timerChoice.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });

        collector1.on("collect", async (i) => {
          if (i.customId === "accept" || "reject") {
            if (i.user.id !== data.Owner) {
              const notYouEmbed = new EmbedBuilder()
                .setColor("#a42a04")
                .setDescription(`Only <@${data.Owner}> can use this button`);
              await i.reply({
                embeds: [notYouEmbed],
                ephemeral: true,
              });
            } else {
              timerChoice.delete();
              massage.delete();
              const dmEmbed = new EmbedBuilder()
                .setColor("#4169E1")
                .setTitle("TTP NOMINATION COMPLETED")
                .setFooter({
                  text: "Created By: xNightmid",
                  iconURL:
                    "https://cdn.discordapp.com/attachments/1127095161592221789/1127324283421610114/NMD-logo_less-storage.png",
                });

              const nomCompleteEmbed1 = new EmbedBuilder()
                .setColor("#ffd700")
                .setTitle("Nomination Process Complete")
                .addFields(
                  { name: `Nominee`, value: `<@${user}>`, inline: true },
                  {
                    name: `Initiator`,
                    value: `<@${interactor}>`,
                    inline: true,
                  }
                );
              if (i.customId === "accept") {
                dmEmbed.setDescription(
                  `Nice! You have passed the TTP nomination process and are now a official recruit!`
                );
                nomCompleteEmbed1.addFields(
                  {
                    name: `Outcome`,
                    value: `Accepted`,
                  },
                  {
                    name: `Method`,
                    value: `Initiators choice`,
                    inline: true,
                  }
                );
                member.roles.add(values.recruitRole);
                member.roles.add(values.tryoutsHeaderRole);
              } else {
                dmEmbed.setDescription(
                  `Unfortunately, you did not pass the TTP nomination process.`
                );
                nomCompleteEmbed1.addFields(
                  {
                    name: `Outcome`,
                    value: `Rejected`,
                  },
                  {
                    name: `Method`,
                    value: `Initiators choice`,
                    inline: true,
                  }
                );
              }

              let upvoters = [];
              await data.Upmembers.forEach(async (member) => {
                upvoters.push(`<@${member}>`);
              });

              let downvoters = [];
              await data.Downmembers.forEach(async (member) => {
                downvoters.push(`<@${member}>`);
              });

              const nomCompleteEmbed2 = new EmbedBuilder()
                .setColor("#ffd700")
                .setTitle("Nomination Votes")
                .addFields(
                  {
                    name: `Upvoters (${upvoters.length})`,
                    value: `> ${
                      upvoters.join("\n> ").slice(0, 1020) || "No upvoters"
                    }`,
                    inline: true,
                  },
                  {
                    name: `Downvoters (${downvoters.length})`,
                    value: `> ${
                      downvoters.join("\n> ").slice(0, 1020) || "No downvoters"
                    }`,
                    inline: true,
                  }
                );
              interaction.channel.send({
                content: `<@&${values.recruiterRole}>`,
                embeds: [nomCompleteEmbed1, nomCompleteEmbed2],
              });
              client.users.send(user, { embeds: [dmEmbed] });
            }
          }
        });
      } else {
        CheckVotes();
      }
    }, 10000); */
  },
};
