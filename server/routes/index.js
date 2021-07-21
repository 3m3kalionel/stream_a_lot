import controllers from "../controllers";

const artisteController = controllers.artiste;
const albumController = controllers.album;
const playlistController = controllers.playlist;
const trackController = controllers.track;
const userController = controllers.user;

const router = app => {
  // user auth
  app.post("/api/v1/user/signup", userController.signup);
  app.post("/api/v1/user/signin", userController.signin);

  //artiste
  app.post("/api/v1/artiste", artisteController.createArtisteProfile);
  app.get("/api/v1/artiste/:artisteId", artisteController.getArtiste);

  // track
  app.post("/api/v1/track", trackController.createTrack);
  app.get("/api/v1/track/:trackId", trackController.getTrack);

  // playlist
  app.post("/api/v1/playlist", playlistController.createPlaylist);
  app.get("/api/v1/playlist/:playlistId", playlistController.getPlaylist);
  app.put(
    "/api/v1/playlist/:playlistId",
    playlistController.addTracksToPlaylist
  );
  app.delete("/api/v1/playlist/:playlistId", playlistController.deletePlaylist);

  //  favourites
  app.get(
    "/api/v1/users/:userId/:filterQuery",
    userController.getUserFavourites
  );
  app.put(
    "/api/v1/user/:userId/:favouritesCategory/:favouritesCategoryId",
    userController.addToFavourites
  );
  app.put(
    "/api/v1/user/:userId/:favouritesCategory/:favouritesCategoryId/remove",
    userController.removeFromFavourites
  );
};

export default router;
