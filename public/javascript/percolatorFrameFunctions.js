/**
 * Get a list of all memory models.
 */
function getMemoryModels(memoryModels) {
    // SET MEMORY MODELS IN SELECTBOX
    var sel = document.getElementById('memoryModelsList');
    sel.innerHTML = "";
    for (var i = 0; i < memoryModels.length; i++) {
        $(sel).append("<li class='list-group-item'><a id='" + memoryModels[i].mmid + "'onclick='chooseMemoryModel(this, false, false)' data-value='" +
            memoryModels[i].mmid + "' data-version='" + memoryModels[i].version + "'  href='#'>" +
            memoryModels[i].modelName + "</a></li>")
    }
}

/**
 * Get versions of choosen memory model.
 *
 * @param id identifier for the chosen memory model.
 * @param prevVersion boolean determining whether an older is chosen
 * @param undo boolean determining whether the undo button has been pressed
 */
function chooseMemoryModel(id, prevVersion, undo) {
    enableDiagramView();
    var version = null;

    percolatorSend({msgType: "unsubscribeToCurrentCursor"});

    if (prevVersion) {
        if (undo) {
            id = currentMemoryModel.mmid;
            version = undoAction();
        }
        else {
            version = $(id).attr('data-version');
            id = currentMemoryModel.mmid;
        }
    } else {
        if (typeof id !== "string") id = $(id).attr('data-value');
        firstVersionListTime = true;
        firstTime = true;
    }
    percolatorSend({msgType: 'getModelById', id: id, version: version});
}

/**
 * Get a memory model with a given ID.
 *
 * @param memoryModel contains response of socket message getModelById
 */
function getMemoryModelById(memoryModel) {

    if (firstVersionListTime) highestVersion = memoryModel.version;

    firstVersionListTime = false;
    collectStacksHeaps(memoryModel);
    drawMemoryModel(memoryModel);
    getVersionList(false, false);
    setModelInfo();
    percolatorSend({msgType: "subscribeToChanges", data: {id: currentMemoryModel.id}});

}

/**
 * Updates the owner, name and current version of the memory model, displayed on the screen
 */
function setModelInfo() {
    $("#owner").html('Owner: ' + currentMemoryModel.owner);
    $("#modelName").html('Modelname: ' + currentMemoryModel.modelName);
    $("#version").html('Version: ' + currentMemoryModel.version);
}

/**
 * Determines and draws the list of versions available for the memory model
 * @param undo, if update is true decrease the highestVersion by one.
 * @param addNewVersion, contains a new version
 */
function getVersionList(undo, addNewVersion) {

    if (addNewVersion) {
        highestVersion++;
    }
    if (undo) {
        highestVersion--;
    }

    if (currentMemoryModel.version != highestVersion) {
        setCSSDisplay("none")
    }
    else{
        $("#undoButton").css("display", "block");
        $("#allButtons").css("display", "block");
    }

    $("#labelVersionList").css("display", "block");

    var sel = document.getElementById('memoryModelVersionList');
    $(sel).empty();

    for (var i = 1; i < highestVersion + 1; i++) {
        $(sel).append("<li class='list-group-item'><a id='versionListItem" + i + "'  onclick='chooseMemoryModel(this , true, false)' data-value='" +
            currentMemoryModel.mmid + "' data-version='" + i + "'  href='#'>  Version: " + i + "</a></li>")
    }
}

function setCSSDisplay(display) {
    $(".addVarToFrame").css("display", display);
    $(".deleteFrame").css("display", display);
    $(".deleteVar").css("display",display);
    $(".deleteHeapStacks").css("display", display);
    $("#undoButton").css("display", display);
    $("#allButtons").css("display", display);
}

/**
 * Removes the latest version and sets the single last version available to be active
 * @returns {Number} Version number of the new active version
 */
function undoAction() {
    var version;
    if (currentMemoryModel.version > 1) {
        percolatorSend({
            msgType: 'removeLatestVersion',
            data: {mmid: currentMemoryModel.mmid, version: currentMemoryModel.version}
        });
        version = currentMemoryModel.version - 1;
        currentMemoryModel.version -= 1;
        highestVersion -= 1;
        return version;
    } else {
        version = 1;
        alert("There is not an older version");
        return version;
    }
}

/**
 * Toggle function for the divs that hold the information about all the memory models and the versions of the current memory model
 * @param me
 */
function toggleActive(me) {

    var isActive = ($(me).hasClass("active")) ? true : false;
    var image = (isActive) ? "close-icon.png" : "open-icon.png";
    var display = (isActive) ? "block" : "none";
    var css;
    var grandparent = $(me).parent().parent();
    if ((grandparent).attr('id') == "allMemoryModels") css = (isActive) ? {
        width: '15%',
        minWidth: "300px"
    } : {width: '50', minWidth: "0"};
    else css = (isActive) ? {
        width: '8%',
        minWidth: "150px"
    } : {
        width: '50',
        minWidth: "0"
    };

    var notToHide = ".rotate270, .togglable";

    $(grandparent).children().not(notToHide).css("display", display);
    $(grandparent).css(css, 500);
    if (isActive)$(me).removeClass("active");
    else $(me).addClass("active");
    $(me).html("<img src='./images/" + image + "' />");

    calculateDiagramContainerSize()
}

/**
 * Calculates the size of the DiagramContainer
 */
function calculateDiagramContainerSize() {
    var size = $(window).width();
    var count = $(diagramContainer).children().length;
    size -= $("#allMemoryModels").outerWidth();
    size -= $("#memoryModelVersions").outerWidth();
    $("#memoryModel").css(
        {
            maxWidth: size - 23 + "px",
            "width": "100%"
        });
    $(diagramContainer).css(
        {
            maxWidth: size - 3 + "px",
            "width": "100%"
        });
    if (currentView === "diagramView" && count > 1) jsPlumb.repaintEverything();
}

/**
 * Writes all the stacks and heaps to dropdown fields. Used for adding frames to any stack of heap you want
 * @param current current memory model
 */
function collectStacksHeaps(current) {
    $(".stackDropDown").empty();
    $(".heapDropDown").empty();
    var options = [];
    var i = 0;
    current.memoryModel.stacks.forEach(function () {
        i++;
        options[i] = 'stack' + i;
        $(".stackDropDown").append($('<option>', {
            value: i - 1,
            text: options[i]
        }));
    });
    i = 0;
    options = [];

    current.memoryModel.heaps.forEach(function () {
        i++;
        options[i] = 'heap' + i;
        $(".heapDropDown").append($('<option>', {
            value: i - 1,
            text: options[i]
        }));
    });
    i = 0;
    options = [];
}