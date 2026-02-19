const logger = require("../utils/logger")("events");
const dashboard = require("../dashboard/server");
const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info(`Logged in as "${client.user.tag}"`);
        // do other things here
        dashboard.start(client, { port: process.env.DASHBOARD_PORT ?? 3000 });
        logger.info("Client is ready!");
    }
}