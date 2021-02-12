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

const getTrack = async (req, res) => {
  const { trackId } = req.params;
  // function that evaluates the start/end range to fulfill from the request - to be returned as a header
  const getRangeFromHeaders = (range, fileLengthInBytes) => {
    if (!range || range.length == 0) {
      return null;
    }

    const rangeDetailsArray = range.split(/bytes=([0-9]*)-([0-9]*)/);
    const startRange = parseInt(rangeDetailsArray[1]);
    const endRange = parseInt(rangeDetailsArray[2]);

    const computedRangeObject = {
      start: isNaN(startRange) ? 0 : startRange,
      end: isNaN(endRange) ? fileLengthInBytes - 1 : endRange,
    };
    const { start, end } = computedRangeObject;

    //if startRange is a number and endRange isn't, send back the full data but since it's zero based, from 0 to fileLengthInBytes - 1
    if (!isNaN(startRange) && isNaN(endRange)) {
      computedRangeObject.start = start;
      computedRangeObject.end = fileLengthInBytes - 1;
    }

    // if startRange isn't a number and endRange is, send back the last <endRange> bytes ie from endRange bytes to fileLengthInBytes - 1
    if (isNaN(startRange) && !isNaN(endRange)) {
      computedRangeObject.Start = fileLengthInBytes - end;
      computedRangeObject.End = fileLengthInBytes - 1;
    }

    return computedRangeObject;
  };

  // function that gets the mimename from the mime type - to be returned as a header
  const getFileMimeName = fileExtension => {
    const mimetype = mimetypes[fileExtension.toLowerCase()];
    if (mimetype === null) {
      mimetype = "application/octet-stream";
    }
    return mimetype;
  };
  // var trackID = new ObjectID(req.params.trackID);

  // check if file exists, else return a 404
  const track = await gridFsTrackModel.findOne({ _id: trackId }).lean();

  if (!track) {
    return res.status(404).send({
      message: "status: failed - track not found",
    });
  }

  const {
    length: sizeInBytes,
    metadata: { fileExtension },
  } = track;
  const responseHeaders = {};

  const mimetypes = {
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".ogg": "application/ogg",
    ".ogv": "video/ogg",
    ".oga": "audio/ogg",
    ".wav": "audio/x-wav",
    ".webm": "video/webm",
  };

  const computedRangeObject = getRangeFromHeaders(
    req.headers["range"],
    sizeInBytes
  );

  // If 'Range' header exists, we will parse it with Regular Expression.
  if (computedRangeObject === null) {
    responseHeaders["Content-Type"] = getFileMimeName(fileExtension);
    responseHeaders["Content-Length"] = sizeInBytes;
    responseHeaders["Accept-Ranges"] = "bytes";

    //  If not, will return file directly.
    res.writeHead(200, { ...responseHeaders });

    let downloadStream = await gridfs.openDownloadStream(track._id);
    downloadStream.on("data", chunk => res.write(chunk));
    downloadStream.on("error", err => res.sendStatus(404));
    downloadStream.on("end", () => {
      res.end();
    });

    return null;
  }

  const { start, end } = computedRangeObject;

  // If the range can't be fulfilled.
  if (start >= sizeInBytes || end >= sizeInBytes) {
    // send back the acceptable range.
    responseHeaders["Content-Range"] = "bytes */" + sizeInBytes;
    // send back the 416 range not satisfiable'
    return res.status(416).send({
      message: "status: failed - requested range not not satisfiable",
    });
  }

  // Indicate the current range.
  responseHeaders["Content-Range"] =
    "bytes " + start + "-" + end + "/" + sizeInBytes;
  responseHeaders["Content-Lengh"] = start === end ? 0 : end - start + 1;
  responseHeaders["Content-Type"] = getFileMimeName(fileExtension);
  responseHeaders["Accept-Ranges"] = "bytes";
  responseHeaders["Cache-Control"] = "no-cache";

  let downloadStream = await gridfs.openDownloadStream(track._id, {
    start,
    end,
  });

  res.writeHead(206, { ...responseHeaders });

  downloadStream.on("data", chunk => res.write(chunk));
  downloadStream.on("error", err => {
    res.sendStatus(404);
  });

  downloadStream.on("end", () => {
    res.end();
  });

  return null;
};

export default {
  createTrack,
  getTrack,
};
