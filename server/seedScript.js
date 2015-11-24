"use strict";

var r     = require("rethinkdb");
var async = require('async');

var config = require('./../config/config.js');

//async.waterfall module for async functions
    async.waterfall([
        function connect(callback) {
                r.connect(config.rethinkdb , callback);
        },
        function removeAllDatabases(connection, callback){
                var nrdatabases = config.rethinkdb.databases.length;
                var count = 0;
                config.rethinkdb.databases.forEach(function(db){
                    r.dbDrop(db).run(connection, function(err) {
                        count++;
                        if(count >= nrdatabases)callback(err, connection);
                    });
                })
        },
        function createAllDatabases(connection, callback) {
                //Create the database if needed.
                config.rethinkdb.databases.forEach(function(db){
                    r.db(db).run(connection, function(err) {
                        if (err) throw err;
                    })
                }).run(connection, function(err) {
                    callback(err, connection);
                });


            },
        function createTable(connection, callback) {
                //Create the table if needed.
                    r.tableList().contains('users').do(function(containsTable) {
                            return r.branch(
                                    containsTable,
                                    {created: 0},
                                    r.tableCreate('users')
                                );
                        }).run(connection, function(err) {
                            callback(err, connection);
                        });
            },

        ], function(err, connection) {
        if(err) {
                console.error(err);
                return;
            }
        startExpress(connection);
        });