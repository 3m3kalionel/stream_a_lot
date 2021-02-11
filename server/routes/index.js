import controllers from "../controllers";

const userController = controllers.user;

const router = app => {
  app.post("/api/v1/user/signup", userController.signup);
};

export default router;
