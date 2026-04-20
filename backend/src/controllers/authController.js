const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { generateToken, getCookieOptions } = require("../utils/jwt");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured on server" });
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      return res.status(400).json({ message: "Invalid Google account payload" });
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email.toLowerCase(),
        role: "student",
      });
    }

    const token = generateToken(user);
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Google login failed",
      error: error.message,
    });
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: req.user });
};

const logout = async (_req, res) => {
  res.clearCookie("token", getCookieOptions());
  return res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  googleLogin,
  getCurrentUser,
  logout,
};
