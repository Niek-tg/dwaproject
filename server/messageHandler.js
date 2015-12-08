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
messageHandler.identifyMessage = function(message, websocket){
   message = JSON.parse(message);
    switch(message.msgType){

        case "subscribeToChanges":
            messageHandler.subscribeToChanges(message,websocket);
            break;

        default :
            // TODO come up with a default action
            break;

    }
};

/**
 * Subscribes to a memory model and sends new updates of the model to the client
 * @param message Message that has been received from client, has a mmid in this case
 * @param websocket Connection to the websocket so a new message can be sent to client
 */
messageHandler.subscribeToChanges = function(message, websocket){
    queries.subscribeToChanges(message.data.mmid, function(err, cursor) {
        cursor.each(
            function(err, row) {
                if (err) throw err;
                websocket.send(JSON.stringify({msgType :"newData",data:row}))
            }
        );
    });
};

module.exports = messageHandler;

