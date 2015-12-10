"use strict";

var r     = require("rethinkdb");
var fs = require('fs');

var config = require(__dirname +'/../config.js');

var ModelInfo = require('./models/thinkyModels.js').ModelInfo;
var History = require('./models/thinkyModels.js').History;

function runSeed(cb){
    var connection = null;
    console.log("seedScript started");
    r.connect(config.rethinkdb).then(function(conn){
        connection = conn;
        return r.dbList().run(connection)
    }).then(function(databases){
        var nrdatabases = databases.length -1;
        var count = 0;
        if(nrdatabases > 0)
            return new Promise(function(resolve, reject){
                databases.forEach(function(db){
                    if(db != "rethinkdb"){    //some weird database, used by rethink.
                        r.dbDrop(db).run(connection, function(err){
                            if (err) reject(err);
                            count++;
                            if(count >= nrdatabases)resolve();
                        });
                    }
                });
            })

    }).then(function(){
        return new Promise(function(resolve, reject){
            r.dbCreate(config.rethinkdb.database).run(connection, function(err) {
                if (err) reject(err);
                resolve();
            });
        });

    }).then(function(){

        var nrdatabases = config.rethinkdb.tables.length;
        var count = 0;

        return new Promise(function(resolve, reject){
            config.rethinkdb.tables.forEach(function(db){
                r.db(config.rethinkdb.database)
                    .tableCreate(db).run(connection, function(err){
                        if (err) reject(err);
                        count++;
                        if(count >= nrdatabases)resolve();
                    })
            })
        });

    }).then(function(){
        return new Promise(function(resolve, reject) {
            fs.readFile(__dirname + "/data/modelInfo.json", 'utf8', function (err, data) {
                if (err) reject(err);
                resolve(JSON.parse(data));
            })
        })
    }).then(function(seedData){
        return new Promise(function(resolve, reject) {

            var aantal = seedData.length;
            var curDone = 0;
            seedData.forEach(function(seed){
                new ModelInfo(seed).save().then(function(result) {
                    curDone++;
                    if(curDone == aantal) resolve(result);
                }).error(function(error) {
                    console.log(error);
                    reject(error);
                });
            });
        })
    }).then(function(){
        return new Promise(function(resolve, reject) {
            fs.readFile(__dirname + "/data/history.json", 'utf8', function (err, data) {
                if (err) reject(err);
                resolve(JSON.parse(data));
            })
        })
    }).then(function(seedData){
        return new Promise(function(resolve, reject) {

            var aantal = seedData.length;
            var curDone = 0;
            seedData.forEach(function(seed){
                new History(seed).save().then(function(result) {
                    curDone++;
                    if(curDone == aantal) resolve(result);
                }).error(function(error) {
                    console.log(error);
                    reject(error);
                });
            });
        })
    }).then(function(){
        // create indexes
        History.ensureIndex("mmid");
        History.ensureIndex("version");
    }).finally(function(){
        console.log("database seeded");
        cb();
    }).error(function (err) {
        throw new Error("Something went wrong! "+ err);
    });

}

module.exports = {
    runSeed: runSeed
};