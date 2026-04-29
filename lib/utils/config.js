require("dotenv").config({
    path: (process.env?.NODE_ENV) ? `.env.${process.env?.NODE_ENV}` : '.env',
    quiet: true
});
const logger = require("./logger")("config");
const { copyFileSync, existsSync, readFileSync } = require("node:fs");
const toml = require("toml");

let config = {}; // defaults to empty object if no config data returned
function loadConfig() {
    try {
        if (existsSync("./config.toml")) {
            logger.debug("Loading bot configuration from './config.toml'...");
            config = toml.parse(readFileSync("./config.toml", "utf-8"));
            if (config?.developer?.enableDebug === true) {};
        } else {
            logger.warn("Configuration file 'config.toml' was not found in bot directory!");
            logger.info("Generating default 'config.toml' for first time setup.");
            copyFileSync("./lib/assets/templates/default_config.toml", "./config.toml");
            logger.warn("Stopping bot due to missing configuration file. Please configure your bot before restarting it.");
            process.exit(1);
        };
    } catch (err) {
        logger.error("Error occurred while attempting to load './config.toml'!");
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        process.exit(-1);
    };
};

module.exports = { ...config, loadConfig };