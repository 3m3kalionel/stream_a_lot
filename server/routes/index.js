import controllers from "../controllers";

const userController = controllers.user;

const router = app => {
  app.post("/api/v1/user/signup", userController.signup);
  app.post("/api/v1/user/signin", userController.signin);
};

export default router;
