/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

var jsonEditorConnection = new WebSocket("ws://localhost:3000");

/**
 * When jsonEditorConnection is opened a message is send to the server to identify wich socket it is en the state of it
 */

jsonEditorConnection.onopen = function () {
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'notActive'})
}

/**
 * Send a percolator message to messageHandler with connection en data
 * @param connection Contains the socketconnection
 * @param data Contains the data that needs to be send
 */
jsonEditorSendMessage = function (data) {
    sendMessage(jsonEditorConnection, data);
}

/**
 * Sends a JSON message true messageHandler client to the server
 * @param data
 */
jsonEditorConnection.onmessage = function (message) {
    messageHandlerClient(message);
}

/**
 * Triggered when the windows is closed. the current cursor is being unsubscribed to prevent server errors and eventually the websocket is closed
 */
window.onbeforeunload = function () {
    jsonEditorConnection.onclose = function () {
    }; // disable onclose handler first
    jsonEditorSendMessage({msgType: "unsubscribeToCurrentCursor"});
    jsonEditorConnection.close()
};

/**
 * Change the state of the json editor to non active
 */

changeJsonEditorState = function () {
    console.log("CODE VIEW IS NOT ACTIVE");
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'notActive'})
}

/**
 * Change the state of the json editor to active
 */

activeJsonEditorState = function () {
    console.log("CODE VIEW IS ACTIVE");
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'active'})
}