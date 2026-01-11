require("dotenv").config();
const logger = require("./logger")("deploy");
const { REST, Routes } = require("discord.js");
const { readdirSync } = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
const rlterm = readline.createInterface({ input: process.stdin, output: process.stdout });
// setup commands deploy functions
function fetchCommands() {
    const commands = []; // generate new array
    const cmdsRootPath = path.resolve("./lib/commands");
    const cmdFolders = readdirSync(cmdsRootPath);
    logger.info(`Found ${cmdFolders.length} directories!`);
    for (const folder of cmdFolders) {
        logger.info(`Searching in ${folder}`);
        const commandsPath = path.join(cmdsRootPath, folder);
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith(".js"));
        logger.info(`Found ${commandFiles.length} in ${folder}!`);
        for (const file of commandFiles) {
            const cmdPath = path.join(commandsPath, file);
            const command = require(cmdPath);
            if ("data" in command && "execute" in command) {
                commands.push(command.data.toJSON());
                logger.debug(`Added ${command.data.name} to commands array!`);
            } else {
                logger.error(`Aborted loading command from file "${cmdPath}" due to errors!`);
                logger.warn(`Malformed command file structure! Missing "data" or "execute" properties!`);
            };
        };
    };
    logger.info(`Prepared ${commands.length} commands for syncing!`);
    return commands;
};
async function deployCommands() {
    try {
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: fetchCommands() }
        );
        logger.info(`Synced ${data.length} commands to application:${process.env.CLIENT_ID}`);
    } catch (err) {
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        logger.error("Failed to deploy application commands!");
        process.exit(-1);
    };
};
async function removeCommands() {
    try {
        const cmds = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID)
        );
        for (const command of cmds) {
            logger.debug(`Removing command "${command.name}" from application:${process.env.CLIENT_ID}`);
            try {
                await rest.delete(
                    Routes.applicationCommand(process.env.CLIENT_ID, command.id)
                );
                logger.debug(`Successfully removed command "${command.name}"!`);
            } catch(err) {
                logger.error(`Failed to delete command "${command.name}"!`);
                logger.error(`${err.code}: ${err.message}`);
                logger.debug(err.stack);
            };
        };
        logger.info("Successfully removed all commands from application!");
    } catch (err) {
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        logger.error(`Failed to delete application commands "${command.name}"!`);
        process.exit(-1);
    };
};
async function runSetup() {
    logger.info("DiscordBot Setup Utility v1.0");
    const action = await rlterm.question(`
        ⚙️ LynxBot Setup Utility v1.0 ⚙️
    Please select an action to perform:
        [D] - Deploy or update application commands
        [R] - Remove all existing application commands
        [X] - Cancel setup and exit utility
    Enter option: `);
    switch (action.substring(0, 1).toUpperCase()) {
        case "D":
            await deployCommands();
            break;
        case "R":
            await removeCommands();
            break;
        case "X":
            logger.warn("Cancelled setup! Exiting now.");
            break;
        default:
            logger.warn(`Unknown option "${action.substring(0, 1).toUpperCase()}"! Please run setup again.`);
    };
    process.exit(0);
};
runSetup();