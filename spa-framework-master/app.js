/**
 * Created by Dion Koers on 6-11-2015.
 */

"use strict";

var   http       = require('http');
var   PORT       = 3001;
var   express    = require('express');
var   app        = express();
var   bodyParser = require('body-parser');
var   path       = require('path');
var   r          = require("rethinkdb");
var async = require('async');



var loginRoute    = require('./server/routes/loginRoute');
var registerRoute = require('./server/routes/registerRoute');
var firebaseRoute = require('./server/routes/firebaseRoute');
var rethinkdbRoute = require('./server/routes/rethinkdbRoute');

//rethinkDB config code
var config = require('./config.js');


app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/login', loginRoute);
app.use('/api/register', registerRoute);
app.use('/api/firebaseRoute', firebaseRoute);
app.use('/api/rethinkdbRoute', rethinkdbRoute);

// error middleware
app.use(function (err, req, res, next) {
    res.send(err);
    throw err;
});

function startExpress(connection) {
    app.databaseConn = connection;
//    app.listen(config.express.port);
    console.log('Listening on port ' + config.express.port);
    http.createServer(app).listen(config.express.port, function () {
        console.log('Server started at port: ' + config.express.port);

    });

}

//async.waterfall module for async functions
async.waterfall([
    function connect(callback) {
        r.connect(config.rethinkdb, callback);
    },
    function createDatabase(connection, callback) {
        //Create the database if needed.
        r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
            return r.branch(
                containsDb,
                {created: 0},
                r.dbCreate(config.rethinkdb.db)
            );
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

