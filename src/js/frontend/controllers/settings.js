'use strict';

define(['./module', 'arcbit', 'available_languages',
        'model/TLCoin', 'model/TLWalletUtils', 'model/TLBlockExplorerAPI', 'model/TLCurrencyFormat'],
    function (controllers, ArcBit, AvailableLanguages, TLCoin,
              TLWalletUtils, TLBlockExplorerAPI, TLCurrencyFormat) {

        // Controller
        controllers.controller('WalletSettingsCtrl', ['$scope', 'modals', '$tabs', 'notify', '$animate', '$translate', '_Filter', function($scope, modals, $tabs, notify, $animate, $translate, _) {
            var identity = ArcBit.getIdentity();

            // Available fiat currencies
            $scope.fiatCurrencies = TLCurrencyFormat.fiatCurrenciesList;

            var preferences = identity.appDelegate.preferences;
            $scope.selectedCurrency = preferences.getBitcoinDenomination();
            $scope.selectedLanguage = preferences.getLanguage();
            $scope.enableAnimations = preferences.getAnimation();
            $scope.alwaysEncrypt = preferences.getAlwaysEncrypt();

            $scope.selectedFiat = preferences.getCurrency();

            var currencyFormat = identity.appDelegate.currencyFormat;
            var txFee = preferences.getTransactionFee();
            $scope.defaultFee = currencyFormat.coinToProperBitcoinAmountString(new TLCoin(txFee));
            var showNonRecommendedFeeWarning = true;

            $scope.languages = AvailableLanguages;
            $scope.advancedModeEnabled = preferences.enabledAdvancedMode();


            $scope.selectedBlockExplorerAPI = preferences.getSelectedBlockExplorerAPI();
            $scope.blockExplorerURLs = preferences.getBlockExplorerURLs($scope.selectedBlockExplorerAPI);
            $scope.selectedBlockExplorerURLIdx = preferences.getSelectedBlockExplorerURLIdx();
            $scope.selectedBlockExplorerURL = $scope.blockExplorerURLs[$scope.selectedBlockExplorerURLIdx];

            $scope.blockExplorerAPIChanged = function() {
                notify.note(_('Close and reopen tab for block explorer service change to take affect'));
                $scope.blockExplorerURLs = preferences.getBlockExplorerURLs($scope.selectedBlockExplorerAPI);
                $scope.selectedBlockExplorerURLIdx = 0;
                preferences.setSelectedBlockExplorer($scope.selectedBlockExplorerAPI, $scope.selectedBlockExplorerURLIdx);
            };
            $scope.blockExplorerURLChanged = function() {
                notify.note(_('Close and reopen tab for block explorer service change to take affect'));
                preferences.setSelectedBlockExplorer($scope.selectedBlockExplorerAPI, $scope.selectedBlockExplorerURLIdx);
            };
            $scope.removeBlockExplorerAPI = function() {
                if ($scope.selectedBlockExplorerAPI != TLBlockExplorerAPI.TLBlockExplorer.INSIGHT) {
                    throw new Error(_("Can only add custom Insight URL only"));
                }
                if ($scope.selectedBlockExplorerURLIdx == 0) {
                    notify.error(_("Cannot delete default API URL"));
                    return;
                }
                if ($scope.selectedBlockExplorerURLIdx == preferences.getSelectedBlockExplorerURLIdx()) {
                    notify.error(_("Cannot delete current API URL"));
                    return;
                }

                preferences.deleteBlockExplorerURL($scope.selectedBlockExplorerAPI, $scope.selectedBlockExplorerURLIdx);
                $scope.blockExplorerURLs = preferences.getBlockExplorerURLs($scope.selectedBlockExplorerAPI);
            };
            $scope.addBlockExplorerURL = function() {
                if ($scope.newAPIURL.indexOf("https://") != 0) {
                    notify.error(_('URL needs to start with https://'));
                    return;
                }
                if ($scope.selectedBlockExplorerAPI != TLBlockExplorerAPI.TLBlockExplorer.INSIGHT) {
                    throw new Error(_("Can only add custom Insight URL"));
                }
                preferences.addBlockExplorerURL($scope.selectedBlockExplorerAPI, $scope.newAPIURL);
                $scope.newAPIURL = null;
            };

            $scope.showPasswordChanged = function() {
                $scope.passTool = true;
                if (preferences.showChangePasswordWarning()) {
                    modals.promptForOKCancel(_('Warning'), _('People generally don’t know how to create secure passwords. If you want to continue, make sure you learn how to create a secure password. Arcbit won’t have any restrictions on your password. By default your password is your 12 word mnemonic/seed.'),
                        _('Continue'), null, function() {
                            preferences.setShowChangePasswordWarning(false);
                        }, function(){
                            $scope.passTool = false;
                        });
                }
            };

            $scope.passwordChanged = function() {
                var identity = ArcBit.getIdentity();
                if (identity.appDelegate.loginPassword != null && $scope.oldPassword === identity.appDelegate.loginPassword) {
                    if ($scope.newPassword == null || $scope.newPassword.length == 0) {
                        notify.error(_('New password needed'));
                    } else if ($scope.newPassword === $scope.newPasswordRepeat) {
                        identity.appDelegate.loginPassword = $scope.newPassword;
                        identity.appDelegate.appWallet.setLoginPassword($scope.newPassword);

                        notify.note(_('Password changed'));
                        $scope.oldPassword = $scope.newPassword = $scope.newPasswordRepeat = '';
                        identity.appDelegate.saveWalletNow();
                    } else {
                        notify.error(_('Password doesn\'t match'));
                    }
                } else {
                    notify.error(_('Incorrect current password'));
                }
            };

            // Callback for saving the selected currency
            $scope.currencyChanged = function() {
                var identity = ArcBit.getIdentity();

                preferences.setBitcoinDenomination($scope.selectedCurrency);
                $scope.defaultFee = currencyFormat.coinToProperBitcoinAmountString(new TLCoin(preferences.getTransactionFee()));
            };

            $scope.fiatCurrencyChanged = function() {
                var identity = ArcBit.getIdentity();

                preferences.setCurrency($scope.selectedFiat);
                ArcBit.getKeyRing().globalSettings.setCurrency($scope.selectedFiat);
            };
            $scope.defaultFeeChanged = function() {
                var input = $scope.defaultFee;
                if (input.length != undefined && input.length == 0) {
                    input = '0';
                }
                if (!isNaN(input)) {

                    var feeAmount = TLCoin.fromString(input, preferences.getBitcoinDenomination());
                    var isRecommendedFee = TLWalletUtils.isValidInputTransactionFee(feeAmount);
                    if (isRecommendedFee) {
                        showNonRecommendedFeeWarning = true;
                    }
                    if (showNonRecommendedFeeWarning && !isRecommendedFee) {
                        showNonRecommendedFeeWarning = false;
                        var minFee = currencyFormat.coinToProperBitcoinAmountStringWithSymbol(new TLCoin(TLWalletUtils.MIN_FEE_AMOUNT));
                        var maxFee = currencyFormat.coinToProperBitcoinAmountStringWithSymbol(new TLCoin(TLWalletUtils.MAX_FEE_AMOUNT));
                        notify.warning(_('Non-recommended Transaction Fee Inputted. Recommended fee is between') + ' ' + minFee +  ' & ' + maxFee);
                    }
                    preferences.setTransactionFee(feeAmount.toNumber());

                    if ($scope.forms.send) {
                        $scope.forms.send.fee = input;
                    }
                }
            };
            $scope.alwaysEncryptChanged = function() {
                if (!preferences.viewedMnemonic() && $scope.alwaysEncrypt) {
                    $scope.alwaysEncrypt = false;
                    notify.warning(_('Before enabling this feature, first view and backup your seed'));
                    return;
                }
                preferences.setAlwaysEncrypt($scope.alwaysEncrypt);
                ArcBit.getKeyRing().globalSettings.setAlwaysEncrypt($scope.alwaysEncrypt);
            };
            $scope.advancedModeChanged = function() {
                $tabs.updateTabs();
                preferences.setAdvancedMode($scope.advancedModeEnabled);
                identity.appDelegate.postEvent('wallet', {type:'EVENT_TOGGLED_ADVANCE_MODED', enabled:$scope.advancedModeEnabled});
            };
            $scope.animationsChanged = function() {
                $animate.enabled($scope.enableAnimations);
                preferences.setAnimation($scope.enableAnimations);
            };
            $scope.languageChanged = function() {
                $translate.use($scope.selectedLanguage);
                preferences.setLanguage($scope.selectedLanguage);
                ArcBit.getKeyRing().globalSettings.setLanguage($scope.selectedLanguage);
            };

            // Identity settings
            $scope.setIdentityName = function(newName) {
                var keyRing = ArcBit.getKeyRing();
                if (keyRing.availableIdentities.indexOf(newName) > -1) {
                    notify.warning(_('You have another identity with that name!'));
                    return;
                }
                ArcBit.service.wallet.renameIdentity(newName, function() {
                    notify.success(_('Identity renamed to {0}', newName));
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            };

            $scope.showSeed = function(){

                if (!preferences.viewedMnemonic()) {
                    preferences.setViewedMnemonic(true);
                }

                $scope.seedTool = true;
                $scope.seedError = false;
                $scope.yourSeed = true;
                $scope.yourSeedWords = identity.appDelegate.appWallet.getPassPhrase();
                $scope.yourSeedHex = identity.appDelegate.appWallet.getMasterHex();

            };
        }]);
    });
