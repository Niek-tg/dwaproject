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
    var oldMmModel = copyObject(currentMemoryModel);

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

    console.log({
        newMemoryModel: currentMemoryModel.memoryModel.stacks,
        oldMemoryModel: oldMmModel.memoryModel.stacks
    });

    percolatorSend({
        msgType: 'updateMemoryModel',
        data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMmModel}
    });


}

/**
 * Makes a copy of a memory model instead of copying the refrence to it
 * @param memoryModel
 */
function copyObject(memoryModel){
    return JSON.parse(JSON.stringify(memoryModel));
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

//TODO usefull comment
var updateValue = function () {

    var oldMmModel = copyObject(currentMemoryModel);

    console.log(currentMemoryModel);
    var newValue = $("#selectedInputField")[0].value;
    var newName = $("#selectedNameField")[0].value;
    var newType = $("input:radio[name='type']:checked")[0].value;

    console.log(newValue);
    console.log(newType);
    console.log(newName);

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
 * Draws the memory model
 *
 * @param memoryModel contains the data of the memory model
 */
var firstDraw = false;
function drawMemoryModel(memoryModel) {

    jsPlumb.reset();
    jsPlumb.Defaults.Container = $("#diagramContainer");

    if (!plumbInitialized) {
        jsPlumb.ready(function () {
            jsPlumb.Defaults.MaxConnections = 5;
        });
        plumbInitialized = true;
    }

    $(diagramContainer).children().remove(); //remove old frames, if they exist
    relations = [];
    if (currentMemoryModel) {
        var owner = currentMemoryModel.owner;
        var language = currentMemoryModel.language;
    }
    if(!firstDraw)     currentMemoryModel = memoryModel;
    firstDraw = true;
    currentMemoryModel.language = (language) ? language : currentMemoryModel.language;
    currentMemoryModel.owner = (owner) ? owner : currentMemoryModel.owner;

    if (memoryModel.memoryModel.stacks) drawFramesOnLocation("Stack", memoryModel.memoryModel.stacks, memoryModel.frameLocations);
    if (memoryModel.memoryModel.heaps) drawFramesOnLocation("Heap", memoryModel.memoryModel.heaps, memoryModel.frameLocations);
    if (memoryModel.memoryModel.stacks || memoryModel.memoryModel.heaps)setClassStyle(memoryModel.memoryModel.stacks.length, memoryModel.memoryModel.heaps.length);

    setClassStyle(memoryModel.memoryModel.stacks.length, memoryModel.memoryModel.heaps.length);

    memoryModelLoaded = true;
    redrawPlumbing();
    attachEventListeners();
    setStackHeapHeight();
}

/**
 * Set the stack or heap as high as the highest
 */
function setStackHeapHeight() {

    var stack = $(".Stack");
    var heap = $(".Heap");
    var maxHeap;
    var maxStack;

    for (i = 0; i < stack.length; i++) {
        var stackNodes = stack[i].childNodes;
        for (j = 0; j < stackNodes.length; j++) {
            var stackNodesTop = stackNodes[j].offsetTop;
            var stackNodesHeight = stackNodes[j].offsetHeight;
            var stackNodesBottom = stackNodesTop + stackNodesHeight;

            if (j === 0 && i === 0 || stackNodesBottom > maxStack) maxStack = stackNodesBottom;
        }
    }

    for (i = 0; i < heap.length; i++) {
        var heapNodes = heap[i].childNodes;
        for (j = 0; j < heapNodes.length; j++) {
            var heapNodesTop = heapNodes[j].offsetTop;
            var heapNodesHeight = heapNodes[j].offsetHeight;
            var heapNodesBottom = heapNodesTop + heapNodesHeight;

            if (j === 0 && i === 0 || heapNodesBottom > maxHeap) maxHeap = heapNodesBottom;
        }
    }

    if (maxHeap > maxStack) {
        $(".Stack").css("height", maxHeap + "px");
        $(".Heap").css("height", maxHeap + "px");
    }
    else if (maxStack > maxHeap) {
        $(".Stack").css("height", maxStack + "px");
        $(".Heap").css("height", maxStack + "px");
    }
}

function addNewMemoryModel() {
    var newMemoryModel = {
        'language': 'Javascript',
        'owner': 'Dick Curtis',
        'mmid': 6666,
        'modelName': 'New MemoryModel',
        'version': 0,
        "memoryModel": {
            "stacks": [
                [
                    {
                        "id": 1,
                        "name": "Global",
                        "vars": []
                    }
                ]
            ],
            "heaps": [
                [
                    {
                        "id": 6,
                        "name": "Global",
                        "vars": []
                    }

                ]
            ]
        }
    };

    percolatorSend({
        msgType: 'makeNewModel',
        data: newMemoryModel
    });
}

/**
 * Attaches all the eventlisteners to their corresponding divs or attributes
 */
function attachEventListeners() {

    $("#addReference").unbind('click');
    $("#addReference").click(function (e) {
        toggleEditingMode = !toggleEditingMode;
        redrawPlumbing();
    });

    $("#updateButton").unbind('click');
    $("#updateButton").click(function () {
        // TODO save the values into the memory model and send to the server
        updateValue();
        //console.log(value);
        //saveValueToDataFormat()
        closeWrapper();
    });

    $("#closeButton").unbind('click');
    $("#closeButton").click(function () {
        closeWrapper();
    });

    $(".variable").unbind('dblclick');
    $(".variable").dblclick(function () {
        openEditField(this);
    });

    $("#addNewStackFrame").unbind('click');
    $('#addNewStackFrame').click(function () {
        addNewFrame($("#frameLabel").val(), 'stack');
    });

    $("#addNewHeapFrame").unbind('click');
    $('#addNewHeapFrame').click(function () {
        addNewFrame($("#frameLabel").val(), 'heap');
    });


    //New memorymodel, stack & heap
    $("#addNewStack").unbind('click');
    $('#addNewStack').click(function () {
        console.log("Komt in addNewStack");
    });

    $("#addNewHeap").unbind('click');
    $('#addNewHeap').click(function () {
        console.log("Komt in addNewHeap");
    });

    $("#addNewMemoryModel").unbind('click');
    $('#addNewMemoryModel').click(function () {
        console.log("Komt in addNewMemoryModel");
        addNewMemoryModel();
    });

    $(".deleteFrame").unbind('click');
    $('.deleteFrame').click(function () {
        deleteFrameOrVar(this, true);
    });

    function closeWrapper() {
        var div = "#editWrapper";
        // TODO fix this one to prevent opening when already closed!
        if (!$(div).is(':hidden')) $(div).slideToggle();
    }
}


/**
 * Sets width of the stack and heap class by the number of stack and heaps
 * @param stacksLength the length of stacks
 * @param heapsLength the length of heaps
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
 * Draws the frames of the memory model.
 *
 * @param location Decides where the frames are drawn. Stack or Heap
 * @param model the data of the memory model
 * @param frameLocations contains the locations of the frames
 * @returns {Promise} Promise to call actions when the drawing is done
 */
function drawFramesOnLocation(location, model, frameLocations) {

    var identifier = 1;
    model.forEach(function (frames) {
        var html = "<div id='" + location + identifier + "' class='" + location + "'>" +
            "<div class='frameLabel'>" + location + "</div>" +
            "<div class='expandDiv'>" +
            "<a onclick='expandDiv($(this).parent().parent())'>+</a>" +
            "</div>" +
            "</div>";

        appendHtmlToLocation(diagramContainer, html);

        frames.forEach(function (item) {
            var top = 0;
            var left = 0;
            var name = (item.name) ? item.name : "";
            var style;

            frameLocations.forEach(function (frameLocation) {
                if (item.id === parseInt(frameLocation.id)) {
                    if (frameLocation.top) top = frameLocation.top;
                    if (frameLocation.left) left = frameLocation.left;
                }
            });

            if (!top && !left) style = "position:relative";
            else style = 'position: absolute; top: ' + top + "px; left: " + left + "%;";

            var html = "<div id='" + item.id + "' class='frame' style='" + style + "'> " +
                "<div class='deleteFrame'></div>" +
                "<div class='frameLabel'>" + name + "</div>" +
                "<div class='addVarToFrame'>" +
                "<a onclick='addVarToFrame($(this).parent().parent())'>+</a>" +
                "</div>" +
                "</div>";
            appendHtmlToLocation('#' + location + identifier, html);

            if (item.vars) drawVars('#' + item.id, item.vars);
        });
        identifier++;
    });
}

function expandDiv(stackOrHeap) {
    stackOrHeap = stackOrHeap[0].id;
    var oldHeight = $('#' + stackOrHeap)[0].clientHeight;
    var newHeight = oldHeight + 100;
    $('#' + stackOrHeap).css("height", newHeight + "px");
    setStackHeapHeight();
}

/**
 * Draws the variables of the memory model.
 * @param location Location where the vars to be drawn in
 * @param vars Data containing the vars to be drawn
 */
function drawVars(location, vars) {
    vars.forEach(function (variable) {
        var value = determineVar(variable);

        var html = "<div class='variable'>" +
            "<div class='variableLabel'>" + variable.name + "</div>" +
            "<div id='" + variable.id + "' class='variableValue'>" + value + "</div>" +
            "<div class='deleteVar'><a onclick='deleteFrameOrVar($(this))' class='deleteVariable'></a></div>" +
            "</div>"
        appendHtmlToLocation(location, html);

    });
}

/**
 * Looks of the variable is a pointer or a variable
 * @param variable Value to be converted to a variable, usable to draw with
 * @returns {String|Number} value to be drawn inside the variable or function
 */
function determineVar(variable) {

    if (highestID < variable.id) highestID = variable.id;

    switch (variable.type) {
        case "reference":
            relations.push({source: variable.id, target: variable.value});
            return "";
            break;
        case "undefined":
            return "undefined";
            break;
        case "string":
            return '"' + variable.value + '"';
            break;
        case "number":
            return variable.value;
            break;
        default:
            return "null";
            break;
    }
}

/**
 * Updates the memory model. Redraws the entire memory model and the relations
 * @param data Data containing the memory model that has to be drawn
 */
function updateMemoryModel(data) {

    console.log(currentMemoryModel);
    var newVal, modelLocation, location, placeInModel, frameIndex, elementIndex, attribute, vars;

    // CURRENT MEMORY MODEL AANPASSEN
    data.data.forEach(function(change){
        console.log(change);
        switch (change.kind){
            case "D":
            case "E": // Edited
                newVal = change.rhs;
                modelLocation = change.path[0];
                location = change.path[1];
                if(modelLocation == "frameLocations"){
                    frameIndex = change.path[1];
                    elementIndex = change.path[2];

                } else{
                    placeInModel = change.path[2];
                    frameIndex = change.path[3];
                    elementIndex = change.path[5];
                    attribute = change.path[6];
                    vars = true;
                }

                if(modelLocation != "frameLocations" && vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars[elementIndex][attribute] = newVal;
                else currentMemoryModel.frameLocations[frameIndex][elementIndex] = newVal;

                break;
            case "D": // Deleted
                if(vars) currentMemoryModel.memoryModel[location][placeInModel][frameIndex].vars.splice(elementIndex, 1);
                else currentMemoryModel.memoryModel[location][placeInModel].splice(frameIndex, 1);
            break;
            case "A": // Change in array
                modelLocation = change.path[0];
                if(modelLocation == "frameLocations") {
                    currentMemoryModel.frameLocations.push(change.item.rhs);
                } else {
                    console.log(change.item.kind);
                    switch (change.item.kind) {
                        case "N":
                            console.log("PATHHHHHH");
                            console.log(change.path);
                            modelLocation = change.path[0];
                            location = change.path[1];
                            placeInModel = change.path[2];
                            frameIndex = change.path[3];
                            vars = change.path[4];

                            if(frameIndex != undefined) vars = true;
                            else vars = false;

                            if(vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars.push(change.kind.rhs);
                            else currentMemoryModel[modelLocation][location][placeInModel].push(change.kind.rhs);

                         break;
                        case "D":
                            console.log(change.item);
                            console.log("PATHHHHHH");
                            console.log(change.path);
                            modelLocation = change.path[0];
                            location = change.path[1];
                            placeInModel = change.path[2];
                            frameIndex = change.path[3];
                            elementIndex = change.index;
                            if(frameIndex != undefined) vars = true;
                            else vars = false;
                            console.log("LOGGGGGGGGGGGGGGGGGGGGGG");
                            console.log(modelLocation);
                            console.log(location);
                            console.log(placeInModel);
                            console.log(frameIndex);
                            //console.log(varsIndex);
                            console.log(vars);
                            console.log(currentMemoryModel[modelLocation][location][placeInModel]);
                            if(vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars.splice(elementIndex, 1);
                            else currentMemoryModel[modelLocation][location][placeInModel].splice(elementIndex, 1);
                            break;

                    }

                }
            break;
            case "N": // New
                newVal = change.rhs;
                modelLocation = change.path[0];
                location = change.path[1];
                placeInModel = change.path[2];
                frameIndex = change.path[3];
                elementIndex = change.path[5];
                attribute = change.path[6];
                vars = true;

                currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars[elementIndex][attribute] = newVal;
            break;
        }
    });
    currentMemoryModel.version++;
    drawMemoryModel(currentMemoryModel);
    // BEPALEN WANNEER VERSIE OPGEHOOGD MOET WORDEN
    getVersionList(false, true);
    setModelInfo();
    updateJSONEditor();
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
    highestID++;

    var oldMemoryModel = copyObject(currentMemoryModel);

    var newFrame = {
        "id": highestID,
        "name": frameName,
        "vars": []
    };

    if (memoryModelLoaded) {
        if (frameType == 'stack') {
            var postitionStackFrame = currentMemoryModel.memoryModel.stacks[0].length;
            currentMemoryModel.memoryModel.stacks[0][postitionStackFrame] = newFrame;
        }

        if (frameType == 'heap') {
            var postitionHeapsFrame = currentMemoryModel.memoryModel.heaps[0].length;
            currentMemoryModel.memoryModel.heaps[0][postitionHeapsFrame] = newFrame;
        }


        console.log({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMemoryModel}
        });

        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMemoryModel}
        });
    }
    else {
        alert('select a memory model first so you can add frames or variables to it')
    }
}

//TODO delete frames
//TODO delete connections or variables

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
            if (currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars.length != 0 && isFrame) return null;

            if (!isFrame) currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars.splice(indexList.elementIndex, 1);
            else currentMemoryModel.memoryModel.heaps[indexList.heapIndex].splice(indexList.frameIndex, 1);
        }
        else {
            if (currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars.length != 0 && isFrame) return null;

            if (!isFrame) currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars.splice(indexList.elementIndex, 1);
            else currentMemoryModel.memoryModel.stacks[indexList.stackIndex].splice(indexList.frameIndex, 1);
        }
    });

    percolatorSend({
        msgType: 'updateMemoryModel',
        data: {newMemoryModel: currentMemoryModel, oldMemoryModel: obj}
    });
}

