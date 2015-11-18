/**
 * Created by Dion Koers on 6-11-2015.
 */

"use strict";

angular.module('psLogin-Register').directive('psLoginRegister', [
    function () {
        return {
            transclude: true,
            controller: 'psLoginRegisterController',
            templateUrl: 'ext-modules/psLogin-Register/psLoginRegisterTemplate.html'
        }
    }]);