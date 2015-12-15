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
    //console.log("drawing");
    return new Promise(function (resolve, reject) {
        var diagramContainer = $('#diagramContainer');
        diagramContainer.children().remove();

        var promises = [];

        jsPlumb.detachEveryConnection();
        frameIdEndPositions = [];
        relations = [];
        promises.push(drawFrames("Stack", model.stacks, frameLocations));
        promises.push(drawFrames("Heap", model.heaps, frameLocations));

        Promise.all(promises).then(function () {
            resolve();
        });
    })
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

                if(top === undefined) {
                    style = "position:relative";
                }
                else{
                    style = 'position: absolute; top: ' + top + "px; left: " + left + "%;"
                }

                $('#' + location + i).append(
                    "<div id='" + item.id + "' class='frame' style='" + style + "'> " +
                    "<div class='frameLabel'>" + name + "</div>" +
                    "</div>");

                if (item.vars) drawVars('#' + item.id, item.vars);
                if (item.funcs)drawFuncs('#' + item.id, item.funcs);
                savePositionsOfframes(item.id);

            });
            i++;
        });
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
    //console.log(data);
    //console.log("update memory model called " + data.data);

    if (data.data.new_val) {
        //console.log(data.data.new_val.memoryModel);
        drawMemoryModel(data.data.new_val.memoryModel, data.data.new_val.frameLocations).then(function () {
            //redrawPlumbing();
            initPlumb();
        });
    }
}

/**
 * Initializes the JSPlumb script
 */
function initPlumb() {
    jsPlumb.ready(function ()         {

        jsPlumb.Defaults.Container = $("#diagramContainer");

        $(".frame").draggable({
            drag: function (e) {
                jsPlumb.repaintEverything();
                console.log("dragged");
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
        //console.log(relation);
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

    var parent = $(id).parent();
    var top = (id.offset().top - id.parent().offset().top);
    var left = (100 / parent.outerWidth()) * (id.offset().left - id.parent().offset().left);

    frameIdEndPositions.push({id: frameId, top: top, left: left});
}

/**
 * When frames are dragged, the posistions of the frames wil be updated en send to the server by websocket.
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
        }
        i++;
    });
    sendMessage({
        msgType: 'updateFramePositions',
        data: {
            frameIdEndPositions: frameIdEndPositions,
            mmid: currentMemoryModel.mmid,
            version: currentMemoryModel.version
        }
    });
}

