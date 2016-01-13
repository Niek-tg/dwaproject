/**
 * Toggle function for the divs that hold the information about all the memory models and the versions of the current memory model
 * @param me
 */
function toggleActive(me){

    var isActive = ($(me).hasClass("active")) ? true : false;
    var image = (isActive)? "close-icon.png" : "open-icon.png";
    var display = (isActive)? "block" : "none";
    var css;
    var grandparent = $(me).parent().parent();
    if((grandparent).attr('id') == "allMemoryModels") css = (isActive)? { width: '15%', minWidth: "300px"  } : { width: '50', minWidth: "0" };
    else css = (isActive)? {
        width: '8%',
        minWidth: "150px"
    } : {
        width: '50',
        minWidth: "0" };

    var notToHide = ".rotate270, .togglable";

    $(grandparent).children().not(notToHide).css( "display", display );
    $(grandparent).css(css, 500);
    if(isActive)$(me).removeClass("active");
    else $(me).addClass("active");
    $(me).html("<img src='./images/"+ image +"' />");

    calculateDiagramContainerSize()
}

/**
 * Calculates the size of the DiagramContainer
 */
function calculateDiagramContainerSize(){
    var size = $(window).width();
    var count = $(diagramContainer).children().length;
    size -= $("#allMemoryModels").outerWidth();
    size -= $("#memoryModelVersions").outerWidth();
    $("#memoryModel").css(
        {
            maxWidth : size - 23 + "px",
            "width": "100%"
        });
    $(diagramContainer).css(
        {
            maxWidth : size - 3 + "px",
            "width": "100%"
        });
    if(currentView === "diagramView" && count > 1) jsPlumb.repaintEverything();

}