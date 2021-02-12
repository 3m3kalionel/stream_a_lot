import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel";
import { handleError } from "../utils";

const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return userModel(req.body).save(function (error) {
      handleError(error, res);
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userDetails = {
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
  };

  const user = new userModel(userDetails);
  user.save(function (err, document) {
    if (err) {
      return handleError(err, res);
    }
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET, {
      expiresIn: 120,
    });

    const newUser = document.toObject();
    delete newUser.__v;
    delete newUser.password;

    return res.status(201).json({
      message: "status: success - user profile created",
      newUser,
      token,
    });
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .send({ message: "status: failed - Please provide email and password" });
  }
  const existingUser = await userModel.findOne({
    email: email.toLowerCase(),
  });

  if (!existingUser) {
    return res.status(404).send({
      message: "status: failed - Email or password is incorrect",
    });
  }

  await bcrypt.compare(password, existingUser.password, (error, isMatch) => {
    if (error) {
      return res.status(400).send({
        message: "status: failed - Email or password is incorrect",
      });
    } else if (isMatch) {
      const token = jwt.sign(
        { userId: existingUser.id },
        "process.env.APP_SECRET",
        {
          expiresIn: 120,
        }
      );

      return res.status(200).json({
        messge: "status: success - signed in",
        token,
      });
    } else {
      return res.status(400).send({
        message: "status: failed - Email or password is incorrect",
      });
    }
  });
};

export default {
  signup,
  signin,
};
