const logger = require("./utils/logger")("main");
const { ActivityType, Client, Collection, GatewayIntentBits } = require("discord.js");
const config = require("./utils/config").loadConfig(); // call loadConfig() to return config object.
const { generateCrashReport } = require('./utils/reports');
const { readdirSync } = require("node:fs");
const path = require("node:path");
// initialize "client" instance
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds
        // ADD REQUIRED INTENTS HERE
    ],
    config: {
        developers: config?.developer.devUserIds ?? [],
        owners: config?.general.adminUserIds ?? []
    },
});
// client application variables
client.commands = {
    cache: new Collection(),
    cooldowns: new Collection()
};
// client command loader
const cmdRootDir = path.join(__dirname, "commands");
for (const cmdSubDir of readdirSync(cmdRootDir)) {
    const cmdFullPath = path.join(cmdRootDir, cmdSubDir);
    const cmdFiles = readdirSync(cmdFullPath).filter((file) => file.endsWith(".js"));
    for (const file of cmdFiles) {
        const cmdFilePath = path.join(cmdFullPath, file);
        try {
            const command = require(cmdFilePath);
            if ("data" in command && "execute" in command) {
                command.path = cmdFilePath;
                client.commands.cache.set(command.data.name, command);
                logger.debug(`Loaded command.${command.data.name} from file "${command.path}"`);
            } else {
                const reason = () => {
                    if (!command.data) return new Error(`Missing or undefined "data" field property!`);
                    if (!command.execute) return new Error(`Missing or undefined "execute" function callback!`);
                    return new Error(`Unknown error while checking required parameters!`);
                };
                throw new Error(`Malformed command file structure!`, { cause: reason } )
            }
        } catch (err) {
            logger.error(`Failed to load command file "${cmdFilePath}"!`);
            logger.error(`CommandLoaderError: ${err.message}`);
            logger.debug(err.stack);
        };
    };
};
// client event handler
const eventsRootDir = path.join(__dirname, "events");
for (const file of readdirSync(eventsRootDir)) {
    const eventFilePath = path.resolve(`${eventsRootDir}/${file}`);
    try {
        const event = require(eventFilePath);
        //if (event.name === Events.Debug && config.developer.enableDebug === false) continue;
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    } catch(err) {
        logger.error(`EventLoaderError: ${err.message}`);
        logger.debug(err.stack);
    }
}
// process event handlers
process.on("SIGINT", () => {
    logger.warn("Application termination signal received (Ctrl+C)! Stopping processes now.");
    process.exit(); // gracefully shutdown application here
});
process.on("exit", (code) => {
    logger.info("Stopping bot application...");
    client.destroy();
    logger.debug(`Process exited with code "${code}"`);
    if (code != 0) {
        logger.warn(`Process exited with non-zero code "${code}"`);
        logger.warn("Please check previous logs for error details.");
    } else {
        logger.info("Application shutdown completed successfully.");
    }
});
process.on("uncaughtException", (err, origin) => {
    logger.error(`UncaughtExceptionError: ${err.message}`);
    logger.error(`${err.name}: ${err.message}`);
    logger.error(`Caused by ${origin}`);
    logger.debug(err.stack);
    generateCrashReport(err); // send error to crash report handler
});
process.on("unhandledRejection", (err, promise) => {
    logger.error(`UnhandledPromiseRejection: ${err.message}`);
    logger.error(`${err.name ?? err.type}: ${err.message}`);
    logger.debug(err.stack);
    promise.catch((reason) => {
        logger.debug(reason);
    });
});
client
    .login(process.env.DISCORD_TOKEN ?? config.application.DISCORD_TOKEN)
    .then(
        (token) => {
            logger.info("Connecting to Discord...");
            logger.verbose(`DISCORD_TOKEN=${token}`);
            client.timeout = setTimeout(() => {
                logger.warn("Discord API taking longer than usual to respond.");
            }, (parseInt(process.env.TIMEOUT) ?? 30) * 1000);
        },
        (reason) => {
            logger.error("Failed to connect. Check logs for errors.");
            if (reason) logger.error(reason); // only log reason if returned
            process.exit(-1); // bot should stop if login promise rejects
        }
    )
    .finally(() => {
        clearTimeout(client.timeout);
        client.timeout = null;
    })
    .catch((err) => {
        logger.error(err.message);
        logger.debug(err.stack);
    });