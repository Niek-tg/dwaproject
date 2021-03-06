/**
 *  Requires the queries.js file
 * @type {queries|exports|module.exports}
 */
var queries = require('./queries/queries.js');

/**
 * Exportable object that stores all methods of the messageHandler
 */
var messageHandler = {};

/**
 * Holds an array of cursors, listening to the memory model they are currently viewing.
 * They are identified by using the ID given to the websocket on connection
 */
var cursorArray = [];

/**
 * TODO
 * They are identified by using the ID given to the websocket on connection
 */
var allModelsCursorArray = [];

/**
 * Handles all incoming messages from clients and calls the corresponding methods
 * @param message Message that has been received from client
 * @param websocket Connection to the websocket so a new message can be sent to client later
 * @param webSocketServer
 */

messageHandler.identifyMessage = function (message, websocket, webSocketServer) {
    message = JSON.parse(message);
    switch (message.msgType) {

        case "subscribeToChanges":
            messageHandler.subscribeToChanges(message, websocket);
            break;
        case "subscribeToAllModels":
            messageHandler.subscribeToAllModels(message, websocket);
            break;

        case "getAllModels":
            messageHandler.getAllMemoryModels(message, websocket);
            break;

        case "getModelById":
            messageHandler.getModelById(message, websocket);
            break;

        case "makeNewModel":
            messageHandler.makeNewModel(message, websocket);
            break;

        case "removeLatestVersion":
            messageHandler.deleteModel(message, websocket, webSocketServer);
            break;

        case "updateFrameLocations":
            messageHandler.updateFrameLocations(message, websocket);
            break;

        case "updateMemoryModel":
            messageHandler.updateMemoryModel(message, websocket, webSocketServer);
            break;

        case "unsubscribeToCurrentCursor":
            messageHandler.unsubscribeToChanges(websocket);
            break;

        case "socketIdentifier":
                websocket.connectionInfo.identity = message.identity;
                websocket.connectionInfo.state = message.state;
            break;
        default :
            websocket.send(JSON.stringify({msgType: "errorMsg", data: "MessageHandler: unknown msgType received="}));
            break;
    }
};

/**
 * Subscribes to a memory model and sends new updates of the model to the client
 * @param message Message that has been received from client, has a mmid in this case
 * @param websocket Connection to the websocket so a new message can be sent to client
 */
messageHandler.subscribeToChanges = function (message, websocket) {

    queries.subscribeToChanges(message.data.id, function (err, curs) {
        var socketID = websocket.connectionInfo.id;
        cursorArray[socketID] = curs;

        cursorArray[socketID].each(
            function (err, row) {
                if (err) throw err;
                websocket.send(JSON.stringify({msgType: "newData", data: row}))
            }
        );
    });
};
/**
 * Subscribes to all memory models
 * @param message
 * @param websocket
 */
messageHandler.subscribeToAllModels = function (message, websocket) {

    queries.subscribeToAllModels(function (err, curs) {
        var socketID = websocket.connectionInfo.id;
        allModelsCursorArray[socketID] = curs;

        allModelsCursorArray[socketID].each(
            function(err, row) {
                if (err) throw err;
                websocket.send(JSON.stringify({msgType: "newAllModelsData", data: row}))
            }
        );
    });
};

/**
 * Unsubscribes to a memory model
 */
messageHandler.unsubscribeToChanges = function (websocket) {
    var id = websocket.connectionInfo.id;
    var cursor = (cursorArray[id]) ? cursorArray[id] : null;
    if (cursor) cursor.close();
    var allModelsCursor = (allModelsCursorArray[id])? allModelsCursorArray[id] : null;
    if(allModelsCursor) allModelsCursor.close();
};

/**
 * Gets all memory models from the database and sends them back to the client
 * @param message
 * @param websocket
 */
