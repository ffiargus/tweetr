"use strict";

const express       = require("express");
const app           = express();
const rootRoutes    = express.Router();

module.exports = function(DataHelpers) {

  //checks cookie to see if/which user is logged in
  rootRoutes.get("/renderlogin", function(req, res) {
    let userID = req.session.userID;
    res.json(userID);
  });

  //login route using a post request
  //sends cookie on success
  rootRoutes.post("/login", function(req, res) {
    DataHelpers.validateLogin(req.body.email, req.body.password, (handle, err) => {
      if (!handle) {
        console.error(err);
      } else {
        console.log(handle, "logged in");
        req.session.userID = handle;
        res.redirect("/");
      }
    });
  });

  //post request to manage logouts, clears cookie
  rootRoutes.post("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
  });

  //post request using datahelpers to create user in database upon successful registration
  rootRoutes.post("/register", function(req, res) {
    DataHelpers.registerUser(req.body.email, req.body.password, req.body.handle, req.body.name, req, res, (err) => {
      if (err) {
        console.log(err);
      };
    });
  });

  return rootRoutes;
}