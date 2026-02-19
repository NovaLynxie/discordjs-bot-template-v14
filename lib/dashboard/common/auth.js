const passport = require("passport");
const { DiscordScope, Strategy } = require("discord-strategy");

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: [DiscordScope.IDENTIFY, DiscordScope.EMAIL, DiscordScope.GUILDS]
}, async (accessToken, refreshToken, profile, callback, consume) => {
    try {
        await Promise.all([ consume.connections(), consume.guilds() ]);
        return callback(null, profile);
    } catch (err) {
        return callback(err);
    }
}));
// serialize and deserialize user for session management
passport.serializeUser((user, callback) => callback(null, user));
passport.deserializeUser((obj, callback) => callback(null, obj));

module.exports = passport;