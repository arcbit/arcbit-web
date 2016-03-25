/**
 * @fileOverview AccountCreateCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWalletJSONKeys'], function (controllers, ArcBit, TLWalletJSONKeys) {
    controllers.controller('AccountCreateCtrl', ['$scope', '$history', '$tabs', 'modals', 'notify', '_Filter', function($scope, $history, $tabs, modals, notify, _) {
        $scope.newPocket = {};
        $scope.createPocket = function() {
            if ($scope.newPocket.name) {
                var identity = ArcBit.getIdentity();
                $scope.selectPocket($scope.newPocket.name, identity.appDelegate.accounts.getNumberOfAccounts());
                var accountObject = identity.appDelegate.accounts.createNewAccount($scope.newPocket.name, TLWalletJSONKeys.TLAccount.NORMAL, true);
//            accountObject.getAccountData(function() {
//            }, function() {
//            });
                $scope.newPocket = {name:''};
            } else {
                // cancel
                $tabs.open();
            }
        };
    }]);
});
