const logger = require("../utils/logger")("events");
const { Events } = require("discord.js");

module.exports = {
    name: Events.Error,
    async execute(err) {
        logger.error(`${err.name}: ${err.message}`);
        logger.debug(err.stack);
    }
};
