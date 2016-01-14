/**
 *  Holds the current memory model which is displayed on the webpage
 */
var currentMemoryModel;

/**
 *  Holds the highest version available of the current memory model
 *  @type (number)
 */
var highestVersion;

/**
 * Contains a boolean with a check if its the first time the memory model is loaded
 * @type {boolean}
 */
var firstTime = false;

/**
 * Contains a boolean with a check if its the first time the version list is loaded
 * @type {boolean}
 */
var firstVersionListTime = false;

/**
 * Contains all the relations to be drawn on the screen. Gets emptied after done drawing the relations on the screen.
 * @type {Array}
 */
var relations = [];

/**
 * Contains a check to make sure JsPlumb is only initialized once
 * @type {Boolean}
 */
var plumbInitialized = false;

/**
 * Contains the highest ID used in the memory model.
 * Is used for determining new id's by adding them using the diagram view
 * @type {number}
 */
var highestID = 0;

/**
 * Contains the last edited div, used by the edit fields
 * @type {*|jQuery|HTMLElement}
 */
var lastEditedDiv;

/**
 * Contains a check if a user selected a memory model
 * @type {Boolean}
 */
var memoryModelLoaded = false;

/**
 * Contains a check if editing mode is reference or variable editing
 * @type {Boolean}
 */
var toggleEditingMode = false;

/**
 * Main div where the memory model should be drawn
 * @type {string}
 */
var diagramContainer = '#diagramContainer';

/**
 * Adds a variable to the given frame
 * @param frame the frame where the new var is added to
 */
function addVarToFrame(frame) {
    highestID++;

    var newVariableName = "myVar";
    var newVariableValue = "myValue";
    var newVariableType = "string";
    var oldMmModel = currentMemoryModel;

    $(frame).append(
        "<div class='variable'>" +
        "<div class='variableLabel'>" + newVariableName + "</div>" +
        "<div id='" + highestID + "' class='variableValue'>" + newVariableValue + "</div>" +
        "</div>");

    console.log(frame);

    attachEventListeners();

    var newVariable = {
        id: highestID,
        name: newVariableName,
        value: newVariableValue,
        type: newVariableType
    };

    lookForFrameOrVar(frame[0].id, function (indexList) {
        if (indexList.location == "heap")
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars.push(newVariable);
        else currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars.push(newVariable);
    });

    percolatorSend({
        msgType: 'updateMemoryModel',
        data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMmModel}
    });
}

/**
 * Opens the editfield with information
 * @param me the frame where the information will be extracted from
 */
function openEditField(me) {
    assignValuesToEditFields(me);

    var divName = "#editWrapper";
    if ($(divName).css("display", "none")) $(divName).slideToggle();
    lastEditedDiv = $(me);
}

/**
 * extracs data from the origin field and assigns it to the required fields
 * @param origin
 */
function assignValuesToEditFields(origin) {

    var value = $(origin).children()[1].innerText;
    $("#selectedInputField").val(value);

    var name = $(origin).children()[0].innerText;
    $("#selectedNameField").val(name);

    var activeType = ($(origin).hasClass("_jsPlumb_endpoint_anchor_")) ?
        "#typeReference" :
        (parseInt(value)) ? "#typeNumber" : "#typeString";
    $(activeType).prop("checked", true);
}

/**
 * Updates the value of the last edited div and notifies the server of a change in the memorymodel
 */
var updateValue = function () {

    var oldMmModel = copyObject(currentMemoryModel);

    var newValue = $("#selectedInputField")[0].value;
    var newName = $("#selectedNameField")[0].value;
    var newType = $("input:radio[name='type']:checked")[0].value;

    var idToFind = $(lastEditedDiv).children()[1].id;
    lookForFrameOrVar(idToFind, function (indexList) {
        if (indexList.location == "heap") {
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex].value = newValue;
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex].type = newType;
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex].name = newName;
        } else {
            currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars[indexList.elementIndex].value = newValue;
            currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars[indexList.elementIndex].type = newType;
            currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars[indexList.elementIndex].name = newName;
        }
    });

    if (!$.isEmptyObject(location)) {
        console.log(currentMemoryModel);
        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMmModel}
        });
    } else {
        alert("NO RESULTS");
    }
};

/**
 * Looks for the id to find in the memorymodel, returns an indexList with the exact locaction where the Id is in the memory model.
 * @param idToFind
 * @param actionWhenFound
 * @returns object
 */
