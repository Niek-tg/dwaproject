/**
 * Attaches all the eventlisteners to their corresponding divs or attributes
 */
function attachEventListeners() {

    var div = "#addReference";
    $(div).unbind('click');
    $(div).click(function () {
        toggleEditingMode = !toggleEditingMode;
        redrawPlumbing();
    });

    div = "#updateButton";
    $(div).unbind('click');
    $(div).click(function () {
        updateValue();
        closeWrapper();
    });

    div = "#closeButton";
    $(div).unbind('click');
    $(div).click(function () {
        closeWrapper();
    });

    div = ".variable";
    $(div).unbind('dblclick');
    $(div).dblclick(function () {
        openEditField(this);
    });

    div = "#addNewStackFrame";
    $(div).unbind('click');
    $(div).click(function () {
        addNewFrame($("#frameLabel").val(), 'stack');
    });

    div = "#addNewHeapFrame";
    $(div).unbind('click');
    $(div).click(function () {
        addNewFrame($("#frameLabel").val(), 'heap');
    });

    //New memorymodel, stack & heap
    div = "#addNewStack";
    $(div).unbind('click');
    $(div).click(function () {
        console.log("Komt in addNewStack");
        addStackOrHeap('stacks');
    });

    div = "#addNewHeap";
    $(div).unbind('click');
    $(div).click(function () {
        console.log("Komt in addNewHeap");
        addStackOrHeap('heaps');
    });

    div = "#addNewMemoryModel";
    $(div).unbind('click');
    $(div).click(function () {
        addNewMemoryModel();
    });

    div = ".deleteFrame";
    $(div).unbind('click');
    $(div).click(function () {
        deleteFrameOrVar(this, true);
    });

    function closeWrapper() {
        var div = "#editWrapper";
        if (!$(div).is(':hidden')) $(div).slideToggle();
    }
}
