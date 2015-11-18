/**
 * Created by Dion Koers on 6-11-2015.
 */

"use strict";

angular.module('psLogin-Register').controller('psLoginRegisterController', ['$scope', 'PsLoginService', 'PsRegisterService', function ($scope, PsLoginService, PsRegisterService) {
    $scope.toggleLogginDirective = true;
    $scope.toggleDashboardEnMenuDirective = false;
    $scope.toggleLoginType = true;
    $scope.toggleRegisterType = false;

    $scope.loginError = false;

    $scope.instantiateCredentials = function () {
        $scope.credentials = {
            email: '',
            password: ''
        };
    };

    $scope.switchType = function () {
        if ($scope.toggleLoginType === false) {
            $scope.toggleLoginType = true;
            $scope.toggleRegisterType = false;
            $scope.instantiateCredentials();
        } else {
            $scope.toggleLoginType = false;
            $scope.toggleRegisterType = true;
            $scope.instantiateCredentials();
        }
    };

    $scope.login = function () {
        PsLoginService.login($scope.credentials).then(function() {
            $scope.toggleLogginDirective = false;
            $scope.toggleDashboardEnMenuDirective = true;
            $scope.loginError = false;
            $scope.instantiateCredentials();
            $scope.$apply();
        }).catch(function (err) {
            console.log(err);
            $scope.loginError = true;
            $scope.instantiateCredentials();
            $scope.$apply();
        });
    };

    $scope.register = function () {
        PsRegisterService.register($scope.credentials);
    }
}]);