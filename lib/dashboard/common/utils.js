const logger = require("./logger")("dashboard");

// utility functions for the dashboard
function fetchBreadcrumbs(url) {
    let breadcrumbs = [{ name: "Home", url: "/" }], acc = "", arr = url.substring(1).split("/");
    for (i = 0; i < arr.length; i++) {
        acc = i != arr.length - 1 ? acc + "/" + arr[i] : null;
        breadcrumbs[i + 1] = { name: arr[i].toUpperCase(), url: acc };
    };
    return breadcrumbs;
};
function isManaged(guild, user) {
    const member = guild.members.cache.get(user.id);
    return member ? member.permissions.has("MANAGE_GUILD") : false;
};
function verifyAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        logger.debug(`Unauthorized access attempt to "${req.originalUrl}"!`);
        req.session.returnTo = req.originalUrl; res.status(401);
        req.flash("error", "You must be logged in to access that page! Please log in to continue.");
        logger.verbose(`req.session.returnTo="${req.session.returnTo}"`);
        res.redirect("/login");
    };
};
// function to render views with common data and error handling
function renderView(req, res, view, data = {}) {
    logger.debug(`Processing view "${view}" with data: ${JSON.stringify(data)}`);
    const client = res.locals.client, config = res.locals.config;
    const hideSecrets = (key, value) => {
        switch (key) {
            case "bot":
                return "[BOT_CLIENT]";
            case "config":
                return "[BOT_CONFIG]";
            case "token":
                return "[BOT_TOKEN]";
            default:
                return value;
        };
    };
    const baseData = {
        bot: client,
        config: config,
        path: req.path,
        //locales: locales,
        user: req.isAuthenticated() ? req.user : null,
        isAdmin: (req.session && req.session.isAdmin) ? req.session.isAdmin : false,
        breadcrumbs: req.breadcrumbs || []
    };
};

module.exports = { fetchBreadcrumbs, isManaged, verifyAuth, renderView };