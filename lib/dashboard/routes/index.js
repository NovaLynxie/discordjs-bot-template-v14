const logger = require("../../utils/logger")("dashboard:routes");
const express = require("express");
const passport = require("passport");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", { title: "Dashboard Home" });
});
router.get("/about", (req, res) => {
    res.render("about", { title: "About the Dashboard" });
});
router.get("/contact", (req, res) => {
    res.render("contact", { title: "Contact Us" });
});
router.get("/login", (req, res) => {
    res.render("login", { title: "Dashboard Login" });
});

module.exports = router;