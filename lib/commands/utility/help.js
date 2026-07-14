const { SlashCommandBuilder, EmbedBuilder, MessageFlags, inlineCode } = require("discord.js");
const { stripIndent, stripIndents } = require("common-tags");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get help for commands!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Lists all available loaded commands.")
        )
        .addStringOption(option => 
            option
                .setName("commandName")
                .setDescription("Specify command to display help for")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    // slash command parameters
    enabled: false,
    permsLevel: 2,
    restricted: false,
    // slash command methods
    async autocomplete(interaction) {
        const { client, options } = interaction;
        const focusedValue = options.getFocused();
        const filteredCommands = client.commands.cache.filter(cmd => cmd.data.name.startsWith(focusedValue));
        await interaction.respond(
            filteredCommands.map(cmd => ({ name: cmd.data.name, value: cmd.data.name })).slice(0, 25)
        );
    },
    async execute(interaction) {
        const { client, options } = interaction;
        const { commandName, subcommand } = options;
        const helpEmbed = new EmbedBuilder();
        if (commandName && commandName ==! "") {
            const command = client.commands.cache.get(commandName);
            if (!command) {
                helpEmbed.setDescription(`Unknown command "${inlineCode(commandName)}"!`);
            } else {
                helpEmbed
                    .setTitle(`Command: ${inlineCode(command.data.name)}`)
                    .setDescription(command.data.description ?? "No description available!")
                    .setFields(
                        { name: "Cooldown", value: `${command.cooldown ?? 0} seconds`, inline: true },
                        { name: "Permission Level", value: command.permsLevel ?? "0 (everyone)", inline: true }
                    );
                if (command.data.options && command.data.options.length > 0) {
                    const optionsDescription = command.data.options.map((option) => {
                        return `${inlineCode(option.name)}: ${option.description ?? "No description available!"}`;
                    }).join("\n");
                    helpEmbed.addFields({ name: "Options", value: optionsDescription });
                };
            };
        } else if (subcommand) {
            switch (subcommand) {
                case "list":
                    helpEmbed
                        .setDescription(stripIndents`
                            Available Commands (${client.commands.cache.size}):
                            ${client.commands.cache.map((command) => `- ${command.data.name}`).join("\n")}
                        `);
                    break;
                default:
                    // do nothing
            };
        };
        // respond the user with help embed
        await interaction.reply({
            embeds: [helpEmbed],
            flags: MessageFlags.Ephemeral
        });
    }
};