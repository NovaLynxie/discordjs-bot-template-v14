import { customLogger } from "../utils/logger";
import { Events } from "discord.js";

const logger = customLogger("events");

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: any) {
        logger.info(`Logged in as "${client.user.tag}"`);
        // run other actions here if needed
    }
}