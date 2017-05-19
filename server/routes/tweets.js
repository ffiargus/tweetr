"use strict";

const express       = require('express');
const app           = express();
const tweetsRoutes  = express.Router();


module.exports = function(DataHelpers) {

  tweetsRoutes.get("/", function(req, res) {
    DataHelpers.getTweets((err, tweets) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(tweets);
      }
    });
  });

  tweetsRoutes.post("/", function(req, res) {
    if (!req.body.text) {
      res.status(400).json({ error: 'invalid request: no data in POST body'});
      return;
    }

    const tweet = {
      user: {
        name: "",
        handle: "",
        avatars: ""
      },
      content: {
        text: req.body.text
      },
      created_at: Date.now()
    };

    DataHelpers.saveTweet(req.session.userID, tweet, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).send();
      }
    });
  });

  tweetsRoutes.get("/renderlogin", function(req, res) {
    let userID = req.session.userID;
    res.json(userID);
  });

  tweetsRoutes.post("/login", function(req, res) {
    DataHelpers.validateLogin(req.body.email, req.body.password, (handle, err) => {
      if (!handle) {
        console.error(err);
      } else {
        console.log(handle, "logged in");
        req.session.userID = handle;
        res.redirect("/");
      };

    })
  });

  tweetsRoutes.post("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
  });

  tweetsRoutes.post("/register", function(req, res) {
    DataHelpers.registerUser(req.body.email, req.body.password, req.body.handle, req.body.name, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(req.body.handle);
        req.session.userID = "@" + req.body.handle;
        res.redirect("/");
      }
    });
  });
  return tweetsRoutes;

}
