const {
  Events,
  ChannelType,
  EmbedBuilder,
  MessageType,
} = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.channel.type === ChannelType.DM) {
      if (message.channel.id !== "1132139803555680306") {
        if (message.embeds.length > 0) {
          const newMessage = new EmbedBuilder()
            .setColor("#ffd700")
            .setDescription(
              `I have sent a new embed to <@${message.channel.recipientId}> ⬇️`
            );
          const botSentEmbed = EmbedBuilder.from(message.embeds[0]);

          client.users.send("943623503624667237", {
            content: "<@943623503624667237>",
            embeds: [newMessage, botSentEmbed],
          });
        } else {
          let embedLogs = new EmbedBuilder()
            .setColor("#ffd700")
            .setTitle(`💬・New DM message!`)
            .setDescription(`Bot has received a new DM message!`)
            .addFields(
              {
                name: "Dm Sent By",
                value: `${message.author} (${message.author.tag})`,
              },
              {
                name: `Message`,
                value: `\`\`\`${message.content || "None"}\`\`\``,
              }
            )
            .setTimestamp();

          if (message.attachments.size > 0)
            embedLogs.addFields({
              name: `📃┆Attachments`,
              value: `${message.attachments.first()?.url}`,
              inline: false,
            });

          client.users.send("943623503624667237", { embeds: [embedLogs] });
        }
        message.react("✅");
      }
    }
  },
};
