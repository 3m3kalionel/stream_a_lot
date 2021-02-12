import controllers from "../controllers";

const artisteController = controllers.artiste;
const trackController = controllers.track;
const userController = controllers.user;

const router = app => {
  app.post("/api/v1/user/signup", userController.signup);
  app.post("/api/v1/user/signin", userController.signin);
  app.post("/api/v1/artiste", artisteController.createArtisteProfile);
  app.get("/api/v1/artiste/:artisteId", artisteController.getArtiste);
  app.post("/api/v1/track", trackController.createTrack);
  app.get("/api/v1/track/:trackId", trackController.getTrack);
};

export default router;
