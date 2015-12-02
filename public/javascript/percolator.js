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

        // SET MEMORY MODELS IN SELECTBOX
        var memoryModels = res;
        var sel = document.getElementById('memoryModelsList');

        for (var i = 0; i < memoryModels.length; i++) {
            //console.log(memoryModels[i])
            $(sel).append("<li class='list-group-item'><a onclick='chooseMemoryModel(this, false, false)' data-value='" +
                memoryModels[i].mmid + "' data-version='" + memoryModels[i].version + "'  href='#'>" +
                memoryModels[i].modelName + "</a></li>")
        }

    };
    xhttp.send();
};


/**
 * Get a memory model with a given ID. And get previous versions of these.
 */
var currentMemoryModel;
var highestVersion;
function chooseMemoryModel(id, prevVersion, undo) {
    var version = null;
    var firstTime = false;
    var xhttp = new XMLHttpRequest();


    $("#undoButton").css("display", "block");

    console.log("GETTING SPECIFIC MEMORY MODEL");


    if (prevVersion) {
        if(undo) {
            id = currentMemoryModel.mmid;
            version = undoAction();
        }
        else{
            version = $(id).attr('data-version');
            id = currentMemoryModel.mmid;
            console.log(" version= ", version);
        }
    } else {
        id = $(id).attr('data-value');
        firstTime = true;
    }

    xhttp.open("GET", '/api/MemoryModels/' + id + '/' + version, true);
    xhttp.onload = function (e) {
        var res = JSON.parse(xhttp.responseText);
        currentMemoryModel = res;
        console.log(firstTime);
        if(firstTime) highestVersion = currentMemoryModel.version;

        getVersionList();
        setModelInfo();

        // SET MEMORY MODEL ON SCREEN
        drawMemoryModel(res.memoryModel).then(function(){
            initPlumb();
            connection.send(JSON.stringify({msgType: "subscribeToChanges", data : {mmid: currentMemoryModel.id}}));
        });
    };
    xhttp.send();
}

function setModelInfo(){
    $("#owner").html(currentMemoryModel.owner);
    $("#modelName").html(currentMemoryModel.modelName);
    $("#version").html("Version: " + currentMemoryModel.version);
}

function getVersionList(){
    var sel = document.getElementById('memoryModelVersionList');
    $(sel).empty();
    for(var i = 1; i < highestVersion+1; i++) {
        $(sel).append("<li class='list-group-item'><a onclick='chooseMemoryModel(this , true, false)' data-value='" +
            currentMemoryModel.mmid + "' data-version='" + i + "'  href='#'>" + i + "</a></li>")

    }
}

function undoAction(){
    var version;
    if (currentMemoryModel.version > 1) {
        $.ajax({
            url: '/api/MemoryModels/' + currentMemoryModel.mmid + '/' + currentMemoryModel.version,
            type: 'DELETE',
            success: function (response) {
                console.log('DELETED LAST VERSION');
            }

        });
        version = currentMemoryModel.version - 1;
        currentMemoryModel.version += -1;
        return version;
    } else {
        version = 1;
        alert("There is not an older version");
        return version;
    }
}



/**
 * Draws the memory model.
 */
function drawMemoryModel(model) {

    return new Promise(function(resolve, reject){
        var diagramContainer = $('#diagramContainer');
        diagramContainer.children().remove();

        diagramContainer.append("<div class='Stack'></div>");
        diagramContainer.append("<div class='Heap'></div>");

        var promises = [];

        promises.push(drawFrames("Stack", model.stack));
        promises.push(drawFrames("Heap", model.heap));

        Promise.all(promises).then(function(){
            resolve();
        });
    })

}


/**
 * Draws the frames of the memory model.
 */
function drawFrames(location, frame) {
    return new Promise(function(resolve, reject) {
        $('.' + location).append(
            "<div class='frameLabel'>" + location + "</div>"
        );

        frame.forEach(function (item) {

            $('.' + location).append(
                "<div id='" + item.id + "' class='frame'> " +
                "<div class='frameLabel'>" + item.name + "</div>" +
                "</div>");

            if (item.vars) drawVars('#' + item.id, item.vars);
            if (item.funcs)drawFuncs('#' + item.id, item.funcs);

        });
        resolve();
    });
}

/**
 * Draws the variables of the memory model.
 */
function drawVars(location, vars) {

    vars.forEach(function (variable) {
        //console.log(variable.id);

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
 */
var relations = [];
function determineVar(variable) {
    if (variable.reference) {
        relations.push({source: variable.id, target: variable.reference});
        return "";
    }
    else if (variable.undefined) return "undefined";
    else if (variable.value) return variable.value;
    else return "null"
}


connection.onmessage = function(message) {
    message = JSON.parse(message);

    console.log(message.data);
};

/**
 * Puts jsPlumb into the application
 */
function initPlumb() {
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
                //console.log("REPAINTING");
                jsPlumb.repaintEverything();
            },
            containment: "parent"
        });

        //jsPlumb.addEndpoint($(".frame"), common);
        //jsPlumb.addEndpoint($(".pointer"), common);
        relations.forEach(function (relation) {
            //console.log(relation);
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