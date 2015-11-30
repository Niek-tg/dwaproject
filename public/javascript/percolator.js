/**
 * Created by tjeuj_000 on 24-11-2015.
 */

var connection = new WebSocket("ws://localhost:3000");

/**
 * Get a list of all memory models.
 */
window.onload = function () {
    console.log("LOADING ALL MEMORY MODELS");
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", '/api/MemoryModels', true);
    xhttp.onload = function (e) {
        var res = JSON.parse(xhttp.responseText);
        console.log(res);

        // SET MEMORY MODELS IN SELECTBOX
        var memoryModels = res;
        var sel = document.getElementById('memoryModelsList');
        for (var i = 0; i < memoryModels.length; i++) {
            $(sel).append("<li><a onclick='chooseMemoryModel(this)' data-value='"+ memoryModels[i].mmid +"' href='#'>"+ memoryModels[i].modelName +"</a></li>")
        }

    };
    xhttp.send();
};


/**
 * Get a memory model with a given ID.
 */
var currentMemoryModel;
function chooseMemoryModel(id) {
    id = $(id).attr('data-value');
    console.log(id);
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", '/api/MemoryModels/' + id, true);
    xhttp.onload = function (e) {
        var res = JSON.parse(xhttp.responseText);
        currentMemoryModel = res.memoryModel;

        drawMemoryModel(res.memoryModel);

        console.log(res);

        // SET MEMORY MODEL ON SCREEN
        var memoryModel = res;
    };

    xhttp.send();
}


/**
 * Draws the memory model.
 */
function drawMemoryModel(model){

    var diagramContainer = $('#diagramContainer');
    diagramContainer.children().remove();

    var stack = diagramContainer.append("<div class='stack'></div>");
    var heap = diagramContainer.append("<div class='heap'></div>");

    drawFrames("stack",model.stack);
    drawFrames("heap",model.heap);
}


/**
 * Draws the frames of the memory model.
 */
function drawFrames(location, frame){

    frame.forEach(function(item){

        $('.'+location).append(
            "<div id='"+ item.id +"' class='frame'> "+
            "<div class='frameLabel'>"+ item.name +"</div>" +
            "</div>");

        if(item.vars) drawVars('#'+  item.id, item.vars);
        if(item.funcs)drawFuncs('#'+ item.id, item.funcs);

    });
    }

/**
 * Draws the variables of the memory model.
 */
function drawVars(location, vars){

    vars.forEach(function(variable){
        console.log(variable.id);

        var value = determineVar(variable);
        $(location).append(
            "<div class='variable'>" +
            "<div class='variableLabel'>"+ variable.name +"</div>" +
            "<div id='"+ variable.id + "' class='variableValue'>"+ value +"</div>" +
            "</div>");
    });
}

/**
 * Draws the functions of the memory model.
 */
function drawFuncs(location, funcs){


    funcs.forEach(function(variable){
        var value = determineVar(variable);

        $(location).append(
            "<div class='variable'>" +
            "<div class='variableLabel'>"+ variable.name +"</div>" +
            "<div id='"+ variable.id + "' class='variableValue pointer'>"+ value+"</div>" +
            "</div>");
    });
}


/**
 * Looks of the variable is a pointer or a variable
 */
var relations = [];
function determineVar(variable){
    if(variable.reference){
        relations.push({source: variable.id, target: variable.reference});
        return "";
    }
    else if(variable.undefined) return "undefined";
    else if(variable.value) return variable.value;
    else return "null"
}

/**
 * Puts jsPlumb into the application
 */
function initPlumb(){
    jsPlumb.ready(function () {
        jsPlumb.Defaults.Container = $("#diagramContainer");

        var common = {
            endpoint: "Blank",
            anchor: ["Left", "Right"],
            overlays: [["Arrow", {width: 40, length: 20}]],
            isSource: true,
            isTarget: true
        };

        //function referenceStyle (variable) {
        //    if (variable === "pointer"){
        //
        //    }
        //
        //        endpoint: "Dot",
        //        anchor: ["Left", "Right"],
        //        overlays: [["Arrow", {width: 40, length: 20}]],
        //        isSource: true,
        //        isTarget: true
        //}


        $(".frame").draggable({
            drag: function (e) {
                console.log("REPAINTING");
                jsPlumb.repaintEverything();
            },
            containment: "parent"
        });

        //jsPlumb.addEndpoint($(".frame"), common);
        //jsPlumb.addEndpoint($(".pointer"), common);
        relations.forEach(function(relation){
            console.log(relation);
            jsPlumb.connect({
                    source: relation.source.toString(),
                    target: relation.target.toString()
                }, common);
        });
        //jsPlumb.connect({
        //    source: "var1pointer",
        //    target: "var3pointer"
        //}, common);

        //jsPlumb.addEndpoint($(".pointer"), common);


    });
}