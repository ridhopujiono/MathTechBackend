const Profile = require("@models").Profile;
const User = require("@models").User;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class AuthenticationController {
  static async auth(req, res) {
    if (!req.body.email || !req.body.password || req.body.password.length < 8) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Email or Password cant be null or Password must 8 character",
      });
    } else {
      try {
        const { email, password } = req.body;
        const data = await User.findOne({
          where: { email: email },
          include: [
            {
              model: Profile,
            },
          ],
        });
        if (!data) {
          return res.status(400).json({
            code: 400,
            success: false,
            message: "Email not found",
          });
        }
        const isPasswordValid = await bcrypt.compare(password, data.password);
        if (!isPasswordValid) {
          return res.status(400).json({
            code: 400,
            success: false,
            message: "Password incorrect",
          });
        }
        const token = jwt.sign(
          {
            user_id: data.id,
          },
          process.env.JWT_SECRET
        );

        res.status(200).json({
          code: 200,
          succcess: true,
          message: "Logged In",
          data: {
            user_id: data.id,
            name: data.name,
            email: data.email,
            profile_picture:
              data.profile_picture === null
                ? data.profile_picture
                : "https://i.ibb.co/MZw9H7S/man.png",
            token: token,
          },
        });
      } catch (err) {
        return res.status(500).json({
          error: err.message,
        });
      }
    }
  }
  static async register(req, res) {
    if (!req.body.name || !req.body.password || !req.body.email) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "name or password or email cant be null",
      });
    } else {
      try {
        const { email, name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const createProfile = await Profile.create({});
        const createUser = await User.create({
          name: name,
          email: email,
          password: hashedPassword,
          profile_id: createProfile.id,
        });
        return res.status(201).json({
          code: 201,
          succcess: true,
          message: "Succesfully Registered",
        });
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
  }
}

module.exports = AuthenticationController;
