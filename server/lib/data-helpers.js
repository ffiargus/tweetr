"use strict";

// Simulates the kind of delay we see with network or filesystem operations
const simulateDelay = require("./util/simulate-delay");
const userHelper    = require("../lib/util/user-helper");

// Defines helper functions for saving and getting tweets, using the database `db`
module.exports = function makeDataHelpers(db) {

  function isDuplicateAccount (userAccount) {
    return db.collection("users").find().toArray((err, results) => {
      for (let user of results) {
        if (userAccount.email === user.email || userAccount.handle === user.handle) {
          return true;
        }
      }
      console.log("user added:", userAccount.handle);
      db.collection("users").insertOne(userAccount);
      return false;
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
        //db.close();
      });
    },

    validateLogin: function(Qemail, Qpass, callback) {
      db.collection("users").find({email: Qemail}).toArray((err, results) => {
          if (results[0].password === Qpass) {
            callback(results[0].handle);
          } else {
            callback(null);
          }

      });
    },

    registerUser: function(Qemail, Qpass, Qhandle, Qname, callback) {
      if (Qname === "" || Qemail === "" || Qpass === "" || Qhandle === ""){
        callback("missing input");
      } else {
        Qhandle = "@" + Qhandle;
        let newUser = {
          email: Qemail,
          password: Qpass,
          handle: Qhandle,
          name: Qname,
          avatars: userHelper.generateRandomAvatars()
        }
        if (isDuplicateAccount(newUser)) {
          callback("username/handle already registered");
        }
      }

    }

  };
}
