/**
 * Holds the name of the current view
 * @type {string}
 */
var currentView = "diagramView";

/**
 * Returns the current view
 */
function getCurrentView(){
    return currentView;
}

/**
 * Sets a currentview
 * @param newView
 */
function setCurrentView(newView){
    currentView = newView;
}

/**
 * Switches to the diagram view
 */
function enableDiagramView(){
    $('#memoryModel').load('./../views/diagramview.html');
    setCurrentView("diagramView");
    calculateDiagramContainerSize();
}

/**
 * Switches to the code view
 */
function enableCodeView(){
    $('#memoryModel').load('./../views/codeview.html',function(cb){
        initJSONEditor();
    });
    $(".newFrameButtons").css("display", "none");
    setCurrentView("codeView");
}
