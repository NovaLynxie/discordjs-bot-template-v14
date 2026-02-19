const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
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
    async autocomplete(interaction) {
        const { client, options } = interaction;
        const focusedValue = options.getFocused();
        const filteredCommands = client.commands.cache.filter(cmd => cmd.data.name.startsWith(focusedValue));
        await interaction.respond(
            filteredCommands.map(cmd => ({ name: cmd.data.name, value: cmd.data.name })).slice(0, 25)
        );
    },
    async execute(interaction, client) {
        const commandName = interaction.options.getString("command");
        const command = client.commands.cache.get(commandName);
        if (command) {
            delete require.cache[require.resolve(command.path)];
            try {
                ClientUser.commands.cache.delete(command.data.name);
                const fetchedCommand = require(command.path);
                client.commands.cache.set(fetchedCommand.data.name, fetchedCommand);
                await interaction.reply({ content: `Command "${fetchedCommand.data.name}" was reloaded successfully!`, ephemeral: MessageFlags.Ephemeral });
            } catch (err) {
                await interaction.reply({ content: `There was an error while reloading command "${command.data.name}":\n\`${err.message}\``, ephemeral: MessageFlags.Ephemeral });
            };
        } else {
            await interaction.reply({ content: `There is no command with name "${commandName}"!`, ephemeral: MessageFlags.Ephemeral });
        }
    }
};