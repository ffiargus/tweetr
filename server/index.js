"use strict";

// Express setup:

const PORT          = 8080;
const express       = require("express");
const bodyParser    = require("body-parser");
const cookieSession = require("cookie-session");
const app           = express();
const MongoClient   = require("mongodb").MongoClient;
const MONGODB_URI   = "mongodb://localhost:27017/tweeter";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
  maxAge: 60 * 60 * 1000

}));

//Connects to the Mongodb database at the URI of Tweeter
//using the standard mongodb port 27017
MongoClient.connect(MONGODB_URI, (err, db) => {

  //logs connection status
  if (err) {
    console.error(`Failed to connect: ${MONGODB_URI}`);
    throw err;
  }
  console.log(`Connected to mongodb: ${MONGODB_URI}`);

  //Sends database into datahelpers module
  //dataHelpers is the only database that accesses the database
  const DataHelpers = require("./lib/data-helpers.js")(db);

  //The following are modules to organize http requests/responses
  //functions created in the dataHelpers are sent into
  //the routes to give access to database
  const rootRoutes = require("./routes/root")(DataHelpers);
  const tweetsRoutes = require("./routes/tweets")(DataHelpers);

  //using our express server at each paths
  app.use("/", rootRoutes);
  app.use("/tweets", tweetsRoutes);
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
