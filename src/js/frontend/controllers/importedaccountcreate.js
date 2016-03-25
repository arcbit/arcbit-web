/**
 * @fileOverview ImportedAccountCreateCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWallet', 'model/TLHDWalletWrapper', 'model/TLWalletUtils', 'model/TLBitcoinJSWrapper'], function (controllers, ArcBit,
                                                                                                                                         TLWallet, TLHDWalletWrapper, TLWalletUtils, TLBitcoinJSWrapper) {
    controllers.controller('ImportedAccountCreateCtrl', ['$scope', '$history', '$animate', '$timeout', '$tabs', 'modals',
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

            $scope.createImportedAccount = function() {
                if ($scope.newPocket.name) {
                    var identity = ArcBit.getIdentity();

                    if (!TLHDWalletWrapper.isValidExtendedPrivateKey($scope.newPocket.name, TLBitcoinJSWrapper.getNetwork(identity.appDelegate.appWallet.isTestnet()))) {
                        notify.error(_("Invalid account private key"));
                        return;
                    }
                    $animate.enabled(false);
                    modals.showSpinner(_('Importing Account'));

                    // timeout is used as a workaround for spinner modal showing delay issue
                    $timeout(function() {
                        identity.appDelegate.saveWalletNow();
                        identity.appDelegate.saveWalletJSONEnabled = false;
                        $scope.selectImportedAccount($scope.newPocket.name, identity.appDelegate.importedAccounts.getNumberOfAccounts());
                        var defaultName = _('Imported Account') + ' ' + (identity.appDelegate.importedAccounts.getNumberOfAccounts() + 1).toString();
                        var accountObject = identity.appDelegate.importedAccounts.addAccountWithExtendedKey($scope.newPocket.name, defaultName);

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
                    }, 27, false); // 27 is min delay for work around for spinner modal showing delay issue
                } else {
                    // cancel
                    $tabs.open();
                }
            };
        }]);
});
