import { readdirSync } from "node:fs";
import path from "node:path";

export const commands = {
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
                commands.cache.set(command.data.name, command);
                logger.debug(`Loaded command.${command.data.name} from file "${command.path}"`);
            } else {
                const reason = () => {
                    if (!command.data) return new ReferenceError(`Missing or undefined "data" field property!`);
                    if (!command.execute) return new ReferenceError(`Missing or undefined "execute" function callback!`);
                    return new Error(`Unknown error while checking required parameters!`);
                };
                throw reason;
            }
        } catch (err: any) {
            logger.error(`Failed to load command file "${cmdFilePath}"!`);
            logger.error(`CommandLoaderError: ${err.message}`);
            logger.debug(err.stack);
        };
    };
};
