import artisteModel from "../models/artisteModel";
import { handleError, validateDocument } from "../utils";

const createArtisteProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return await artisteModel(req.body).save(function (error) {
        handleError(error, res);
      });
    }

    const newArtiste = new artisteModel({
      name,
    });
    newArtiste.save(function (error) {
      error && error.errors
        ? handleError(error, res)
        : res.status(201).send({
            message: "status: success - artiste profile created",
            artiste: newArtiste,
          });
    });
  } catch (err) {
    return res.status(400).send({
      message: "status: failed - something went wrong",
    });
  }
};

const getArtiste = async (req, res) => {
  try {
    const returnFields = "-createdAt -updatedAt -__v";
    const fieldsToPopulate = "tracks";
    const artiste = await validateDocument("artiste", req.params.artisteId, {
      returnFields,
      fieldsToPopulate,
    });

    if (artiste.error) {
      const {
        error: { code, message },
      } = artiste;

      return res.status(code).send({
        message,
      });
    }

    return res.status(200).send({
      message: "status: success - artiste found",
      artiste,
    });
  } catch (err) {
    console.log("resssss", err);
    return res.status(400).send({
      message: "status: failed - something went wrong",
    });
  }
};

export default {
  createArtisteProfile,
  getArtiste,
};
