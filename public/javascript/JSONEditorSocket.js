/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

var jsonEditorConnection = new WebSocket("ws://localhost:3000");

/**
 * When jsonEditorConnection is opened a message will be send to the server to identify which socket
 * it is and the state of it
 */

jsonEditorConnection.onopen = function () {
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'notActive'})
};

/**
 * Sends a percolator message to messageHandler with connection and data
 * @param connection Contains the socketconnection
 * @param data Contains the data that needs to be send
 */

jsonEditorSendMessage = function (data) {
    sendMessage(jsonEditorConnection, data);
};

/**
 * Receives incoming messages from the server.
 * @param message which is send by the server.
 */

jsonEditorConnection.onmessage = function (message) {
    messageHandlerClient(message);
};

/**
 * Triggered when the windows is closed. The current cursor is being unsubscribed to prevent server errors and
 * eventually the websocket is closed
 */

window.onbeforeunload = function () {
    jsonEditorSendMessage({msgType: "unsubscribeToCurrentCursor"});
    jsonEditorConnection.close()
};

/**
 * Change the state of the json editor to non active
 */

changeJsonEditorState = function () {
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'notActive'})
};

/**
 * Change the state of the json editor to active
 */

activeJsonEditorState = function () {
    jsonEditorSendMessage({msgType: 'socketIdentifier', identity: 'jsonEditor', state: 'active'})
};