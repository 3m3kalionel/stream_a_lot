import artisteModel from "../models/artisteModel";
import { handleError } from "../utils";

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

export default {
  createArtisteProfile,
};
