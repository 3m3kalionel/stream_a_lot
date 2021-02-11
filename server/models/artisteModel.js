import mongoose from "mongoose";

import { isEmpty } from "../utils";

const ArtisteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "status: failed - Please enter a name for the artiste"],
    validate: {
      validator: function (field) {
        return isEmpty(field);
      },
    },
  },
  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
    },
  ],
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    },
  ],
});

export default mongoose.model("Artiste", ArtisteSchema);
