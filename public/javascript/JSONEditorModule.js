/**
 *  Adds a JSON editor on the page and fills it with data selected from the Memorymodel list.
 *  When the "opslaan" button is clicked it will be saved to the database.
 *  When the "nieuw geheugenmodel" button is clicked it will create a new memorymodel.
 */

var keydownExists = false; //Boolean to make sure the event listener on keydown isn't created twice.

function initJSONEditor() {


    var container = document.getElementById('jsoneditor');
    var editor = new JSONEditor(container, options, currentMemoryModel);
    var oldMemoryModel = currentMemoryModel;
    var newMemorymodelButton = $('<input/>').attr({type: 'button', id: 'setJSON', value: 'Nieuw geheugenmodel'});
    var saveMemorymodelButton = $('<input/>').attr({type: 'button', id: 'getJSON', value: 'Opslaan'});
    var savedFirstTime = true;
    var counter = 0;

    document.getElementById("undoButton").disabled = true;
    $("#JSONButtons").append(newMemorymodelButton, saveMemorymodelButton);

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
                    vars: [
                        {
                            id: '',
                            name: '',
                            value: '',
                            type: ''
                        }
                    ]
                }],
                heap: [
                    {
                        id: '',
                        name: '',
                        vars: [
                            {
                                id: '',
                                name: '',
                                value: '',
                                type: ''
                            }
                        ]
                    }
                ]
            }
        };
        editor.set(modelInfo);
    });

    $("#getJSON").click(function saveMemoryModel() {
        var newMemoryModel = editor.get();
        oldMemoryModel.version = newMemoryModel.version;
        if (savedFirstTime) savedFirstTime = false;
        else newMemoryModel.version += counter; oldMemoryModel.version += counter; counter ++;
        jsonEditorSendMessage({msgType: 'updateMemoryModel', data: {newMemoryModel: newMemoryModel, oldMemoryModel:oldMemoryModel}});
        oldMemoryModel = newMemoryModel;
    });


    if (!keydownExists) {
        $(window).bind('keydown', function (event) {
            keydownExists = true;
            if ((event.ctrlKey || event.metaKey) && event.which == 83) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 's':
                        event.preventDefault();
                        var newMemoryModel = editor.get();
                        oldMemoryModel.version = newMemoryModel.version;
                        if (savedFirstTime) savedFirstTime = false;
                        else newMemoryModel.version += counter; oldMemoryModel.version += counter; counter ++;
                        jsonEditorSendMessage({msgType: 'updateMemoryModel', data: {newMemoryModel: newMemoryModel, oldMemoryModel:oldMemoryModel}});
                        oldMemoryModel = newMemoryModel;
                        break;
                }
            }
        });

        $(window).bind('keyup', function (event) {
            keydownExists = false;
        });
    }
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
            case 'version':
            case 'frameLocations':
                return false;
            default:
                return {
                    field: true,
                    value: true
                };
        }
    }
};



