const { SlashCommandBuilder } = require("discord.js");
const { permissions } = require("../../assets/schemas/common.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("template_command")
        .setDescription("template_command_description"),
        // add other options here
    // slash command methods
    enabled: false,
    permsLevel: permissions.commands.USER,
    restricted: false,
    // slash command methods
    async autocomplete(interaction) {
        // autocomplete callback response here!
    },
    async execute(interaction) {
        // execute callback response here!
    }
};