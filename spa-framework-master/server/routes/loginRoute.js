/**
 * Created by Dion Koers on 6-11-2015.
 */

"use strict";

var express = require('express');
var router = express.Router();

var Firebase = require("firebase");
var myDataRef = new Firebase('https://spa-dashboard.firebaseio.com/');

router.post('/', function (req, res) {

    // TODO create JSON WEB TOKEN

    myDataRef.authWithPassword({
        email: req.body.email,
        password: req.body.password
    }, function (error, authData) {
        if (error) {
            console.log("Login Failed!", error);
            return res.send({succeeded: false});
        } else {
            console.log("Authenticated successfully with payload:", authData);
            return res.send({succeeded: true});
        }
    });
});

module.exports = router;