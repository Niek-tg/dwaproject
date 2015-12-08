/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

var connection = new WebSocket("ws://localhost:3000");

connection.onmessage = function (message) {
    var data = JSON.parse(message.data);
    console.log(data);

    switch (data.msgType) {
        case "newData":
            updateMemoryModel(data);
            break;
    }
};



function initJSONEditor() {
    /**
     * Get a list of all memory models.
     */

    getMemoryModelList();

    /**
     *    Create the editor and set buttons
     */

    var container = document.getElementById('jsoneditor');
    var editor = new JSONEditor(container);

    var newMemorymodelButton = $('<input/>').attr({type: 'button', id: 'setJSON', value: 'Nieuw geheugenmodel'});
        $("#JSONButtons").append(newMemorymodelButton);

        $("#setJSON").click(function newMemoryModel() {
            var modelInfo = {
                'language': '',
                'owner': '',
                'mmid': 123,
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
            var json = editor.get();
            alert(JSON.stringify(json, null, 2));
        });



}

function getMemoryModelList(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", '/api/MemoryModels', true);
    xhttp.onload = function (e) {
        var res = JSON.parse(xhttp.responseText);

        // SET MEMORY MODELS IN SELECTBOX
        var memoryModels = res;
        var sel = document.getElementById('listOfMemoryModels');

        for (var i = 0; i < memoryModels.length; i++) {
            //console.log(memoryModels[i])
            $(sel).append("<li class='list-group-item'><a id='" + memoryModels[i].mmid + "'onclick='chooseMemorymodel()' data-value='" +
                memoryModels[i].mmid + "' data-version='" + memoryModels[i].version + "'  href='#'>" +
                memoryModels[i].modelName + "</a></li>")
        }
    };
    xhttp.send();
};

function chooseMemorymodel(){
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", '/api/MemoryModels/' + id + '/' + version, true);
    xhttp.onload = function (e) {
        var res = JSON.parse(xhttp.responseText);
        currentMemoryModel = res;
    };
    xhttp.send();
}








