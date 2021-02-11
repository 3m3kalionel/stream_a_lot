import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: [true, "Please enter the title of the track"],
    },
    metadata: {
      artisteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Artiste",
        required: [true, "Please enter the id of the artiste"],
      },
      featuredArtistes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Artiste",
        },
      ],
      sizeInBytes: Number,
      duration: Number,
      fileExtension: String,
    },
  },
  {
    strict: false,
  }
);

export default mongoose.model("Track", FileSchema, "tracks.files");
