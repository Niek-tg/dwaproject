var diff = require('deep-diff').diff;

/**
 *
 * @type {Array}
 */
var pendingChangeList = [];

/**
 * Returns all the changes between the old and new memory model
 * @param newModel
 * @param oldModel
 * @returns {Array}
 */
function checkForChanges(newModel, oldModel){

    pendingChangeList = [];

    var diffs = diff(oldModel, newModel);
    console.log('changes zijn' , diffs);
    if(diffs) diffs.forEach(function(diff){
        pendingChangeList.push(diff);
    });

    return pendingChangeList;
}

module.exports = {
    checkForChanges : checkForChanges
};


////////////////////////////////////////////////// CLIENT SIDE CODE !!!!


///**
// * Updates the memory model. Redraws the entire memory model and the relations
// * @param data Data containing the memory model that has to be drawn
// */
//function updateMemoryModel(data) {
//
//    console.log(currentMemoryModel);
//    var newVal, modelLocation, location, placeInModel, frameIndex, elementIndex, attribute, vars;
//
//    // CURRENT MEMORY MODEL AANPASSEN
//    data.data.forEach(function(change){
//        console.log(change);
//        switch (change.kind){
//            case "D":
//            case "E": // Edited
//                newVal = change.rhs;
//                modelLocation = change.path[0];
//                location = change.path[1];
//                if(change.path[4] !== "id") {
//                    if (modelLocation == "frameLocations") {
//                        frameIndex = change.path[1];
//                        elementIndex = change.path[2];
//
//                    } else {
//                        placeInModel = change.path[2];
//                        frameIndex = change.path[3];
//                        //elementIndex = change.index;
//                        console.log("CHECK THIS FOR LOGGING");
//                        console.log(modelLocation);
//                        console.log(location);
//                        console.log(placeInModel);
//                        console.log(frameIndex);
//                        console.log(elementIndex);
//                        //if(change.path[4] === "id"){
//                        //    console.log('IS A ID !!!!!');
//                        //    break;
//                        //    //elementIndex = currentMemoryModel[modelLocation][location][placeInModel].indexOf(change.lhs);
//                        //    //console.log( currentMemoryModel[modelLocation][location][placeInModel]);
//                        //    //console.log(elementIndex);
//                        //    //currentMemoryModel[modelLocation][location][placeInModel].splice(elementIndex, 1);
//                        //}
//
//                        elementIndex = change.path[5];
//                        attribute = change.path[6];
//                        vars = true;
//
//                    }
//
//                    if (modelLocation != "frameLocations" && vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars[elementIndex][attribute] = newVal;
//                    else currentMemoryModel.frameLocations[frameIndex][elementIndex] = newVal;
//
//                }
//                else{
//                    console.log('IS A ID !!!!!');
//                }
//                break;
//            case "D": // Deleted
//                if(vars) currentMemoryModel.memoryModel[location][placeInModel][frameIndex].vars.splice(elementIndex, 1);
//                else currentMemoryModel.memoryModel[location][placeInModel].splice(frameIndex, 1);
//                break;
//            case "A": // Change in array
//                modelLocation = change.path[0];
//                if(modelLocation == "frameLocations") {
//                    currentMemoryModel.frameLocations.push(change.item.rhs);
//                } else {
//                    console.log(change.item.kind);
//                    switch (change.item.kind) {
//                        case "N":
//                            console.log("PATHHHHHH");
//                            console.log(change.path);
//                            modelLocation = change.path[0];
//                            location = change.path[1];
//                            placeInModel = change.path[2];
//                            frameIndex = change.path[3];
//                            vars = change.path[4];
//
//                            if(frameIndex != undefined) vars = true;
//                            else vars = false;
//
//                            if(vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars.push(change.kind.rhs);
//                            else currentMemoryModel[modelLocation][location][placeInModel].push(change.kind.rhs);
//
//                            break;
//                        case "D":
//                            console.log(change.item);
//                            console.log("PATHHHHHH");
//                            console.log(change.path);
//                            modelLocation = change.path[0];
//                            location = change.path[1];
//                            placeInModel = change.path[2];
//                            frameIndex = change.path[3];
//                            elementIndex = change.index;
//                            if(frameIndex != undefined) vars = true;
//                            else vars = false;
//                            console.log("LOGGGGGGGGGGGGGGGGGGGGGG");
//                            console.log(modelLocation);
//                            console.log(location);
//                            console.log(placeInModel);
//                            console.log(frameIndex);
//                            //console.log(varsIndex);
//                            console.log(vars);
//                            console.log(currentMemoryModel[modelLocation][location][placeInModel]);
//                            if(vars) currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars.splice(elementIndex, 1);
//                            else currentMemoryModel[modelLocation][location][placeInModel].splice(elementIndex, 1);
//                            break;
//
//                    }
//
//                }
//                break;
//            case "N": // New
//                newVal = change.rhs;
//                modelLocation = change.path[0];
//                location = change.path[1];
//                placeInModel = change.path[2];
//                frameIndex = change.path[3];
//                elementIndex = change.path[5];
//                attribute = change.path[6];
//                vars = true;
//
//                currentMemoryModel[modelLocation][location][placeInModel][frameIndex].vars[elementIndex][attribute] = newVal;
//                break;
//        }
//    });
//    currentMemoryModel.version++;
//    drawMemoryModel(currentMemoryModel);
//    // BEPALEN WANNEER VERSIE OPGEHOOGD MOET WORDEN
//    getVersionList(false, true);
//    setModelInfo();
//    updateJSONEditor();
//}