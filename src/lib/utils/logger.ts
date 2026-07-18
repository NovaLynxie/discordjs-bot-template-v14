import { createLogger, addColors, format, transports } from "winston";
import 'winston-daily-rotate-file';
import { name } from '../../../package.json';
// logger constants
const parentDir = "./logs";
const timestamp = "YYYY-MM-DD HH:mm:ss";
// fetch system local timezone
const getTimeZone = () => new Date().toLocaleString(
    Intl.DateTimeFormat().resolvedOptions().locale,
    { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
);
// logger custom levels
const customLevels = {
    colors: {
        error: "red",
        warn: "yellow",
        info: "white",
        data: "grey",
        debug: "blue",
        verbose: "magenta"
    },
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        data: 4,
        verbose: 5
    }
};
addColors(customLevels.colors);
const customOutputFormat = format.printf(({ processName, serviceName, level, message, timestamp }) => `${timestamp} [${processName}/${serviceName}] (${level}): ${message}`);
// export custom logger 
export function customLogger(service: string) {
    return createLogger({
        defaultMeta: {
            processName: name,
            serviceName: service ?? "runtime"
        },
        levels: customLevels.levels,
        transports: [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.timestamp({ format: "HH:mm:ss" }),
                    customOutputFormat
                ),
                level: process.env.LOG_LEVEL ?? "info"
            }),
            new transports.DailyRotateFile({
                filename: `${parentDir}/debug-%DATE%.log`,
                format: format.combine(
                    format.timestamp({ format: timestamp }),
                    customOutputFormat
                ),
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
                level: "debug",
            }),
            new transports.DailyRotateFile({
                filename: `${parentDir}/latest-%DATE%.log`,
                format: format.combine(
                    format.timestamp({ format: timestamp }),
                    customOutputFormat
                ),
                datePattern: "YYYY-MM-DD",
                zippedArchive: true,
                maxSize: "20m",
                maxFiles: "14d",
                level: "info",
            }),
        ]
    });
};
