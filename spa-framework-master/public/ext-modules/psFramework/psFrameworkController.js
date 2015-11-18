/**
 * Created by Dion Koers on 3-11-2015.
 */

"use strict";

angular.module("psFramework").controller("psFrameworkController",
    ['$scope', 'PsFrameworkService', function ($scope, PsframeworkService) {

        $scope.lijst = [];
        $scope.cursor = undefined;

        PsframeworkService.getRequest().then(function(data){
            data.data.forEach(function(user){
                $scope.lijst.push(user);
            });
            $scope.$apply();
        }).then(function(){
            $scope.cursor = PsframeworkService.getCursor();

        }).then(function(){
            $scope.$apply();
        });


        $scope.createNewUser = function () {
            console.log('button werkt');
            PsframeworkService.createNewUser();
        };


        $scope.createNewUserWithPush = function () {
            console.log('button werkt');
            PsframeworkService.createNewUserWithPush();
        };

        $scope.updateUser = function () {
            PsframeworkService.updateUser().then(function(data){
                console.log(data.data)
            });
        };

        $scope.deleteRequest = function () {
            PsframeworkService.deleteRequest();
        };
    }]);