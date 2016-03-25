/**
 * @fileOverview Popup classes.
 */
'use strict';

/**
 * Popup class constructor to handle identities.
 * @param {Object} $scope Angular scope.
 * @constructor
 */
define(['frontend/controllers/module', 'arcbit', 'frontend/port'], function (controllers, ArcBit, Port) {
    controllers.controller('PopupCtrl', ['$scope', '$window', '$translate', function($scope, $window, $translate) {

        $scope.identityLoaded = false;
        $scope.currentIdentity = false;
        $scope.tab = 0;
        $scope.needsOpen = false;

        $scope.forms = {};
        $scope.forms.identityDropdown = false;
        $scope.identityName = false;
        //*
        var globalLanguage = ArcBit.getKeyRing().globalSettings.getLanguage();
        if (globalLanguage) {
            $translate.use(globalLanguage);
        }

        // Wallet service, connect to get notified about identity getting loaded.
        Port.connect('wallet', function(data) {
            if (data.type == 'ready') {
                // identity is ready here
                $scope.identityLoaded = true;
                $scope.currentIdentity = data.identity;
                $scope.identity = ArcBit.getIdentity();
                $scope.forms.identityDropdown = false;
                if ($scope.needsOpen) {
                    $scope.needsOpen = false;
                    $window.open('index.html#wallet');
                }
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        Port.connect('gui', function(data) {
            if (['height', 'radar'].indexOf(data.type) > -1) {
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        var keyRing = ArcBit.getKeyRing();

        keyRing.loadIdentities(function(identityNames) {
            var identities = [];
            identityNames.forEach(function(item) {
                identities.push({id: item});
            });
            $scope.identities = identities;
            if (!$scope.currentIdentity) {
                if (ArcBit.getKeyRing().currentIdentityName != null) {
                    $scope.currentIdentity = ArcBit.getKeyRing().currentIdentityName;
                } else {
                    var currentIdentityName = keyRing.globalSettings.getCurrentIdentityName();
                    if (currentIdentityName != null) {
                        $scope.currentIdentity = currentIdentityName;
                    } else {
                        $scope.currentIdentity = identityNames[0];
                    }
                }
            }
            if (keyRing.identities.hasOwnProperty($scope.currentIdentity)) {
                $scope.identityLoaded = true;
            }
            if(!$scope.$$phase) {
                $scope.$apply();
            }
            ArcBit.getKeyRing().currentIdentityName = $scope.currentIdentity;
        });


        $scope.loadIdentity = function(name) {
            ArcBit.getKeyRing().currentIdentityName = name;

            $scope.currentIdentity = name;
            $scope.forms.identityDropdown = false;

            var globalLanguage = ArcBit.getKeyRing().globalSettings.getLanguage();
            if (globalLanguage) {
                $translate.use(ArcBit.getKeyRing().globalSettings.getLanguage());
            }

            var identityIdx = ArcBit.getKeyRing().availableIdentities.indexOf(name);
            ArcBit.service.obelisk.disconnect(function() {
                $scope.needsOpen = !$scope.identityLoaded;
                ArcBit.core.loadIdentity(identityIdx);
            });
        }

    }]);
});
