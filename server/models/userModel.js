import mongoose from "mongoose";
import beautifyUnique from "mongoose-beautiful-unique-validation";

import { isEmpty } from "../utils";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [
      true,
      "status: failed - Please enter a username for your profile",
    ],
    unique: "status: failed - {PATH} {VALUE} is already taken",
    validate: {
      validator: function (field) {
        return isEmpty(field);
      },
      message: () => {
        return `status: failed - name input can't be empty`;
      },
    },
  },
  password: {
    type: String,
    required: [true, "status: failed - Please enter your password"],
  },
  email: {
    type: String,
    required: [true, "status: failed - Please enter your email"],
    unique: "status: failed - {PATH} {VALUE} is already taken",
    validate: {
      validator: function (field) {
        return isEmpty(field);
      },
      message: props => {
        return `status: failed - input is not a valid ${props.path}`;
      },
    },
  },
  favouriteArtistes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artiste",
    },
  ],
  favouriteTracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
    },
  ],
  favouritePlaylists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
  favouriteAlbums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
  ],
});

userSchema.plugin(beautifyUnique);

export default mongoose.model("User", userSchema);
