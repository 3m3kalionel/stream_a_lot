import gridFsTrackModel from "../models/gridFsTrackModel";
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

const addTracksToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { trackId: trackIdsToAdd } = req.body;

  const playlist = await validateDocument("playlist", playlistId, {});
  if (playlist.error) {
    const {
      error: { code, message },
    } = playlist;
    return res.status(code).send({
      message,
    });
  }

  const records = await gridFsTrackModel.find(
    {
      _id: {
        $in: trackIdsToAdd,
      },
    },
    "_id"
  );

  const getResponseMessage = (records, trackIdsToAdd) => {
    return records.length === trackIdsToAdd.length
      ? "status: success - track(s) added to playlist"
      : "status: success - valid track(s) added to playlist";
  };

  const updatedPlaylist = await playlistModel.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        tracks: {
          $each: records,
        },
      },
    },
    {
      new: true,
      returnNewDocument: true,
      useFindAndModify: false,
      // runValidators
    }
  );

  return res.status(200).send({
    message: getResponseMessage(records, trackIdsToAdd),
    tracks: updatedPlaylist.tracks,
  });
};

const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidMongoId(playlistId)) {
    return res.status(400).send({
      message:
        "status: failed - please enter a valid id for the playlist owner",
    });
  }

  try {
    await playlistModel.findByIdAndDelete(playlistId, function (
      error,
      document
    ) {
      if (document === null) {
        return res.status(404).send({
          message: `status: failed - playlist id ${playlistId} not found`,
        });
      }
    });

    return res.status(200).send({ message: "deleted" });
  } catch (err) {
    res.status(400).send({
      message: "status: failed - something went wrong",
    });
  }
};

export default {
  createPlaylist,
  addTracksToPlaylist,
  deletePlaylist,
};
