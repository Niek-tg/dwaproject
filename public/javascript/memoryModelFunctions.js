/**
 * Contains all the relations to be drawn on the screen. Gets emptied after done drawing the relations on the screen
 * @type {Array}
 */
var relations = [];

/**
 * Contains all the stack end heap frame id's end positions
 * @type {Array}
 */
var frameIdEndPositions = [];

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


function openEditField(me){

    assignValuesToEditFields(me);

    var divName = "#editWrapper";
    if($(divName+ ":hidden")) $(divName).slideToggle();
    lastEditedDiv = $(me);

}

function assignValuesToEditFields(origin){

    var value = origin.innerText;
    $("#selectedInputField").val(value);

    var activeType = ($(origin).hasClass("_jsPlumb_endpoint_anchor_")) ?
        "#typeReference" :
        (parseInt(value)) ? "#typeNumber" :"#typeString" ;

    $(activeType).prop("checked", true);
}

var updateValue = function(){

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
    currentMemoryModel.memoryModel.stacks.forEach(function(stack){

        loop(stack, function(){
            currentMemoryModel.memoryModel.stacks[stackIndex][frameIndex].vars[elementIndex].value = newValue ;
            currentMemoryModel.memoryModel.stacks[stackIndex][frameIndex].vars[elementIndex].type = newType ;

            //TODO ALS TYPE NULL OF UNDEFINED IS EN OUDE TYPE WAS RELATION, VERWIJDEREN UIT DE LIJST
        });
        stackIndex++;
    });

    if(!found) currentMemoryModel.memoryModel.heaps.forEach(function(heap){

        loop(heap, function(){
            //console.log(heapIndex);
            currentMemoryModel.memoryModel.heaps[heapIndex][frameIndex].vars[elementIndex].value = newValue ;
            currentMemoryModel.memoryModel.heaps[heapIndex][frameIndex].vars[elementIndex].type = newType ;
        });
        heapIndex++;
    });

    function loop(location, cb){
        if(found) return true;
        frameIndex = 0;
        location.forEach(function(frame){
            elementIndex = 0;
            if(found) return true;

            frame.vars.forEach(function(element){
                if(found) return true;
                if(element.id == lastEditedDiv[0].id){
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

    if(found){
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
 * @param model contains the data of the memory model
 * @param frameLocations contains the locations of the frames
 * @returns {Promise} Promise to call actions when the drawing is done
 */
function drawMemoryModel(model, frameLocations) {
    //console.log("drawing");
    return new Promise(function (resolve, reject) {
        var diagramContainer = $('#diagramContainer');
        diagramContainer.children().remove();

        var promises = [];

        jsPlumb.detachEveryConnection();
        frameIdEndPositions = [];
        currentMemoryModel.frameLocations = [];
        relations = [];
        promises.push(drawFrames("Stack", model.stacks, frameLocations));
        promises.push(drawFrames("Heap", model.heaps, frameLocations));
        promises.push(setClassStyle(model.stacks.length, model.heaps.length));

        Promise.all(promises).then(function () {
            attachEventListeners();
            memoryModelLoaded = true;
            resolve();
        });
    })
}

/**
 * Attaches all the eventlisteners to their corresponding divs or attributes
 */
function attachEventListeners(){

    $("#updateButton").unbind('click');
    $("#updateButton").click(function() {
      // TODO save the values into the memory model and send to the server
        updateValue();
        //console.log(value);
        //saveValueToDataFormat()
        closeWrapper();
    });

    $("#closeButton").unbind('click');
    $("#closeButton").click(function() {
        closeWrapper();
    });

    $("#variableValue").unbind('dblclick');
    $(".variableValue").dblclick(function() {
        openEditField(this);
    });

    $("#addNewStackFrame").unbind('click');
    $('#addNewStackFrame').click(function(){
        addNewFrame($("#frameLabel").val(), 'stack');
    });

    $("#addNewHeapFrame").unbind('click');
    $('#addNewHeapFrame').click(function(){
        addNewFrame($("#frameLabel").val(), 'heap');
    });

    function closeWrapper(){
        var div = "#editWrapper";
        if(!$(div).is(':hidden')) $(div).slideToggle();
    }

}

/**
 * Sets width of the stack and heap class by the number of stack and heaps
 * @param stacksLength the length of stacks
 * @param heapsLength the length of heaps
 * @returns {Promise} Promise to call actions when setting width is done
 */
function setClassStyle(stacksLength, heapsLength) {
    return new Promise(function (resolve, reject) {
        var totalWidth = (stacksLength + heapsLength);
        var stackWidth;
        var heapWidth;
        if (totalWidth === 2) {
            stackWidth = 30;
            heapWidth = 70;
        }
        else {
            stackWidth = (100 / totalWidth);
            heapWidth = (100 / totalWidth);
        }

        $(".Stack").css("width", "calc(" + stackWidth + "% - 2px)");
        $(".Heap").css("width", "calc(" + heapWidth + "% - 2px)");

        resolve();
    });
}

/**
 * Draws the frames of the memory model.
 *
 * @param location Decides where the frames are drawn. Stack or Heap
 * @param model the data of the memory model
 * @param frameLocations contains the locations of the frames
 * @returns {Promise} Promise to call actions when the drawing is done
 */

function drawFrames(location, model, frameLocations) {
    return new Promise(function (resolve, reject) {
        console.log("DRAWING FRAMES");
        var diagramContainer = $('#diagramContainer');
        var i = 1;

        model.forEach(function (frames) {

            diagramContainer.append("<div id='" + location + i + "' class='" + location + "'></div>");


            $('#' + location + i).append(
                "<div class='frameLabel'>" + location + "</div>"
            );

            frames.forEach(function (item) {
                var top, left;

                frameLocations.forEach(function (frameLocation) {
                    if (item.id === parseInt(frameLocation.id)) {
                        top = (frameLocation.top) ? frameLocation.top : 0;
                        left = (frameLocation.left) ? frameLocation.left : 0;
                    }
                });

                var name = (item.name) ? item.name : "";
                var style;

                if (top === undefined) {
                    style = "position:relative";
                }
                else {
                    style = 'position: absolute; top: ' + top + "px; left: " + left + "%;"
                }

                $('#' + location + i).append(
                    "<div id='" + item.id + "' class='frame' style='" + style + "'> " +
                    "<div class='frameLabel'>" + name + "</div>" +
                    "<div class='addVarToFrame'><a onclick='addVarToFrame($(this).parent().parent())'>+</a></div>" +
                    "</div>");

                if (item.vars) drawVars('#' + item.id, item.vars);
                savePositionsOfframes(item.id);

            });
            i++;
        });
        resolve();
    });
}

function addVarToFrame(me){
    highestID++;

    $(me).append(
        "<div class='variable'>" +
        "<div class='variableLabel'>name</div>" +
        "<div id='" + highestID + "' class='variableValue'>value</div>" +
        "</div>");

    attachEventListeners();
}

/**
 * Draws the variables of the memory model.
 * @param location Location where the vars to be drawn in
 * @param vars Data containing the vars to be drawn
 */
function drawVars(location, vars) {
    vars.forEach(function (variable) {
        var value = determineVar(variable);

        $(location).append(
            "<div class='variable'>" +
            "<div class='variableLabel'>" + variable.name + "</div>" +
            "<div id='" + variable.id + "' class='variableValue'>" + value + "</div>" +
            "</div>");
    });
}

/**
 * Looks of the variable is a pointer or a variable
 * @param variable Value to be converted to a variable, usable to draw with
 * @returns {String|Number} value to be drawn inside the variable or function
 */
function determineVar(variable) {

    if(highestID < variable.id) highestID = variable.id;

    if (variable.type === "reference") {
        relations.push({source: variable.id, target: variable.value});
        return "";
    }
    else if (variable.type === "undefined") return "undefined";
    else if (variable.type === "string") return '"' + variable.value + '"';
    else if (variable.type === "number") return variable.value;
    else return "null"
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
        drawMemoryModel(data.data.new_val.memoryModel, data.data.new_val.frameLocations).then(function () {
            initPlumb();
        });
    }
}

function updateJSONEditor(){
    if(currentView === "codeView") {
        $( "#jsoneditor" ).empty();
        $("#JSONButtons").empty();
        initJSONEditor();
    }
}

/**
 * Initializes the JSPlumb script
 */
function initPlumb() {
    jsPlumb.ready(function () {

        jsPlumb.Defaults.Container = $("#diagramContainer");

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
        redrawPlumbing();
    });
}

/**
 * Draws the connections between the frames and variables where needed.
 */
function redrawPlumbing() {

    var common = {
        endpoint: "Blank",
        anchor: ["Left", "Right"],
        overlays: [["Arrow", {width: 40, length: 20, location: 1}]],
        paintStyle: {strokeStyle: 'grey', lineWidth: 5},
        hoverPaintStyle: {strokeStyle: "#752921"},
        isSource: true,
        isTarget: true
    };

    relations.forEach(function (relation) {
        //console.log(relation);
        jsPlumb.connect({
            source: relation.source.toString(),
            target: relation.target.toString()
        }, common);
    });

    relations = [];
}


/**
 * When frames are drawn it saves the positions of the frames in a array en send to the server by websocket.
 * @param frameId id of the frame what needs to be updated
 */

var savePositionsOfframes = function (frameId) {
    var id = $('#' + frameId);

    var parent = $(id).parent();
    var top = (id.offset().top - id.parent().offset().top);
    var left = (100 / parent.outerWidth()) * (id.offset().left - id.parent().offset().left);

    frameIdEndPositions.push({id: frameId, top: top, left: left});
    currentMemoryModel.frameLocations.push({id: frameId, top: top, left: left});
};

/**
 * When frames are dragged, the posistions of the frames wil be updated en send to the server by websocket.
 * @param frameId id of the frame what needs to be updated
 */

var updatePositionFrames = function (frameId) {
    frameId = parseInt(frameId);
    var id = $('#' + frameId);
    var parent = $(id).parent();
    var top = (id.offset().top - id.parent().offset().top);
    var left = (100 / parent.outerWidth()) * (id.offset().left - id.parent().offset().left);

    var i = 0;


    frameIdEndPositions.forEach(function (frame) {
        if (frameId === frame.id) {
            frameIdEndPositions[i] = {id: frame.id, top: top, left: left};
            currentMemoryModel.frameLocations[i] = {id: frame.id, top: top, left: left};

        }
        i++;
    });
    percolatorSend({
        msgType: 'updateFramePositions',
        data: {
            frameIdEndPositions: frameIdEndPositions,
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
    var obj = currentMemoryModel;

    highestID++;

    var newFrame = {
        "id": highestID,
        "name": frameName
    };

    //console.log(newFrame);

    if (memoryModelLoaded) {
        if (frameType === 'stack') {
            var postitionStackFrame =  obj.memoryModel.stacks[0].length;

            obj.memoryModel.stacks[0][postitionStackFrame] = newFrame;
        }

        if (frameType === 'heap') {
            var postitionHeapsFrame =  obj.memoryModel.heaps[0].length;
            obj.memoryModel.heaps[0][postitionHeapsFrame] = newFrame;
        }
console.log( "data:", {newMemoryModel: obj, oldMemoryModel: currentMemoryModel});
        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: obj, oldMemoryModel: currentMemoryModel}
        });
    }
    else {
        alert('select a memory model first so you can add frames or variables to it')
    }
}