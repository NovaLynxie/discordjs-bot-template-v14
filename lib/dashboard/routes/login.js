const logger = require("../../utils/logger")("dashboard:routes");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/login", (req, res, next) => {
    if (req,session.returnTo) {
        next();
    } else {
        const parsed = url.parse(req.headers.referer || "/");
        if (parsed.hostname === req.hostname) {
            req.session.returnTo = parsed.path;
        } else {
            req.session.returnTo = "/";
        };
    };
    next();
}, passport.authenticate("discord"));
router.get("/discord/callback", passport.authenticate("discord", { failureRedirect: "/login", scope: ["identify", "guilds"] }), (req, res) => {
    // Successful authentication, redirect to the originally requested page or home if none was set
    const returnTo = req.session.returnTo || "/";
    delete req.session.returnTo;
    res.redirect(returnTo);
});
router.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            logger.error(`Server Error: Logout failed for user ${req.user ? req.user.id : "unknown"}!`);
            logger.error(`${err.name} (${err.code}): ${err.message}`);
            logger.error(`Caused by ${err.cause}`); logger.debug(err.stack);
            req.flash("error", "An error occurred while logging out. Please try again.");
            res.status(500).render("error", { title: "Logout Error", message: "An error occurred while logging out. Please try again.", error: err });
        } else {
            req.flash("success", "You have been logged out successfully!");
            res.redirect("/");
        };
    });
});

module.exports = router;