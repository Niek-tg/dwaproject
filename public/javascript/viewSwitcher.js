
/**
 * Holds the name of the current view
 * @type {string}
 */
var currentView = "diagramView";

/**
 * Switches to the diagram view
 */
function enableDiagramView(){
    $('#memoryModel').load('./../views/diagramview.html');
    currentView = "diagramView";
}

/**
 * Switches to the code view
 */
function enableCodeView(){
    $('#memoryModel').load('./../views/codeview.html');
    currentView = "codeView";
}

$(document).ready(function(){
    enableDiagramView();
});
