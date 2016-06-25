/**
 * @fileOverview WalletCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'frontend/port', 'model/TLExchangeRate', 'model/TLAppDelegate',
        'model/TLHDWalletWrapper', 'model/TLWalletJson', 'model/TLWalletUtils', 'model/TLWalletJSONKeys'
        , 'model/TLBlockExplorerAPI', 'model/TLBitcoinListener'],
    function (controllers, ArcBit, Port, TLExchangeRate, TLAppDelegate, TLHDWalletWrapper, TLWalletJson, TLWalletUtils,
              TLWalletJSONKeys, TLBlockExplorerAPI, TLBitcoinListener) {
        'use strict';

        /**
         * Controller
         */
        controllers.controller('WalletCtrl',
            ['$scope', '$location', '$history', 'notify', 'clipboard', 'modals', '$animate', '_Filter', '$tabs', '$translate', '$timeout', '$interval',
                function($scope, $location, $history, notify, clipboard, modals, $animate, _, $tabs, $translate, $timeout, $interval) {

                    $scope.forms = {};
                    $scope.identityName = false;

                    $scope.rotateLogo = false;

                    $scope.modals = modals;
                    $scope.clipboard = clipboard;

                    $scope.openWallet = $tabs.openWallet;
                    $scope.isLoggedIn = false;
                    var isEnteredFromRelaunchedChrome = false;
                    var updateExchangeRateInterval;

                    $scope.logoutWallet = function() {
                        var identity = ArcBit.getIdentity();

                        if (identity.appDelegate.preferences.showLogoutWarning()) {
                            modals.promptForOKCancel(_('Logout Warning'), _('Password is required to log back in. By default your password is your 12 word mnemonic, which is found in settings.'), _('Logout'), null, function() {
                                identity.appDelegate.preferences.setShowLogoutWarning(false);
                                $scope.logoutWallet();
                            });
                            return;
                        }
                        if (!identity.appDelegate.preferences.viewedMnemonic()) {
                            modals.promptForOK(_("Warning"), _('ArcBit has detected that you have not yet viewed your 12 word mnemonic. First write down or memorize your 12 word mnemonic, which is found in settings.'), null);
                            return;
                        }

                        identity.appDelegate.saveWalletNow(true);
                        $scope.isLoggedIn = false;

                        var keyRing = ArcBit.getKeyRing();
                        var walletService = ArcBit.service.wallet;
                        var currentIdentity = walletService.getCurrentIdentity();
                        keyRing.close(currentIdentity.name);
                        $location.path('/login');
                    }

                    /**
                     * Wallet Port
                     * Sends notifications about wallet state and identity change
                     */
                    Port.connectNg('wallet', $scope, function(data) {
                        if (data.type == 'ready') {
                            var updated = identityLoaded(ArcBit.getIdentity());
                            if(updated && !$scope.$$phase) {
                                $scope.$apply();
                            }
                        } else if (data.type == 'rename') {
                            $scope.identityName = data.newName;
                            $scope.availableIdentities = ArcBit.getKeyRing().availableIdentities;
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        } else if (data.type == 'EVENT_WALLET_LOGIN') {
                            $scope.isLoggedIn = true;
                            var identity = ArcBit.getIdentity();
                            linkIdentity(identity);
                            var currentSelectedAccount = identity.appDelegate.preferences.getCurrentSelectedAccount();
                            ArcBit.getKeyRing().currentIdentityName = data.identityName;
                            $tabs.open(currentSelectedAccount.account_type, currentSelectedAccount.idx);
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                            $history.initHistoryProvider();
                            identity.appDelegate.blockExplorerAPI = new TLBlockExplorerAPI(identity.appDelegate.preferences);
                            identity.appDelegate.bitcoinListener = new TLBitcoinListener(identity.appDelegate);
                            identity.appDelegate.getAndSetBlockHeight();
                            identity.appDelegate.setUpAllStealthPaymentAddresses();
                            $history.fetchSelectedAccountBalance();
                            identity.appDelegate.bitcoinListener.reconnect();
                            identity.appDelegate.stealthWebSocket.reconnect();
                            var keyRing = ArcBit.getKeyRing();
                            keyRing.globalSettings.setCurrentIdentityName(ArcBit.getKeyRing().currentIdentityName);
                            $translate.use(identity.appDelegate.preferences.getLanguage());
                            periodicUpdateExchangeRate();
                        } else if (data.type == 'EVENT_FETCHING_BALANCE') {
                            $history.pocket.bitcoinBalance = null;
                            $history.pocket.fiatBalance = null;
                            $scope.rotateLogo = 1;
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        } else if (data.type == 'EVENT_FINISH_FETCHING_BALANCE') {
                            $scope.rotateLogo = 0;
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        } else if (data.type == 'EVENT_TOGGLED_ADVANCE_MODED') {
                            $scope.advancedModeEnabled = data.enabled;
                        }
                    });


                    /**
                     * Check if a route is active
                     */
                    $scope.isActive = function(route) {
//    return route === $location.path().slice(0, route.length);
                    };

                    /**
                     * Link given identity to the scope
                     */
                    function linkIdentity(identity) {
                        // Link pockets and funds
                        if (identity.appDelegate == null) { return; }
                        if (identity.appDelegate.walletDecrypted) {
                            $scope.accounts = identity.appDelegate.accounts.accountsArray;
                            $scope.importedAccounts = identity.appDelegate.importedAccounts.accountsArray;
                            $scope.importedWatchAccounts = identity.appDelegate.importedWatchAccounts.accountsArray;
                            $scope.importedAddresses = identity.appDelegate.importedAddresses.importedAddresses;
                            $scope.importedWatchAddresses = identity.appDelegate.importedWatchAddresses.importedAddresses;
                            $scope.archivedAccounts = identity.appDelegate.accounts.archivedAccountsArray;
                            $scope.archivedImportedAccounts = identity.appDelegate.importedAccounts.archivedAccountsArray;
                            $scope.archivedImportedWatchAccounts = identity.appDelegate.importedWatchAccounts.archivedAccountsArray;
                            $scope.archivedImportedAddresses = identity.appDelegate.importedAddresses.archivedImportedAddresses;
                            $scope.archivedImportedWatchAddresses = identity.appDelegate.importedWatchAddresses.archivedImportedAddresses;
                            $scope.advancedModeEnabled = identity.appDelegate.preferences.enabledAdvancedMode();
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                        } else {
                            $animate.enabled(true);
                        }

                        // set some links
                        $scope.availableIdentities = ArcBit.getKeyRing().availableIdentities;
                        $scope.identityName = identity.name;

                        if (identity.appDelegate.walletDecrypted == false) { return; }
                    }

                    /**
                     * Identity loaded, called when a new identity is loaded
                     */
                    function identityLoaded(identity) {
                        if (!identity || $scope.identityName == identity.name) {
                            return false;
                        }

                        linkIdentity(identity);

                        if (isEnteredFromRelaunchedChrome) {
                            isEnteredFromRelaunchedChrome = false;
                            var loginPassword = identity.appDelegate.getLoginPassword();
                            identity.appDelegate.initAppDelegate(loginPassword);
                            linkIdentity(identity);
                            openWalletAfterAppDelegateLoaded(identity);
                        }

                        return true;
                    }

                    /**
                     * Click on the title either toggles pocket list or goes to wallet
                     */
                    $scope.titleClick = function() {
                        var currentPath = $location.path();
                        if (currentPath.substr(0, 7) === '/wallet') {
                            var element = angular.element(document.querySelector('.inner-wrap'));
                            element.toggleClass('pinned');
                            //var element = angular.element(document.querySelector('.off-canvas-wrap'));
                            //element.toggleClass('move-right');
                        } else {
                            $location.path("/wallet");
                        }
                    }

                    /**
                     * Utility function to create iterators
                     */
                    $scope.range = function(n) {
                        if (!n) return [];
                        return new Array(n);
                    };

                    $scope.refreshBalance = function() {
                        var identity = ArcBit.getIdentity();
                        var accountIdx = $tabs.pocketId;
                        var accountObject = null;
                        var addressObject = null;

                        if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                            accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(accountIdx);
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                            accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(accountIdx);
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                            accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(accountIdx);
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                            addressObject = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(accountIdx);
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                            addressObject = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(accountIdx);
                        } else {
                            return;
                        }

                        $history.pocket.bitcoinBalance = null;
                        $history.pocket.fiatBalance = null;
                        $scope.rotateLogo = 1;
                        if (accountObject) {
                            accountObject.getAccountData(function() {
                                $scope.rotateLogo = 0;
                            }, function() {
                                $scope.rotateLogo = 0;
                            });
                        } else if (addressObject) {
                            addressObject.getSingleAddressData(function() {
                                $scope.rotateLogo = 0;
                            }, function() {
                                $scope.rotateLogo = 0;
                            });
                        }
                    };

                    $scope.displayBitcoinBalance = function() {
                        var identity = ArcBit.getIdentity();
                        identity.appDelegate.preferences.setDisplayLocalCurrency(false);
                    };

                    $scope.displayFiatBalance = function() {
                        var identity = ArcBit.getIdentity();
                        identity.appDelegate.preferences.setDisplayLocalCurrency(true);
                    };

                    chrome.extension.sendMessage({ type: 'getTabId' }, function(res) { });

                    function loadWalletIdentity(walletName) {
                        TLWalletJson.getLocalWalletJSONFile(walletName, function (walletObj) {

                            if (walletObj != null && walletObj["version"] != null) {
                                var walletService = ArcBit.service.wallet;
                                if (walletObj["encrypted"]) {
                                    walletService.createIdentityWithEncryptedWalletJSON(walletName, walletObj, function(identity) {
                                        $location.path('/login');
                                        var updated = identityLoaded(ArcBit.getIdentity());
                                    });

                                } else {
                                    // this happens when opening wallet after a chrome relaunch
                                    isEnteredFromRelaunchedChrome = true;
                                    walletService.loadIdentityFromJSON(walletName, walletObj, identityLoaded);
                                }
                            } else {
                                var walletService = ArcBit.service.wallet;
                                var mnemonic = TLHDWalletWrapper.generateMnemonicPassphrase();

                                var firstWalletName = "Wallet 1"; //Dont need to translate, first created wallet is always in english
                                var recoverFromMnemonic = false;
                                //recoverFromMnemonic = true; // DEBUG uncomment to restore wallet on create first wallet
                                walletService.createIdentity(firstWalletName, 'bitcoin', mnemonic, recoverFromMnemonic, function(identity) {
                                    ArcBit.getKeyRing().currentIdentityName = firstWalletName;

                                    $scope.isLoggedIn = true;
                                    $tabs.openWallet();
                                    var updated = identityLoaded(ArcBit.getIdentity());
                                    $history.initHistoryProvider();
                                    identity.appDelegate.blockExplorerAPI = new TLBlockExplorerAPI(identity.appDelegate.preferences);
                                    identity.appDelegate.bitcoinListener = new TLBitcoinListener(identity.appDelegate);
                                    identity.appDelegate.getAndSetBlockHeight();
                                    identity.appDelegate.setUpAllStealthPaymentAddresses();
                                    $history.fetchSelectedAccountBalance();
                                    identity.appDelegate.bitcoinListener.reconnect();
                                    identity.appDelegate.stealthWebSocket.reconnect();

                                    var keyRing = ArcBit.getKeyRing();
                                    keyRing.globalSettings.setCurrentIdentityName(firstWalletName);

                                    $translate.use(identity.appDelegate.preferences.getLanguage());
                                    periodicUpdateExchangeRate();
                                    var version = chrome.app.getDetails().version;
                                    identity.appDelegate.saveWalletJSONEnabled = true;
                                    identity.appDelegate.saveWalletNow();
                                    keyRing.globalSettings.setInstallDate();
                                    keyRing.globalSettings.setAppVersion(version);
                                    keyRing.globalSettings.save();

                                }, function() {
                                    notify.error(_('Error Restoring Wallet. Please Try again.'));
                                    if(!$scope.$$phase) {
                                        $scope.$apply();
                                    }
                                });

                            }
                        });

                    }

                    function periodicUpdateExchangeRate() {
                        if (updateExchangeRateInterval) {
                            $interval.cancel(updateExchangeRateInterval);
                            updateExchangeRateInterval = null;
                        }

                        updateExchangeRateInterval = $interval(function() {
                            var identity = ArcBit.getIdentity();
                            if (identity == null) {
                                return;
                            }
                            identity.appDelegate.exchangeRate.getExchangeRates(function () {
                                if(!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }, function (response) {
                            });
                        }, 21600000); // 6 hours
                    }


                    function openWalletAfterAppDelegateLoaded(identity) {
                        if (!identity.appDelegate.initializeEh) {//happens when switching a wallet after a chrome relaunch, thus appDelegate.init not called yet on switched wallet
                            var loginPassword = identity.appDelegate.getLoginPassword();
                            identity.appDelegate.initAppDelegate(loginPassword);
                            linkIdentity(identity);
                        }
                        var currentSelectedAccount = identity.appDelegate.preferences.getCurrentSelectedAccount();
                        $tabs.loadRoute(null, currentSelectedAccount.account_type, currentSelectedAccount.idx);
                        $scope.isLoggedIn = true;
                        $tabs.openWallet();
                        $history.initHistoryProvider();
                        identity.appDelegate.blockExplorerAPI = new TLBlockExplorerAPI(identity.appDelegate.preferences);
                        identity.appDelegate.bitcoinListener = new TLBitcoinListener(identity.appDelegate);
                        identity.appDelegate.getAndSetBlockHeight();
                        identity.appDelegate.setUpAllStealthPaymentAddresses();
                        $history.fetchSelectedAccountBalance();
                        identity.appDelegate.bitcoinListener.reconnect();
                        identity.appDelegate.stealthWebSocket.reconnect();
                        var keyRing = ArcBit.getKeyRing();
                        keyRing.globalSettings.setCurrentIdentityName(identity.appDelegate.walletName);
                        $translate.use(identity.appDelegate.preferences.getLanguage());
                        periodicUpdateExchangeRate();
                        if (!identity.appDelegate.preferences.viewedMnemonic()) {
                            $timeout(function(){
                                notify.note(_('You have not yet viewed and backed up your 12 word mnemonic. You can view your mnemonic in settings.'));
                                if(!$scope.$$phase) {
                                    $scope.$apply();
                                }
                            }, 3000, false);
                        }
                    }
                    var identity = ArcBit.getIdentity();


                    if (identity != null) {
                        var currentWalletName = ArcBit.getKeyRing().currentIdentityName;
                        if (currentWalletName == identity.appDelegate.walletName) {
                            if (identity.appDelegate.walletObj != null && identity.appDelegate.walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTED] == false) {
                                openWalletAfterAppDelegateLoaded(identity);
                            } else {
                                // TODO can optimize by not loading walletjson from chrome local storage when going to login from here, cuz already have it in memory
                                $location.path('/login');
                            }
                        } else {
                            loadWalletIdentity(currentWalletName);
                        }

                    } else {
                        // accounts for close browser after logout
                        var keyRing = ArcBit.getKeyRing();
                        var currentIdentityName = ArcBit.getKeyRing().currentIdentityName;
                        if (currentIdentityName) {
                        } else {
                            currentIdentityName = keyRing.globalSettings.getCurrentIdentityName();
                            ArcBit.getKeyRing().currentIdentityName = currentIdentityName;
                        }
                        // initial first app open and auto create first wallet
                        var currentWalletName = ArcBit.getKeyRing().currentIdentityName;
                        loadWalletIdentity(currentWalletName);
                    }
                }]);
    });
