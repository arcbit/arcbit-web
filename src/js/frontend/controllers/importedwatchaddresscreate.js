/**
 * @fileOverview ImportedWatchAddressCreateCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWallet', 'model/TLBitcoinJSWrapper', 'model/TLStealthAddress', 'model/TLWalletUtils'],
    function (controllers, ArcBit, TLWallet, TLBitcoinJSWrapper, TLStealthAddress, TLWalletUtils) {
        controllers.controller('ImportedWatchAddressCreateCtrl', ['$scope', '$history', '$animate', '$timeout', '$tabs', 'modals', 'sounds', 'notify', '_Filter',
            function($scope, $history, $animate, $timeout, $tabs, modals, sounds, notify, _) {

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

                $scope.createImportedWatchAddress = function() {
                    if ($scope.newPocket.name) {
                        var identity = ArcBit.getIdentity();
                        if (TLStealthAddress.isStealthAddress($scope.newPocket.name, identity.appDelegate.appWallet.isTestnet())) {
                            notify.error(_("Cannot import reusable address"));
                            return;
                        }
                        if (!TLBitcoinJSWrapper.isValidAddress($scope.newPocket.name, identity.appDelegate.appWallet.isTestnet())) {
                            notify.error(_("Invalid address"));
                            return;
                        }
                        $animate.enabled(false);
                        modals.showSpinner(_('Importing Address'));
                        $timeout(function() {
                            $scope.selectImportedWatchAddress($scope.newPocket.name, identity.appDelegate.importedWatchAddresses.getCount());

                            var importedAddress = identity.appDelegate.importedWatchAddresses.addImportedWatchAddress($scope.newPocket.name);
                            //*
                            importedAddress.getSingleAddressData(function() {
                                $animate.enabled(identity.appDelegate.preferences.getAnimation());
                                modals.cancel();
                                notify.success(_("Imported"));
                                if(!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }, function() {
                                $animate.enabled(identity.appDelegate.preferences.getAnimation());
                                modals.cancel();
                                notify.success(_("Imported"));
                                if(!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            });
                            $scope.newPocket = {name:''};
                        }, 30, false);
                    } else {
                        // cancel
                        $tabs.open();
                    }
                };
            }]);
    });
