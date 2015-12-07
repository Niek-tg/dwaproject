var queries = require('./queries/queries.js');

var messageHandler = {};


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

