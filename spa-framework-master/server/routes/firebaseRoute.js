/**
 * Created by Dion Koers on 11-11-2015.
 */

"use strict";

var express = require('express');
var router = express.Router();

var Firebase = require("firebase");
var myDataRef = new Firebase('https://spa-dashboard.firebaseio.com/');

// Create a database reference to user data
var usersRef = myDataRef.child("users");

router.get('/getUser', function (req, res) {
    // Get a database reference to our posts

    //usersRef.once("value", function (snapshot) {
    //    var nameSnapshot = snapshot.child("userDion");
    //    var name = nameSnapshot.val();
    //    console.log(name);
    //}, function (error) {
    //    if (error) {
    //        console.log("Data could not be saved." + error);
    //    } else {
    //        console.log("Get data successfully.");
    //    }
    //});

    // Attach an asynchronous callback to read the data at our posts reference

    var onValueChange =  myDataRef.once("value", function(snapshot) {
        console.log(snapshot.val());
        off('value', onValueChange);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });


});

router.post('/createNewUser', function (req, res) {
    // TODO set gegevens
    // Write or replace data
    // use set() to save a user object to the database with the user's username, full name, and birthday.
    // When a JSON object is saved to the database, the object properties are automatically mapped to
    // database child locations
    // If you'd like to know when your data has been committed, you can add a completion callback.
    // Both set() and update() take an optional completion callback that is called when the write has
    // been committed to the database.

    usersRef.set({
        userDion: {
            date_of_birth: "Februari 23, 1992",
            full_name: "Dion Koers"
        }
    }, function (error) {
        if (error) {
            console.log("Data could not be saved." + error);
        } else {
            console.log("Data saved successfully.");
        }
    });
    console.log('post route wordt aangeroepen');
    res.send('succes set');
});

router.post('/createNewUserWithPush', function (req, res) {
    // TODO set gegevens
    // Push is used when you are woking with list data
    // would work if only a single author were adding posts, but in our collaborative blogging application many users
    // may add posts at the same time. If two authors write to /posts/2 simultaneously, then one of the posts would be
    // deleted by the other.
    // instead use push
    // push()  generates a unique ID, or key, for each new child. so 2 or more party's can add at the same time
    // The unique key is based on a timestamp, so list items will automatically be ordered chronologically.

    // create a new child for users en execute this way .key() can get the unique id
    var newUser = usersRef.push();
    // TODO check how push _ set work together

    usersRef.push({
        userDion: {
            date_of_birth: "Februari 23, 1992",
            full_name: "Dion Koers"
        }
    }, function (error) {
        if (error) {
            console.log("Data could not be saved." + error);
        } else {
            console.log("Data saved successfully.");
        }
    });
    console.log('post route wordt aangeroepen');

    var postID = newUser.key();
    console.log(postID);
    res.send('succes set');
});


router.post('/updateUser', function (req, res) {
    //TODO update user
    //Update child of database reference

    usersRef.child("userDion").update({
        date_of_birth: "June 23, 1912",
        full_name: "Dion Dion"
    }, function (error) {
        if (error) {
            console.log("Data could not be saved." + error);
        } else {
            console.log("Data updated successfully.");
        }
    });
    res.send('succes update');
});

router.get('/deleteUser', function (req, res) {
    //TODO update user
    //Delete a child of the database reference

    usersRef.child("userDion").remove(), function (error) {
        if (error) {
            console.log("Data could not be deleted." + error);
        } else {
            console.log("Data deleted successfully.");
        }
    };
    res.send('delete succes');
});

// TODO important Saving Transactional Data

module.exports = router;