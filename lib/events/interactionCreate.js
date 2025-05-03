const logger = require("../utils/logger")("interaction");
const { config } = require("../utils/config");
const { permissions, responses } = require("../assets/schemas/common.json");
const { Collection, Events, time } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const { client, commandName, guild, member, user } = interaction;
        const { cooldowns } = client.commands;
        // interaction create event functions
        function checkPermsLevel(command) {
            switch (command.permsLevel) {
                case permissions.commands.DEVELOPER:
                    return config.developer.devUserIds.includes(user.id);
                case permissions.commands.ADMIN:
                    return config.general.adminUserIds.includes(user.id);
                case permissions.commands.USER:
                    logger.warn(`${user.tag} tried to execute restricted command ${command.data.name}!`);
                    return false;
                default:
                    logger.warn(`No permission level defined in ${command.data.name}! Assuming default command permission level "USER".`);
                    return false;
            };
        };
        // check if interaction is an autocomplete or chat input command
        if (interaction.isAutocomplete() || interaction.isChatInputCommand()) {
            const command = client.commands.cache.get(commandName);
            if (!command) {
                logger.error(`InteractionError: Unknown command "${commandName}" received!`);
                logger.debug(`Unknown interaction "${commandName}" was triggered by user "${user.username}"!`);
                await interaction.reply({
                    content: `Unknown command "${commandName}"!`,
                    ephemeral: true
                });
            };
            logger.debug(`Received user interaction ${commandName} from ${(guild) ? `Guild: "${guild.name}" => Member: "${member.user.username}"` : `User: "${user.username}"`}`);
            if (interaction.isAutocomplete()) {
                if (command?.disabled) 
                    return interaction.respond([ { name: responses.interactions.errors.autocomplete.disabledAutocompleteInteraction, value: "ERR_COMMAND_DISABLED" } ]);
                if (command?.restricted && !checkPermsLevel(command)) 
                    return interaction.respond([ { name: responses.interactions.errors.autocomplete.restrictedAutoCompleteInteraction, value: "ERR_INSUFFICIENT_PERMISSION" } ]);
                try {
                    await command.autocomplete(interaction);
                } catch (err) {
                    logger.error(`Failed while autocompleting for ${command.data.name}!`);
                    logger.error(`${err.name}: ${err.message}`);
                    logger.debug(err.stack);
                };
            };
            if (interaction.isChatInputCommand()) {
                if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());
                const timestamps = cooldowns.get(command.data.name);
                const cooldownDuration = (command?.cooldown ?? 1) * 1000;
                const systemTime = Date.now(); // fetch current system time
                if (timestamps.has(user.id)) {
                    const cooldownExpiresAt = timestamps.get(user.id) + cooldownDuration;
                    if (systemTime < cooldownExpiresAt) {
                        const cooldownExpiryTimestamp = Math.round(cooldownExpiresAt / 1000);
                        logger.warn(`Detected ${user.username} trying to use "${command.data.name}" too quickly!`);
                        return interaction.reply({
                            content: `${member ?? user}, this command is in cooldown! Try again in ${time(cooldownExpiryTimestamp, "R")}`,
                            ephemeral: true
                        });
                    }
                } else {
                    timestamps.set(user.id, systemTime);
                    setTimeout(() => timestamps.delete(user.id), cooldownDuration);
                };
                if (command?.disabled) {
                    return interaction.reply({
                        content: "This command is currently disabled. Please contact my administrator for more information.",
                        ephemeral: true
                    });
                };
                if (command?.restricted && !checkPermsLevel(command)) {
                    return interaction.reply({
                        content: "You do not have permission to use this command!",
                        ephemeral: true
                    });
                };
                try {
                    await command.execute(interaction);
                } catch (err) {
                    logger.error(`Interaction ChatInputCommand Error! Failed while executing ${command.data.name}!`);
                    logger.error(`${err.name}: ${err.message}`);
                    logger.debug(err.stack);
                    const response = {
                        content: "Something went wrong while executing this command!",
                        ephemeral: true,
                    };
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp(response);
                    } else {
                        await interaction.reply(response);
                    };
                };
            };
        };
    }
};
