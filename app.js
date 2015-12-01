var express = require('express');
var ws = require('ws');
var http = require('http');
var path = require('path');
var bodyParser = require('body-parser');
var memorymodelRoute = require('./server/routes/memorymodels.js');
var r = require('rethinkdb');

var config     = require('./config.js');

const RUNSEED = (process.argv.slice(2) == 'seed');

if(RUNSEED){
    var seedScript = require('./server/seedScript.js');
    seedScript.runSeed(startWebservers); // startWebservers as callback, when done
} else startWebservers();

var theHttpServer;

//Function to set up HTTP server with settings from config.js

function startWebservers(){

    var theExpressApp = express();
    theHttpServer = http.createServer();
    theExpressApp.use(bodyParser.json());

    var webSocketServer = new ws.Server({
        server: theHttpServer
    });

    theExpressApp.use(express.static(path.join(__dirname, 'public')));
    theExpressApp.use('/api/memorymodels', memorymodelRoute);

    webSocketServer.on('connection', function connection(websocket) {
        websocket.on('message', function incoming(message) {

            switch(message.msgType){
                case "subscribeToChanges":
                    // TODO

                break;
                default :
                    // TODO come up with a default action
                break;
            }



        });

        websocket.on('close', function incoming(msg) {

        });
    });

    theHttpServer.on('request', theExpressApp).listen(config.express.port, function() {
        console.log("The Server is lisening on port 3000.")
    });
}

module.exports = theHttpServer;