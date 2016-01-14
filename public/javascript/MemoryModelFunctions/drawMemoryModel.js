/**
 * Draws the memory model
 *
 * @param memoryModel contains the data of the memory model
 */
function drawMemoryModel(memoryModel) {

    jsPlumb.reset();
    jsPlumb.Defaults.Container = $("#diagramContainer");
    closeEditBar();

    if (!plumbInitialized) {
        jsPlumb.ready(function () {
            jsPlumb.Defaults.MaxConnections = 5;
        });
        plumbInitialized = true;
    }

    $(diagramContainer).children().remove(); //remove old frames, if they exist
    relations = [];

    if (!firstTime) {
        var owner = currentMemoryModel.owner;
        var language = currentMemoryModel.language;
    }
    firstTime = false;
    currentMemoryModel = memoryModel;
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
            "<div><a onclick='deleteHeapStack($(this))' class='deleteHeapStacks'></a></div>" +
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
            "</div>";
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
 * Adds a new reference to the memory model
 * @param source
 * @param target
 */
function newReference(source, target) {
    var oldMem = copyObject(currentMemoryModel);
    if (toggleEditingMode === true) {
        relations.push({source: source, target: target});
        var indexList = lookForFrameOrVar(source);

        if(indexList.location === "stack") {
            currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars[indexList.elementIndex].value = target;
            currentMemoryModel.memoryModel.stacks[indexList.stackIndex][indexList.frameIndex].vars[indexList.elementIndex].type = "reference";
        }
        else{
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex].value = target;
            currentMemoryModel.memoryModel.heaps[indexList.heapIndex][indexList.frameIndex].vars[indexList.elementIndex].type = "reference";
        }
        percolatorSend({
            msgType: 'updateMemoryModel',
            data: {newMemoryModel: currentMemoryModel, oldMemoryModel: oldMem}
        });
    }
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
            //console.log(relation);
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
        endpointStyle:{ fillStyle:"none"},
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

/**
 * Set the stack or heap as high as the highest
 */
function setStackHeapHeight() {

    var stack = $(".Stack");
    var heap = $(".Heap");
    var maxHeap;
    var maxStack;

    for (var i = 0; i < stack.length; i++) {
        var stackNodes = stack[i].childNodes;
        for (var j = 0; j < stackNodes.length; j++) {
            var stackNodesTop = stackNodes[j].offsetTop;
            var stackNodesHeight = stackNodes[j].offsetHeight;
            var stackNodesBottom = stackNodesTop + stackNodesHeight;

            if (j === 0 && i === 0 || stackNodesBottom > maxStack) maxStack = stackNodesBottom;
        }
    }

    for (var i = 0; i < heap.length; i++) {
        var heapNodes = heap[i].childNodes;
        for (var j = 0; j < heapNodes.length; j++) {
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