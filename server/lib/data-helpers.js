"use strict";

const userHelper    = require("../lib/util/user-helper");
const bcrypt        = require("bcrypt");

//used for updating tweets using thier object id assigned by mongo
const ObjectId      = require("mongodb").ObjectId;

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {

  function isDuplicateAccount (userAccount, req, res) {
    db.collection("users").find().toArray((err, results) => {
      for (let user of results) {                         //checks if handle or email is in use
        if (userAccount.email === user.email || userAccount.handle === user.handle) {
          console.log("user/handle already exists");
          return;
        }
      }
      db.collection("users").insertOne(userAccount);       //stores user in database
      console.log("user added:", userAccount.handle);
      req.session.userID = userAccount.handle;
      res.redirect("/");
    });
  };

  return {

    // Saves a tweet to `db`
    saveTweet: function(userHandle, newTweet, callback) {
      db.collection("users").find({handle: userHandle}).toArray((err, results) => {
        newTweet.user.name = results[0].name;
        newTweet.user.handle = results[0].handle;
        newTweet.user.avatars = results[0].avatars;
        db.collection("tweets").insertOne(newTweet)
      });
      callback(null, true);
    },

    // Get all tweets in `db`, sorted by newest first
    getTweets: function(callback) {
      db.collection("tweets").find().toArray((err, results) => {
        if (err) throw err;
        const sortNewestFirst = (a, b) => a.created_at - b.created_at;
        callback(null, results.sort(sortNewestFirst));
      });
    },

    validateLogin: function(Qemail, Qpass, callback) {
      db.collection("users").find({email: Qemail.toLowerCase()}).toArray((err, results) => {
          if (!results[0]) {
            callback(null, "invalid user");
          } else if (bcrypt.compareSync(Qpass, results[0].password)) {
            callback(results[0].handle, null);
          } else {
            callback(null, "wrong password");
          }

      });
    },

    //following function check validity of user and calls function
    registerUser: function(Qemail, Qpass, Qhandle, Qname, Qreq, Qres, callback) {
      if (Qname === "" || Qemail === "" || Qpass === "" || Qhandle === "") {
        callback("missing input");
      } else {
        let hashedPass = bcrypt.hashSync(Qpass, 10);    //hashes the password before storing it
        Qhandle = "@" + Qhandle.toLowerCase();          //ensures handle and email are not case-sensitive
        let newUser = {
          email: Qemail.toLowerCase(),
          password: hashedPass,
          handle: Qhandle,
          name: Qname,
          avatars: userHelper.generateRandomAvatars()   //uses user helper utility to recieve avatars
        }
        //checks if user already exists, if not stores new user into database
        isDuplicateAccount(newUser, Qreq, Qres);
      }
    },

    //like tweets function to modify and update the properties in the database
    likeTweet: function(uID, tID, callback) {
      let formatTID = new ObjectId(tID);        //formats id to allow for mongo query
      db.collection("tweets").find({_id: formatTID}).toArray((err, results) => {
        for (let i = 0; i < results[0].likes.length; i++) {
          if (uID === results[0].likes[i]) {
            results[0].likes.splice(i, 1);
            db.collection("tweets").update({_id: formatTID}, {$set:{likes: results[0].likes}});
            callback(null, true); //true means unlike
            return;
          }
        }
        results[0].likes.push(uID);
        db.collection("tweets").update({_id: formatTID}, {$set:{likes: results[0].likes}});
        callback(null, false); //false means like tweet
      });
    }

  };
}
