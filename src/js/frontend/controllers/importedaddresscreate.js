/**
 * @fileOverview ImportedAddressCreateCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'model/TLWallet', 'model/TLBitcoinJSWrapper', 'model/TLWalletUtils'],
    function (controllers, ArcBit, TLWallet, TLBitcoinJSWrapper, TLWalletUtils) {
        controllers.controller('ImportedAddressCreateCtrl', ['$scope', '$history', '$animate', '$timeout', '$tabs', 'modals', 'sounds', 'notify', '_Filter',
            function($scope, $history, $animate, $timeout, $tabs, modals, sounds, notify, _) {

                $scope.newPocket = {};
                $scope.requirePassword = false;
                $scope.importEncrypted = 'encrypted';
                var showingSpinner = false;

                $scope.getAddressFromQRCode = function() {
                    modals.scanQr(function(data) {
                        var pars = TLWalletUtils.parseURI(data);
                        if (!pars || !pars.address) {
                            notify.warning(_('URI not supported'));
                            return;
                        }
                        $scope.newPocket.name = pars.address;
                        $scope.onAddressChanged();
                        sounds.play('keygenEnd');
                    });
                };

                function importPrivateKey(inputtedKey, encryptedPrivateKey) {
                    if (!TLBitcoinJSWrapper.isValidPrivateKey(inputtedKey)) {
                        notify.error(_("Invalid Private Key"));
                        return;
                    }
                    var identity = ArcBit.getIdentity();

                    if (!showingSpinner) {
                        $animate.enabled(false);
                        modals.showSpinner(_('Importing Private Key'));
                        showingSpinner = true;
                    } else {
                        modals.vars.desc = _('Importing Private Key');
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                    $timeout(function() {
                        $scope.selectImportedAddress(inputtedKey, identity.appDelegate.importedAddresses.getCount());

                        var importedAddress = identity.appDelegate.importedAddresses.addImportedPrivateKey(inputtedKey, encryptedPrivateKey);

                        importedAddress.getSingleAddressData(function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            showingSpinner = false;
                            notify.success(_("Imported"));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }, function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            showingSpinner = false;
                            notify.success(_("Imported"));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                    }, 30, false);

                    // reset pocket form
                    $scope.newPocket = {name:''};
                }


                function handleIsBIP38EncryptedKey(inputtedKey, password, encrypted) {
                    var identity = ArcBit.getIdentity();

                    $animate.enabled(false);
                    modals.showSpinner(_('Decrypting Private Key'));
                    showingSpinner = true;
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                    $timeout(function() {
                        TLBitcoinJSWrapper.privateKeyFromEncryptedPrivateKey(inputtedKey, password, function(decryptedKey) {
                            if (encrypted){
                                importPrivateKey(decryptedKey, inputtedKey);
                            } else {
                                importPrivateKey(decryptedKey);
                            }
                        }, function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            showingSpinner = false;
                            notify.error(_("Incorrect password"));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }, function (errorStr) {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            showingSpinner = false;
                            if (errorStr == 'Invalid Private Key') {
                                notify.error(_('Invalid Private Key'));
                            } else {
                                notify.error(errorStr);
                            }
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                    }, 30, false);

                }

                $scope.onAddressChanged = function() {
                    if (TLBitcoinJSWrapper.isBIP38EncryptedKey($scope.newPocket.name)) {
                        if (!$scope.requirePassword) {
                            $scope.requirePassword = true;
                        }
                    } else if ($scope.requirePassword) {
                        $scope.requirePassword = false;
                    }
                };

                $scope.createImportedAddress = function() {
                    if ($scope.newPocket.name) {
                        var inputtedKey = $scope.newPocket.name;
                        if (TLBitcoinJSWrapper.isBIP38EncryptedKey(inputtedKey)) {
                            if ($scope.newPocket.password == null) {
                                notify.note(_("Require private key password"));
                                return;
                            }
                            handleIsBIP38EncryptedKey(inputtedKey, $scope.newPocket.password, $scope.importEncrypted == 'encrypted');
                        } else {
                            importPrivateKey(inputtedKey);
                        }
                    } else {
                        // cancel
                        $tabs.open();
                    }
                };
            }]);
    });
