import { createServer } from "http";

import app from "./app";

// set up the server
const port = parseInt(process.env.PORT, 10) || 8000;

app.set("port", port);

const server = createServer(app);
server.listen(port, err => {
  err && console.error(err);
  console.log(`Server running on port ${port}`);
});
