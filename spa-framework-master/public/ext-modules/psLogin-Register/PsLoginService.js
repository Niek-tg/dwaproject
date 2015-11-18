/**
 * Created by Dion Koers on 6-11-2015.
 */

"use strict";

angular.module('psLogin-Register').factory('PsLoginService', ['$http' ,function ($http) {
    var factory = {};

    factory.login = function (credentials) {
        return new Promise(function(resolve, reject){
            $http({
                method: 'POST',
                url: '/api/login/',
                data: credentials
            }).then(function successCallback(response) {
                console.log('Post succes' + response);
                if(response.data.succeeded){
                    resolve(response);
                }else{
                    reject(response);
                }

            }, function errorCallback(response) {
                console.log('Post error: ' + response);
            });
        });
    };

    return factory;
}]);