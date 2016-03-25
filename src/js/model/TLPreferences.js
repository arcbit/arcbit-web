'use strict';

define(['model/TLBlockExplorerAPI', 'model/TLCoin'],
    function(TLBlockExplorerAPI, TLCoin) {
        var PREFERENCE_TRANSACTION_FEE = "tx_fee";
        var PREFERENCE_STEALTH_EXPLORER_URL = "stealth_explorer_url";
        var PREFERENCE_STEALTH_SERVER_PORT = "stealth_web_server_port";
        var PREFERENCE_STEALTH_WEB_SOCKET_PORT = "stealth_web_socket_port";
        var PREFERENCE_FIAT_DISPLAY = "fiat_display";
        var PREFERENCE_BITCOIN_DISPLAY = "btc_display";
        var PREFERENCE_SELECTED_BLOCK_EXPLORER = "selected_block_explorer";
        var PREFERENCE_BLOCKEXPLORER_API_URLS_DICT = "block_explorer_urls";
        var PREFERENCE_WALLET_ADVANCE_MODE = "advance_mode";
        var PREFERENCE_DISPLAY_LOCAL_CURRENCY = "display_local_currency";
        var PREFERENCE_CURRENT_ACCOUNT = "current_account";
        var PREFERENCE_VIEW_MNEMONIC = "viewed_mnemonic";
        var PREFERENCE_SHOW_LOGOUT_WARNING = "show_logout_warning";
        var PREFERENCE_SHOW_CHANGE_PASSWORD_WARNING = "show_change_pw_warning";
        var PREFERENCE_SHOW_STEALTH_PAYMENT_DELAY = "show_stealth_payment_delay";
        var PREFERENCE_SHOW_STEALTH_PAYMENT_NOTE = "show_stealth_payment_note";
        var PREFERENCE_LANGUAGE = "language";
        var PREFERENCE_ANIMATION = "animation";
        var PREFERENCE_ALWAYS_ENCRYPT = "always_encrypt";


        function TLPreferences(appDelegate, preferencesDict, stealthServerConfig) {
            this.appDelegate = appDelegate;
            this.preferencesDict = preferencesDict;
            this.stealthServerConfig = stealthServerConfig;
        }


        TLPreferences.prototype.getCurrency= function() {
            return this.preferencesDict[PREFERENCE_FIAT_DISPLAY];
        };

        TLPreferences.prototype.setCurrency = function(currency) {
            this.preferencesDict[PREFERENCE_FIAT_DISPLAY] = currency;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getBitcoinDenomination = function() {
            if (this.preferencesDict[PREFERENCE_BITCOIN_DISPLAY] != null) {
                return this.preferencesDict[PREFERENCE_BITCOIN_DISPLAY];
            }
            return TLCoin.TLBitcoinDenomination.BTC;
        };

        TLPreferences.prototype.setBitcoinDenomination = function(bitcoinDisplayUnit) {
            if (TLCoin.TLBitcoinDenomination[bitcoinDisplayUnit] == null) {
                throw new Error("Invalid bitcoin denomination")
            }
            this.preferencesDict[PREFERENCE_BITCOIN_DISPLAY] = bitcoinDisplayUnit;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getCurrentSelectedAccount = function() {
            return this.preferencesDict[PREFERENCE_CURRENT_ACCOUNT];
        };

        TLPreferences.prototype.setCurrentSelectedAccount = function(selectedAccount) {
            this.preferencesDict[PREFERENCE_CURRENT_ACCOUNT] = selectedAccount;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getSelectedBlockExplorerURL = function(blockExplorer, idx) {
            return this.preferencesDict[PREFERENCE_BLOCKEXPLORER_API_URLS_DICT][blockExplorer][idx];
        };

        TLPreferences.prototype.getSelectedBlockExplorerURLIdx = function() {
            if (this.preferencesDict[PREFERENCE_SELECTED_BLOCK_EXPLORER] != null) {
                return this.preferencesDict[PREFERENCE_SELECTED_BLOCK_EXPLORER].idx;
            } else {
                return 0;
            }
        };

        TLPreferences.prototype.getSelectedBlockExplorerAPI = function() {
            if (this.preferencesDict[PREFERENCE_SELECTED_BLOCK_EXPLORER] != null) {
                return this.preferencesDict[PREFERENCE_SELECTED_BLOCK_EXPLORER].api;
            } else {
                return TLBlockExplorerAPI.TLBlockExplorer.INSIGHT;
            }
        };

        TLPreferences.prototype.setSelectedBlockExplorer = function(blockExplorerType, idx) {
            if (blockExplorerType != TLBlockExplorerAPI.TLBlockExplorer.INSIGHT &&
                blockExplorerType != TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                throw new Error("Invalid block explorer type");
            }
            this.preferencesDict[PREFERENCE_SELECTED_BLOCK_EXPLORER] = {
                api: blockExplorerType,
                idx: idx
            };
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getBlockExplorerURLs = function(blockExplorerType) {
            return this.preferencesDict[PREFERENCE_BLOCKEXPLORER_API_URLS_DICT][blockExplorerType];
        };

        TLPreferences.prototype.addBlockExplorerURL = function(blockExplorerType, urlString) {
            if (blockExplorerType != TLBlockExplorerAPI.TLBlockExplorer.INSIGHT) {
                throw new Error("Can only add custom Insight URL");
            }
            var blockExplorer2blockExplorerURLDict = this.preferencesDict[PREFERENCE_BLOCKEXPLORER_API_URLS_DICT];
            blockExplorer2blockExplorerURLDict[blockExplorerType].push(urlString);
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.deleteBlockExplorerURL = function(blockExplorerType, idx) {
            if (idx == 0) {
                throw new Error("Cannot delete default API URL")
            }
            if (idx == this.getSelectedBlockExplorerURLIdx()) {
                throw new Error("Cannot delete current API URL")
            }
            if (blockExplorerType != TLBlockExplorerAPI.TLBlockExplorer.INSIGHT) {
                throw new Error("Can only delete custom Insight URL");
            }

            // if deleted a url that has an index lower then the selected url idx, then i need to decrement the selected
            // idx by one to compensate
            if (idx < this.getSelectedBlockExplorerURLIdx()) {
                this.setSelectedBlockExplorer(blockExplorerType, this.getSelectedBlockExplorerURLIdx()-1);
            }

            var blockExplorer2blockExplorerURLDict = this.preferencesDict[PREFERENCE_BLOCKEXPLORER_API_URLS_DICT];
            blockExplorer2blockExplorerURLDict[blockExplorerType].splice(idx, 1);
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.resetBlockExplorerAPIURL = function() {
            var blockExplorer2blockExplorerURLDict = {};
            blockExplorer2blockExplorerURLDict[TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN] = ['https://blockchain.info/'];
            blockExplorer2blockExplorerURLDict[TLBlockExplorerAPI.TLBlockExplorer.INSIGHT] = ['https://insight.bitpay.com/', 'https://blockexplorer.com/'];
            this.preferencesDict[PREFERENCE_BLOCKEXPLORER_API_URLS_DICT] = blockExplorer2blockExplorerURLDict;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getStealthExplorerURL = function() {
            return this.preferencesDict[PREFERENCE_STEALTH_EXPLORER_URL];
        };

        TLPreferences.prototype.setStealthExplorerURL = function(value) {
            this.preferencesDict[PREFERENCE_STEALTH_EXPLORER_URL] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getStealthServerPort = function() {
            return this.preferencesDict[PREFERENCE_STEALTH_SERVER_PORT];
        };

        TLPreferences.prototype.setStealthServerPort = function(value) {
            this.preferencesDict[PREFERENCE_STEALTH_SERVER_PORT] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getStealthWebSocketPort = function() {
            return this.preferencesDict[PREFERENCE_STEALTH_WEB_SOCKET_PORT];
        };

        TLPreferences.prototype.setStealthWebSocketPort = function(value) {
            this.preferencesDict[PREFERENCE_STEALTH_WEB_SOCKET_PORT] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.resetStealthExplorerAPIURL = function() {
            this.setStealthExplorerURL(this.stealthServerConfig.getStealthServerUrl());
        };

        TLPreferences.prototype.resetStealthServerPort = function() {
            this.setStealthServerPort(this.stealthServerConfig.getStealthServerPort());
        };

        TLPreferences.prototype.resetStealthWebSocketPort = function() {
            this.setStealthWebSocketPort(this.stealthServerConfig.getWebSocketServerPort());
        };

        TLPreferences.prototype.getTransactionFee = function() {
            return this.preferencesDict[PREFERENCE_TRANSACTION_FEE];
        };

        TLPreferences.prototype.setTransactionFee = function(value) {
            this.preferencesDict[PREFERENCE_TRANSACTION_FEE] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.isDisplayLocalCurrency = function() {
            return this.preferencesDict[PREFERENCE_DISPLAY_LOCAL_CURRENCY];
        };

        TLPreferences.prototype.setDisplayLocalCurrency = function(enabled) {
            this.preferencesDict[PREFERENCE_DISPLAY_LOCAL_CURRENCY] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.enabledAdvancedMode = function() {
            return this.preferencesDict[PREFERENCE_WALLET_ADVANCE_MODE];
        };

        TLPreferences.prototype.setAdvancedMode = function(enabled) {
            this.preferencesDict[PREFERENCE_WALLET_ADVANCE_MODE] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.viewedMnemonic = function() {
            return this.preferencesDict[PREFERENCE_VIEW_MNEMONIC];
        };

        TLPreferences.prototype.setViewedMnemonic = function(enabled) {
            this.preferencesDict[PREFERENCE_VIEW_MNEMONIC] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.showLogoutWarning = function() {
            return this.preferencesDict[PREFERENCE_SHOW_LOGOUT_WARNING];
        };

        TLPreferences.prototype.setShowLogoutWarning = function(enabled) {
            this.preferencesDict[PREFERENCE_SHOW_LOGOUT_WARNING] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.showChangePasswordWarning = function() {
            return this.preferencesDict[PREFERENCE_SHOW_CHANGE_PASSWORD_WARNING];
        };

        TLPreferences.prototype.setShowChangePasswordWarning = function(enabled) {
            this.preferencesDict[PREFERENCE_SHOW_CHANGE_PASSWORD_WARNING] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.enabledShowStealthPaymentDelay = function() {
            return this.preferencesDict[PREFERENCE_SHOW_STEALTH_PAYMENT_DELAY];
        };

        TLPreferences.prototype.setEnabledShowStealthPaymentDelay = function(enabled) {
            this.preferencesDict[PREFERENCE_SHOW_STEALTH_PAYMENT_DELAY] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.enabledShowStealthPaymentNote = function() {
            return this.preferencesDict[PREFERENCE_SHOW_STEALTH_PAYMENT_NOTE];
        };

        TLPreferences.prototype.setEnabledShowStealthPaymentNote = function(enabled) {
            this.preferencesDict[PREFERENCE_SHOW_STEALTH_PAYMENT_NOTE] = enabled;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getLanguage = function() {
            return this.preferencesDict[PREFERENCE_LANGUAGE];
        };

        TLPreferences.prototype.setLanguage = function(value) {
            this.preferencesDict[PREFERENCE_LANGUAGE] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getAnimation = function() {
            return this.preferencesDict[PREFERENCE_ANIMATION];
        };

        TLPreferences.prototype.setAnimation = function(value) {
            this.preferencesDict[PREFERENCE_ANIMATION] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        TLPreferences.prototype.getAlwaysEncrypt = function() {
            return this.preferencesDict[PREFERENCE_ALWAYS_ENCRYPT];
        };

        TLPreferences.prototype.setAlwaysEncrypt = function(value) {
            this.preferencesDict[PREFERENCE_ALWAYS_ENCRYPT] = value;
            if (this.appDelegate) this.appDelegate.saveWalletPayloadDelay();
        };

        return TLPreferences;
    });
