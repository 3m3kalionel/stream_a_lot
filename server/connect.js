import mongoose from "mongoose";
import envConfig from "./config";

let db;

mongoose.Promise = global.Promise;

const getAppUrl = env => {
  let appUrl;
  switch (env) {
    case "test":
      appUrl = "APP_URL_TEST";
      break;
    case "production":
      appUrl = "APP_URL_PROD";
      break;
    default:
      appUrl = "APP_URL_DEV";
  }
  return process.env[appUrl];
};

const connect = async (config = envConfig) => {
  const database = await mongoose.connect(getAppUrl(process.env.NODE_ENV), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  mongoose.connection.on("connected", () => {
    console.log("Connected to a mongo instance");
  });

  mongoose.connection.on("error", err => {
    console.error("Error connecting to mongo", err);
  });

  db = database;
  return "connected";
};

export const getDb = () => {
  return db;
};

export default connect;
