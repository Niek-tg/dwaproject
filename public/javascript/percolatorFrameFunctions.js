var diagramContainer = $("#diagramContainer");

function toggleActive(me){

    var isActive = ($(me).hasClass("active")) ? true : false;
    var grandparent = $(me).parent().parent();


    if(isActive){
        $(grandparent).children().not($(me).parent()).css( "display", "block" );
        $(grandparent).css({ width: '15%', minWidth: "300px"  }, 500);
        $(me).removeClass("active");
        $(me).text("close");
        calculateDiagramContainerSize()
    }
    else {
        $(grandparent).children().not($(me).parent()).css( "display", "none" );
        $(grandparent).css({ width: '50', minWidth: "0" }, 500);
        $(me).addClass("active");
        $(me).text("open");
        calculateDiagramContainerSize()
    }

}

function calculateDiagramContainerSize(){
    var size = $(window).width();
    size -= $("#allMemoryModels").outerWidth();
    size -= $("#memoryModelVersions").outerWidth();
    $("#diagramContainer").css({maxWidth : size -2 + "px"});
    jsPlumb.repaintEverything();
}
calculateDiagramContainerSize();