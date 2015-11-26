var config = require(__dirname +'/../../config.js');

var thinky     = require('thinky')(config.thinky);
var type = thinky.type;

var ModelInfo = thinky.createModel("ModelInfo", {
    id: type.number(),
    language: type.string(),
    owner: type.string()
});

var History = thinky.createModel("History",{
    id: type.number(),
    mmid: type.number(),
    version: type.number(),
    memoryModel:{
        stack: [{
            id: type.number(),
            name: type.string(),
            order: type.number(),
            vars:[
                {
                    id: type.number(),
                    name: type.string(),
                    value: type.number(),
                    undefined: type.boolean(),
                    reference: type.number()
                }
            ],
            funcs:[
                {
                    id: type.number(),
                    name: type.string(),
                    reference: type.number()
                }
            ]
        }],
        heap: [
            {
                id: type.number(),
                name: type.string(),
                order: type.number(),
                vars: [
                    {
                        id: type.number(),
                        name: type.string(),
                        value: type.string(),
                        undefined: type.boolean(),
                        reference: type.number()
                    }
                ],
                funcs:[
                    {
                        id: type.number(),
                        name: type.string(),
                        reference: type.number()
                    }
                ]
            }
        ]
    }
});

module.exports = {
    ModelInfo : ModelInfo,
    History : History
};