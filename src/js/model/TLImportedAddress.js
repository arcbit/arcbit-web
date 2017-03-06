'use strict';

define(['model/TLCoin', 'model/TLWalletJSONKeys', 'model/TLBitcoinJSWrapper', 'model/TLTxObject', 'model/TLWalletUtils'],
    function(TLCoin, TLWalletJSONKeys, TLBitcoinJSWrapper, TLTxObject, TLWalletUtils) {

        function TLImportedAddress(appDelegate, dict) {
            this.haveUpDatedUTXOs = false;
            this.unspentOutputsCount = 0;
            this.unspentOutputsSum = null;
            this.positionInWalletArray = 0;
            this.txObjectArray = [];
            this.txidToAccountAmountDict = null;
            this.txidToAccountAmountTypeDict = {};
            this.txidToBalanceAsOfTxidDict = {};
            this.privateKey = null;

            this.appDelegate = appDelegate;
            this.appWallet = appDelegate.appWallet;
            this.lastFetchTime = 0;
            this.addressDict = dict;
            this.unspentOutputs = [];
            this.balance = TLCoin.zero();
            this.fetchedAccountData = false;
            this.listeningToIncomingTransactions = false;
            this.watchOnly = this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY] == null ? true : false;
            this.archived = this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] == TLWalletJSONKeys.TLAddressStatus.ARCHIVED;
            this.processedTxDict = {};
            this.importedAddress = this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];

            this.resetAccountBalances();
        }

        TLImportedAddress.prototype.hasSetPrivateKeyInMemory = function() {
            return this.privateKey != null;
        };

        TLImportedAddress.prototype.setPrivateKeyInMemory = function(privKey) {
            if (TLBitcoinJSWrapper.isBIP38EncryptedKey(privKey)) {
                this.privateKey = privKey;
                return true;
            }
            if (TLBitcoinJSWrapper.getAddress(privKey, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet())) == this.getAddress()) {
                this.privateKey = privKey;
                return true;
            }
            return false;
        };

        TLImportedAddress.prototype.clearPrivateKeyFromMemory = function() {
            this.privateKey = null;
        };

        TLImportedAddress.prototype.getDefaultAddressLabel = function() {
            return this.importedAddress;
        };

        TLImportedAddress.prototype.setHasFetchedAccountData = function(fetched, unixTime) {
            this.fetchedAccountData = fetched;
            this.lastFetchTime = unixTime;
            if (this.fetchedAccountData == true && this.listeningToIncomingTransactions == false) {
                this.listeningToIncomingTransactions == true;
                this.appDelegate.bitcoinListener.listenForAddress(this.getAddress());
            }
        };

        TLImportedAddress.prototype.hasFetchedAccountData = function() {
            return this.fetchedAccountData;
        };

        TLImportedAddress.prototype.getUnspentArray = function() {
            return this.unspentOutputs;
        };

        TLImportedAddress.prototype.getUnspentSum = function() {
            if (this.unspentOutputsSum != null) {
                return this.unspentOutputsSum;
            }

            if (this.unspentOutputs == null) {
                return TLCoin.zero();
            }

            var unspentOutputsSumTemp = 0;
            for (var i = 0; i < this.unspentOutputs.length; i++) {
                unspentOutputsSumTemp += this.unspentOutputs[i]["value"];
            }

            this.unspentOutputsSum = new TLCoin(unspentOutputsSumTemp);
            return this.unspentOutputsSum;
        };

        TLImportedAddress.prototype.setUnspentOutputs = function(unspentOuts) {
            this.unspentOutputs = unspentOuts;
        };

        TLImportedAddress.prototype.getBalance = function() {
            return this.balance;
        };

        TLImportedAddress.prototype.isWatchOnly = function() {
            return this.watchOnly;
        };

        TLImportedAddress.prototype.setArchived = function(archived) {
            this.archived = archived;
        };

        TLImportedAddress.prototype.isArchived = function() {
            return this.archived;
        };

        TLImportedAddress.prototype.getPositionInWalletArray = function() {
            return this.positionInWalletArray;
        };

        TLImportedAddress.prototype.setPositionInWalletArray = function(idx) {
            this.positionInWalletArray = idx;
        };

        TLImportedAddress.prototype.isPrivateKeyEncrypted = function() {
            if (this.watchOnly) {
                return false;
            }
            if (TLBitcoinJSWrapper.isBIP38EncryptedKey(this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY], this.appWallet.isTestnet())) {
                return true;
            }
            return false;
        };

        TLImportedAddress.prototype.getAddress = function() {
            return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
        };

        TLImportedAddress.prototype.getEitherPrivateKeyOrEncryptedPrivateKey = function() {
            if (this.watchOnly) {
                return this.privateKey;
            } else {
                return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY];
            }
        };

        TLImportedAddress.prototype.getPrivateKey = function() {
            if (this.watchOnly) {
                return this.privateKey;
            } else if (this.isPrivateKeyEncrypted()) {
                return this.privateKey;
            } else {
                return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY];
            }
        };

        TLImportedAddress.prototype.getEncryptedPrivateKey = function() {
            if (this.watchOnly) {
                return this.privateKey;
            } else if (this.isPrivateKeyEncrypted()) {
                return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY];
            } else {
                return null;
            }
        };

        TLImportedAddress.prototype.getLabel = function() {
            if (this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] == null ||
                this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] == '') {
                return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
            } else {
                return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL];
            }
        };

        TLImportedAddress.prototype.getTxObjectCount = function() {
            return this.txObjectArray.length;
        };

        TLImportedAddress.prototype.getTxObject = function(txIdx) {
            return this.txObjectArray[txIdx];
        };

        TLImportedAddress.prototype.getAccountAmountChangeForTx = function(txHash) {
            return this.txidToAccountAmountDict[txHash];
        };

        TLImportedAddress.prototype.getAccountAmountChangeTypeForTx = function(txHash) {
            return this.txidToAccountAmountTypeDict[txHash];
        };

        TLImportedAddress.prototype.getBalanceAsOfTx = function(txHash) {
            return this.txidToBalanceAsOfTxidDict[txHash];
        };

        TLImportedAddress.prototype.processNewTx = function(txObject) {
            if (this.processedTxDict[txObject.getHash()] != null) {
                // happens when you send coins to the same account, so you get the same tx from the websockets more then once
                return null;
            }
            var obj = this.processTx(txObject, true, this.balance);
            this.txObjectArray.unshift(txObject);
            return obj.receivedAmount;
        };

        TLImportedAddress.prototype.processTxArray = function(txArray, shouldUpdateAccountBalance) {
            this.resetAccountBalances();
            var balanceAsOfTxid = TLCoin.zero();
            for (var i = txArray.length-1; i > -1; i--) {
                //for (var i = 0; i < txArray.length; i++) {
                var txObject = new TLTxObject(this.appDelegate, txArray[i]);
                var obj = this.processTx(txObject, shouldUpdateAccountBalance, balanceAsOfTxid);
                balanceAsOfTxid = obj.balanceAsOfTxid;
                if (obj.doesTxInvolveAddress) {
                    this.txObjectArray.unshift(txObject);
                }
            }
        };

        TLImportedAddress.prototype.processTx = function(txObject, shouldUpdateAccountBalance, balanceAsOfTxid) {
            this.haveUpDatedUTXOs = false;
            this.processedTxDict[txObject.getHash()] = true;
            var currentTxSubtract = 0;
            var currentTxAdd = 0;
            var doesTxInvolveAddress = false;
            //console.log("processTx: " + txObject.getHash());

            var outputAddressToValueArray = txObject.getOutputAddressToValueArray();
            for (var i = 0; i < outputAddressToValueArray.length; i++) {
                var output = outputAddressToValueArray[i];
                var value = 0;
                if (output["value"] != null) {
                    value = output["value"];
                }
                if (output["addr"] != null && output["addr"] == this.importedAddress) {
                    currentTxAdd += value;
                    doesTxInvolveAddress = true;
                }
            }

            var inputAddressToValueArray = txObject.getInputAddressToValueArray();
            for (var i = 0; i < inputAddressToValueArray.length; i++) {
                var input = inputAddressToValueArray[i];
                var value = 0;
                if (input["value"] != null) {
                    value = input["value"];
                }
                if (input["addr"] != null && input["addr"] == this.importedAddress) {
                    currentTxSubtract += value;
                    doesTxInvolveAddress = true;
                }
            }


            if (shouldUpdateAccountBalance) {
                this.balance = new TLCoin(this.balance.toNumber() + currentTxAdd - currentTxSubtract);
            }
            var receivedAmount;
            if (currentTxSubtract > currentTxAdd) {
                var amountChangeToAccountFromTx = new TLCoin(currentTxSubtract - currentTxAdd);
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.SEND;
                balanceAsOfTxid = balanceAsOfTxid.subtract(amountChangeToAccountFromTx);
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                receivedAmount = null;
            } else if (currentTxSubtract < currentTxAdd) {
                var amountChangeToAccountFromTx = new TLCoin(currentTxAdd - currentTxSubtract);
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.RECEIVE;
                balanceAsOfTxid = balanceAsOfTxid.add(amountChangeToAccountFromTx);
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                receivedAmount = amountChangeToAccountFromTx;
            } else {
                var amountChangeToAccountFromTx = new TLCoin.zero();
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.MOVE_BETWEEN_WALLET;
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                receivedAmount = null;
            }
            return {doesTxInvolveAddress:doesTxInvolveAddress, receivedAmount:receivedAmount, balanceAsOfTxid:balanceAsOfTxid};
        };

        TLImportedAddress.prototype.getSingleAddressData = function(success, failure) {
            var self = this;
            this.isFetchingTxs = true;
            this.appDelegate.blockExplorerAPI.getAddressesInfo([this.importedAddress], function(jsonData) {
                //console.log("getSingleAddressData jsonData " + JSON.stringify(jsonData, null, 2));
                if (jsonData == null) {
                    success ? success() : null;
                    return;
                }
                if (jsonData["txs"] == null) {
                    success ? success() : null;
                    return;
                }
                var addressesArray = jsonData["addresses"];
                if (addressesArray == null) {
                    success ? success() : null;
                    return;
                }
                for (var i = 0; i < addressesArray.length; i++) {
                    var addressDict = addressesArray[i];
                    self.balance = new TLCoin(addressDict["final_balance"]);
                    self.processTxArray(jsonData["txs"], false);
                }
                self.setHasFetchedAccountData(true, Math.floor(Date.now() / 1000));

                self.isFetchingTxs = false;
                success ? success() : null;
                self.appDelegate.postEvent('wallet', {'type': 'EVENT_FETCHED_ADDRESSES_DATA'});
            }, function() {
                self.isFetchingTxs = false;
                failure ? failure() : null;
            });
        };

        TLImportedAddress.prototype.setLabel = function(label) {
            return this.addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = label;
        };

        TLImportedAddress.prototype.resetAccountBalances = function() {
            this.txObjectArray = [];
            this.txidToAccountAmountDict = {};
            this.txidToAccountAmountTypeDict = {};
        };

        return TLImportedAddress;
    });
