/**
 * Sets up and holds the websocket connection.
 * @type {WebSocket}
 */

var connection = new WebSocket("ws://localhost:3000");

/**
 * Sends a JSON message to the server
 * @param data The data to send
 */
function sendMessage(data){
    connection.send(JSON.stringify(data));
}

/**
 * Send a websocket message to the server when connection is opened,
 * to get all memory models
 */
connection.onopen = function() {
    console.log("getting memory models");
    connection.send(JSON.stringify({msgType: "getAllModels"}));
};
/**
 * Triggered when the windows is closed. the current cursor is being unsubscribed to prevent server errors and eventually the websocket is closed
 */
window.onbeforeunload = function() {
    connection.onclose = function () {}; // disable onclose handler first
    sendMessage({msgType: "unsubscribeToCurrentCursor"});
    connection.close()
};


/**
 * MessageListener for the client, runs when a new message is received.
 * @param message Contains the received message
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
        case "updateMemoryModel":
            getMemoryModels(data.data);
            break;
        case "updateList":
            getVersionList(true);
            break;
        case "errorMsg":
            console.log(data.data);
            break;
        default :
            console.log('client messagehandler: unknown message received ' + data.msgType);
            break;
    }
};


