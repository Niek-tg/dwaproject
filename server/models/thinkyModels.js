var config = require(__dirname + '/../../config.js');

var thinky = require('thinky')(config.thinky);
var type = thinky.type;

var ModelInfo = thinky.createModel("ModelInfo", {
    id: type.string(),
    language: type.string(),
    owner: type.string()
});

var History = thinky.createModel("History", {

    id: type.string(),
    mmid: type.string(),
    modelName: type.string(),
    version: type.number(),
    frameLocations: type.array(),
    memoryModel: {
        stacks: [
            [
                {
                    id: type.number(),
                    name: type.string(),
                    vars: [
                        {
                            id: type.number(),
                            name: type.string(),
                            value: type.any(),
                            type: type.string()
                        }
                    ]
                }]
        ],
        heaps: [
            [{
                id: type.number(),
                name: type.string(),
                vars: [
                    {
                        id: type.number(),
                        name: type.string(),
                        value: type.any(),
                        type: type.string()
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