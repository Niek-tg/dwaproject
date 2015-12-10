var queries = require('./queries/queries.js');

/**
 * Exportable object that stores all methods of the messageHandler
 */
var messageHandler = {};

/**
 * Handles all incoming messages from clients and calls the corresponding methods
 * @param message Message that has been received from client
 * @param websocket Connection to the websocket so a new message can be sent to client later
 */
messageHandler.identifyMessage = function (message, websocket) {
    message = JSON.parse(message);
    switch (message.msgType) {

        case "subscribeToChanges":
            messageHandler.subscribeToChanges(message, websocket);
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

        case "deleteModel":
            messageHandler.deleteModel(message, websocket);
            break;

        case "updateFramePositions":
            messageHandler.setModelPositions(message, websocket);
            break;
        case "addNewFrame":
            messageHandler.addNewFrame(message, websocket);
            break;
        case "addVariableToFrame":
            messageHandler.addVariableToFrame(message, websocket);
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
    websocket.currentMMID = message.data.mmid;
    queries.subscribeToChanges(message.data.mmid, function (err, cursor) {
        cursor.each(
            function (err, row) {
                if (err) throw err;
                websocket.send(JSON.stringify({msgType: "newData", data: row}))
            }
        );
    });
};

/**
 * Gets all memory models from the database and sends them back to the client
 * @param message
 * @param websocket
 */
messageHandler.getAllMemoryModels = function (message, websocket) {
    queries.getAll(function (err, result) {
        if (err)
            return websocket.send(JSON.stringify({msgType: "errorMsg", data: err}));

        if (!result)
            return websocket.send(JSON.stringify({
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

    queries.createNewMemoryModel({language: language, owner: owner, modelName: modelName}, function (err, result) {
        if (err) websocket.send(JSON.stringify({
            msgType: "errorMsg",
            data: "Something went wrong in query createNewMemorymodel " + err
        }));

        websocket.send(JSON.stringify({msgType: "makeNewModel", data: result}));
    });
};

/**
 * Deletes a memory model with the given ID from the database
 * @param message
 * @param websocket
 */
messageHandler.deleteModel = function (message, websocket) {
    var mmid = message.data.id;
    var version = parseInt(message.data.version);
    queries.deleteLatestversion(mmid, version, function (err, result) {
        if (err)
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the delete query, unexpected error: " + err
            }));

        return websocket.send(JSON.stringify({msgType: "deleteModel", data: "Delete request completed"}));
    });
};

/**
 *
 * @param message
 * @param websocket
 */

messageHandler.setModelPositions = function (message, websocket) {
    var positions = message.data.frameIdEndPositions;
    var mmid = message.data.mmid;
    var version = message.data.version;

    queries.setModelPositions(positions, mmid, version, function (err, result) {
        if (err)
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the delete query, unexpected error: " + err
            }));

        return websocket.send(JSON.stringify({msgType: "positionsUpdated", data: "Positions updated completed"}));
    });
}


//TODO niew frame toevoegen even kijken of stack en heap appart moeten
messageHandler.addNewFrame = function (message, websocket) {
    var frame = message.data.newFrame;
    var mmid = message.data.mmid;
    var version = message.data.version;
    var frameType = message.data.frameType;
    console.log('frame' + frame);
    console.log('mmid' + mmid);
    console.log('version' + version);
    console.log('frametype' + frameType);

    queries.addNewFrame(mmid, version, frame, frameType, function (err, result) {
        if (err)
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the addNewFrame query, unexpected error: " + err
            }));

        return websocket.send(JSON.stringify({msgType: "newData", data: result}));
    });
}

//TODO moet nog
messageHandler.addVariableToFrame = function(message, websocket){
    var variableName = message.data.var.varName;
    var value = message.data.var.varValue;
    var currentMemoryModel = message.data.currentMemoryModel;
    var frameType = message.data.frameType;
    var currentFrameId = message.data.currentFrameId;

    console.log(currentMemoryModel + '' + variableName + '' + value + '' + currentFrameId + '' + frameType + '' + currentFrameId)

}

module.exports = messageHandler;

