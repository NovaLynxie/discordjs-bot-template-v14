const logger = require('./logger')();
const { version: appVersion } = require('../../package.json');
const djsVersion = require('discord.js').version;
//const { generateDependencyReport } = require('@discordjs/voice');
const fs = require('node:fs');
// crash report handler functions
function generateTimestamp() {
    const date = new Date();
    let hrs, mins, secs, logtime, day, month, year, logdate;
	hrs = date.getUTCHours();
	if (hrs <= 9) hrs = `0${hrs}`;
	mins = date.getUTCMinutes();
	if (mins <= 9) mins = `0${mins}`;
	secs = date.getUTCSeconds();
	if (secs <= 9) secs = `0${secs}`;
	logtime = `${hrs}.${mins}.${secs}`;
	day = date.getUTCDate();
	month = date.getUTCMonth() + 1;
	year = date.getUTCFullYear();
	logdate = `${day}-${month}-${year}`;
	return logstamp = `${logdate}_${logtime}`;
};
function generateCrashReport(error) {
    try {
        fs.accessSync('./logs/crash-reports/', fs.constants.F_OK);
        if (!fs.existsSync('./logs/crash-reports/')) {
            logger.debug('Generating new crash-reports directory...');
            fs.mkdirSync('./logs/crash-reports/', { recursive: true });
        };
    } catch (err) {
        logger.error('Failed to write to logs! Please check folder access permissions.');
        logger.error(`${err.name}: ${err.message}`);
    };
    const stack = error?.stack ?? "No stacktrace available!";
    const messages = ['Did I do that?', 'Erm... whoops.', 'Hehe, my bad...', 'Well, feck if I how that happened. ¯\\_(ツ)_/¯', 'Application stopped unexpectedly (X_X)'];
    const splash = messages[Math.floor(Math.random() * messages.length)];
    const logstamp = generateTimestamp();
    const filePath = `./logs/crash-reports/crash-${logstamp}.log`;
    const crashReport = `Log Date: ${logstamp}
    Program crashed unexpectedly! Generating crash-report...
  ${randomMsg}
    Caused by: ${error}
    Stacktrace:
      ${stack}
    ==============================================================
    Version Information
    Please provide this otherwise we cannot provide any support!
    --------------------------------------------------------------
    NodeJS: v${process.versions.node}
    BotApp: v${version}
    DiscordJS: v${djsVersion}
    ==============================================================
    `;
    fs.writeFile(filePath, crashReport, (err) => {
        if (err) {
			logger.error('Something went wrong while writing crash report!');
			logger.error(`Caused by: ${err.message}`); logger.debug(err.stack);
			logger.warn('Error details may have been lost, check console.');
        } else {
            logger.warn(`Crash report logged successfully to '${filePath}'.`);
        };
    });
};
module.exports = { generateCrashReport }; // export crashReportHandler function as module