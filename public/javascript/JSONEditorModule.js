/**
 *  Adds a JSON editor on the page and fills it with data selected from the Memorymodel list.
 *  When the "opslaan" button is clicked it will be saved to the database.
 *  When the "nieuw geheugenmodel" button is clicked it will create a new memorymodel.
 */

var keydownExists = false; //Boolean to make sure the event listener on keydown isn't created twice.

function initJSONEditor() {
    var JSONId = currentMemoryModel.id;
    var JSONFrameLocations = currentMemoryModel.frameLocations;
    var JSONMmid = currentMemoryModel.mmid;
    var JSONVersion = currentMemoryModel.version;
    var oldJSONVersion = currentMemoryModel.version;

    delete currentMemoryModel.frameLocations;
    delete currentMemoryModel['id'];
    delete currentMemoryModel.mmid;
    delete currentMemoryModel.version;

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
        else JSONVersion += counter; oldJSONVersion += counter; counter ++;
        setBackModelInfo(newMemoryModel, oldMemoryModel);
        jsonEditorSendMessage({msgType: 'updateMemoryModel', data: {newMemoryModel: newMemoryModel, oldMemoryModel:oldMemoryModel}});
        oldMemoryModel = newMemoryModel;
        oldJSONVersion = JSONVersion;
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
                        setBackModelInfo(newMemoryModel, oldMemoryModel);
                        jsonEditorSendMessage({msgType: 'updateMemoryModel', data: {newMemoryModel: newMemoryModel, oldMemoryModel:oldMemoryModel}});
                        oldMemoryModel = newMemoryModel;
                        oldJSONVersion = JSONVersion;
                        break;
                }
            }
        });

        $(window).bind('keyup', function (event) {
            keydownExists = false;
        });
    }

    function setBackModelInfo(newMemoryModel, oldMemoryModel){
        if(JSONFrameLocations) newMemoryModel.frameLocations = JSONFrameLocations;
        newMemoryModel.id = JSONId;
        newMemoryModel.mmid = JSONMmid;
        newMemoryModel.version = JSONVersion;
        currentMemoryModel = newMemoryModel;

        oldMemoryModel.frameLocations = currentMemoryModel.frameLocations;
        oldMemoryModel.id = currentMemoryModel.id;
        oldMemoryModel.mmid = currentMemoryModel.mmid;
        oldMemoryModel.version = oldJSONVersion;
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





