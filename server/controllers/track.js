const multer = require("multer");
const mongoose = require("mongoose");
const { Readable } = require("stream");

import gridFsTrackModel from "../models/gridFsTrackModel";

import { handleError } from "../utils";
import artisteModel from "../models/artisteModel";

let gridfs = null;
mongoose.connection.on("connected", () => {
  gridfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "tracks",
  });
});

const createTrack = (req, res) => {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: {
      fields: 3,
      files: 1,
      parts: 4,
    },
  });

  try {
    upload.single("track")(req, res, err => {
      const { title, artisteId, featuredArtistes, duration } = req.body;

      if (!artisteId || !title) {
        return gridFsTrackModel(req.body).save(function (error) {
          handleError(error, res);
        });
      }

      if (!req.file) {
        return res.status(400).send({
          messge: "status: failed - please select a track to be uploaded",
        });
      }

      if (err) {
        return res.status(400).json({
          message: "Upload Request Validation Failed",
          res: err,
        });
      }

      const { size: sizeInBytes, originalname } = req.file;

      const readableTrackStream = new Readable();
      readableTrackStream.push(req.file.buffer);
      readableTrackStream.push(null);

      let uploadStream = gridfs.openUploadStream(title, {
        metadata: {
          artisteId,
          featuredArtistes: featuredArtistes || [],
          sizeInBytes,
          duration,
          fileExtension: originalname.match(/\.[0-9a-z]+$/i)[0],
        },
      });

      let id = uploadStream.id;

      readableTrackStream.pipe(uploadStream);

      uploadStream.on("finish", async () => {
        await artisteModel.findByIdAndUpdate(
          artisteId,
          {
            $push: {
              tracks: {
                _id: id,
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
        return res.status(201).json({
          message:
            "File uploaded successfully, stored under Mongo ObjectID: " + id,
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
};

export default {
  createTrack,
};
