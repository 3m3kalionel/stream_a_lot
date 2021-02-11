import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter the title of the album"],
    },
    artiste: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please enter the album artiste's name"],
      ref: "Artiste",
    },
    tracks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Track",
      },
    ],
    length: String,
    yearReleased: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Album", albumSchema);
