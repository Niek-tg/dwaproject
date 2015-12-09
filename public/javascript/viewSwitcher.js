
function enableDiagramView(){
    $('#memoryModel').load('./../views/diagramview.html');
}

function enableCodeView(){
    $('#memoryModel').load('./../views/codeview.html');

}

$(document).ready(function(){
    enableDiagramView();
})
