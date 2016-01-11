
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
    $(".newFrameButtons").css("display", "block");
    $(".viewButtons").css("display", "block");
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

    if (firstTime) highestVersion = memoryModel.version;

    firstTime = false;

    console.log(memoryModel)
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
 * @param undo, if update is true decrease the highestVersion by one
 */
function getVersionList(undo, addNewVersion) {

    if(addNewVersion){highestVersion ++;}
    if(undo){highestVersion --;}

    console.log(currentMemoryModel)
    if(currentMemoryModel.version === highestVersion) $("#undoButton").css("display", "block");
    else $("#undoButton").css("display", "none");

    $("#labelVersionList").css("display", "block");

    var sel = document.getElementById('memoryModelVersionList');
    $(sel).empty();

        for (var i = 1; i < highestVersion + 1; i++) {
            $(sel).append("<li class='list-group-item'><a id='versionListItem" + i + "'  onclick='chooseMemoryModel(this , true, false)' data-value='" +
                currentMemoryModel.mmid + "' data-version='" + i + "'  href='#'>  Version: " + i + "</a></li>")
        }
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

