import mongoose from "mongoose";

import { isEmpty } from "../utils";

const PlaylistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [
        true,
        "status: failed - Please enter a title for the playlist",
      ],
      validate: {
        validator: function (field) {
          return isEmpty(field);
        },
        message: () => {
          return "status: failed - Please enter a title for the playlist";
        },
      },
    },
    description: String,
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [
        true,
        "status: failed - Please enter a valid id for the playlist owner",
      ],
      ref: "User",
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    numberOfTracks: Number,
    length: String,
    status: {
      type: String,
      enum: ["private", "public"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Playlist", PlaylistSchema);
