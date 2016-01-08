/**
 * Sets up and holds the websocket connection.
 * @type {WebSocket}
 */

var connection = new WebSocket("ws://localhost:3000");

/**
 * Sends a websocket message to the server when connection is opened to identify the socket and the state of it.
 * Sends a message to the server to get all memory models
 */

connection.onopen = function () {
    attachEventListeners();
    percolatorSend({msgType: 'socketIdentifier', identity: 'visualView', state: 'active'});
    percolatorSend({msgType: "getAllModels"});
};


/**
 * Sends a percolator message to messageHandler with connection and data
 * @param connection Contains the socketconnection
 * @param data Contains the data that needs to be send
 */
percolatorSend = function (data) {
    sendMessage(connection, data);
};


/**
 * Triggered when the windows is closed. The current cursor is being unsubscribed to prevent server errors and
 * eventually the websocket is closed
 */
window.onbeforeunload = function () {
    percolatorSend({msgType: "unsubscribeToCurrentCursor"});
    connection.close()
};

/**
 * MessageListener for the client, runs when a new message is received.
 * @param message Contains the received message
 */

connection.onmessage = function (message) {
    messageHandlerClient(message);
};

/**
 * Change the state of the JSON editor to non active
 */
changeDiagramState = function () {
    percolatorSend({msgType: 'socketIdentifier', identity: 'visualView', state: 'notActive'})
};

/**
 * Change the state of the JSON editor to active
 */
activeDiagramState = function () {
    percolatorSend({msgType: 'socketIdentifier', identity: 'visualView', state: 'active'})
};







