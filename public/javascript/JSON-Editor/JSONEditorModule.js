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
    $(window).unbind('keydown');
    keydownExists = false;

    var currentJSONMemoryModel = {
        language: currentMemoryModel.language,
        memoryModel: currentMemoryModel.memoryModel,
        modelName: currentMemoryModel.modelName,
        owner: currentMemoryModel.owner
    };

    var container = document.getElementById('jsoneditor');
    var editor = new JSONEditor(container, options, currentJSONMemoryModel);
    var oldMemoryModel = currentMemoryModel;
    var saveMemorymodelButton = $('<input/>').attr({type: 'button', id: 'getJSON', value: 'Opslaan'});

    document.getElementById("undoButton").disabled = true;
    $("#JSONButtons").append(saveMemorymodelButton);

    $("#getJSON").click(function saveMemoryModel() {
        var newMemoryModel = editor.get();
        setBackModelInfo(newMemoryModel);
        jsonEditorSendMessage({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: newMemoryModel, oldMemoryModel: oldMemoryModel}
        });
    });

    if (!keydownExists) {
        $(window).bind('keydown', function (event) {
            keydownExists = true;
            if ((event.ctrlKey || event.metaKey) && event.which == 83) {
                switch (String.fromCharCode(event.which).toLowerCase()) {
                    case 's':
                        event.preventDefault();
                        var newMemoryModel = editor.get();
                        setBackModelInfo(newMemoryModel);
                        jsonEditorSendMessage({
                            msgType: 'updateMemoryModel',
                            data: {newMemoryModel: newMemoryModel, oldMemoryModel: oldMemoryModel}
                        });
                        break;
                }
            }
        });

        $(window).bind('keyup', function () {
            keydownExists = false;
        });
    }

    function setBackModelInfo(newMemoryModel) {
        if (currentMemoryModel.frameLocations) newMemoryModel.frameLocations = currentMemoryModel.frameLocations;
        newMemoryModel.id = currentMemoryModel.id;
        newMemoryModel.mmid = currentMemoryModel.mmid;
        newMemoryModel.version = currentMemoryModel.version;
    }
}

/**
 *  When the view is changed from diagramview to codeview, the JSON Editor is reinitialized with the latest data.
 */
function updateJSONEditor(){
    if(currentView === "codeView") {
        $( "#jsoneditor" ).empty();
        $("#JSONButtons").empty();
        initJSONEditor();
    }
}






