var config = require(__dirname + '/../../config.js');

var thinky = require('thinky')(config.thinky);
var type = thinky.type;

var ModelInfo = thinky.createModel("ModelInfo", {
    id: type.string(),
    language: type.string(),
    owner: type.string()
});

var History = thinky.createModel("History", {

    id: type.string(), // mag weg voor client (websocket houdt het bij)
    mmid: type.string(), //mag weg voor client
    modelName: type.string(),
    version: type.number(), //disable voor client
    memoryModel: {
        stacks: [

            {
                frameLocations:[
                    {
                        id: type.number,
                        top: type.number,
                        left: type.number
                    }
                ]
            },


            [
                {
                    id: type.number(),//disable voor client
                    name: type.string(),
                    vars: [ //properties value & type
                        {
                            id: type.number(), //disable voor client
                            name: type.string(),
                            value: type.mix(),
                            type: type.mix()
                            //undefined: type.boolean(),
                            //reference: type.number()
                        }
                    ]
                }]
        ],
        heaps: [
            {
                frameLocations:[
                    {
                        id: type.number,
                        top: type.number,
                        left: type.number
                    }
                ]
            },
            [{
                id: type.number(),
                name: type.string(),
                //order: type.number(), //verwijderen
                vars: [
                    {
                        id: type.number(),
                        name: type.string(),
                        value: type.string(),
                        undefined: type.boolean(),
                        reference: type.number()
                    }
                ]
            }]

        ]
    }
});

module.exports = {
    ModelInfo: ModelInfo,
    History: History
};