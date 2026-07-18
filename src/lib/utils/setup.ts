import { config, loadConfig } from './config'; // load env values using config.js instead
const logger = require("./logger")("deploy");
import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
const rest = new REST().setToken(process.env.DISCORD_TOKEN ?? "<DISCORD_BOT_TOKEN>");
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
        const commandFiles = readdirSync(commandsPath).filter((file: any) => file.endsWith(".js"));
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
        const data: any = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID ?? "<DISCORD_CLIENT_ID>"),
            { body: fetchCommands() }
        );
        logger.info(`Synced ${data.length} commands to application:${process.env.CLIENT_ID}`);
    } catch (err: any) {
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        logger.error("Failed to deploy application commands!");
        process.exit(-1);
    };
};
async function removeCommands() {
    try {
        const cmds: any = await rest.get(
            Routes.applicationCommands(process.env.CLIENT_ID ?? "<DISCORD_CLIENT_ID>")
        );
        for (const command of cmds) {
            logger.debug(`Removing command "${command.name}" from application:${process.env.CLIENT_ID}`);
            try {
                await rest.delete(
                    Routes.applicationCommand(process.env.CLIENT_ID ?? "<DISCORD_CLIENT_ID>", command.id)
                );
                logger.debug(`Successfully removed command "${command.name}"!`);
            } catch(err: any) {
                logger.error(`Failed to delete command "${command.name}"!`);
                logger.error(`${err.code}: ${err.message}`);
                logger.debug(err.stack);
            };
        };
        logger.info("Successfully removed all commands from application!");
    } catch (err: any) {
        logger.error(`${err.code}: ${err.message}`);
        logger.debug(err.stack);
        process.exit(-1);
    };
};
async function runSetup() {
    const action = await rlterm.question(`
        ⚙️ DiscordBot Setup Utility v1.0 ⚙️
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
            process.exit(0);
        default:
            logger.warn(`Unknown option "${action.substring(0, 1).toUpperCase()}"! Please run setup again.`);
            runSetup(); // keep running till exit by cancel action
    };
};
runSetup(); // run setup main function