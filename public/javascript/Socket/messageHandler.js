/**
 * Sends a JSON message to the server
 * @param data The data to send
 * @socket checks which socket is sending data.
 */
function sendMessage(socket, data) {
    socket.send(JSON.stringify(data));
}

/**
 * MessageListener for the client, runs when a new message is received.
 * @param message Contains the received message
 */
function messageHandlerClient(message) {
    var data = JSON.parse(message.data);
    switch (data.msgType) {
        case "newData":
            console.log(data);
            updateMemoryModel(data);
            break;
        case "newAllModelsData":
            percolatorSend({msgType: "getAllModels"});
            break;
        case "getAllModels":
            getMemoryModels(data.data);
            break;
        case "getModelById":
            getMemoryModelById(data.data);
            break;
        case "updateMemoryModel":
            getMemoryModels(data.data);
            break;
        case "updateVersionList":
            getVersionList(false, true);
            break;
        case "removeLatestVersion":
            getVersionList(true, false);
            break;
        case "errorMsg":
            console.log(data.data);
            break;
        default :
            console.log('client messagehandler: unknown message received ' + data.msgType);
            break;
    }
}