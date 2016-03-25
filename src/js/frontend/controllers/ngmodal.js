/**
 * @fileOverview OverviewCtrl angular controller
 */
'use strict';

define(['./module'], function (controllers) {
    controllers.controller('NgModalCtrl', ['$scope', function($scope) {

        $scope.vars = $scope.modals.vars;

        $scope.ok = function(data) {
            $scope.modals.show = false;
            if ($scope.modals.okCallback) {
                $scope.modals.okCallback(data, $scope.vars);
            }
        }
        $scope.cancel = function(reason) {
            $scope.modals.cancel(reason);
        }
    }]);
});
