'use strict';

define(['./module'], function (controllers) {
  controllers.controller('ToolsCtrl', ['$scope', function($scope) {
    $scope.tools = {};
  }]);
});
