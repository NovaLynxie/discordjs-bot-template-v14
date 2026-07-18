require("dotenv").config({
    path: (process.env?.NODE_ENV) ? `.env.${process.env?.NODE_ENV}` : '.env',
    quiet: true
});
import { customLogger } from "./logger";
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import toml from "toml";
const logger = customLogger("config");
// config module code
export let config: any; // defaults to empty object if no config data returned
export function loadConfig() {
    try {
        if (existsSync("./config.toml")) {
            config = toml.parse(readFileSync("./config.toml", "utf-8"));
            if (config?.developer?.enableDebug === true) {};
            return config;
        } else {
            logger.warn("Configuration file 'config.toml' was not found in bot directory!");
            logger.info("Generating default 'config.toml' for first time setup.");
            copyFileSync("./lib/assets/templates/default_config.toml", "./config.toml");
            logger.warn("Stopping bot due to missing configuration file. Please configure your bot before restarting it.");
            process.exit(1);
        };
    } catch (err: any) {
        logger.error("Error occurred while attempting to load './config.toml'!");
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        process.exit(-1);
    };
};
