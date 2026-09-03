const logger = require('./logger')();
const { version: appVersion } = require('../../package.json');
const djsVersion = require('discord.js').version;
//const { generateDependencyReport } = require('@discordjs/voice');
const { accessSync, constants, existsSync, mkdirSync, writeFileSync } = require('node:fs');
const os = require('node:os');
// crash report handler functions
function generateTimestamp() {
    const date = new Date();
    let hrs, mins, secs;
	hrs = date.getUTCHours();
	if (hrs <= 9) hrs = `0${hrs}`;
	mins = date.getUTCMinutes();
	if (mins <= 9) mins = `0${mins}`;
	secs = date.getUTCSeconds();
	if (secs <= 9) secs = `0${secs}`;
	const logtime = `${hrs}.${mins}.${secs}`;
	const day = date.getUTCDate();
	const month = date.getUTCMonth() + 1;
	const year = date.getUTCFullYear();
	const logdate = `${day}-${month}-${year}`;
	return `${logdate}_${logtime}`;
};
function generateCrashReport(error) {
    try {
        accessSync('./logs/crash-reports/', constants.W_OK);
        if (!existsSync('./logs/crash-reports/')) {
            logger.debug('Generating new crash-reports directory...');
            mkdirSync('./logs/crash-reports/', { recursive: true });
        };
    } catch (err) {
        logger.error('Failed to write to logs! Please check folder access permissions.');
        logger.error(`${err.name}: ${err.message}`);
    };
    logger.debug("Gathering crash-report log dump data...");
    const stack = error?.stack ?? "No stacktrace available!";
    const messages = ['Did I do that?', 'Erm... whoops.', 'Hehe, my bad...', 'Well, feck if I how that happened. ¯\\_(ツ)_/¯', 'Application stopped unexpectedly (X_X)'];
    const logstamp = generateTimestamp();
    const filePath = `./logs/crash-reports/crash-${logstamp}.log`;
    const crashReport = `Log Date: ${logstamp}
    // "${messages[Math.floor(Math.random() * messages.length)]}" //
    Caused by: ${error?.message ?? error}
    Stacktrace:
      ${stack}
    ============================================================================================================================
    Application Information
    Please provide this otherwise we cannot provide any support!
    ----------------------------------------------------------------------------------------------------------------------------
    NodeJS: v${process.versions.node} (${process.platform})
    BotApp: v${appVersion}
    DiscordJS: v${djsVersion}
    ----------------------------------------------------------------------------------------------------------------------------
    System Information
    Operating System: ${os.version()} (${os.type()} ${os.machine()})
    ============================================================================================================================
    `;
    logger.debug("Writing crash report data to file...");
    try {
        writeFileSync(filePath, crashReport);
        logger.warn(`Crash report logged successfully to '${filePath}'.`);
    } catch (err) {
        logger.error('Something went wrong while writing crash report!');
        logger.error(`Caused by: ${err.message}`); logger.debug(err.stack);
        logger.warn('Error details may have been lost, check main log files or console output!');
    };
};
module.exports = { generateCrashReport }; // export crashReportHandler function as module