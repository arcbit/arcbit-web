/**
 * @file New Wallet Angular Tricks
 */
'use strict';


/**
 * Password class constructor.
 * @param {Object} $scope Angular scope.
 * @constructor
 */
define(['./module', 'arcbit', 'available_languages', 'model/TLHDWalletWrapper', 'model/TLWalletJson',
    'model/TLWalletJSONKeys', 'model/TLBlockExplorerAPI', 'model/TLBitcoinListener'], function (controllers, ArcBit,
                                                                                                AvailableLanguages, TLHDWalletWrapper, TLWalletJson,
                                                                                                TLWalletJSONKeys, TLBlockExplorerAPI, TLBitcoinListener) {
    controllers.controller('NewWalletCtrl', ['$scope', '$history', '$animate', '$timeout', 'modals', '$location', 'notify', '$translate', '_Filter', '$tabs',
        function($scope, $history, $animate, $timeout, modals, $location, notify, $translate, _, $tabs) {

//  $scope.step = 1;
            $scope.step = 2;
            $scope.languages = AvailableLanguages;
            $scope.form = {
                create_or_restore: 'create',
                network: 'bitcoin',
                language: AvailableLanguages.preferedLanguage()
            };
            var recoverFromMnemonic = true;
            var checkUserInputtedMnemonic = false;
            $scope.nextStep = function() {
                $scope.step++;
            };

            $scope.nextStepCreateOrRestore = function(walletCount) {
                $scope.form.name = _('Wallet') + ' ' + walletCount;
                var self = this;
                TLWalletJson.getLocalWalletJSONFile($scope.form.name, function(walletObj) {

                    if (walletObj != null && walletObj[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ENCRYPTION_VERSION] != null) {
                        self.nextStepCreateOrRestore(++walletCount);
                    } else {
                        if ($scope.form.create_or_restore == 'create') {
                            var mnemonic = TLHDWalletWrapper.generateMnemonicPassphrase();
                            $scope.form.mnemonic = mnemonic;
                            recoverFromMnemonic = false;
                            var globalAlwaysEncrypt = ArcBit.getKeyRing().globalSettings.getAlwaysEncrypt();
                            if (globalAlwaysEncrypt) {
                                $scope.step+=2;
                                checkUserInputtedMnemonic = true;
                            } else {

                                $scope.form.mnemonic2 = mnemonic;
                                $scope.mnemonicSubmit();
                            }
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        } else {
                            $scope.step+=3;
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    }

                });
            };

            $scope.previousStep = function() {
                $scope.step--;
            };

            $scope.changeLanguage = function() {
                $translate.use($scope.form.language);
            };

            $scope.passwordSubmit = function() {
                // Check that passwords match.
                if ($scope.form.passwd != $scope.form.passwd2) {
                    $scope.message = _('Passwords are not the same');
                    return;
                }

                if ($scope.form.create_or_restore == 'create') {
                    var mnemonic = TLHDWalletWrapper.generateMnemonicPassphrase();
                    $scope.form.mnemonic = mnemonic;
                    $scope.step++;
                } else {
                    $scope.step += 2;
                }
            };

            $scope.mnemonicSubmit = function() {
                var walletService = ArcBit.service.wallet;
                if (!TLHDWalletWrapper.phraseIsValid($scope.form.mnemonic2)) {
                    notify.error(_('Invalid mnemonic'));
                    return;
                }
                var userViewedMnemonic = false;
                if (checkUserInputtedMnemonic) {
                    if ($scope.form.mnemonic != $scope.form.mnemonic2) {
                        notify.error(_('Mnemonics are not the same'));
                        return;
                    }
                    userViewedMnemonic = true;
                }

                $animate.enabled(false);
                modals.showSpinner(_('Creating wallet'));
                if(!$scope.$$phase) {
                    $scope.$apply();
                }
                $timeout(function() {
                    // close sockets for current wallet
                    var identity = ArcBit.getIdentity();
                    identity.appDelegate.bitcoinListener.closePermanently();
                    identity.appDelegate.stealthWebSocket.closePermanently();

                    walletService.createIdentity($scope.form.name, $scope.form.network, $scope.form.mnemonic2, recoverFromMnemonic,
                        function(identity) {
                            $animate.enabled(true);
                            modals.cancel();

                            ArcBit.getKeyRing().currentIdentityName = $scope.form.name;
                            $history.initHistoryProvider();
                            var currentSelectedAccount = identity.appDelegate.preferences.getCurrentSelectedAccount();
                            $tabs.loadRoute(null, currentSelectedAccount.account_type, currentSelectedAccount.idx);
                            $tabs.openWallet();
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }

                            var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(0);
                            // consider new wallet account fetchedAccountData to be true even though haven't fetched data.
                            // Can do this cuz new wallet should not have any txs
                            accountObject.fetchedAccountData = true;
                            identity.appDelegate.blockExplorerAPI = new TLBlockExplorerAPI(identity.appDelegate.preferences);
                            identity.appDelegate.bitcoinListener = new TLBitcoinListener(identity.appDelegate);
                            identity.appDelegate.getAndSetBlockHeight();
                            identity.appDelegate.bitcoinListener.reconnect();
                            identity.appDelegate.stealthWebSocket.reconnect();
                            var keyRing = ArcBit.getKeyRing();
                            keyRing.globalSettings.setCurrentIdentityName($scope.form.name);


                            $translate.use(identity.appDelegate.preferences.getLanguage());
                            if (recoverFromMnemonic || userViewedMnemonic) {
                                identity.appDelegate.preferences.setViewedMnemonic(true);
                            }
                            identity.appDelegate.saveWalletJSONEnabled = true;
                            identity.appDelegate.saveWalletNow();


                        }, function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            notify.error(_('Error Restoring Wallet. Please Try again.'));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                }, 30, false);
            }
        }]);
});
