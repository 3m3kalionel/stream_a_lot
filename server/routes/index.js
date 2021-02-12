import controllers from "../controllers";

const artisteController = controllers.artiste;
const playlistController = controllers.playlist;
const trackController = controllers.track;
const userController = controllers.user;

const router = app => {
  app.post("/api/v1/user/signup", userController.signup);
  app.post("/api/v1/user/signin", userController.signin);
  app.post("/api/v1/artiste", artisteController.createArtisteProfile);
  app.get("/api/v1/artiste/:artisteId", artisteController.getArtiste);
  app.post("/api/v1/track", trackController.createTrack);
  app.get("/api/v1/track/:trackId", trackController.getTrack);
  app.post("/api/v1/playlist", playlistController.createPlaylist);
  app.put(
    "/api/v1/playlist/:playlistId",
    playlistController.addTracksToPlaylist
  );
};

export default router;
