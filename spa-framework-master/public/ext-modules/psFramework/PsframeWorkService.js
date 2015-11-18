/**
 * Created by Dion Koers on 11-11-2015.
 */

"use strict";

angular.module('psFramework').factory('PsFrameworkService', [ '$http' , function($http){

    var factory = {};

    // TODO http get user
    factory.getRequest = function(){
        return new Promise(function(resolve,reject){
            $http({
                method: 'GET',
                url: '/api/rethinkdbRoute/getUser'
            }).then(function succesCallback(response){
                console.log('get request was succesfull');
                resolve(response);
            }, function errorCallback(response){
                reject(response);
            });
        })

    };

    factory.getCursor = function(){
        return new Promise(function(resolve,reject){
            $http({
                method: 'GET',
                url: '/api/rethinkdbRoute/getCursor'
            }).then(function succesCallback(response){
                console.log('cursor received '+ response);
                resolve(response);
            }, function errorCallback(response){
                reject(response);
            });
        })

    };




    //TODO http post user
    factory.createNewUser = function(){
        $http({
            method: 'POST',
            url: '/api/rethinkdbRoute/createNewUser'
        }).then(function succesCallback(response){
            console.log('Creating new user succesfull');
        }, function errorCallback(response){
        });
    };

    //TODO http push user
    factory.createNewUserWithPush = function(){
        $http({
            method: 'POST',
            url: '/api/rethinkdbRoute/createNewUserWithPush'
        }).then(function succesCallback(response){
            console.log('Push user succesfull');
        }, function errorCallback(response){
        });
    };

    // TODO http update
    factory.updateUser = function(){
        return new Promise(function(resolve, reject){
            $http({
                method: 'POST',
                url: '/api/rethinkdbRoute/updateUser'
            }).then(function succesCallback(response){
                //console.log('Updated user succesfull');
                resolve(response)
            }, function errorCallback(response){
                reject(response);
            });
        })

    };
    // TODO http put
    factory.putRequest = function(){
        //TODO HTTP request
        alert('put functie');
    };
    // TODO http delete
    factory.deleteRequest = function(){
        $http({
            method: 'GET',
            url: '/api/rethinkdbRoute/deleteUser'
        }).then(function succesCallback(response){
            console.log('Delete user succesfull');
        }, function errorCallback(response){

        });
    };

    return factory;

}]);