function lookForFrameOrVar(idToFind, actionWhenFound) {

    var found = false;
    var frameIndex = 0;
    var elementIndex = 0;
    var stackIndex = 0;
    var heapIndex = 0;
    var placeInModel;

    var indexList = {};

    function declareIndexList() {
        if (placeInModel == "heap") indexList.heapIndex = heapIndex;
        else indexList.stackIndex = stackIndex;
        indexList.frameIndex = frameIndex;
        indexList.location = placeInModel;
        indexList.elementIndex = elementIndex;
        found = true;

        if (actionWhenFound)actionWhenFound(indexList);
        return indexList;
    }

    currentMemoryModel.memoryModel.stacks.forEach(function (stack) {
        if (!$.isEmptyObject(indexList))return null;
        placeInModel = "stack";
        loop(stack);
        stackIndex++;
    });

    if (!found) currentMemoryModel.memoryModel.heaps.forEach(function (heap) {
        if (!$.isEmptyObject(indexList)) return null;
        placeInModel = "heap";
        loop(heap);
        heapIndex++;
    });

    function loop(location) {
        if (!$.isEmptyObject(indexList)) return null;
        frameIndex = 0;

        location.forEach(function (frame) {
            if (!$.isEmptyObject(indexList)) return null;
            elementIndex = 0;
            if (idToFind == frame.id) {
                console.log("found!");
                return declareIndexList();
            }

            frame.vars.forEach(function (element) {
                if (idToFind == element.id) return declareIndexList();
                elementIndex++;
            });
            frameIndex++;
        });
    }

    return indexList;
}

/**
 * adds a new memorymodel and sends it to the server
 */
function addNewMemoryModel() {

    var user = prompt("Please enter your name");
    var memorymodelName = prompt("Please enter memorymodel name");

    if (!user || !memorymodelName) {
        return console.log("Geannuleerd");
    }

    highestID++;
    var newMemoryModel = {
        'language': 'Javascript',
        'owner': user,
        'modelName': memorymodelName,
        'version': 0,
        "memoryModel": {
            "stacks": [
                [
                    {
                        "id": highestID,
                        "name": "Global",
                        "vars": []
                    }
                ]
            ],
            "heaps": [
                [
                    {
                        "id": highestID + 1,
                        "name": "",
                        "vars": []
                    }
                ]
            ]
        }
    };
    highestID++;
    percolatorSend({
        msgType: 'makeNewModel',
        data: newMemoryModel
    });
}

/**
 * create new stack or heap
 */
function addStackOrHeap(type) {
    var oldMem = currentMemoryModel;

    currentMemoryModel.memoryModel[type].push([]);
    collectStacksHeaps(currentMemoryModel);

    percolatorSend({
        msgType: 'updateMemoryModel',
        data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMem}
    });
}

/**
 * Sets width of the stack and heap class by the number of stack and heaps
 * @param numberOfStacks the number of stacks
 * @param numberOfHeaps the number of heaps
 * @returns {Promise} Promise to call actions when setting width is done
 */
function setClassStyle(numberOfStacks, numberOfHeaps) {

    var totalNumber = numberOfStacks + numberOfHeaps;
    var stackWidth;
    var heapWidth;
    if (totalNumber == 2) {
        stackWidth = 30;
        heapWidth = 70;
    } else {
        stackWidth = (100 / totalNumber);
        heapWidth = (100 / totalNumber);
    }

    $(".Stack").css("width", "calc(" + stackWidth + "% - 2px)");
    $(".Heap").css("width", "calc(" + heapWidth + "% - 2px)");
}

/**
 * Increases the size of the div where the memory model can be dragged
 * @param stackOrHeap
 */
function expandDiv(stackOrHeap) {
    stackOrHeap = stackOrHeap[0].id;
    var oldHeight = $('#' + stackOrHeap)[0].clientHeight;
    var newHeight = oldHeight + 100;
    $('#' + stackOrHeap).css("height", newHeight + "px");
    setStackHeapHeight();
}

/**
 * Updates the memory model. Redraws the entire memory model and the relations
 * @param data Data containing the memory model that has to be drawn
 */
function updateMemoryModel(data) {
    if (data.data.new_val) {
        if (data.data.new_val.version > currentMemoryModel.version) {
            var owner = currentMemoryModel.owner;
            var language = currentMemoryModel.language;
            currentMemoryModel = data.data.new_val;
            currentMemoryModel.owner = owner;
            currentMemoryModel.language = language;
            drawMemoryModel(currentMemoryModel);
            getVersionList(false, true);
            setModelInfo();
            updateJSONEditor();

        }
        else {
            currentMemoryModel.frameLocations = data.data.new_val.frameLocations;
            drawMemoryModel(currentMemoryModel);
        }
    }
}

