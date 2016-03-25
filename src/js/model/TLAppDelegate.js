'use strict';

define(['arcbit', 'backend/port', 'model/TLPreferences', 'model/TLStealthServerConfig', 'model/TLBlockExplorerAPI', 'model/TLStealthExplorerAPI',
        'model/TLWallet', 'model/TLWalletUtils', 'model/TLHDWalletWrapper', 'model/TLAccounts', 'model/TLStealthWebSocket',
        'model/TLWalletJson', 'model/TLWalletJSONKeys', 'model/TLBlockchainStatus', 'model/TLImportedAddresses', 'model/TLCurrencyFormat',
        'model/TLSpaghettiGodSend', 'model/TLPushTxAPI', 'model/TLTxObject', 'model/TLContacts', 'angular'],
    function(ArcBit, Port, TLPreferences, TLStealthServerConfig, TLBlockExplorerAPI, TLStealthExplorerAPI, TLWallet,
             TLWalletUtils, TLHDWalletWrapper, TLAccounts, TLStealthWebSocket, TLWalletJson, TLWalletJSONKeys, TLBlockchainStatus,
             TLImportedAddresses, TLCurrencyFormat, TLSpaghettiGodSend, TLPushTxAPI, TLTxObject, TLContacts, angular) {

        var MAX_CONSECUTIVE_FAILED_STEALTH_CHALLENGE_COUNT = 8;
        var RESPOND_TO_STEALTH_PAYMENT_GET_TX_TRIES_MAX_TRIES = 3;
        var SAVE_WALLET_DELAY_TIME = 3000;
        var $timeout = angular.injector(['ng']).get('$timeout');

        //isTestnet is null if walletObj is not null
        function TLAppDelegate(exchangeRate, walletName, walletObj, isTestnet) {
            this.appWallet = null;
            this.accounts = null;
            this.importedAccounts = null;
            this.importedWatchAccounts = null;
            this.importedAddresses = null;
            this.importedWatchAddresses = null;
            this.godSend = null;
            this.saveWalletJSONEnabled = true;
            this.consecutiveFailedStealthChallengeCount = 0;
            this.respondToStealthPaymentGetTxTries = 0;
            this.pendingSelfStealthPaymentTxid = null;
            this.exchangeRate = exchangeRate;
            this.walletName = walletName;
            this.walletObj = walletObj;
            this.isTestnet = isTestnet;
            this.walletDecrypted = false;
            this.loginPassword = null;
            this.tmpWalletDict = null;
            this.sendFormsData = [{address: null, amount: null}];
            this.initializeEh = false;
            this.saveWalletTimer = null;
        }

        TLAppDelegate.prototype.getAndSetBlockHeight = function(success, error) {
            var self = this;
            this.blockExplorerAPI.getBlockHeight(function(obj) {
                self.blockchainStatus.blockHeight = obj.height;
                success ? success() : null;
            }, function() {
                error ? error() : null;
            });
        };


        TLAppDelegate.prototype.getLoginPassword = function() {
            if (this.loginPassword == null) {
                this.tmpWalletDict = TLWalletJson.getWalletJsonDict(this.walletObj, null);
                this.loginPassword = this.tmpWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WALLETS][0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LOGIN_PASSWORD];
            }
            return this.loginPassword;
        };

        TLAppDelegate.prototype.initAppDelegate = function(loginPassword) {
            this.initWithParams(this.walletName, this.walletObj, this.isTestnet, loginPassword);
            this.initializeEh = true;
        };

        TLAppDelegate.prototype.initWithParams = function(walletName, walletObj, isTestnet, loginPassword) {
            if (loginPassword == null) {
                throw new Error('loginPassword is null');
            }

            this.blockchainStatus = new TLBlockchainStatus();
            this.stealthServerConfig = new TLStealthServerConfig();

            if (walletObj != null) {
                if (this.tmpWalletDict == null) {
                    this.tmpWalletDict = TLWalletJson.getWalletJsonDict(walletObj, loginPassword);
                }
                var preferencesDict = this.tmpWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WALLETS][0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PREFERENCES];
                this.appWallet = new TLWallet(this, walletName);
                this.preferences = new TLPreferences(this, preferencesDict, this.stealthServerConfig);
                this.initializeWalletAppAndShowInitialScreen(this.tmpWalletDict, isTestnet, loginPassword);
            } else {
                this.appWallet = new TLWallet(this, walletName);
                this.preferences = new TLPreferences(this, {}, this.stealthServerConfig);
                if (!TLHDWalletWrapper.phraseIsValid(loginPassword)) { // loginPassword should be mnemonic
                    throw new Error('loginPassword should be mnemonic');
                }
                this.initializeWalletAppAndShowInitialScreen(null, isTestnet, loginPassword);
            }
        };

        TLAppDelegate.prototype.recoverHDWallet = function(mnemonic, isTestnet, successCallback, failureCallback) {
            var masterHex = TLHDWalletWrapper.getMasterHex(mnemonic);
            this.appWallet.createInitialWalletPayload(mnemonic, masterHex, isTestnet);
            this.accounts = new TLAccounts(this.appWallet, this.appWallet.getAccountObjectArray(), TLWalletUtils.TLAccountType.HD_WALLET)
            this.importedAccounts = new TLAccounts(this.appWallet, this.appWallet.getImportedAccountArray(), TLWalletUtils.TLAccountType.IMPORTED);
            this.importedWatchAccounts = new TLAccounts(this.appWallet, this.appWallet.getWatchOnlyAccountArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);
            this.importedAddresses = new TLImportedAddresses(this, this.appWallet.getImportedPrivateKeyArray(), TLWalletUtils.TLAccountType.IMPORTED);
            this.importedWatchAddresses = new TLImportedAddresses(this, this.appWallet.getWatchOnlyAddressArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);

            var MAX_CONSECUTIVE_UNUSED_ACCOUNT_LOOK_AHEAD_COUNT = 4;
            function recoverNewAccounts(appDelegate, accountIdx, consecutiveUnusedAccountCount, success, failure) {
                var accountName = "Account " + (accountIdx + 1).toString();
                var accountObject = appDelegate.accounts.createNewAccount(accountName, TLWalletJSONKeys.TLAccount.NORMAL, false);

                console.log("recoverHDWalletaccountName " + accountName);

                function doAgain() {
                    accountIdx += 1;
                    recoverNewAccounts(appDelegate, accountIdx, consecutiveUnusedAccountCount, success, failure); // REAL
                    //if (accountIdx < 2) recoverNewAccounts(appDelegate, accountIdx, consecutiveUnusedAccountCount, success, failure); //DEBUG
                    //else success(consecutiveUnusedAccountCount); //DEBUG
                    //success(consecutiveUnusedAccountCount); //DEBUG
                }
                accountObject.recoverAccount(true, function(sumMainAndChangeAddressMaxIdx) {
                    console.log("accountName " + accountName + " sumMainAndChangeAddressMaxIdx: " + sumMainAndChangeAddressMaxIdx);
                    if (sumMainAndChangeAddressMaxIdx > -2) {
                        consecutiveUnusedAccountCount = 0;
                        doAgain();
                    } else {
                        if (accountObject.stealthWallet) {
                            accountObject.stealthWallet.checkIfHaveStealthPayments(function(haveStealthPayments) {
                                if (haveStealthPayments) {
                                    consecutiveUnusedAccountCount = 0;
                                } else {
                                    consecutiveUnusedAccountCount++;
                                    if (consecutiveUnusedAccountCount == MAX_CONSECUTIVE_UNUSED_ACCOUNT_LOOK_AHEAD_COUNT) {
                                        success(consecutiveUnusedAccountCount);
                                        return;
                                    }
                                }
                                doAgain();
                            }, function() {
                                success(consecutiveUnusedAccountCount);
                            });
                        } else {
                            doAgain();
                        }
                    }
                }, function() {
                    failure();
                });
            }

            var self = this;
            recoverNewAccounts(this, 0, 0, function(consecutiveUnusedAccountCount) {
                console.log("recover HDWallet getNumberOfAccounts " + self.accounts.getNumberOfAccounts());
                if (self.accounts.getNumberOfAccounts() == 0) {
                    var accountObject = self.accounts.createNewAccount("Account 1", TLWalletJSONKeys.TLAccount.NORMAL, true);
                } else if (self.accounts.getNumberOfAccounts() > 1) {
                    while (self.accounts.getNumberOfAccounts() > 1 && consecutiveUnusedAccountCount > 0) {
                        self.accounts.popTopAccount();
                        consecutiveUnusedAccountCount--;
                    }
                }
                successCallback();
            }, function() {
                failureCallback();
            });
        };


        TLAppDelegate.prototype.refreshApp = function(passphrase, isTestnet) {
            if (isTestnet == null) {

            }

            this.preferences.setTransactionFee(TLWalletUtils.DEFAULT_FEE_AMOUNT());
            this.preferences.resetBlockExplorerAPIURL();

            var DEFAULT_BLOCKEXPLORER_API = TLBlockExplorerAPI.TLBlockExplorer.INSIGHT;
            //DEFAULT_BLOCKEXPLORER_API = TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN;
            var DEFAULT_BLOCKEXPLORER_URL_IDX = 0;
            //DEFAULT_BLOCKEXPLORER_URL_IDX = 1;
            this.preferences.setSelectedBlockExplorer(DEFAULT_BLOCKEXPLORER_API, DEFAULT_BLOCKEXPLORER_URL_IDX);
            this.preferences.resetStealthExplorerAPIURL();
            this.preferences.resetStealthServerPort();
            this.preferences.resetStealthWebSocketPort();
            this.preferences.setAnimation(true);

            var globalCurrency = ArcBit.getKeyRing().globalSettings.getCurrency();
            if (globalCurrency) {
                this.preferences.setCurrency(globalCurrency);
            } else {
                var DEFAULT_CURRENCY = "USD";
                this.preferences.setCurrency(DEFAULT_CURRENCY);
            }
            var globalLanguage = ArcBit.getKeyRing().globalSettings.getLanguage();
            if (globalLanguage) {
                this.preferences.setLanguage(globalLanguage);
            } else {
                var DEFAULT_LANGUAGE = "en_US";
                DEFAULT_LANGUAGE = "es_ES"; //DEBUG
                this.preferences.setLanguage(DEFAULT_LANGUAGE);
            }
            var globalAlwaysEncrypt = ArcBit.getKeyRing().globalSettings.getAlwaysEncrypt();
            if (globalAlwaysEncrypt != null) {
                this.preferences.setAlwaysEncrypt(globalAlwaysEncrypt);
            } else {
                this.preferences.setAlwaysEncrypt(false);
            }

            this.preferences.setCurrentSelectedAccount({
                account_type:TLWalletUtils.TLSelectedAccountType.HD_WALLET,
                idx: 0
            });

            this.preferences.setDisplayLocalCurrency(false);

            this.preferences.setViewedMnemonic(false);
            this.preferences.setShowLogoutWarning(true);
            this.preferences.setShowChangePasswordWarning(true);
            this.preferences.setEnabledShowStealthPaymentDelay(true);
            this.preferences.setEnabledShowStealthPaymentNote(true);

            //this.preferences.setAdvancedMode(true); //DEBUG

            var masterHex = TLHDWalletWrapper.getMasterHex(passphrase);
            this.appWallet.createInitialWalletPayload(passphrase, masterHex, isTestnet);
            this.accounts = new TLAccounts(this.appWallet, this.appWallet.getAccountObjectArray(), TLWalletUtils.TLAccountType.HD_WALLET);
            this.importedAccounts = new TLAccounts(this.appWallet, this.appWallet.getImportedAccountArray(), TLWalletUtils.TLAccountType.IMPORTED);
            this.importedWatchAccounts = new TLAccounts(this.appWallet, this.appWallet.getWatchOnlyAccountArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);
            this.importedAddresses = new TLImportedAddresses(this, this.appWallet.getImportedPrivateKeyArray(), TLWalletUtils.TLAccountType.IMPORTED);
            this.importedWatchAddresses = new TLImportedAddresses(this, this.appWallet.getWatchOnlyAddressArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);
        };

        TLAppDelegate.prototype.recoverHDWalletAndSave = function(mnemonic, successCallback, failureCallback) {
            this.recoverHDWallet(mnemonic, this.isTestnet, function() {
                successCallback();
            }, function() {
                failureCallback();
            });
        };

        TLAppDelegate.prototype.initializeWalletAppAndShowInitialScreen = function(walletPayload, isTestnet, loginPassword) {
            if (walletPayload == null) {
                if (!TLHDWalletWrapper.phraseIsValid(loginPassword)) {
                    throw new Error('login password is not validate mnemonic');
                }
                this.refreshApp(loginPassword, isTestnet);
                var accountObject = this.accounts.createNewAccount("Account 1", TLWalletJSONKeys.TLAccount.NORMAL, true);
                accountObject.updateAccountNeedsRecovering(false);
            } else {
                // this happens only when renaming wallet
                this.appWallet.loadWalletPayload(walletPayload);
                this.tmpWalletDict = null;
                this.accounts = new TLAccounts(this.appWallet, this.appWallet.getAccountObjectArray(), TLWalletUtils.TLAccountType.HD_WALLET);
                this.importedAccounts = new TLAccounts(this.appWallet, this.appWallet.getImportedAccountArray(), TLWalletUtils.TLAccountType.IMPORTED);
                this.importedWatchAccounts = new TLAccounts(this.appWallet, this.appWallet.getWatchOnlyAccountArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);
                this.importedAddresses = new TLImportedAddresses(this, this.appWallet.getImportedPrivateKeyArray(), TLWalletUtils.TLAccountType.IMPORTED);
                this.importedWatchAddresses = new TLImportedAddresses(this, this.appWallet.getWatchOnlyAddressArray(), TLWalletUtils.TLAccountType.IMPORTED_WATCH);
            }
            this.godSend = new TLSpaghettiGodSend(this, isTestnet);
            this.stealthExplorerAPI = new TLStealthExplorerAPI(this.preferences, this.stealthServerConfig);
            this.stealthWebSocket = new TLStealthWebSocket(this);
            this.currencyFormat = new TLCurrencyFormat(this.exchangeRate, this.preferences);
            this.pushTxAPI = new TLPushTxAPI(this, isTestnet);
            this.walletDecrypted = true;
            this.loginPassword = loginPassword;
            this.contacts = new TLContacts(this);
        };

        TLAppDelegate.prototype.setUpAllStealthPaymentAddresses = function() {
            for (var i = 0; i < this.accounts.getNumberOfAccounts();  i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet) {
                    accountObject.stealthWallet.setUpStealthPaymentAddresses(true, true, true);
                }
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet) {
                    accountObject.stealthWallet.setUpStealthPaymentAddresses(true, true, true);
                }
            }
        };

        TLAppDelegate.prototype.updateModelWithNewBlock = function(block) {
            var height = block.height;
            this.blockchainStatus.blockHeight = height;
            this.postEvent('wallet', {'type': 'EVENT_MODEL_UPDATED_NEW_BLOCK'});
        };

        TLAppDelegate.prototype.updateModelWithNewTransaction = function(tx) {
            var txObject = new TLTxObject(this, tx);
            if (this.pendingSelfStealthPaymentTxid != null) {
                // Special case where receiving stealth payment from same sending account.
                // Let stealth websocket handle it
                // Need this cause, must generate private key and add address to account so that the bitcoins can be accounted for.
                if (txObject.getHash() == this.pendingSelfStealthPaymentTxid) {
                    //this.pendingSelfStealthPaymentTxid = null;
                    return;
                }
            }
            var addressesInTx = txObject.getAddresses();
            for (var i = 0; i < this.accounts.getNumberOfAccounts();  i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                if (!accountObject.hasFetchedAccountData()) {
                    continue;
                }
                for (var j = 0; j < addressesInTx.length; j++) {
                    if (accountObject.isAddressPartOfAccount(addressesInTx[j])) {
                        this.handleNewTxForAccount(accountObject, txObject);
                    }
                }
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                if (!accountObject.hasFetchedAccountData()) {
                    continue;
                }
                for (var j = 0; j < addressesInTx.length; j++) {
                    if (accountObject.isAddressPartOfAccount(addressesInTx[j])) {
                        this.handleNewTxForAccount(accountObject, txObject);
                    }
                }
            }
            for (var i = 0; i < this.importedWatchAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedWatchAccounts.getAccountObjectForIdx(i);
                if (!accountObject.hasFetchedAccountData()) {
                    continue;
                }
                for (var j = 0; j < addressesInTx.length; j++) {
                    if (accountObject.isAddressPartOfAccount(addressesInTx[j])) {
                        this.handleNewTxForAccount(accountObject, txObject);
                    }
                }
            }
            for (var i = 0; i < this.importedAddresses.getCount();  i++) {
                var importedAddress = this.importedAddresses.getAddressObjectAtIdx(i);
                if (!importedAddress.hasFetchedAccountData()) {
                    continue;
                }
                var address = importedAddress.getAddress();
                for (var j = 0; j < addressesInTx.length; j++) {
                    if (addressesInTx[j] == address) {
                        this.handleNewTxForImportedAddress(importedAddress, txObject);
                    }
                }
            }
            for (var i = 0; i < this.importedWatchAddresses.getCount();  i++) {
                var importedAddress = this.importedWatchAddresses.getAddressObjectAtIdx(i);
                if (!importedAddress.hasFetchedAccountData()) {
                    continue;
                }
                var address = importedAddress.getAddress();
                for (var j = 0; j < addressesInTx.length; j++) {
                    if (addressesInTx[j] == address) {
                        this.handleNewTxForImportedAddress(importedAddress, txObject);
                    }
                }
            }
        };

        TLAppDelegate.prototype.handleNewTxForAccount = function(accountObject, txObject) {
            var receivedAmount = accountObject.processNewTx(txObject);
            var receivedTo = accountObject.getAccountNameOrAccountPublicKey();
            this.updateUIForNewTx(txObject.getHash(), receivedAmount, receivedTo);
        };

        TLAppDelegate.prototype.handleNewTxForImportedAddress = function(importedAddress, txObject) {
            var receivedAmount = importedAddress.processNewTx(txObject);
            var receivedTo = importedAddress.getLabel();
            this.updateUIForNewTx(txObject.getHash(), receivedAmount, receivedTo);
        };

        TLAppDelegate.prototype.updateUIForNewTx = function(txHash, receivedAmount, receivedTo) {
            this.postEvent('wallet', {'type': 'EVENT_MODEL_UPDATED_NEW_UNCONFIRMED_TRANSACTION'});
            if (receivedAmount != null) {
                var amountStr = this.currencyFormat.getProperAmount(receivedAmount);
                this.postEvent('wallet', {'type': 'EVENT_RECEIVE_PAYMENT', 'receivedAmount': amountStr, 'receivedTo': receivedTo});
            }
        };

        TLAppDelegate.prototype.setWalletTransactionListenerClosed = function() {
            for (var i = 0; i < this.accounts.getNumberOfAccounts();  i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                accountObject.listeningToIncomingTransactions = false;
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                accountObject.listeningToIncomingTransactions = false;
            }
            for (var i = 0; i < this.importedWatchAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedWatchAccounts.getAccountObjectForIdx(i);
                accountObject.listeningToIncomingTransactions = false;
            }
            for (var i = 0; i < this.importedAddresses.getCount();  i++) {
                var importedAddress = this.importedAddresses.getAddressObjectAtIdx(i);
                importedAddress.listeningToIncomingTransactions = false;
            }
            for (var i = 0; i < this.importedWatchAddresses.getCount();  i++) {
                var importedAddress = this.importedWatchAddresses.getAddressObjectAtIdx(i);
                importedAddress.listeningToIncomingTransactions = false;
            }
        };

        TLAppDelegate.prototype.listenToAccountAddresses = function(accountObject) {
            var activeMainAddresses = accountObject.getActiveMainAddresses();
            for (var j = 0; j < activeMainAddresses.length; j++) {
                this.bitcoinListener.listenForAddress(activeMainAddresses[j]);
            }
            var activeChangeAddresses = accountObject.getActiveChangeAddresses();
            for (var j = 0; j < activeChangeAddresses.length; j++) {
                this.bitcoinListener.listenForAddress(activeChangeAddresses[j]);
            }
            accountObject.listeningToIncomingTransactions = true;
        }

        TLAppDelegate.prototype.listenToIncomingTransactionForWallet = function() {
            if (this.bitcoinListener == null) {
                return;
            }
            var self = this;
            var checkAndListenToAccountAddresses = function(accountObject) {
                if (!accountObject.hasFetchedAccountData()) {
                    return;
                }
                self.listenToAccountAddresses(accountObject);
            }
            for (var i = 0; i < this.accounts.getNumberOfAccounts(); i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                checkAndListenToAccountAddresses(accountObject);
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts(); i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                checkAndListenToAccountAddresses(accountObject);
            }
            for (var i = 0; i < this.importedWatchAccounts.getNumberOfAccounts(); i++) {
                var accountObject = this.importedWatchAccounts.getAccountObjectForIdx(i);
                checkAndListenToAccountAddresses(accountObject);
            }

            var listenToImportedAddress = function(importedAddress) {
                if (!importedAddress.hasFetchedAccountData()) {
                    return;
                }
                self.bitcoinListener.listenForAddress(importedAddress.getAddress());
                importedAddress.listeningToIncomingTransactions = true;
            }
            for (var i = 0; i < this.importedAddresses.getCount(); i++) {
                var importedAddress = this.importedAddresses.getAddressObjectAtIdx(i);
                listenToImportedAddress(importedAddress);
            }
            for (var i = 0; i < this.importedWatchAddresses.getCount(); i++) {
                var importedAddress = this.importedWatchAddresses.getAddressObjectAtIdx(i);
                listenToImportedAddress(importedAddress);
            }
        };

        TLAppDelegate.prototype.setAccountsListeningToStealthPaymentsToFalse = function() {
            for (var i = 0; i < this.accounts.getNumberOfAccounts(); i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet != null) {
                    accountObject.stealthWallet.isListeningToStealthPayment = false;
                }
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts(); i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet != null) {
                    accountObject.stealthWallet.isListeningToStealthPayment = false;
                }
            }
        };

        TLAppDelegate.prototype.respondToStealthChallenge = function(responseDict) {
            this.stealthWebSocket.challenge = responseDict.challenge;
            if (!this.stealthWebSocket.isWebSocketOpen()) {
                return;
            }
            for (var i = 0; i < this.accounts.getNumberOfAccounts(); i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                if (accountObject.hasFetchedAccountData() &&
                    accountObject.stealthWallet != null && accountObject.stealthWallet.isListeningToStealthPayment == false) {
                    var addrAndSig = accountObject.stealthWallet.getStealthAddressAndSignatureFromChallenge(this.stealthWebSocket.challenge);
                    this.stealthWebSocket.sendMessageSubscribeToStealthAddress(addrAndSig.addr, addrAndSig.sig);
                }
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts(); i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                if (accountObject.hasFetchedAccountData() &&
                    accountObject.stealthWallet != null && accountObject.stealthWallet.isListeningToStealthPayment == false) {
                    var addrAndSig = accountObject.stealthWallet.getStealthAddressAndSignatureFromChallenge(this.stealthWebSocket.challenge);
                    this.stealthWebSocket.sendMessageSubscribeToStealthAddress(addrAndSig.addr, addrAndSig.sig);
                }
            }
        }

        TLAppDelegate.prototype.respondToStealthAddressSubscription = function(responseDict) {
            var stealthAddress = responseDict.addr;
            var subscriptionSuccess = responseDict.success;
            if (subscriptionSuccess == "False" && this.consecutiveFailedStealthChallengeCount < MAX_CONSECUTIVE_FAILED_STEALTH_CHALLENGE_COUNT) {
                this.consecutiveFailedStealthChallengeCount++;
                this.stealthWebSocket.sendMessageGetChallenge();
                return;
            }
            this.consecutiveFailedStealthChallengeCount = 0;
            for (var i = 0; i < this.accounts.getNumberOfAccounts();  i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet.getStealthAddress() == stealthAddress) {
                    accountObject.stealthWallet.isListeningToStealthPayment = true;
                }
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                if (accountObject.stealthWallet.getStealthAddress() == stealthAddress) {
                    accountObject.stealthWallet.isListeningToStealthPayment = true;
                }
            }
        }

        TLAppDelegate.prototype.handleGetTxSuccessForRespondToStealthPayment = function(stealthAddress, paymentAddress, txid, txTime, txObject) {
            var inputAddresses = txObject.getInputAddressArray();
            var outputAddresses = txObject.getOutputAddressArray();
            if (outputAddresses.indexOf(paymentAddress) == -1) {
                return;
            }
            var possibleStealthDataScripts = txObject.getPossibleStealthDataScripts();
            var self = this;
            function processStealthPayment(accountObject) {
                if (accountObject.stealthWallet.getStealthAddress() == stealthAddress) {
                    if (accountObject.hasFetchedAccountData()) {
                        for (var i = 0; i < possibleStealthDataScripts.length; i++) {
                            var stealthDataScript = possibleStealthDataScripts[i];
                            var privateKey = accountObject.stealthWallet.generateAndAddStealthAddressPaymentKey(stealthDataScript, paymentAddress,
                                txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT);
                            if (privateKey != null) {
                                self.handleNewTxForAccount(accountObject, txObject);
                                break;
                            }
                        }
                    }
                } else {
                    // must refresh account balance if a input address belongs to account
                    // this is needed because websocket api does not notify of addresses being used as inputs
                    for (var i = 0; i < inputAddresses.length; i++) {
                        if (accountObject.hasFetchedAccountData() && accountObject.isAddressPartOfAccount(inputAddresses[i])) {
                            self.handleNewTxForAccount(accountObject, txObject);
                        }
                    }
                }
            }

            for (var i = 0; i < this.accounts.getNumberOfAccounts();  i++) {
                var accountObject = this.accounts.getAccountObjectForIdx(i);
                processStealthPayment(accountObject);
            }
            for (var i = 0; i < this.importedAccounts.getNumberOfAccounts();  i++) {
                var accountObject = this.importedAccounts.getAccountObjectForIdx(i);
                processStealthPayment(accountObject);
            }
            for (var i = 0; i < this.importedAddresses.getCount();  i++) {
                var importedAddress = this.importedAddresses.getAddressObjectAtIdx(i);
                for (var j = 0; i < inputAddresses.length;  j++) {
                    if (inputAddresses[j] == importedAddress.getAddress()) {
                        this.handleNewTxForImportedAddress(importedAddress, txObject);
                    }
                }
            }
            for (var i = 0; i < this.importedWatchAddresses.getCount();  i++) {
                var importedAddress = this.importedWatchAddresses.getAddressObjectAtIdx(i);
                for (var j = 0; i < inputAddresses.length;  j++) {
                    if (inputAddresses[j] == importedAddress.getAddress()) {
                        this.handleNewTxForImportedAddress(importedAddress, txObject);
                    }
                }
            }
        }

        TLAppDelegate.prototype.respondToStealthPayment = function(responseDict) {
            var stealthAddress = responseDict.stealth_addr;
            var txid = responseDict.txid;
            var paymentAddress = responseDict.addr;
            var txTime = responseDict.time;
            if (this.respondToStealthPaymentGetTxTries < RESPOND_TO_STEALTH_PAYMENT_GET_TX_TRIES_MAX_TRIES) {
                var self = this;
                this.blockExplorerAPI.getTx(txid, function(jsonData) {
                    if (jsonData == null) {
                        return;
                    }
                    var txObject = new TLTxObject(self, jsonData);
                    self.handleGetTxSuccessForRespondToStealthPayment(stealthAddress, paymentAddress, txid, txTime, txObject);
                    self.respondToStealthPaymentGetTxTries = 0;
                }, function() {
                    self.respondToStealthPayment(note);
                    self.respondToStealthPaymentGetTxTries++;
                });
            }
        };

        TLAppDelegate.prototype.saveWalletPayloadDelay = function(saveEncrypted) {
            if (this.saveWalletJSONEnabled == false) {
                return false;
            }
            var self = this;
            if (this.saveWalletTimer != null) {
                $timeout.cancel(this.saveWalletTimer);
                this.saveWalletTimer = null;
            }

            this.saveWalletTimer = $timeout(function() {
                self.saveWalletNow(saveEncrypted);
            }, SAVE_WALLET_DELAY_TIME, false);
        };

        TLAppDelegate.prototype.saveWalletNow = function(saveEncrypted, callback) {
            console.log("saveWalletNow starting...");
            var self = this;
            this.saveWalletJson(this.loginPassword, saveEncrypted, function () {
                //IMPORTANT, need this here because there can be a delay to save after a logout save, which negates the encrypted logout save
                $timeout.cancel(self.saveWalletTimer);
                self.saveWalletTimer = null;
                callback ? callback() : null;
            });
        };

        TLAppDelegate.prototype.saveWalletJson = function(password, saveEncrypted, successCallback) {
            if (this.saveWalletJSONEnabled == false) {
                return false;
            }
            if (this.preferences.getAlwaysEncrypt() && !saveEncrypted) {
                saveEncrypted = true;
            }
            //console.log("TLAppDelegate saveWalletJson saveEncrypted: " + saveEncrypted);
            this.appWallet.setPreferencesDict(this.preferences.preferencesDict); //TODO: refactor, so don't have to do this before saving wallet
            //console.log("saveWalletJson: " + JSON.stringify(this.appWallet.getWalletsJson()), null, 2);
            var encryptedWalletJson = TLWalletJson.getEncryptedWalletJsonContainer(this.appWallet.getWalletsJson(),
                password, saveEncrypted == true ? saveEncrypted : false);

            this.walletObj = encryptedWalletJson;

            TLWalletJson.saveWalletJson(this.walletName, encryptedWalletJson, function () {
                console.log("TLAppDelegate saveWalletJson success");
                successCallback(true);
            });
        };

        TLAppDelegate.prototype.postEvent = function(port, params) {
            Port.post(port, params);
        };

        return TLAppDelegate;
    });
