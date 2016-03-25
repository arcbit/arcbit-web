'use strict';

define(['./module', 'frontend/port', 'arcbit'], function (controllers, Port, ArcBit) {
    controllers.controller('IdentitiesCtrl', ['$scope', '$window', 'modals', 'notify', '_Filter', function($scope, $window, modals, notify, _) {
        Port.connectNg('wallet', $scope, function(data) {
            if (data.type == 'ready' || data.type == 'rename') {
                $scope.currentIdentity = ArcBit.getIdentity().name;
                $scope.identities = ArcBit.getKeyRing().identities;
                $scope.loadedIdentities = Object.keys($scope.identities);
                $scope.availableIdentities = ArcBit.getKeyRing().availableIdentities;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            }
        });

        var deleteCurrentIdentity = function(identityName) {
            var identityIdx = $scope.availableIdentities.indexOf(identityName);
            if ($scope.availableIdentities.length == 1) {
                notify.warning(_('Can\'t delete the last identity!'));
                return;
            }
            var nextIdentity = identityIdx ? 0 : 1;
            ArcBit.core.loadIdentity(nextIdentity, function() {
                // Delete the identity after a new identity is loaded
                deleteOtherIdentity(identityName);
            });
        };

        var deleteOtherIdentity = function(identityName) {
            var keyRing = ArcBit.getKeyRing();
            keyRing.remove(identityName, function() {
                var identityIdx = $scope.availableIdentities.indexOf(identityName);
                if (identityIdx > -1) {
                    $scope.availableIdentities.splice(identityIdx, 1);
                }
                notify.note(_('{0} has been deleted.', identityName));
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            });
        };

        var confirmDeleteIdentity = function(identityName) {
            var identity = ArcBit.getIdentity();
            if (identityName == identity.name) {
                deleteCurrentIdentity(identityName);
            } else {
                deleteOtherIdentity(identityName);
            }
        };

        $scope.deleteIdentity = function(identityName) {
            if (identityName == ArcBit.getIdentity().appDelegate.walletName) {
                notify.warning(_('Can\'t delete your current identity!'));
                return;
            }
            var aa = _('Accept');
            modals.promptForOKCancel(_('Are you sure you want to delete {0}?', identityName), _('This action can\'t be reverted!'), _('Accept'), null, function() {
                confirmDeleteIdentity(identityName);
            });
        };

    }]);
});
