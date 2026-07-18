import { SlashCommandBuilder, MessageFlags, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import { commands } from '../../bot';

export default {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName("reload")
        .setDescription("Reloads a command that has been modified without restarting the bot.")
        .addStringOption(option =>
            option.setName("command")
                .setDescription("Specify command to reload")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    // slash command parameters
    enabled: true,
    permsLevel: 2,
    restricted: true,
    // slash command methods
    async autocomplete(interaction: AutocompleteInteraction) {
        const { options } = interaction;
        const focusedValue = options.getFocused();
        //const filteredCommands = commands.cache.filter((cmd: { data: { name: string }; }) => cmd.data.name.startsWith(focusedValue));
        const filteredCommands = commands.cache.filter((cmd: any) => cmd?.data.name.startsWith(focusedValue));
        await interaction.respond(
            filteredCommands.map((cmd: any) => ({ name: cmd.data.name, value: cmd.data.name })).slice(0, 25)
        );
    },
    async execute(interaction: ChatInputCommandInteraction) {
        const { options } = interaction;
        const commandName = options.getString("command");
        const command: any = commands.cache.get(commandName);
        if (command) {
            delete require.cache[require.resolve(command.path)];
            try {
                commands.cache.delete(command.data.name);
                const fetchedCommand = require(command.path);
                commands.cache.set(fetchedCommand.data.name, fetchedCommand);
                await interaction.reply({ content: `Command "${fetchedCommand.data.name}" was reloaded successfully!`, flags: MessageFlags.Ephemeral });
            } catch (err: any) {
                await interaction.reply({ content: `There was an error while reloading command "${command.data.name}":\n\`${err.message}\``, flags: MessageFlags.Ephemeral });
            };
        } else {
            await interaction.reply({ content: `There is no command with name "${commandName}"!`, flags: MessageFlags.Ephemeral });
        }
    }
};