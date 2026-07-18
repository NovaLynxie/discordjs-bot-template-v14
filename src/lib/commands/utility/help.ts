import { SlashCommandBuilder, EmbedBuilder, MessageFlags, inlineCode, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { stripIndents } from "common-tags";
import { commands } from "../../bot";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get help for commands!")
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("Lists all available loaded commands.")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("view")
                .setDescription("View help for specific command.")
                .addStringOption(option => 
                    option
                        .setName("commandName")
                        .setDescription("Specify command to display help for")
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ),
    // slash command parameters
    enabled: false,
    permsLevel: 2,
    restricted: false,
    // slash command methods
    async autocomplete(interaction: AutocompleteInteraction) {
        const { options } = interaction;
        const focusedValue = options.getFocused();
        const filteredCommands = commands.cache.filter((cmd: any) => cmd.data.name.startsWith(focusedValue));
        await interaction.respond(
            filteredCommands.map((cmd: any) => ({ name: cmd.data.name, value: cmd.data.name })).slice(0, 25)
        );
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const { client, options } = interaction;
        const commandName = options.getString("commandName");
        const subcommand = options.getSubcommand();
        const helpEmbed = new EmbedBuilder();
        if (commandName) {
            const command:any = commands.cache.get(commandName);
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
                    const optionsDescription = command.data.options.map((option: any) => {
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
                            Available Commands (${commands.cache.size}):
                            ${commands.cache.map((command: any) => `- ${command.data.name}`).join("\n")}
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