/**
 * Boolean to make sure the event listener on keydown isn't created twice
 * @type {boolean}
 */
var keydownExists = false;

/**
 * Options used by the JSON editor
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

/**
 *  Adds a JSON editor on the page and fills it with data selected from the Memorymodel list.
 *  When the "opslaan" button is clicked it will be saved to the database.
 *  When the "nieuw geheugenmodel" button is clicked it will create a new memorymodel.
 */
function initJSONEditor() {
    var currentJSONMemoryModel = {
        language: currentMemoryModel.language,
        memoryModel: currentMemoryModel.memoryModel,
        modelName: currentMemoryModel.modelName,
        owner: currentMemoryModel.owner
    };

    var JSONVersion = currentMemoryModel.version;
    var oldJSONVersion = currentMemoryModel.version;

    var container = document.getElementById('jsoneditor');
    var editor = new JSONEditor(container, options, currentJSONMemoryModel);
    var oldMemoryModel = currentJSONMemoryModel;
    var newMemorymodelButton = $('<input/>').attr({type: 'button', id: 'setJSON', value: 'Nieuw geheugenmodel'});
    var saveMemorymodelButton = $('<input/>').attr({type: 'button', id: 'getJSON', value: 'Opslaan'});

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
        setBackModelInfo(newMemoryModel, oldMemoryModel);
        jsonEditorSendMessage({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: newMemoryModel, oldMemoryModel: oldMemoryModel}
        });
        oldMemoryModel = newMemoryModel;
        JSONVersion ++; oldJSONVersion ++;
    });

    if (!keydownExists) {
        $(window).bind('keydown', function (event) {
            keydownExists = true;
            if ((event.ctrlKey || event.metaKey) && event.which == 83) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 's':
                        event.preventDefault();
                        var newMemoryModel = editor.get();
                        setBackModelInfo(newMemoryModel, oldMemoryModel);
                        jsonEditorSendMessage({
                            msgType: 'updateMemoryModel',
                            data: {newMemoryModel: newMemoryModel, oldMemoryModel: oldMemoryModel}
                        });
                        oldMemoryModel = newMemoryModel;
                        JSONVersion ++; oldJSONVersion ++;
                        break;
                }
            }
        });

        $(window).bind('keyup', function () {
            keydownExists = false;
        });
    }

    function setBackModelInfo(newMemoryModel, oldMemoryModel) {
        if (currentMemoryModel.frameLocations) newMemoryModel.frameLocations = currentMemoryModel.frameLocations;
        newMemoryModel.id = currentMemoryModel.id;
        newMemoryModel.mmid = currentMemoryModel.mmid;
        newMemoryModel.version = JSONVersion;
        currentMemoryModel = newMemoryModel;

        oldMemoryModel.frameLocations = currentMemoryModel.frameLocations;
        oldMemoryModel.id = currentMemoryModel.id;
        oldMemoryModel.mmid = currentMemoryModel.mmid;
        oldMemoryModel.version = oldJSONVersion;
    }
}

/**
 * TODO ADD USEFUL COMMENT
 */
function updateJSONEditor(){
    if(currentView === "codeView") {
        $( "#jsoneditor" ).empty();
        $("#JSONButtons").empty();
        initJSONEditor();
    }
}






