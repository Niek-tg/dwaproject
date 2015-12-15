/**
 * Sets up and holds the websocket connection
 * @type {WebSocket}
 */

//var connection = new WebSocket("ws://localhost:3000");


/**
 *  Adds a JSON editor on the page and fills it with data selected from the Memorymodel list.
 *  When the "opslaan" button is clicked it will be saved to the database.
 *  When the "nieuw geheugenmodel" button is clicked it will create a new memorymodel.
 */

var keydownExists = false; //Boolean to make sure the event listener on keydown isn't created twice.

function initJSONEditor() {

    var container = document.getElementById('jsoneditor');
    var selectedMemoryModel = currentMemoryModel;
    var editor = new JSONEditor(container, options, selectedMemoryModel );
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
        var newMemoryModel = editor.get();
        sendMessage({msgType: 'updateMemoryModel', data: newMemoryModel});
    });


if(!keydownExists){
    $(window).bind('keydown', function (event) {
        keydownExists = true;
        if ((event.ctrlKey || event.metaKey) && event.which == 83) {
            switch (String.fromCharCode(event.which).toLowerCase()) {
                case 's':
                    event.preventDefault();
                    var newMemoryModel = editor.get();
                    sendMessage({msgType: 'updateMemoryModel', data: newMemoryModel});
                    break;
            }
        }
    })}
}

/**
 * Function to disable some fields or/and values in de JSON-editor. Setting it to true or false.
 * @type {{editable: Function}}
 */

var options = {
    editable: function (object) {
        console.log(object);
        switch (object.field) {
            case 'mmid':
            case 'id':
                return true;
            default:
                return {
                    field: true,
                    value: true
                };
        }
    }
};



