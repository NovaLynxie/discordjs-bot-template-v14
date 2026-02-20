const logger = require("../utils/logger")("dashboard");
const express = require("express");
const session = require("express-session");
//const fileUpload = require("express-fileupload");
const passport = require("./common/auth"); // import configured passport instance
const flash = require("connect-flash");
const SQliteStore = require("connect-sqlite3")(session);
const crypto = require("node:crypto");
const path = require("node:path");

const app = express();
// app configuration for view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app middleware for serving static files, parsing request bodies, handling file uploads, managing sessions, and initializing authentication
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
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

function initialize(config) {
    logger.info("Initializing dashboard server...");
    if (!process.env.SESSION_SECRET) {
        logger.warn("No SESSION_SECRET provided! Generating a random secret for this session. This will invalidate all sessions on server restart, so it is recommended to set a persistent secret in production environments.");
    };
    logger.debug("Setting up dashboard middleware...");
    /* Commented out file upload middleware for now, since not required in the current dashboard implementation. Can be re-enabled in the future if needed for features like profile picture uploads, etc.
    app.use(fileUpload({
        createParentPath: true,
        limitHandler: (req, res) => {
            logger.warn(`File upload from ${req.ip} exceeded the size limit!`);
            return res.status(413).send("File size exceeds the allowed limit of 10MB!");
        },
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
        logger: logger, // pass logger instance to fileUpload for logging upload events and errors
    }));
    */
    app.use(
        session({
            secret: config.sessionSecret ?? process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString("hex"),
            store: new SQliteStore({ db: "sessions.sqlite", dir: "./data/" }),
            resave: false, // do not save session if unmodified, connect-sqlite3 should already handle this by default
            saveUninitialized: false,
            cookie: { secure: "auto", maxAge: 3600000 },
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(flash());
    logger.info("Dashboard server initialized successfully!");
};
function start(client, config) {
    initialize(config); // initialize server with provided configuration
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