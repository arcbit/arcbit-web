/**
 * @fileOverview AddressesCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'frontend/port', 'model/TLWalletUtils', 'model/TLCoin', 'model/TLHDWalletWrapper', 'model/TLBitcoinJSWrapper'],
    function (controllers, ArcBit, Port, TLWalletUtils, TLCoin, TLHDWalletWrapper, TLBitcoinJSWrapper) {
        controllers.controller('AddressesCtrl', ['$scope', 'notify', 'modals', '$window', '$history', '$tabs', 'clipboard', '_Filter',
            function($scope, notify, modals, $window, $history, $tabs, clipboard, _) {


                // Filters
                $scope.addrFilter = $history.addrFilter;
                $scope.nPages = 0;
                $scope.page = 0;
                var limit = 10;
                var accountObject;

                $scope.setCurrentAddress = function(address) {
                    $scope.currentAddress = address;
                };

                /**
                 * Sets an address filter
                 * @param {String} name Filter name
                 */
                $scope.setAddressFilter = function(name, dontSetPageToZero) {
                    var identity = ArcBit.getIdentity();
                    var accountIdx = $history.currentSelectedAccount.idx;
                    if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(accountIdx);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(accountIdx);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(accountIdx);

                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET) {
                        accountObject = identity.appDelegate.accounts.getArchivedAccountObjectForIdx(accountIdx);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT) {
                        accountObject = identity.appDelegate.importedAccounts.getArchivedAccountObjectForIdx(accountIdx);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                        accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(accountIdx);
                    } else {
                        return;
                    }

                    if (name == 'activeMain') {
                        $scope.allAddresses = new Array(accountObject.getMainActiveAddressesCount());
                    } else if (name == 'activeChange') {
                        $scope.allAddresses = new Array(accountObject.getChangeActiveAddressesCount());
                    } else if (name == 'stealthPayment') {
                        if (accountObject.stealthWallet) {
                            $scope.allAddresses = new Array(accountObject.stealthWallet.getStealthAddressPaymentsCount());
                        }
                    } else if (name == 'archivedMain') {
                        $scope.allAddresses = new Array(accountObject.getMainArchivedAddressesCount());
                    } else if (name == 'archivedChange') {
                        $scope.allAddresses = new Array(accountObject.getChangeArchivedAddressesCount());
                    }

                    $history.setAddressFilter(name);
                    $scope.addrFilter = name;
                    if (dontSetPageToZero != true) {
                        $scope.page = 0;
                    }
                    if (name == 'activeMain') {
                        var len = accountObject.getMainActiveAddressesCount();
                        for(var i = $scope.page*limit; i < len && i < ($scope.page*limit) + limit; i++) {
                            var address = accountObject.getMainActiveAddress(len - 1 - i);
                            var balance = accountObject.getAddressBalance(address);
                            $scope.allAddresses[i] = {
                                address: address,
//                key: accountObject.getMainPrivateKey(address),
                                key: 1,
                                balance: balance,
                                idx: accountObject.getAddressHDIndex(address)
                            };
                        }
                    } else if (name == 'activeChange') {
                        var len = accountObject.getChangeActiveAddressesCount();
                        for(var i = $scope.page*limit; i < len && i < ($scope.page*limit) + limit; i++) {
                            var address = accountObject.getChangeActiveAddress(len - 1 - i);
                            var balance = accountObject.getAddressBalance(address);
                            $scope.allAddresses[i] = {
                                address: address,
//                  key: accountObject.getChangePrivateKey(address),
                                key: 1,
                                balance: balance,
                                idx: accountObject.getAddressHDIndex(address)
                            };
                        }
                    } else if (name == 'stealthPayment') {
                        if (accountObject.stealthWallet) {
                            var len = accountObject.stealthWallet.getStealthAddressPaymentsCount();
                            for(var i = $scope.page*limit; i < len && i < ($scope.page*limit) + limit; i++) {
                                var idx = len - 1 - i;
                                var address = accountObject.stealthWallet.getPaymentAddressForIndex(idx);
                                var balance = accountObject.getAddressBalance(address);
                                $scope.allAddresses[i] = {
                                    address: address,
                                    key: 1,
                                    balance: balance,
                                    idx: idx
                                };
                            }
                        } else {
                            $scope.allAddresses = [];
                        }
                    } else if (name == 'archivedMain') {
                        var len = accountObject.getMainArchivedAddressesCount();
                        for(var i = $scope.page*limit; i < len && i < ($scope.page*limit) + limit; i++) {
                            var address = accountObject.getMainArchivedAddress(len - 1 - i);
                            $scope.allAddresses[i] = {
                                address: address,
                                key: 1,
                                balance: TLCoin.zero(),
                                idx: accountObject.getAddressHDIndex(address)
                            };
                        }
                    } else if (name == 'archivedChange') {
                        var len = accountObject.getChangeArchivedAddressesCount();
                        for(var i = $scope.page*limit; i < len && i < ($scope.page*limit) + limit; i++) {
                            var address = accountObject.getChangeArchivedAddress(len - 1 - i);
                            $scope.allAddresses[i] = {
                                address: address,
                                key: 1,
                                balance: TLCoin.zero(),
                                idx: accountObject.getAddressHDIndex(address)
                            };
                        }
                    }

                    $scope.nPages = Math.ceil($scope.allAddresses.length/limit);
                    $scope.addresses = $scope.allAddresses.slice($scope.page*limit, ($scope.page*limit) + limit);
                };

                $scope.setPage = function(page) {
                    if (page < 0 || page >= $scope.nPages) {
                        return;
                    }
                    $scope.page = page;
                    $scope.setAddressFilter($scope.addrFilter, true);
//      $scope.addresses = $scope.allAddresses.slice($scope.page*limit, ($scope.page*limit) + limit);
                };

                var getPrivateKey = function(address) {
                    var key;
                    if ($scope.addrFilter == 'activeMain') {
                        key = accountObject.getMainPrivateKey(address);
                    } else if ($scope.addrFilter == 'activeChange') {
                        key = accountObject.getChangePrivateKey(address);
                    } else if ($scope.addrFilter == 'stealthPayment') {
                        if (accountObject.stealthWallet) {
                            key = accountObject.stealthWallet.getPaymentAddressPrivateKey(address);
                        }
                    } else if ($scope.addrFilter == 'archivedMain') {
                        key = accountObject.getMainPrivateKey(address);
                    } else if ($scope.addrFilter == 'archivedChange') {
                        key = accountObject.getChangePrivateKey(address);
                    }
                    return key;
                };

                $scope.showPrivateKeyQRCode = function(address) {
                    if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        if (accountObject.hasSetExtendedPrivateKeyInMemory()) {
                            modals.showBtcQr(getPrivateKey(address));
                        } else {
                            modals.promptForInput(_("Account private key missing"), _("Do you want to temporary import your account private key?"), "xprv...", function(input) {
                                var identity = ArcBit.getIdentity();
                                if (!TLHDWalletWrapper.isValidExtendedPrivateKey(input, TLBitcoinJSWrapper.getNetwork(identity.appDelegate.appWallet.isTestnet()))) {
                                    notify.warning(_('Invalid account private key'));
                                } else {
                                    var success = accountObject.setExtendedPrivateKeyInMemory(input);
                                    if (!success) {
                                        notify.warning(_('Account private key does not match imported account public key'));
                                    } else {
                                        $history.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                                        notify.success(_('Imported'));
                                    }
                                }
                            });
                        }
                    } else {
                        modals.showBtcQr(getPrivateKey(address));
                    }
                };

                $scope.showAddressInWeb = function(addr) {
                    var identity = ArcBit.getIdentity();
                    var idx = identity.appDelegate.preferences.getSelectedBlockExplorerURLIdx();
                    var api = identity.appDelegate.preferences.getSelectedBlockExplorerAPI();
                    $window.open(identity.appDelegate.preferences.getSelectedBlockExplorerURL(api, idx)+"address/"+addr, '_blank');
                };


                var promptToSignMessage = function(addr) {
                    var key = getPrivateKey(addr);
                    modals.promptSignMessage(false, addr, null, function() {
                    }, function(reason, vars) {
                        if (reason == 'dont_dismiss') {
                            if (vars.msg == null) {
                                notify.warning(_('Missing message'));
                                return;
                            }
                            vars.sig = TLBitcoinJSWrapper.getSignatureFromKey(key, vars.msg);
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    });
                };

                $scope.signMessage = function(addr) {
                    if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        if (accountObject.hasSetExtendedPrivateKeyInMemory()) {
                            promptToSignMessage(addr);
                        } else {
                            modals.promptForInput(_("Account private key missing"), _("Do you want to temporary import your account private key?"), "xprv...", function(input) {
                                var identity = ArcBit.getIdentity();
                                if (!TLHDWalletWrapper.isValidExtendedPrivateKey(input, TLBitcoinJSWrapper.getNetwork(identity.appDelegate.appWallet.isTestnet()))) {
                                    notify.warning(_('Invalid account private key'));
                                } else {
                                    var success = accountObject.setExtendedPrivateKeyInMemory(input);
                                    if (!success) {
                                        notify.warning(_('Account private key does not match imported account public key'));
                                    } else {
                                        $history.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                                        notify.success(_('Imported'));
                                    }
                                }
                            });
                        }
                    } else {
                        promptToSignMessage(addr);
                    }
                };

                $scope.$watch('pocket.index || pocket.type', function() {
                    $scope.setAddressFilter($scope.addrFilter);
                });

                Port.connectNg('wallet', $scope, function(data) {
                    if (data.type == 'EVENT_MODEL_UPDATED_NEW_UNCONFIRMED_TRANSACTION') {
                        $scope.setAddressFilter($scope.addrFilter, true);
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else if (data.type == 'EVENT_FETCHED_ADDRESSES_DATA') {
                        $scope.setAddressFilter($scope.addrFilter, true);
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                });

            }]);
    });
