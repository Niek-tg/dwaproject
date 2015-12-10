/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

//var connection = new WebSocket("ws://localhost:3000");
//
//connection.onmessage = function (message) {
//    var data = JSON.parse(message.data);
//    console.log(data);
//
//    switch (data.msgType) {
//        case "getModelById":
//            setMemoryModel(data.data);
//            console.log("komt in switch");
//            break;
//
//    }
//};

/**
 *  Adds a JSON editor on the page and fills it with data selected from the Memorymodel list.
 *  When the "opslaan" button is clicked it will be saved to the database.
 */


function initJSONEditor() {

    var container = document.getElementById('jsoneditor');
    var editor = new JSONEditor(container);
    var selectedMemoryModel = currentMemoryModel;
    editor.set(selectedMemoryModel);

    var newMemorymodelButton = $('<input/>').attr({type: 'button', id: 'setJSON', value: 'Nieuw geheugenmodel'});
        $("#JSONButtons").append(newMemorymodelButton);

        $("#setJSON").click(function newMemoryModel() {
            var modelInfo = {
                'language': '',
                'owner': '',
                'mmid': 21,
                'modelName': '',
                'version': 0,
                'memoryModel': {
                    stack: [{
                        id: '',
                        name: '',
                        order: '',
                        vars: [
                            {
                                id: '',
                                name: '',
                                value: '',
                                undefined: '',
                                reference: ''
                            }
                        ],
                        funcs: [
                            {
                                id: '',
                                name: '',
                                reference: ''
                            }
                        ]
                    }],
                    heap: [
                        {
                            id: '',
                            name: '',
                            order: '',
                            vars: [
                                {
                                    id: '',
                                    name: '',
                                    value: '',
                                    undefined: '',
                                    reference: ''
                                }
                            ],
                            funcs: [
                                {
                                    id: '',
                                    name: '',
                                    reference: ''
                                }
                            ]
                        }
                    ]
                }
            };
            editor.set(modelInfo);
        });

        var saveMemorymodelButton = $('<input/>').attr({type: 'button', id: 'getJSON', value: 'Opslaan'});
        $("#JSONButtons").append(saveMemorymodelButton);

        $("#getJSON").click(function saveMemoryModel() {
            //var json = editor.get();
            var newMemoryModel = editor.get();
            sendMessage({msgType:'makeNewModel', data:newMemoryModel});

            //alert(JSON.stringify(json, null, 2));
        });

}




