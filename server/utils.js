import mongoose from "mongoose";

import artisteModel from "./models/artisteModel";
import playlistModel from "./models/playlistModel";
import userModel from "./models/userModel";
import gridFsModel from "./models/gridFsTrackModel";

export const isEmpty = fieldValue => {
  return !(fieldValue.trim().length === 0);
};

export const isIncorrectEnumValue = fieldValue => {
  return !["public", "private"].includes(fieldValue);
};

export const handleError = ({ errors }, res) => {
  const modelErrors = Object.keys(errors);

  const message = errors[modelErrors.shift()].message;
  return res.status(400).send({
    message,
  });
};

export const isValidMongoId = id => {
  const ObjectId = mongoose.Types.ObjectId;

  if (ObjectId.isValid(id)) {
    if (String(new ObjectId(id)) === id) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

export function getUserFavouritesReturnFields(inputField) {
  switch (inputField) {
    case "playlists":
    case "playlist":
      return ["favouritePlaylists", "title"];
      break;
    case "tracks":
    case "track":
      return ["favouriteTracks", "title", "artiste", "featuredArtistes"];
      break;
    case "artistes":
    case "artiste":
      return ["favouriteArtistes", "name"];
      break;
  }
}

const getModel = modelParam => {
  switch (modelParam) {
    case "playlist":
      return playlistModel;
      break;
    case "track":
      return gridFsModel;
      break;
    case "artiste":
      return artisteModel;
      break;
    case "user":
      return userModel;
      break;
  }
};

export function getUserFavouritesUpdateObject(
  favouritesCategory,
  favouritesCategoryId
) {
  switch (favouritesCategory) {
    case "artiste":
      return {
        favouriteArtistes: favouritesCategoryId,
      };
      break;
    case "playlist":
      return {
        favouritePlaylists: favouritesCategoryId,
      };
      break;
    case "track":
      return {
        favouriteTracks: favouritesCategoryId,
      };
      break;
  }
}

export async function validateDocument(modelParam, documentId, queryOptions) {
  const error = new Error();
  const { returnFields, fieldsToPopulate } = queryOptions;

  let document;
  const model = getModel(modelParam);

  try {
    if (!isValidMongoId(documentId)) {
      error.code = 400;
      error.message = `status: failed - id ${documentId} is not a valid mongoose document id`;
      throw error;
    }

    document = returnFields
      ? await model.findById(documentId, returnFields).populate({
          path: fieldsToPopulate,
          select: returnFields,
        })
      : await model.findById(documentId, returnFields);

    if (!document) {
      error.code = 404;
      error.message = `status: failed - ${modelParam} id ${documentId} not found`;
      throw error;
    }

    return document;
  } catch (error) {
    if (error.message.includes("is not a valid mongoose document id")) {
      error.code = 400;
      return { error };
    }

    return { error };
  }
}
