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
    if(diffs) diffs.forEach(function(diff){
        pendingChangeList.push(diff);
    });

    return pendingChangeList;
}


module.exports = {
    checkForChanges : checkForChanges
};
