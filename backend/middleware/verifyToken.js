const jwt = require("jsonwebtoken");

verifyToken = (req, res, next) => {
  // Extract token from "Bearer token" without using optional chaining
  let token = null;
  if (req.headers["authorization"] && req.headers["authorization"].split(" ").length > 1) {
    token = req.headers["authorization"].split(" ")[1];
  }

  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }

  // Verify token and extract payload
  jwt.verify(token, "hayaltamrat@27", (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Failed to authenticate token" });
    }

    // Attach the decoded user information to the req object
    req.user = decoded; // now req.user.user_id will be available
    next();
  });
};

module.exports = verifyToken;