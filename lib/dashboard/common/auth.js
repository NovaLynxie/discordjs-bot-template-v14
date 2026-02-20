const logger = require("../../utils/logger")("dashboard:auth");
const passport = require("passport");
const { DiscordScope, Strategy } = require("discord-strategy");

if (!process.env.CALLBACK_URL) {
    logger.warn("No CALLBACK_URL provided! Defaulting to http://localhost:3000/auth/callback. Please set a valid CALLBACK_URL in your environment variables for production environments.");
};
if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    throw new Error("Missing required environment variables for application authentication! Please ensure APP_CLIENT_ID and APP_CLIENT_SECRET are set.");
};
if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required in production environments! Please set a secure, random string as SESSION_SECRET in your environment variables.");
};
passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL ?? `http://localhost:${process.env.PORT ?? 3000}/auth/callback`,
    scope: [DiscordScope.IDENTIFY, DiscordScope.EMAIL, DiscordScope.GUILDS]
}, async (accessToken, refreshToken, profile, verified, consume) => {
    try {
        await Promise.all([ consume.connections(), consume.guilds() ]);
        return verified(null, profile);
    } catch (err) {
        return verified(err);
    }
}));
// serialize and deserialize user for session management
passport.serializeUser((user, callback) => callback(null, user));
passport.deserializeUser((obj, callback) => callback(null, obj));

module.exports = passport;