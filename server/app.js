import express from "express";
import bodyParser from "body-parser";

import routes from "./routes";
import connect, { getDb } from "./connect";
import models from "./models";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("*", (req, res) => res.status(200).send("Yo! Welcome to stream_a_lot"));

routes(app);
connect();
getDb();

export default app;
