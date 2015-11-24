/**
 * Created by tjeuj_000 on 24-11-2015.
 */

//var memoryModels = data.data;
//var sel = document.getElementById('memoryModelsList');
//for(var i = 0; i < memoryModels.length; i++) {
//    var opt = document.createElement('option');
//    opt.innerHTML = memoryModels[i];
//    opt.value = memoryModels[i];
//    sel.appendChild(opt);
//}

var connection = new WebSocket("ws://localhost:3000");

window.onload=function() {
console.log("LOADING ALL MEMORY MODELS");
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", '/api/MemoryModels', true);
    xhttp.send();

};

//function chooseMemoryModel($http, id) {
//    $http.get('/api/MemoryModels/' + id)
//        .success(function (data) {
//            console.log(data);
//        })
//        .error(function (data, status) {
//            alert(data);
//            console.log("ERROR", status, data);
//        });
//}