//TODO usefull comment
//TODO send a scoket message to the server with the updated model
//TODO first connection has to be a variabel field
function newReference(source, target) {
    if (toggleEditingMode === true) {
        relations.push({source: source, target: target});
        redrawPlumbing();

        //TODO SAVE TO SERVER

    }
}

/**
 * Appends the given HTML to the location
 * @param location Location where the HTML should be appended to
 * @param html Desired HTML to be added to the location
 */
function appendHtmlToLocation(location, html) {
    $(location).append(html);
}

/**
 * Draws the connections between the frames and variables where needed.
 */
function redrawPlumbing() {


    $(".frame").draggable({
        drag: function (e) {
            jsPlumb.repaintEverything();
        },
        containment: "parent",
        stop: function (event) {
            if ($(event.target).find('select').length == 0) {
                updatePositionFrames(event.target.id);
                setStackHeapHeight();
            }
        }
    });
    jsPlumb.bind("connection", function (info) {
        var exists = false;
        relations.forEach(function (relation) {
            if (info.sourceId == relation.source && info.targetId == relation.target) {
                exists = true;
                return null;
            }
        });
        if (!exists)newReference(info.sourceId, info.targetId)
    });

    var common = {
        anchor: ["Left", "Right"],
        overlays: [["Arrow", {width: 40, length: 20, location: 1}]],
        paintStyle: {strokeStyle: 'grey', lineWidth: 5},
        connectorStyle: {strokeStyle: 'grey', lineWidth: 5},
        hoverPaintStyle: {strokeStyle: "#752921"},
        isSource: true,
        isTarget: true
    };

    if (toggleEditingMode) common.endpoint = "Dot";
    else common.endpoint = "Blank";

    jsPlumb.deleteEveryEndpoint();
    jsPlumb.removeAllEndpoints();

    jsPlumb.addEndpoint($('.Heap .frame'), common);
    jsPlumb.addEndpoint($('.variableValue'), common);
    relations.forEach(function (relation) {

        var source = $("#" + relation.source);
        var target = $("#" + relation.target);

        if (source.length && target.length) {
            var sourceTarget = {
                source: relation.source.toString(),
                target: relation.target.toString()
            };
            jsPlumb.connect(sourceTarget, common);
        }
    });
}