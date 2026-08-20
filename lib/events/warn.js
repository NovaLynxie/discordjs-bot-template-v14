const logger = require("../utils/logger")("events");
const { Events } = require("discord.js");

module.exports = {
    name: Events.Warn,
    async execute(warning) {
        logger.warn(`${warning}`);
    }
};
