const { validationResult } = require("express-validator");
const { User } = require("../models/user_model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Token } = require("../models/token_model");
const mailSender = require("../helpers/email_sender");

exports.register = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });
    userData = await user.save();
    if (!userData) {
      return res.status(500).json({
        type: "Internal Server Error",
        message: "Could nt create a new user",
      });
    }
    return res.status(201).json(userData);
  } catch (error) {
    if (error.message.includes("email_1 dup")) {
      return res.status(409).json({
        type: "AuthError",
        message: "User with this email already exists.",
      });
    }
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Check your email and try again." });
    }
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({
        message: "Incorrect password. Check your password and try again.",
      });
    }
    const accessToken = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.ACCESS_TOKEN,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.REFRESH_TOKEN,
      { expiresIn: "60d" }
    );

    const token = await Token.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    await new Token({ userId: user._id, accessToken, refreshToken }).save();
    user.passwordHash = undefined;
    return res.json({ ...user._doc, accessToken });
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyToken = async (req, res, next) => {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) return res.json(false);
    accessToken = accessToken.replace("Bearer", "").trim();
    const token = await Token.findOne({ accessToken });
    if (!token) return res.json(false);

    const tokenData = jwt.decode(token.refreshToken);
    const user = await User.findById(tokenData._id);
    if (!user) return res.json(false);

    const isValidate = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN
    );
    if (!isValidate) return res.json(false);
    return res.json(true);
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      {
        return res
        .status(404)
        .json({ message: "User with that email does not exist." });
      }

    const otp = Math.floor(1000 + Math.random() * 9000);
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 600000;

    await user.save();

    const response = await mailSender.sendMail(
      email,
      `Password Reset OTP`,
      `Your OTP for password reset is : ${otp}`
    );
    return res.json({ message: response });
  } catch (error) {
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
exports.verifyPasswordResetOTP = async (req, res) => {
  try{
    const {email, otp} = req.body;
    const user = await User.findOne({email});
    if(!user) {
      return res.status(404).json({message: "User with that email does not exist."});

    }
    if(user.resetPasswordOTP !== +otp || Date.now() > user.resetPasswordOTPExpires) {
      return res.status(400).json({message: "Invalid or Expired OTP."});
    }

    user.resetPasswordOTP = 1;
    user.resetPasswordOTPExpires = undefined;
    await user.save();
    return res.status(200).json({message: "OTP Confirm Successfully."});
  }catch(e) {
    return res.status(500).json({ type: e.name, message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try{
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user) {
      return res.status(404).json({message: "User with that email does not exist."});
    }
    if(user.resetPasswordOTP !== 1) {
      return res.status(401).json({message: "Confirm OTP before resetting password."});
    }
    user.passwordHash = bcrypt.hashSync(password, 8);
    user.resetPasswordOTP = undefined;
    await user.save();
    return res.status(200).json({message: "Password reset successfully."});
  }catch(e) {
    return res.status(500).json({type: e.name, message: e.message});
  }
};
