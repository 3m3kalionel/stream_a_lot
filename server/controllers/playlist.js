import playlistModel from "../models/playlistModel";
import userModel from "../models/userModel";
import { handleError, validateDocument, isValidMongoId } from "../utils";

const createPlaylist = async (req, res) => {
  try {
    const { title, creatorId } = req.body;
    if (!isValidMongoId(creatorId)) {
      return res.status(400).send({
        message:
          "status: failed - Please enter a valid id for the playlist owner",
      });
    }

    if (!title || !creatorId) {
      return playlistModel(req.body).save(function (error) {
        handleError(error, res);
      });
    }

    const user = await validateDocument("user", creatorId, {});

    if (user.error) {
      const {
        error: { code, message },
      } = user;
      return res.status(code).send({
        message,
      });
    }

    const newPlaylist = new playlistModel(req.body);
    newPlaylist.save(async function (error) {
      if (error && error.errors) {
        return handleError(error, res);
      }

      await userModel.findByIdAndUpdate(
        creatorId,
        {
          $push: {
            favouritePlaylists: {
              _id: newPlaylist._id,
            },
          },
        },
        {
          new: true,
          returnNewDocument: true,
          useFindAndModify: false,
          runValidators: true,
        }
      );

      res.status(201).send({
        message: "status: success - playlist created",
        playlist: newPlaylist,
      });
    });
  } catch (err) {
    res.status(400).send({
      message: "status: failed - something went wrong",
    });
  }
};

export default {
  createPlaylist,
};
