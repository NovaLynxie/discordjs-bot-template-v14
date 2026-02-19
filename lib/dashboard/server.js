const logger = require("../utils/logger")("dashboard");
const express = require("express");
const session = require("express-session");
const passport = require("./common/auth"); // import configured passport instance
const flash = require("connect-flash");
const SQliteStore = require("connect-sqlite3")(session);
//const fileUpload = require("express-fileupload");
const path = require("node:path");
const fileUpload = require("express-fileupload");

const app = express();
// app configuration for view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app middleware for serving static files, parsing request bodies, handling file uploads, managing sessions, and initializing authentication
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(fileUpload({ limits: { fileSize: 10 * 1024 * 1024 } })); // limit file uploads to 10MB
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        store: new SQliteStore({ db: "sessions.sqlite", dir: "./data" }),
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 3600000 },
    }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app global variables definition middleware
app.use((req, res, next) => {
    // fetch user data from session and make it available in templates
    res.locals.user = req.user || null;
    // define flash messages for error and success notifications
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
// import and use route handlers for different dashboard functionalities
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/login"));
app.use("/guilds", require("./routes/guilds"));
app.use("/settings", require("./routes/settings"));

function start(client, config) {
    app.locals.client = client; // ensure client is available in app locals
    app.listen(config.port ?? 3000, (err) => {
        if (err) {
            logger.error(`${err.name} (${err.code}): ${err.message}`);
            logger.error(`Caused by ${err.cause}`);
            logger.debug(err.stack);
            logger.warn("Dashboard server failed to start! Please check the error logs for more details!");
        } else {
            logger.info(`Dashboard server is running on localhost:${config.port}`);
        };
    });
};

module.exports = { start };