const logger = require("./utils/logger")("main");
const { ActivityType, Client, Collection, GatewayIntentBits } = require("discord.js");
const { config } = require("./utils/config");
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
            //if (force) delete require.cache[require.resolve(cmdFilePath)];
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
process.on("exit", (code) => {
    logger.info("Shutting down application...");
    client.destroy();
    logger.debug(`Process exited with code "${code}"`);
});
process.on("uncaughtException", (err, origin) => {
    logger.error(`UncaughtExceptionError: ${err.message}`);
    logger.error(`Caused by ${origin}`);
    logger.debug(err.stack);
});
process.on("unhandledRejection", (err, promise) => {
    logger.error(`UnhandledPromiseRejection: ${err.message}`);
    logger.debug(err.stack);
    promise.catch((reason) => {
        logger.debug(reason);
    });
});
client
    .login(process.env.DISCORD_TOKEN ?? config.application.DISCORD_TOKEN)
    .then((res) => {
        logger.info("Connecting to Discord...");
        logger.verbose(`token: ${res}`);
    })
    .catch((err) => {
        logger.error(err.message);
        logger.debug(err.stack);
    })
    .finally(() => logger.info("Authenticating..."));