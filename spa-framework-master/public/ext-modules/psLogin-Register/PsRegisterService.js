/**
 * Created by Dion Koers on 9-11-2015.
 */

"use strict";

angular.module('psLogin-Register').factory('PsRegisterService',function($http) {
    var factory = {};

    factory.register = function(credentials){
        $http({
            method: 'POST',
            url: '/api/register/',
            data: credentials

        }).then(function successCallback(response) {
            console.log('Dit komt van de registerRoute' + response);
        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
    };

    return factory;
});
