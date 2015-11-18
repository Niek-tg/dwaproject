/**
 * Created by Dion Koers on 4-11-2015.
 */

"use strict";

angular.module('app').config(['$routeProvider' , function ($provide){
    $provide.decorator("exceptionHandler", ["$delegate", function($delegate){
        return function(exeption, cause){
            $delegate(exeption, cause);
            alert(exeption.message)
        };
    }]);
}]);
