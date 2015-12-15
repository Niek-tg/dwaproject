/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

var jsonEditorConnection = new WebSocket("ws://localhost:3000");

/**
 * Sends a JSON message to the server
 * @param data
 */
function jsonSendMessage(data){
    jsonEditorConnection.send(JSON.stringify(data));
}

/**
 * Send a websocket message to the server to receive memory models.
 */
jsonEditorConnection.onopen = function() {
    console.log("getting memory models");
    connection.send(JSON.stringify({msgType: "getAllModels"}));
};

/**
 * Listener to messages received by the websocket. Fired when a message is received.
 *
 * @param message contains the message received by the websocket
 */
jsonEditorConnection.onmessage = function(message) {
    var data = JSON.parse(message.data);
    console.log(data);
    switch(data.msgType){
        case "updateMemoryModel":
            getMemoryModels(data.data);
            break;
        case "errorMsg":
            console.log(data.data);
            break;
        default :
            console.log('default');
            break;
    }
};


