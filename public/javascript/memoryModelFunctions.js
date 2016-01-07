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

    $(frame).append(
        "<div class='variable'>" +
        "<div class='variableLabel'>name</div>" +
        "<div id='" + highestID + "' class='variableValue'>value</div>" +
        "</div>");

    attachEventListeners();

    // TODO ADD TO CURRENT MEMORY MODEL



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
    if ($(divName + ":hidden")) $(divName).slideToggle();
    lastEditedDiv = $(me);

}

/**
 * extracs data from the origin field and assigns it to the required fields
 * @param origin
 */
function assignValuesToEditFields(origin) {

    var value = origin.innerText;
    $("#selectedInputField").val(value);

    var activeType = ($(origin).hasClass("_jsPlumb_endpoint_anchor_")) ?
        "#typeReference" :
        (parseInt(value)) ? "#typeNumber" : "#typeString";
    $(activeType).prop("checked", true);
}

//TODO usefull comment
var updateValue = function () {

    var oldMmModel = currentMemoryModel;
    var owner = currentMemoryModel.owner;
    var language = currentMemoryModel.language;

    var newValue = $("#selectedInputField")[0].value;
    var newType = $("input:radio[name='type']:checked")[0].value;

    var found = false;
    var frameIndex = 0;
    var elementIndex = 0;
    var stackIndex = 0;
    var heapIndex = 0;
    currentMemoryModel.memoryModel.stacks.forEach(function (stack) {

        loop(stack, function () {
            currentMemoryModel.memoryModel.stacks[stackIndex][frameIndex].vars[elementIndex].value = newValue;
            currentMemoryModel.memoryModel.stacks[stackIndex][frameIndex].vars[elementIndex].type = newType;

            //TODO ALS TYPE NULL OF UNDEFINED IS EN OUDE TYPE WAS RELATION, VERWIJDEREN UIT DE LIJST
        });
        stackIndex++;
    });

    if (!found) currentMemoryModel.memoryModel.heaps.forEach(function (heap) {
        loop(heap, function () {
            //console.log(heapIndex);
            currentMemoryModel.memoryModel.heaps[heapIndex][frameIndex].vars[elementIndex].value = newValue;
            currentMemoryModel.memoryModel.heaps[heapIndex][frameIndex].vars[elementIndex].type = newType;
        });
        heapIndex++;
    });

    function loop(location, cb) {
        if (found) return true;
        frameIndex = 0;
        location.forEach(function (frame) {
            elementIndex = 0;
            if (found) return true;

            frame.vars.forEach(function (element) {
                if (found) return true;
                if (element.id == lastEditedDiv[0].id) {
                    found = true;
                    cb();
                    currentMemoryModel.owner = owner;
                    currentMemoryModel.language = language;
                }
                elementIndex++;
            });
            frameIndex++;
        });
    }

    if (found) {
        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMmModel}
        });
    } else {
        alert("NO RESULTS");
    }
};


/**
 * Draws the memory model
 *
 * @param memoryModel contains the data of the memory model
 */
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
    currentMemoryModel = memoryModel;

    if (memoryModel.memoryModel.stacks) drawFramesOnLocation("Stack", memoryModel.memoryModel.stacks, memoryModel.frameLocations);
    if (memoryModel.memoryModel.heaps) drawFramesOnLocation("Heap", memoryModel.memoryModel.heaps, memoryModel.frameLocations);
    if(memoryModel.memoryModel.stacks || memoryModel.memoryModel.heaps)setClassStyle(memoryModel.memoryModel.stacks.length, memoryModel.memoryModel.heaps.length);

    setClassStyle(memoryModel.memoryModel.stacks.length, memoryModel.memoryModel.heaps.length);
    
    memoryModelLoaded = true;
    redrawPlumbing();
    attachEventListeners();
}

