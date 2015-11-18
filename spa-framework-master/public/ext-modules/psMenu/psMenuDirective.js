/**
 * Created by Dion Koers on 5-11-2015.
 */

"use strict";

angular.module('psMenu').directive('psMenu', function () {
    return {
        transclude: true,
        templateUrl: 'ext-modules/psMenu/psMenuTemplate.html',
        controller: 'psMenuController',
        link: function (scope, el, attr) {
        }
    };
});