/**
 * @fileOverview ImportedWatchAccountCreateCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWallet', 'model/TLHDWalletWrapper', 'model/TLWalletUtils', 'model/TLBitcoinJSWrapper'], function (controllers, ArcBit,
                                                                                                                                         TLWallet, TLHDWalletWrapper, TLWalletUtils, TLBitcoinJSWrapper) {
    controllers.controller('ImportedWatchAccountCreateCtrl', ['$scope', '$history', '$animate', '$timeout', '$tabs', 'modals',
        'sounds', 'notify', '_Filter', function($scope, $history, $animate, $timeout, $tabs, modals, sounds, notify, _) {

            $scope.newPocket = {};

            $scope.getAddressFromQRCode = function() {
                modals.scanQr(function(data) {
                    var pars = TLWalletUtils.parseURI(data);
                    if (!pars || !pars.address) {
                        notify.warning(_('URI not supported'));
                        return;
                    }
                    $scope.newPocket.name = pars.address;
                    sounds.play('keygenEnd');
                });
            };

            $scope.createImportedWatchAccount = function() {
                if ($scope.newPocket.name) {
                    var identity = ArcBit.getIdentity();

                    if (!TLHDWalletWrapper.isValidExtendedPublicKey($scope.newPocket.name, TLBitcoinJSWrapper.getNetwork(identity.appDelegate.appWallet.isTestnet()))) {
                        notify.error(_("Invalid account public key"));
                        return;
                    }
                    $animate.enabled(false);
                    modals.showSpinner(_('Importing Account'));

                    $timeout(function() {
                        identity.appDelegate.saveWalletNow();
                        identity.appDelegate.saveWalletJSONEnabled = false;
                        $scope.selectImportedWatchAccount($scope.newPocket.name, identity.appDelegate.importedWatchAccounts.getNumberOfAccounts());

                        var defaultName = _('Watch Account') + ' ' + (identity.appDelegate.importedWatchAccounts.getNumberOfAccounts() + 1).toString();
                        var accountObject = identity.appDelegate.importedWatchAccounts.addAccountWithExtendedKey($scope.newPocket.name, defaultName);
                        accountObject.recoverAccount(true, function() {

                            accountObject.getAccountData(function() {
                                $animate.enabled(identity.appDelegate.preferences.getAnimation());
                                modals.cancel();
                                identity.appDelegate.saveWalletJSONEnabled = true;
                                identity.appDelegate.saveWalletNow();
                            }, function() {
                                $animate.enabled(identity.appDelegate.preferences.getAnimation());
                                modals.cancel();
                                identity.appDelegate.saveWalletJSONEnabled = true;
                                identity.appDelegate.saveWalletNow();
                            });

                            $scope.newPocket = {name:''};
                        }, function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                        });
                    }, 30, false);
                } else {
                    // cancel
                    $tabs.open();
                }
            };
        }]);
});