function addNewMemoryModel(){

    //var user = prompt("Please enter your name", "Memory model owner");
    //if (person != null) {
    //    document.getElementById("demo").innerHTML =
    //        "Hello " + person + "! How are you today?";
    //}

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

    $("#variableValue").unbind('dblclick');
    $(".variableValue").dblclick(function () {
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
                "<div class='deleteVar'><a onclick='deleteFrameOrVar($(this).parent().parent().parent()[0].id, $(this).parent().parent().children()[1].id)' class='deleteVariable'></a></div>" +
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
        if (data.data.new_val) {
            if (data.data.new_val.version > currentMemoryModel.version) {
                getVersionList(false, true);
                var owner = currentMemoryModel.owner;
                var language = currentMemoryModel.language;
                currentMemoryModel = data.data.new_val;
                currentMemoryModel.owner = owner;
                currentMemoryModel.language = language;

                setModelInfo();
                updateJSONEditor();
            }
            drawMemoryModel(data.data.new_val);
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
        highestID++;

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

            console.log("data:", {newMemoryModel: obj, oldMemoryModel: currentMemoryModel});

            percolatorSend({
                msgType: 'updateMemoryModel',
                data: {newMemoryModel: currentMemoryModel, oldMemoryModel: currentMemoryModel}
            });
        }
        else {
            alert('select a memory model first so you can add frames or variables to it')
        }
    }

//TODO delete frames
//TODO delete connections or variables

    function deleteFrameOrVar(id) {
        var obj = currentMemoryModel;
        var heaps = obj.memoryModel.heaps[0].length;
        var stacks = obj.memoryModel.stacks[0].length;
        var removeStacks = null;
        var removeHeaps = null;
        var removeVariables = null;
        var hasChild = false;

        //console.log('dit zit er in parent id', parentId);
        //console.log('dit zit er in chilId id', childId);

        //console.log('eerste heap', obj.memoryModel.heaps[0]);

        var found = false;
        obj.memoryModel.heaps.forEach(function (heap) {
            heap.forEach(function (frame) {
                if (frame.id == id) {
                    found = true;
                    if (frame.vars) hasChild = true;
                    if (!hasChild) heap.splice(indexOf(frame), 1);
                }
                console.log(frame)
                if (hasChild)frame.vars.forEach(function (variable) {
                    found = true;
                    if (variable.id == id) {
                        frame.vars.splice(indexOf(variable), 1);
                    }
                })
            })
        });

        console.log(found);


        //for (var i = 0; i < heaps; i++) {
        //    if (obj.memoryModel.heaps[0][i].id == parentId) {
        //        removeHeaps = i;
        //        if (childId != null) {
        //            for (var j = 0; j < obj.memoryModel.heaps[0][i].vars.length; j++) {
        //                if (childId == obj.memoryModel.heaps[0][i].vars[j].id) {
        //                    console.log(obj.memoryModel.heaps[0][i].vars[j].id);
        //                    obj.memoryModel.heaps[0][i].vars.splice(j, 1);
        //                }
        //            }
        //            removeHeaps = null;
        //        }
        //    }
        //}
        //
        //for (var i = 0; i < stacks; i++) {
        //    if (obj.memoryModel.stacks[0][i].id == parentId) {
        //        if (obj.memoryModel.stacks[0][i].vars != null) {
        //            for (var j = 0; j < obj.memoryModel.stacks[0][i].vars.length; j++) {
        //                obj.memoryModel.stacks[0][i].vars.splice(j, 1);
        //            }
        //        }
        //        removeStacks = i;
        //    }
        //}
        //if (removeHeaps != null && obj.memoryModel.heaps[0][removeHeaps].vars.length == 0) {
        //    obj.memoryModel.heaps[0].splice(removeHeaps, 1);
        //}else{
        //    console.log('Op dit moment bestaan er nog variabelen of referenties verwijder deze eerst voordat een frame verwijderd kan worden');
        //}
        //
        //if (removeStacks != null) {
        //    obj.memoryModel.stacks[0].splice(removeStacks, 1);
        //}
        //console.log('eerste heap', obj.memoryModel.heaps[0]);

        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: obj, oldMemoryModel: currentMemoryModel}
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
            hoverPaintStyle: {strokeStyle: "#752921"},
            isSource: true,
            isTarget: true
        };

        if (toggleEditingMode) common.endpoint = "Dot";
        else common.endpoint = "Blank";

    jsPlumb.addEndpoint($('.frame'), common);
    jsPlumb.addEndpoint($('.variableValue'), common);
    relations.forEach(function (relation) {
        var sourceTarget = {
            source: relation.source.toString(),
            target: relation.target.toString()
        };
        jsPlumb.connect(sourceTarget, common);
    });
}