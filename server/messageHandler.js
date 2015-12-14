var queries = require('./queries/queries.js');
var app = require('../app.js');

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

        case "updateMemoryModel":
            messageHandler.updateMemoryModel(message, websocket);
            break;

        case "testCase":
            console.log("Komt in testcaseKomt in testcaseKomt in testcaseKomt in testcaseKomt in testcaseKomt " +
                "in testcaseKomt in testcaseKomt in testcaseKomt in testcaseKomt in testcaseKomt in testcase");
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
    console.log(message);
    websocket.currentID = message.data.id;
    queries.subscribeToChanges(message.data.id, function (err, cursor) {
        console.log("IN MESSAGEHANDLER SUBSCRIBE");
        cursor.each(
            function (err, row) {
                if (err) throw err;
                console.log("IN CURSOREACH SUBSCRIBE");
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
    console.log(message.id)
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
            data: "Something went wrong in query createNewMemorymodel " + err
        }));

        websocket.send(JSON.stringify({msgType: "getAllModels", data: result}));
        console.log(JSON.stringify(result));
    });
};

/**
 * Deletes a memory model with the given ID from the database
 * @param message
 * @param websocket
 */
messageHandler.deleteModel = function (message, websocket) {
    var mmid = message.data.mmid;
    console.log('Dit zit er in deleteModel mmid')
    console.log(mmid)
    var version = parseInt(message.data.version);
    console.log('Dit zit er in deleteModel version')
    console.log(version)
    queries.deleteLatestversion(mmid, version, function (err, result) {
        if (err) {
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the delete query, unexpected error: " + err
            }));
        } else {
            console.log('Hij komt in de callback');
            console.log(result);
            app.broadCastToAll({msgType: "updateList", data: "Ik ben een test"});

        }
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

};

messageHandler.updateMemoryModel = function (message, websocket) {
    var memoryModel = message.data;

    queries.updateMemoryModel(memoryModel, function (err, result) {
        console.log("Koekenzopeioeioieiooioioiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
        if (err) {
            return websocket.send(JSON.stringify({
                msgType: "errorMsg",
                data: "Something went wrong in the delete query, unexpected error: " + err
            }));
        }

        else {
            return websocket.send(JSON.stringify({
                msgType: "updateMemoryModel",
                data: "Updated memorymodel completed"
            }));
        }

    });

};


module.exports = messageHandler;

