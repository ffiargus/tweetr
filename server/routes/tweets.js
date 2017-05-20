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
      res.status(400).json({ error: "invalid request: no data in POST body"});
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
      likes: [],
      flags: [],
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

  //handles like requests using a put method
  tweetsRoutes.put("/:tID", function(req, res) {
    let uID = req.session.userID;
    let tID = req.params.tID;
    DataHelpers.likeTweet(uID, tID, (err, unLike) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(unLike);
      }
    })
  });

  return tweetsRoutes;

}