/**
 * When frames are dragged, the posistions of the frames wil be updated en send to the server by websocket.
 * @param frameId id of the frame what needs to be updated
 */
var updatePositionFrames = function (frameId) {
    var id = $('#' + frameId);
    var parent = $(id).parent();
    var top = (id.offset().top - id.parent().offset().top);
    var left = (100 / parent.outerWidth()) * (id.offset().left - id.parent().offset().left);

    var found = false;
    currentMemoryModel.frameLocations.forEach(function (location) {
        if (location.id == frameId) {
            found = true;
            location.top = top;
            location.left = left;
            return null;
        }
    });

    if (!found) currentMemoryModel.frameLocations.push({id: frameId, top: top, left: left});

    percolatorSend({
        msgType: 'updateFrameLocations',
        data: {
            frameLocations: currentMemoryModel.frameLocations,
            mmid: currentMemoryModel.mmid,
            version: currentMemoryModel.version
        }
    });
};

/**
 * When a memort model is selected en a new frame is added (heap or stack), a message wil be send to the server by websocket.
 * @param frameName is the Name of the frame
 * @param frameType is the type of the container it needs to be put in (heap, stack)
 */
function addNewFrame(frameName, frameType) {
    var obj = copyObject(currentMemoryModel);
    highestID++;
    var selectedStack = $(".stackDropDown option:selected").val();
    var selectedHeap = $(".heapDropDown option:selected").val();

    var newFrame = {
        "id": highestID,
        "name": frameName,
        "vars": []
    };

    if (memoryModelLoaded) {
        if (frameType == 'stack') {
            var postitionStackFrame = currentMemoryModel.memoryModel.stacks[selectedStack].length;
            if (selectedStack != null) {
                currentMemoryModel.memoryModel.stacks[selectedStack][postitionStackFrame] = newFrame;
            } else {
                console.log('select a stack first');
            }
        }

        if (frameType == 'heap') {
            var postitionHeapsFrame = currentMemoryModel.memoryModel.heaps[selectedHeap].length;
            if (selectedHeap != null) {
                currentMemoryModel.memoryModel.heaps[selectedHeap][postitionHeapsFrame] = newFrame;
            } else {
                console.log('select a heap first');
            }
        }

        console.log("data:", {newMemoryModel: currentMemoryModel, oldMemoryModel: currentMemoryModel});

        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: obj}
        });
    }
    else {
        alert('select a memory model first so you can add frames or variables to it')
    }
}

/**
 * deletes a frame or variable based on the id of the object and sends a notification to the server
 * @param id
 * @param isFrame
 */
function deleteFrameOrVar(id, isFrame) {
    var obj = copyObject(currentMemoryModel);
    if (!isFrame) {
        id = $(id).parent().parent().children()[1];
    }
    else {
        id = $(id).parent()[0];
    }
    id = $(id)[0].id;

    lookForFrameOrVar(id, function (indexList) {

        if (indexList.location == "heap") {
            if (currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars.length != 0 && isFrame) {
                console.log("IN FRAME!!!!");
                alert("Remove first all variables in the frame");
                return null;
            }

            if (!isFrame) currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex];
            if (!isFrame) currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars.splice(indexList.elementIndex, 1);
            else currentMemoryModel.memoryModel.heaps[indexList.heapIndex].splice(indexList.frameIndex, 1);
        }
        else {
            if (currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars.length != 0 && isFrame) {
                alert("Remove first all variables in the frame");
                return null;
            }

            if (!isFrame) currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars.splice(indexList.elementIndex, 1);
            else currentMemoryModel.memoryModel.stacks[indexList.stackIndex].splice(indexList.frameIndex, 1);
        }
    });

    percolatorSend({
        msgType: 'updateMemoryModel',
        data: {newMemoryModel: currentMemoryModel, oldMemoryModel: obj}
    });
}

/**
 * deletes a heap or stack
 * @param id of the heap or stack that needs to be deleted
 * @param
 */
function deleteHeapStack(id) {
    var obj = copyObject(currentMemoryModel);
    var id = $(id).parent().parent()[0].id;

    id = id.split('');
    var location = id[0];
    id = id[id.length - 1];

    if (location == 'H') {
        location = 'heaps';
    } else {
        location = 'stacks';
    }

    if ($.isEmptyObject(currentMemoryModel.memoryModel[location][id - 1])) {

        currentMemoryModel.memoryModel[location].splice((id - 1),1);
        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: obj}
        });
    } else {
        alert('Remove all frames first');
    }
}