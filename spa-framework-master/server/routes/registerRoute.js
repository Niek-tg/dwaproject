/**
 * Created by Dion Koers on 9-11-2015.
 */

"use strict";

var express = require('express');
var router = express.Router();

var Firebase = require("firebase");
var myFirebaseRef = new Firebase('https://spa-dashboard.firebaseio.com/');

router.post('/', function (req, res) {

    myFirebaseRef.createUser({
        email:    req.body.email,
        password: req.body.password
    }, function (error, userData) {
        if (error) {
            console.log("Error creating user:", error);
        } else {
            console.log("Successfully created user account with uid:", userData.uid);
        }
    });
});

module.exports = router;