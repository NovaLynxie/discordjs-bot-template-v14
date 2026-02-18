const logger = require("../utils/logger")("dashboard");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
//const fileUpload = require("express-fileupload");
const path = require("node:path");

const app = express();
// app configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
// app middleware
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 3600000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
// app global variables
app.use((req, res, next) => {
    // fetch user data from session and make it available in templates
    res.locals.user = req.user || null;
    // define flash messages for error and success notifications
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
// import route handlers
app.use(require("./routes/index"));
app.use(require("./routes/login"));
app.use(require("./routes/guilds"));

module.exports = (client, { port = 3000 }) => {
    app.listen(port, () => {
        logger.info(`Dashboard server is running on localhost:${port}`);
    });
};