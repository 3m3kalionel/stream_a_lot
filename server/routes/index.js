import controllers from "../controllers";

const userController = controllers.user;
const artisteController = controllers.artiste;

const router = app => {
  app.post("/api/v1/user/signup", userController.signup);
  app.post("/api/v1/user/signin", userController.signin);
  app.post("/api/v1/artiste", artisteController.createArtisteProfile);
  app.get("/api/v1/artiste/:artisteId", artisteController.getArtiste);
};

export default router;
