/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

var connection = new WebSocket("ws://localhost:3000");

/**
 * Sends a JSON message to the server
 * @param data
 */
function sendMessage(data){
    connection.send(JSON.stringify(data));
}

/**
 * Send a websocket message to the server to receive memory models.
 */
connection.onopen = function() {
    console.log("getting memory models");
    connection.send(JSON.stringify({msgType: "getAllModels"}));
};

/**
 * Listener to messages received by the websocket. Fired when a message is received.
 *
 * @param message contains the message received by the websocket
 */
connection.onmessage = function(message) {
    var data = JSON.parse(message.data);
    console.log(data);
    switch(data.msgType){
        case "newData":
            updateMemoryModel(data);
            break;
        case "getAllModels":
            getMemoryModels(data.data);
            break;
        case "getModelById":
            getMemmoryModelById(data.data);
            break;
        case "positionsUpdated":
            console.log(data.data);
            break;
        case "errorMsg":
            console.log(data.data);
        default :
            console.log('komt nog');
            break;
    }
};


