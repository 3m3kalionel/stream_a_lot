import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/userModel";
import {
  handleError,
  getUserFavouritesReturnFields,
  validateDocument,
  getUserFavouritesUpdateObject,
} from "../utils";

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
    const token = jwt.sign({ userId: user.id }, "process.env.APP_SECRET", {
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
  let existingUser = await userModel.findOne({
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

      existingUser = existingUser.toObject();
      delete existingUser.password;

      return res.status(200).json({
        messge: "status: success - signed in",
        token,
        existingUser,
      });
    } else {
      return res.status(400).send({
        message: "status: failed - Email or password is incorrect",
      });
    }
  });
};

const getUserFavourites = async (req, res) => {
  const { userId, filterQuery } = req.params;
  const [field, ...filteredField] = getUserFavouritesReturnFields(filterQuery);
  const returnFields = "_id username";

  const user = await userModel
    .findById(userId)
    .select("_id username")
    .populate(field, filteredField);

  return res.status(200).send({
    message: "status: success - user favourites found",
    user,
  });
};

const addToFavourites = async (req, res) => {
  const { userId, favouritesCategory, favouritesCategoryId } = req.params;
  const [field, ...filteredFields] = getUserFavouritesReturnFields(
    favouritesCategory
  );

  const document = await validateDocument(
    favouritesCategory,
    favouritesCategoryId,
    {}
  );

  if (document.error) {
    const {
      error: { code, message },
    } = document;
    return res.status(code).send({
      message,
    });
  }

  try {
    const update = await userModel
      .findByIdAndUpdate(
        // runValidators
        userId,
        {
          $addToSet: getUserFavouritesUpdateObject(
            favouritesCategory,
            favouritesCategoryId
          ),
        },
        {
          new: true,
          useFindAndModify: false,
          runValidators: true,
        }
      )
      .select(field)
      .populate(field, filteredFields);

    if (document && update) {
      return res.status(200).send({
        message: "status: success - added to favourites",
        update,
      });
    }
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
};

const removeFromFavourites = async (req, res) => {
  const { userId, favouritesCategory, favouritesCategoryId } = req.params;
  const [field, ...filteredFields] = getUserFavouritesReturnFields(
    favouritesCategory
  );

  const document = await validateDocument(
    favouritesCategory,
    favouritesCategoryId,
    {}
  );

  if (document.error) {
    const {
      error: { code, message },
    } = document;
    return res.status(code).send({
      message,
    });
  }
  try {
    const update = await userModel
      .findByIdAndUpdate(
        // runValidators
        userId,
        {
          $pull: getUserFavouritesUpdateObject(
            favouritesCategory,
            favouritesCategoryId
          ),
        },
        {
          new: true,
          useFindAndModify: false,
          runValidators: true,
        },
        function (error, document) {
          if (document === null) {
            return res.status(404).send({
              message: `status: failed - id ${userId} not found`,
            });
          }
        }
      )
      .select(field)
      .populate(field, filteredFields);

    if (document && update) {
      return res.status(200).send({
        message: "status: success - removed from favourites",
        update,
      });
    }
  } catch (error) {
    res.status(400).send({
      error,
    });
  }
};

export default {
  signup,
  signin,
  getUserFavourites,
  addToFavourites,
  removeFromFavourites,
};
