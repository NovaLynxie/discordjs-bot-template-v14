import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { stripIndents } from "common-tags";
exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Replies with 'Pong' and response time."),    
    // slash command parameters
    enabled: true,
    permsLevel: 2,
    restricted: true,
    // slash command methods
    async execute(interaction: ChatInputCommandInteraction) {
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
