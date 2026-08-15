const { MessageFlags, SlashCommandBuilder } = require("discord.js");
const { stripIndents } = require("common-tags");
const { permissions } = require("../../assets/schemas/common.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with 'Pong' and response time."),    
    // slash command parameters
    enabled: true,
    permsLevel: permissions.commands.USER,
    restricted: true,
    // slash command methods
    async execute(interaction) {
        const { client } = interaction;
        let latency = new Date().getTime() - interaction.createdTimestamp;
        await interaction.reply({
            content: stripIndents`Ping Responder
            \`\`\`
            📡 ${client.ws.ping} ms
            💬 ${latency} ms
            \`\`\``,
            flags: MessageFlags.Ephemeral,
        });
    },
};
