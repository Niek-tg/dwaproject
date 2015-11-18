/**
 * Created by dickpino on 12-11-15.
 */

"use strict";

var express = require('express');
var router = express.Router();

var r = require("rethinkdb");

// Create a database reference to user dat

router.get('/getUser', function (req, res) {

    r.table('users').run(req.app.databaseConn,function(err, result){
        if(err){
            console.log("User not be created." + err);

        }
        else {
            //console.log(JSON.stringify(result._responses));

             //console.log(result);

            res.json(result._responses[0].r);

        }
    });

});

router.get('/getCursor', function(req, res){
    r.table('users').changes().run(req.app.databaseConn).then(function(cursor) {
        // Retrieve all the todos in an array
        var X = cursor;

        console.log(this.x);
        return X;
        cursor.toArray(function(err, result) {
            console.log(result);
            if (err) throw err;
            res.data(result);
        });
    }).error(function(err){
        console.log("error!: "+ err);
    });
});

router.post('/createNewUser', function (req, res) {
    r.table("users")
        .insert({
        name: 'Frits',
        age: 29
        },{returnChanges: true})
        .run(req.app.databaseConn,function(err, result){
            if(err){
                console.log("User could not be created." + err);
            }
            else {
                console.log("User created successfully.");
            }
    })
});

router.post('/updateUser', function (req, res) {

    var age = Math.floor(Math.random() * 100) + 1;
    console.log(age);

    r.table('users')
        .getAll("Frits", {index: "name"})
        .update({age: age}, {returnChanges: true})
        .run(req.app.databaseConn, function(err, result) {
            if(err){
                return res.json({"message": err});
            }
            else {
                return res.json({"message": "Succes!"});
            }
        });
});

router.get('/deleteUser', function (req, res) {

    r.table('users').getAll("Sjakie").delete().run(req.app.databaseConn, function(err, result) {
        if(err){
            console.log("User could not be deleted." + err);
        }
        else {
            console.log("User deleted successfully.");
        }    });
    res.send('delete succes');
});

module.exports = router;