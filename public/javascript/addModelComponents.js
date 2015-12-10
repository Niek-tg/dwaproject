var currentFrameId = null;
var currentFrameType = null;

//TODO usefull comments
var NewmodelName;
var languageType;
var ownerNewModel;

//TODO add new model
function addNewMemorModel(modelName, language, owner){


    NewmodelName = modelName;
    languageType = language;
    ownerNewModel = owner;
    console.log(NewmodelName);
    console.log(languageType);
    console.log(ownerNewModel);
    if(NewmodelName && languageType && ownerNewModel) {
        var newModel = {
            'language': languageType,
            'owner': ownerNewModel,
            'mmid': 21,
            'modelName': NewmodelName,
            'version': 0,
            'memoryModel': {
                stack: [{
                    id: '0',
                    name: 'Global',
                    order: '1',
                    vars: [],
                    funcs: []
                }],
                heap: [
                    {
                        id: '1',
                        name: 'test',
                        order: '2',
                        vars: [
                            {
                                id: '1',
                                name: 'testVar',
                                value: 10,
                                undefined: '',
                                reference: ''
                            }
                        ],
                        funcs: []
                    }
                ]
            }
        };
    }else{
        alert('modelName, language or owner is empty');
    }

    sendMessage({
        msgType: 'addNewFrame',
        data: {msgType: 'makeNewModel', data: newModel}
    });
}

//TODO documentation en a re-order function for when a frame is removed
function getOrder(frameType) {
    var orderHeap = 0;
    var orderStack = 0;

    if (frameType === 'heap') {
        console.log('komt in heap');
        currentMemoryModel.memoryModel.heap.forEach(function () {
            orderHeap++;
        })
        console.log("Order stack stuf" + orderHeap);
        return orderHeap;
    }
    if (frameType === 'stack') {
        console.log('komt in stack');
        currentMemoryModel.memoryModel.stack.forEach(function () {
            orderStack++;
        })
        console.log("order stack stuf" + orderStack);
        return orderStack;
    }
}

/**
 * Draws new frame
 *
 * //TODO Creeer een dropdown met alle id's zodat die mee gegevens kunnen worden
 * //TODO Voeg dan knop met variabel toe en input veld zodat die aan het frame toegevoegd kunnen
 * //TODO worden
 */

function addNewFrame(frameName, frameType) {

    if (memoryModelLoaded) {
        if (frameType == 'stack') {
            var orderStack = getOrder('stack');
            console.log(orderStack);
            var newStackFrame = [{
                "id": frameIdEndPositions.length + 1,
                "name": frameName,
                "order": orderStack + 1,
                "vars": [],
                "funcs": []
            }]
            currentFrameType = frameType;
            currentFrameId = frameIdEndPositions.length + 1;

            sendMessage({
                msgType: 'addNewFrame',
                data: {newFrame: newStackFrame, currentMemoryModel: currentMemoryModel, frameType: frameType}
            });
        }

        if (frameType == 'heap') {
            var orderHeap = getOrder('heap')
            var newHeapFrame = [{
                "id": frameIdEndPositions.length + 1,
                "name": orderHeap + 1,
                "order": 1,
                "vars": [],
                "funcs": []
            }]

            currentFrameType = frameType;
            currentFrameId = frameIdEndPositions.length + 1;

            sendMessage({
                msgType: 'addNewFrame',
                data: {newFrame: newHeapFrame, currentMemoryModel: currentMemoryModel, frameType: frameType}
            });
        }
    }else{
        alert('select first a memorymodel so you can add frames or variables to it')
    }

    console.log(currentMemoryModel);
}

//TODO usefull comments

function addVariableToFrame(varName, value) {

    sendMessage({
        msgType: 'addVariableToFrame',
        data: {
            currentMemoryModel: currentMemoryModel,
            frameType: currentFrameType,
            currentFrameId: currentFrameId,
            var: {
                varName: varName,
                varValue: value
            }
        }
    });
    console.log('functie add variable works: ' + varName + ' value: ' + value);
}

function addFunctionToFrame(functionName) {
    console.log('functie add function works: ' + functionName);
}