// middleware/authMiddleware.js

const { getLogin, logout } = require("../models/LoginModel");

const authMiddleware = {
  login: (req, res, next) => getLogin(req, res, next),
  logout: (req, res, next) => logout(req, res, next),
};

module.exports = authMiddleware;
