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
    version: type.number(), //disable
    frameLocations: type.array(), // mag weg voor client, misschien apart houden voor stack en heap
    memoryModel: {
        stacks: [
            [
                {
                    id: type.number(),//disable
                    name: type.string(),
                    order: type.number(), //verwijderen
                    vars: [ //properties value & type
                        {
                            id: type.number(), //disable
                            name: type.string(),
                            value: type.mix(),
                            undefined: type.boolean(),
                            reference: type.number()
                        }
                    ],
                    funcs: [ // funcs verwijderen. op de heap is het alleen nodig met object en func
                        {
                            id: type.number(),
                            name: type.string(),
                            reference: type.number()
                        }
                    ]
                }]
        ],
        heaps: [
            [{
                id: type.number(),
                name: type.string(),
                order: type.number(), //verwijderen
                vars: [
                    {
                        id: type.number(),
                        name: type.string(),
                        value: type.string(),
                        undefined: type.boolean(),
                        reference: type.number()
                    }
                ],
                funcs: [
                    {
                        id: type.number(),
                        name: type.string(),
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