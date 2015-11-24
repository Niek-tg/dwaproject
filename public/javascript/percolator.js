/**
 * Created by tjeuj_000 on 24-11-2015.
 */

$http.get('/api/MemoryModels/')
    .success(function (data) {
        console.log(data);
        var memoryModels = data.memoryModels
        var sel = document.getElementById('memoryModelsList');
        for(var i = 0; i < memoryModels.length; i++) {
            var opt = document.createElement('option');
            opt.innerHTML = memoryModels[i];
            opt.value = memoryModels[i];
            sel.appendChild(opt);
        }
    })
    .error(function (data, status) {
        alert(data);
        console.log("ERROR", status, data);
    });


function chooseMemoryModel($http, id) {
    $http.get('/api/MemoryModels/' + id)
        .success(function (data) {
            console.log(data);
        })
        .error(function (data, status) {
            alert(data);
            console.log("ERROR", status, data);
        });
}