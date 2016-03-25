/**
 * @fileOverview ReceivingAddressesCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'frontend/port', 'model/TLWalletUtils', 'model/TLBitcoinJSWrapper', 'model/TLHDWalletWrapper'],
    function (controllers, ArcBit, Port, TLWalletUtils, TLBitcoinJSWrapper, TLHDWalletWrapper) {
        controllers.controller('ReceivingAddressesCtrl', ['$scope', 'notify', '$window', 'modals', '$history', '$tabs', 'clipboard', '_Filter', function($scope, notify, $window, modals, $history, $tabs, clipboard, _) {
            var accountObject;

            $scope.nPages = 0;
            $scope.page = 0;
            var limit = 10;

            $scope.setCurrentAddress = function(address) {
                $scope.currentAddress = address;
            };


            $scope.setAddressFilter = function(name, dontSetPageToZero) {
                var identity = ArcBit.getIdentity();
                var accountIdx = $history.currentSelectedAccount.idx;
                if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                    accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(accountIdx);
                } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                    accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(accountIdx);
                } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                    accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(accountIdx);
                } else {
                    return;
                }

                $scope.allAddresses = [];
                $scope.displayingLocalCurrency = identity.appDelegate.preferences.isDisplayLocalCurrency();

                for(var i = 0; i < accountObject.getReceivingAddressesCount(); i++) {
                    var address = accountObject.getReceivingAddress(i);
                    $scope.allAddresses.push({
                        address: address
                    });
                }

                $scope.nPages = Math.ceil($scope.allAddresses.length/limit);
                if (dontSetPageToZero != true) {
                    $scope.page = 0;
                }
                $scope.addresses = $scope.allAddresses.slice($scope.page*limit, ($scope.page*limit) + limit);
            };

            $scope.setPage = function(page) {
                if (page < 0 || page >= $scope.nPages) {
                    return;
                }
                $scope.page = page;
                $scope.addresses = $scope.allAddresses.slice($scope.page*limit, ($scope.page*limit) + limit);
            };

            var promptToSignMessage = function(addr) {
                var key = accountObject.getMainPrivateKey(addr);
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

            $scope.showAddressInWeb = function(addr) {
                var identity = ArcBit.getIdentity();
                var idx = identity.appDelegate.preferences.getSelectedBlockExplorerURLIdx();
                var api = identity.appDelegate.preferences.getSelectedBlockExplorerAPI();
                $window.open(identity.appDelegate.preferences.getSelectedBlockExplorerURL(api, idx)+"address/"+addr, '_blank');
            };

            $scope.$watch('pocket.index || pocket.type', function() {
                $scope.setAddressFilter();
            })

            Port.connectNg('wallet', $scope, function(data) {
                if (data.type == 'EVENT_UPDATED_RECEIVING_ADDRESSES') {
                    $scope.setAddressFilter();
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                } else if (data.type == 'EVENT_FETCHED_ADDRESSES_DATA') {
                    $scope.setAddressFilter();
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
            });
        }]);
    });
