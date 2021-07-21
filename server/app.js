import express from "express";
import bodyParser from "body-parser";

import routes from "./routes";
import connect, { getDb } from "./connect";
import models from "./models";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.static(__dirname + "/views"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/audio.html");
});

app.use(bodyParser.urlencoded({ extended: false }));

routes(app);
connect();
getDb();

export default app;
