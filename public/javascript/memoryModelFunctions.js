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
 * Draws the memory model
 *
 * @param model contains the data of the memory model
 * @param frameLocations contains the locations of the frames
 * @returns {Promise} Promise to call actions when the drawing is done
 */
function drawMemoryModel(model, frameLocations) {

    return new Promise(function (resolve, reject) {
        var diagramContainer = $('#diagramContainer');
        diagramContainer.children().remove();

        diagramContainer.append("<div class='Stack'></div>");
        diagramContainer.append("<div class='Heap'></div>");

        var promises = [];

        promises.push(drawFrames("Stack", model.stack, frameLocations));
        promises.push(drawFrames("Heap", model.heap, frameLocations));

        Promise.all(promises).then(function () {
            resolve();
        });
    })
}

/**
 * Draws the frames of the memory model.
 *
 * @param location Decides where the frames are drawn. Stack or Heap
 * @param frames the data of the memory model
 * @param frameLocations contains the locations of the frames
 * @returns {Promise} Promise to call actions when the drawing is done
 */

function drawFrames(location, frames, frameLocations) {
    return new Promise(function (resolve, reject) {


        $('.' + location).append(
            "<div class='frameLabel'>" + location + "</div>"
        );

        var top, left;
        frames.forEach(function (item) {
            frameLocations.forEach(function (frameLocation) {
                if (item.id === parseInt(frameLocation.id)) {
                    console.log(frameLocation);
                    top = (frameLocation.top)? frameLocation.top : 0;
                    left = (frameLocation.left)? frameLocation.left : 0;
                }
            });
            var name = (item.name) ? item.name : "";

            var style = (top && left)? 'top: ' + top + "px; left: " + left + "px;" : "position:relative";

            $('.' + location).append(
                "<div id='" + item.id + "' class='frame' style='" +style+ "'> " +
                "<div class='frameLabel'>" + name + "</div>" +
                "</div>");

            if (item.vars) drawVars('#' + item.id, item.vars);
            if (item.funcs)drawFuncs('#' + item.id, item.funcs);
            savePositionsOfframes(item.id)
        });

        sendMessage({msgType: 'updateFramePositions', data:{frameIdEndPositions: frameIdEndPositions, mmid: currentMemoryModel.mmid, version: currentMemoryModel.version }});
        resolve();
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

        $(location).append(
            "<div class='variable'>" +
            "<div class='variableLabel'>" + variable.name + "</div>" +
            "<div id='" + variable.id + "' class='variableValue'>" + value + "</div>" +
            "</div>");
    });
}

/**
 * Draws the functions of the memory model.
 * @param location Location where the vars to be drawn in
 * @param funcs Data containing the vars to be drawn
 */
function drawFuncs(location, funcs) {
    funcs.forEach(function (variable) {
        var value = determineVar(variable);
        $(location).append(
            "<div class='variable'>" +
            "<div class='variableLabel'>" + variable.name + "</div>" +
            "<div id='" + variable.id + "' class='variableValue pointer'>" + value + "</div>" +
            "</div>");
    });
}

/**
 * Looks of the variable is a pointer or a variable
 * @param variable Value to be converted to a variable, usable to draw with
 * @returns {String|Number} value to be drawn inside the variable or function
 */
function determineVar(variable) {
    if (variable.reference) {
        relations.push({source: variable.id, target: variable.reference});
        return "";
    }
    else if (variable.undefined) return "undefined";
    else if (variable.value) return variable.value;
    else return "null"
}

/**
 * Updates the memory model. Redraws the entire memory model and the relations
 * @param data Data containing the memory model that has to be drawn
 */
function updateMemoryModel(data) {
    console.log(data);
    console.log("update memory model called " + data.data);

    if (data.data.new_val) {
        //console.log(data.data.new_val.memoryModel);
        drawMemoryModel(data.data.new_val.memoryModel).then(function () {
            redrawPlumbing()
        });
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
        overlays: [["Arrow", {width: 40, length: 20}]],
        isSource: true,
        isTarget: true
    };

    relations.forEach(function (relation) {
        jsPlumb.connect({
            source: relation.source.toString(),
            target: relation.target.toString()
        }, common);
    });
    relations = [];
}


/**
 * When frames are drawn it saves the positions of the frames in a array en send to the server by websocket..
 */

var savePositionsOfframes = function (frameId) {
    var id = $('#' + frameId);
    var top = id.position().top;
    var left = id.position().left;

    frameIdEndPositions.push({id: frameId, top: top, left: left});
}

/**
 * When frames are dragged, the posistions of the frames wil be updated en send to the server by websocket.
 */

var updatePositionFrames = function (frameId) {
    frameId = parseInt(frameId);
    var id = $('#' + frameId);
    var top = id.position().top;
    var left = id.position().left;
    var i = 0;

    frameIdEndPositions.forEach(function (frame) {
        if (frameId === frame.id) {
            frameIdEndPositions[i] = {id: frame.id, top: top, left: left};
        }
        i++;
    });
    sendMessage({msgType: 'updateFramePositions', data:{frameIdEndPositions: frameIdEndPositions, mmid: currentMemoryModel.mmid, version: currentMemoryModel.version }});
}

function frameAlgoritm() {


}
