const logger = require("../../utils/logger")("dashboard:routes");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/guilds", (req, res) => {
    res.render("guilds", { title: "Dashboard Guilds" });
});
router.get("/guilds/:id", (req, res) => {
    res.render("guild", { title: "Dashboard Guild" });
});

module.exports = router;