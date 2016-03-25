/**
 * @fileOverview ContactsCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit'], function (controllers, ArcBit) {
    controllers.controller('loginCtrl', ['$scope', '$routeParams', '$location', '$route', '$history', '$tabs', 'notify', '_Filter',
        function($scope, $routeParams, $location, $route, $history, $tabs, notify, _) {

            $scope.loginPassword = '';
            $scope.identityName = ArcBit.getKeyRing().currentIdentityName;

            $scope.login = function() {
                var keyRing = ArcBit.getKeyRing();

                var currentIdentityName = ArcBit.getKeyRing().currentIdentityName;

                keyRing.load(currentIdentityName, function(loadedIdentity) {

                    ArcBit.service.wallet.setCurrentIdentity(currentIdentityName);
                    var identity = ArcBit.getIdentity();

                    try {
                        identity.appDelegate.initAppDelegate($scope.loginPassword);
                    } catch(errMsg) {
                        notify.error(_('Incorrect password'));
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                        return;
                    }
                    $history.initHistoryProvider();
                    identity.appDelegate.saveWalletNow();
                    identity.appDelegate.postEvent('wallet', {type:'EVENT_WALLET_LOGIN', identityName:currentIdentityName});
                    $scope.loginPassword = '';
                });
            };
        }]);
});