messageHandler.getAllMemoryModels = function (message, websocket) {
    queries.getAll(function (err, result) {
        if (err) return websocket.send(JSON.stringify({msgType: "errorMsg", data: err}));

        if (!result) return websocket.send(JSON.stringify({
            msgType: "errorMsg",
            data: "Something went wrong in the getAll query: No memory models were found!"
        }));

        var resultsArray = [];

        result.forEach(function (r) {
            var inList = false;
            var i = 0;
            resultsArray.forEach(function (result) {
                if (r.mmid === result.mmid) {
                    inList = true;
                    if (r.version > result.version) {
                        resultsArray[i] = r;
                    }
                }
                else inList = false;
                i++;
            });
            if (inList === false) {
                resultsArray.push(r);
            }
        });
        websocket.send(JSON.stringify({msgType: "getAllModels", data: resultsArray}));
    });
};

/**
 * Gets a model by ID (and optionally by version too) from the database and sends it to the client
 * @param message
 * @param websocket
 */
messageHandler.getModelById = function (message, websocket) {
    var mmid = message.id;
    var version = (message.version) ? parseInt(message.version) : null;

    if (mmid) {
        var cb = function (err, result) {
            if (err)
                return websocket.send(JSON.stringify({msgType: "errorMsg", data: err}));

            if (result[0])
                return websocket.send(JSON.stringify({msgType: "getModelById", data: result[0]}));

            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the getModelById callback: ID or version does not exist"
            }));
        };

        if (version) queries.getMemoryModelByIdAndVersion(mmid, version, cb);
        else query = queries.getMemoryModelById(mmid, cb);

    } else return websocket.send(JSON.stringify({
        msgType: "errorMsg",
        data: "Something went wrong in getModelById query: not a valid id"
    }));
};

/**
 * Creates a new memory model in the database
 * @param message
 * @param websocket
 */
messageHandler.makeNewModel = function (message, websocket) {
    var language = message.data.language;
    var owner = message.data.owner;
    var modelName = message.data.modelName;
    var memoryModel = message.data.memoryModel;

    queries.createNewMemoryModel({
        language: language,
        owner: owner,
        modelName: modelName,
        memoryModel: memoryModel
    }, function (err, result) {
        if (err) websocket.send(JSON.stringify({
            msgType: "errorMsg",
            data: "Something went wrong in query create NewMemorymodel " + err
        }));
        else messageHandler.getAllMemoryModels(message, websocket);
    });
    websocket.send(JSON.stringify({msgType: "newMemoryModel", data: message}));
};

/**
 * Deletes a memory model with the given ID from the database en send a broadcast to al clients that
 * are active except the current websocket
 * @param message
 * @param websocket
 * @param webSocketServer
 */
messageHandler.deleteModel = function (message, websocket, webSocketServer) {
    var mmid = message.data.mmid;
    var version = parseInt(message.data.version);

    queries.deleteLatestversion(mmid, version, function (err, result) {
        if (err) {
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the delete query: " + err
            }));
        } else {
            webSocketServer.clients.forEach(function (client) {
                if(websocket != client){
                    if (client.connectionInfo.state === 'active') {
                        client.send(JSON.stringify({msgType: "removeLatestVersion"}))
                    }
                }
            });
        }
    });
};

/**
 *
 * @param message
 * @param websocket
 */
messageHandler.updateFrameLocations = function (message, websocket) {
    var positions = message.data.frameLocations;
    var mmid = message.data.mmid;
    var version = message.data.version;

    queries.updateFrameLocations(positions, mmid, version, function (err, result) {
        if (err)
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the updateFrameLocations query " + err
            }));

        return websocket.send(JSON.stringify({msgType: "positionsUpdated", data: "Positions updated completed"}));
    });
};

messageHandler.updateMemoryModel = function (message, websocket, webSocketServer) {
    var memoryModel = message.data.newMemoryModel;
    var oldMemoryModel = message.data.oldMemoryModel;

    queries.updateMemoryModel(memoryModel, oldMemoryModel, function (err, result) {
        if (err) {
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the updateMemoryModel query, unexpected error: " + err
            }));
        }
        else {
            return messageHandler.getAllMemoryModels(message, websocket);
        }
    });
};

module.exports = messageHandler;

