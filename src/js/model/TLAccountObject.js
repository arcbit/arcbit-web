'use strict';

define(['model/TLWalletJSONKeys', 'model/TLWallet', 'model/TLCoin', 'model/TLStealthExplorerAPI',
        'model/TLWalletUtils', 'model/TLTxObject', 'model/TLStealthWallet', 'model/TLBitcoinJSWrapper', 'model/TLHDWalletWrapper'],
    function(TLWalletJSONKeys, TLWallet, TLCoin, TLStealthExplorerAPI, TLWalletUtils, TLTxObject, TLStealthWallet,
             TLBitcoinJSWrapper, TLHDWalletWrapper) {

        TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS = 5;

        var ACCOUNT_UNUSED_ACTIVE_MAIN_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT = 5;
        var ACCOUNT_UNUSED_ACTIVE_CHANGE_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT = 5;
        var GAP_LIMIT = 20;
        var MAX_ACTIVE_MAIN_ADDRESS_TO_HAVE = 55;
        var MAX_ACTIVE_CHANGE_ADDRESS_TO_HAVE = 55;
        var EXTENDED_KEY_DEFAULT_ACCOUNT_NAME_LENGTH = 50;

        TLAccountObject.prototype.setUpActiveMainAddresses = function() {
            this.mainActiveAddresses = [];
            var addressesArray = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES];
            var minAddressIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX];

            var startIdx;
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                startIdx = minAddressIdx;
            } else {
                startIdx = 0;
            }

            for (var i = startIdx; i < addressesArray.length; i++) {
                var addressDict = addressesArray[i];
                var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
                var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
                this.address2HDIndexDict[address] = HDIndex;
                this.address2IsMainAddress[address] = true;
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
                this.mainActiveAddresses.push(address);
                this.activeAddressesDict[address] = true;
            }
        };

        TLAccountObject.prototype.setUpActiveChangeAddresses = function() {
            this.changeActiveAddresses = [];
            var addressesArray = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES];
            var minAddressIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX];

            var startIdx;
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                startIdx = minAddressIdx;
            } else {
                startIdx = 0;
            }

            for (var i = startIdx; i < addressesArray.length; i++) {
                var addressDict = addressesArray[i];
                var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
                var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
                this.address2HDIndexDict[address] = HDIndex;
                this.address2IsMainAddress[address] = false;
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
                this.changeActiveAddresses.push(address);
                this.activeAddressesDict[address] = true;
            }
        };

        TLAccountObject.prototype.setUpArchivedMainAddresses = function() {
            this.mainArchivedAddresses = [];
            var addressesArray = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES];
            var maxAddressIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX];

            for (var i = 0; i < maxAddressIdx; i++) {
                var addressDict = addressesArray[i];
                //expect(addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] == TLWalletJSONKeys.TLAddressStatus.ACTIVE).toBe(true);
                var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
                var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
                this.address2HDIndexDict[address] = HDIndex;
                this.address2IsMainAddress[address] = true;
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
                this.mainArchivedAddresses.push(address);
            }
        };

        TLAccountObject.prototype.setUpArchivedChangeAddresses = function() {
            this.changeArchivedAddresses = [];
            var addressesArray = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES];
            var maxAddressIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX];

            for (var i = 0; i < maxAddressIdx; i++) {
                var addressDict = addressesArray[i];
                //expect(addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] == TLWalletJSONKeys.TLAddressStatus.ACTIVE).toBe(true);
                var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
                var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
                this.address2HDIndexDict[address] = HDIndex;
                this.address2IsMainAddress[address] = false;
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
                this.changeArchivedAddresses.push(address);
            }
        };

        function TLAccountObject(appDelegate, appWallet, dict, accountType) {
            this.appDelegate = appDelegate;
            this.appWallet = null;
            this.haveUpDatedUTXOs = false;
            this.unspentOutputsCount = 0;
            this.stealthPaymentUnspentOutputsCount = 0;
            this.lastFetchTime = 0;
            this.isFetchingTxs = false;
            this.unspentOutputs = [];
            this.stealthPaymentUnspentOutputs = [];
            this.mainActiveAddresses = [];
            this.changeActiveAddresses = [];
            this.activeAddressesDict = {};
            this.mainArchivedAddresses = [];
            this.changeArchivedAddresses = [];
            this.address2BalanceDict = {};
            this.address2HDIndexDict = {};
            this.address2IsMainAddress = {};
            this.address2NumberOfTransactions = {};
            this.HDIndexToArchivedMainAddress = {};
            this.HDIndexToArchivedChangeAddress = {};
            this.txObjectArray = [];
            this.txidToAccountAmountDict = {};
            this.txidToAccountAmountTypeDict = {};
            this.txidToBalanceAsOfTxidDict = {};
            this.receivingAddressesArray = [];
            this.processedTxDict = {};
            this.accountType = null;
            this.accountBalance = TLCoin.zero();
            this.totalUnspentOutputsSum = null;
            this.fetchedAccountData = false;
            this.listeningToIncomingTransactions = false;
            this.positionInWalletArray = 0;
            this.extendedPrivateKey = null;
            this.stealthWallet = null;



            this.appWallet = appWallet;
            this.accountType = accountType;
            this.accountDict = dict;
            this.unspentOutputs = null;
            this.totalUnspentOutputsSum = null;
            this.extendedPrivateKey = null;

            this.txidToAccountAmountTypeDict = {};
            this.address2BalanceDict = {};

            this.setUpActiveMainAddresses();
            this.setUpActiveChangeAddresses();
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                this.setUpArchivedMainAddresses();
                this.setUpArchivedChangeAddresses();
            } else {
                this.HDIndexToArchivedMainAddress = {};
                this. HDIndexToArchivedChangeAddress = {};
            }


            if (accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                this.positionInWalletArray = this.getAccountIdxNumber();
            } else if (accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                //set later in accounts
            } else if (accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                //set later in accounts
            }
//*
            if (TLWalletUtils.ALLOW_MANUAL_SCAN_FOR_STEALTH_PAYMENT && accountType != TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                var stealthAddressArray = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
                var stealthWalletDict = stealthAddressArray[0];
                this.stealthWallet = new TLStealthWallet(appDelegate, stealthWalletDict, this, this.isArchived());

                for (var i = 0; i < this.stealthWallet.getStealthAddressPaymentsCount(); i++) {
                    var address = this.stealthWallet.getPaymentAddressForIndex(i);
                    this.address2BalanceDict[address] = TLCoin.zero();
                }
            }
            //*/
        }


        TLAccountObject.prototype.isWatchOnly = function() {
            return this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH;
        };

        TLAccountObject.prototype.hasSetExtendedPrivateKeyInMemory = function() {
            //expect(this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH).toBe(true);
            return this.extendedPrivateKey != null;
        };

        TLAccountObject.prototype.setExtendedPrivateKeyInMemory = function(extendedPrivKey) {
            //expect(this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH).toBe(true);
            //expect(TLHDWalletWrapper.isValidExtendedPrivateKey(extendedPrivKey), TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet())).toBe(true);
            if (TLHDWalletWrapper.getExtendPubKey(extendedPrivKey, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet())) == this.getExtendedPubKey()) {
                this.extendedPrivateKey = extendedPrivKey;
                return true;
            }
            return false;
        };

        TLAccountObject.prototype.clearExtendedPrivateKeyFromMemory = function() {
            //expect(this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH).toBe(true);
            this.extendedPrivateKey = null;
        };

        TLAccountObject.prototype.hasFetchedAccountData = function() {
            return this.fetchedAccountData;
        };

        TLAccountObject.prototype.renameAccount = function(accountName) {
            this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = accountName;
            return true;
        };

        TLAccountObject.prototype.getAccountName = function() {
            return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME];
        };

        TLAccountObject.prototype.getAccountNameOrAccountPublicKey = function() {
            var accountName = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME];
            return accountName != "" ? accountName : this.getExtendedPubKey();
        };

        TLAccountObject.prototype.archiveAccount = function(enabled) {
            var status = enabled ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
        };

        TLAccountObject.prototype.isArchived = function() {
            return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] == TLWalletJSONKeys.TLAddressStatus.ARCHIVED;
        };

        TLAccountObject.prototype.getAccountID = function() {
            var accountidx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
            return accountidx.toString();
        };

        TLAccountObject.prototype.getAccountIdxNumber = function() {
            return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
        };

        TLAccountObject.prototype.getAccountHDIndex = function() {
            return TLHDWalletWrapper.getAccountIdxForExtendedKey(this.getExtendedPubKey(),
                TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
        };

        TLAccountObject.prototype.getExtendedPubKey = function() {
            return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
        };

        TLAccountObject.prototype.getExtendedPrivKey = function() {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET || this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PRIVATE_KEY];
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                return this.extendedPrivateKey;
            }

            return null;
        };

        TLAccountObject.prototype.getAddressBalance = function(address) {
            var amount = this.address2BalanceDict[address];
            return amount != null ? amount : TLCoin.zero();
        };

        TLAccountObject.prototype.getNumberOfTransactionsForAddress = function(address) {
            //expect(this.isHDWalletAddress(address));
            if (this.address2NumberOfTransactions[address] != null) {
                return this.address2NumberOfTransactions[address];
            }
            return 0;
        };

        TLAccountObject.prototype.getAddressHDIndex = function(address) {
            return this.address2HDIndexDict[address];
        };

        TLAccountObject.prototype.getAccountPrivateKey = function(address) {
            if (this.isHDWalletAddress(address)) {
                if (this.address2IsMainAddress[address] == true) {
                    return this.getMainPrivateKey(address);
                } else {
                    return this.getChangePrivateKey(address);
                }
            }
            return null;
        };

        TLAccountObject.prototype.getMainPrivateKey = function(address) {
            var HDIndexNumber = this.address2HDIndexDict[address];
            var addressSequence = [TLWalletJSONKeys.TLAddressType.MAIN, HDIndexNumber];
            if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                //expect(this.extendedPrivateKey != null);
                return TLHDWalletWrapper.getPrivateKey(this.extendedPrivateKey, addressSequence,
                    TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
            } else {
                return TLHDWalletWrapper.getPrivateKey(this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PRIVATE_KEY],
                    addressSequence, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
            }
        };

        TLAccountObject.prototype.getChangePrivateKey = function(address) {
            var HDIndexNumber = this.address2HDIndexDict[address];
            var addressSequence = [TLWalletJSONKeys.TLAddressType.CHANGE, HDIndexNumber];
            if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                //expect(this.extendedPrivateKey != null);
                return TLHDWalletWrapper.getPrivateKey(this.extendedPrivateKey, addressSequence,
                    TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
            } else {
                return TLHDWalletWrapper.getPrivateKey(this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PRIVATE_KEY],
                    addressSequence, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
            }
        };

        TLAccountObject.prototype.getTxObjectCount = function() {
            return this.txObjectArray.length;
        };

        TLAccountObject.prototype.getTxObject = function(txIdx) {
            return this.txObjectArray[txIdx];
        };

        TLAccountObject.prototype.isAddressPartOfAccountActiveChangeAddresses = function(address) {
            for (var i = 0; i < this.changeActiveAddresses.length; i++) {
                if (this.changeActiveAddresses[i] == address) {
                    return true;
                }
            }
            return false;
        };

        TLAccountObject.prototype.isAddressPartOfAccountActiveMainAddresses = function(address) {
            for (var i = 0; i < this.mainActiveAddresses.length; i++) {
                if (this.mainActiveAddresses[i] == address) {
                    return true;
                }
            }
            return false;
        };

        TLAccountObject.prototype.isActiveAddress = function(address) {
            return this.activeAddressesDict[address] != null;
        };

        TLAccountObject.prototype.isHDWalletAddress = function(address) {
            return this.address2HDIndexDict[address] != null;
        };

        TLAccountObject.prototype.isAddressPartOfAccount = function(address) {
            if (this.stealthWallet == null) {
                return this.isHDWalletAddress(address);
            } else {
                return this.isHDWalletAddress(address) || this.stealthWallet.isPaymentAddress(address);
            }
        };

        TLAccountObject.prototype.getBalance = function() {
            return this.accountBalance;
        };

        TLAccountObject.prototype.getAccountType = function() {
            return this.accountType;
        };

        TLAccountObject.prototype.getAccountAmountChangeForTx = function(txHash) {
            return this.txidToAccountAmountDict[txHash];
        };

        TLAccountObject.prototype.getAccountAmountChangeTypeForTx = function(txHash) {
            return this.txidToAccountAmountTypeDict[txHash];
        };

        TLAccountObject.prototype.getBalanceAsOfTx = function(txHash) {
            return this.txidToBalanceAsOfTxidDict[txHash];
        };

        TLAccountObject.prototype.addToAddressBalance = function(address, amount) {
            var addressBalance = this.address2BalanceDict[address];
            if (addressBalance == null) {
                addressBalance = amount;
                this.address2BalanceDict[address] = addressBalance;
            } else {
                addressBalance = addressBalance.add(amount);
                this.address2BalanceDict[address] = addressBalance;
            }
        };

        TLAccountObject.prototype.subtractToAddressBalance = function(address, amount) {
            var addressBalance = this.address2BalanceDict[address];
            if (addressBalance == null) {
                addressBalance = TLCoin.zero().subtract(amount);
                this.address2BalanceDict[address] = addressBalance;
            } else {
                addressBalance = addressBalance.subtract(amount);
                this.address2BalanceDict[address] = addressBalance;
            }
        };

        TLAccountObject.prototype.processNewTx = function(txObject) {
            //console.log("processNewTx: " + txObject.getHash() + ' ' + this.getAccountName());
            if (this.processedTxDict[txObject.getHash()] != null) {
                return null;
            }

            var obj = this.processTx(txObject, true, true, this.accountBalance);

            this.txObjectArray.unshift(txObject);

            this.checkToArchiveAddresses();
            this.updateReceivingAddresses();
            this.updateChangeAddresses();
            return obj.receivedAmount;
        };

        TLAccountObject.prototype.processTx = function(txObject, shouldCheckToAddressesNTxsCount, shouldUpdateAccountBalance, balanceAsOfTxid) {
            this.haveUpDatedUTXOs = false;
            this.processedTxDict[txObject.getHash()] = true;
            var currentTxSubtract = 0;
            var currentTxAdd = 0;

            var address2hasUpdatedNTxCount = {};
            //console.log("processTx: " + txObject.getHash());
            var outputAddressToValueArray = txObject.getOutputAddressToValueArray();
            for (var i = 0; i < outputAddressToValueArray.length; i++) {
                var output = outputAddressToValueArray[i];
                var value = 0;
                if (output["value"] != null) {
                    value = output["value"];
                }
                if (output["addr"] != null) {
                    var address = output["addr"];
                    if (this.isActiveAddress(address)) {
                        currentTxAdd += value;
                        if (shouldUpdateAccountBalance) {
                            this.addToAddressBalance(address, new TLCoin(value));
                        }
                        if (shouldCheckToAddressesNTxsCount && address2hasUpdatedNTxCount[address] == null) {
                            address2hasUpdatedNTxCount[address] = '';
                            var ntxs = this.getNumberOfTransactionsForAddress(address);
                            this.address2NumberOfTransactions[address] = ntxs + 1;
                        }
                    } else if (this.stealthWallet != null && this.stealthWallet.isPaymentAddress(address)) {
                        currentTxAdd += value;
                        if (shouldUpdateAccountBalance) {
                            this.addToAddressBalance(address, new TLCoin(value));
                        }
                    } else {
                    }
                }
            }

            var inputAddressToValueArray = txObject.getInputAddressToValueArray();
            for (var i = 0; i < inputAddressToValueArray.length; i++) {
                var input = inputAddressToValueArray[i];
                var value = 0;
                if (input["value"] != null) {
                    value = input["value"];
                }
                if (input["addr"] != null) {
                    var address = input["addr"];
                    if (this.isActiveAddress(address)) {
                        currentTxSubtract += value;
                        if (shouldUpdateAccountBalance) {
                            this.subtractToAddressBalance(address, new TLCoin(value));
                        }
                        if (shouldCheckToAddressesNTxsCount && address2hasUpdatedNTxCount[address] == null) {
                            address2hasUpdatedNTxCount[address] = '';
                            var ntxs = this.getNumberOfTransactionsForAddress(address);
                            this.address2NumberOfTransactions[address] = ntxs + 1;
                        }
                    } else if (this.stealthWallet != null && this.stealthWallet.isPaymentAddress(address)) {
                        currentTxSubtract += value;
                        if (shouldUpdateAccountBalance) {
                            this.subtractToAddressBalance(address, new TLCoin(value));
                        }
                    } else {
                    }
                }
            }

            if (shouldUpdateAccountBalance) {
                this.accountBalance = new TLCoin(this.accountBalance.toNumber() + currentTxAdd - currentTxSubtract);
            }
            if (currentTxSubtract > currentTxAdd) {
                var amountChangeToAccountFromTx = new TLCoin(currentTxSubtract - currentTxAdd);
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.SEND;
                balanceAsOfTxid = balanceAsOfTxid.subtract(amountChangeToAccountFromTx);
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                return {receivedAmount: null, balanceAsOfTxid: balanceAsOfTxid};
            } else if (currentTxSubtract < currentTxAdd) {
                var amountChangeToAccountFromTx = new TLCoin(currentTxAdd - currentTxSubtract);
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.RECEIVE;

                //var a = new TLCoin(balanceAsOfTxid.toNumber());
                //var b = new TLCoin(amountChangeToAccountFromTx.toNumber());

                balanceAsOfTxid = balanceAsOfTxid.add(amountChangeToAccountFromTx);
                // balanceAsOfTxid = a.add(b);
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                return {receivedAmount: amountChangeToAccountFromTx, balanceAsOfTxid: balanceAsOfTxid};
            } else {
                var amountChangeToAccountFromTx = new TLCoin.zero();
                this.txidToAccountAmountDict[txObject.getHash()] = amountChangeToAccountFromTx;
                this.txidToAccountAmountTypeDict[txObject.getHash()] = TLWalletUtils.TLAccountTxType.MOVE_BETWEEN_WALLET;
                this.txidToBalanceAsOfTxidDict[txObject.getHash()] = new TLCoin(balanceAsOfTxid.toNumber());
                return {receivedAmount: null, balanceAsOfTxid: balanceAsOfTxid};
            }
        };

        TLAccountObject.prototype.getReceivingAddressesCount = function() {
            return this.receivingAddressesArray.length;
        };

        TLAccountObject.prototype.getReceivingAddress = function(idx) {
            return this.receivingAddressesArray[idx];
        };

        TLAccountObject.prototype.updateReceivingAddresses = function() {
            this.receivingAddressesArray = [];
            var addressIdx = 0;
            for (addressIdx = 0; addressIdx < this.mainActiveAddresses.length; addressIdx++) {
                var address = this.mainActiveAddresses[addressIdx];
                if (this.getNumberOfTransactionsForAddress(address) == 0) {
                    break;
                }
            }
            var lookedAtAllAddresses = false;
            var receivingAddressesStartIdx = -1;
            for (; addressIdx < addressIdx + TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS; addressIdx++) {
                if (addressIdx >= this.getMainActiveAddressesCount()) {
                    lookedAtAllAddresses = true;
                    break
                }

                var address = this.mainActiveAddresses[addressIdx];
                if (this.getNumberOfTransactionsForAddress(address) == 0) {
                    this.receivingAddressesArray.push(address);
                    if (receivingAddressesStartIdx == -1) {
                        receivingAddressesStartIdx = addressIdx;
                    }
                }
                if (this.receivingAddressesArray.length >= TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS ||
                    addressIdx - receivingAddressesStartIdx >= TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS) {
                    break;
                }
            }
            while (lookedAtAllAddresses && this.receivingAddressesArray.length < TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS) {
                var address = this.getNewMainAddress(this.getMainAddressesCount());
                addressIdx++;
                if (addressIdx - receivingAddressesStartIdx < TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS) {
                    this.receivingAddressesArray.push(address);
                } else {
                    break
                }
            }
            while (this.getMainActiveAddressesCount() - addressIdx < ACCOUNT_UNUSED_ACTIVE_MAIN_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT) {
                this.getNewMainAddress(this.getMainAddressesCount());
            }
            this.appDelegate.postEvent('wallet', {'type': 'EVENT_UPDATED_RECEIVING_ADDRESSES'});
        };

        TLAccountObject.prototype.updateChangeAddresses = function() {
            var addressIdx = 0;
            for (; addressIdx < addressIdx + this.changeActiveAddresses.length; addressIdx++) {
                var address = this.changeActiveAddresses[addressIdx];
                if (this.getNumberOfTransactionsForAddress(address) == 0) {
                    break;
                }
            }
            while (this.getChangeActiveAddressesCount() - addressIdx < ACCOUNT_UNUSED_ACTIVE_CHANGE_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT) {
                this.getNewChangeAddress(this.getChangeAddressesCount());
            }
        };

        TLAccountObject.prototype.checkToArchiveAddresses = function() {
            this.checkToArchiveMainAddresses();
            this.checkToArchiveChangeAddresses();
        };

        TLAccountObject.prototype.checkToArchiveMainAddresses = function() {
            if (this.getMainActiveAddressesCount() <= MAX_ACTIVE_MAIN_ADDRESS_TO_HAVE) {
                return;
            }

            var activeMainAddresses = this.getActiveMainAddresses().slice();
            for (var i = 0; i < activeMainAddresses.length; i++) {
                var address = activeMainAddresses[i];
                if (this.getAddressBalance(address).lessOrEqual(TLCoin.zero()) && this.getNumberOfTransactionsForAddress(address) > 0) {
                    var addressIdx = this.address2HDIndexDict[address];
                    var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                    if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                        if (addressIdx != this.mainArchivedAddresses.length) {
                            throw new Error('addressIdx != this.mainArchivedAddresses.length');
                        }
                        this.mainArchivedAddresses.push(address);
                    } else {
                        if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                            if (addressIdx != this.appWallet.getMinMainAddressIdxFromHDWallet(accountIdx)) {
                                throw new Error('addressIdx != this.appWallet.getMinMainAddressIdxFromHDWallet(accountIdx)');
                            }
                        } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                            if (addressIdx != this.appWallet.getMinMainAddressIdxFromImportedAccount(this.getPositionInWalletArray())) {
                                throw new Error('addressIdx != this.appWallet.getMinMainAddressIdxFromImportedAccount(this.getPositionInWalletArray())');
                            }
                        } else {
                            if (addressIdx != this.appWallet.getMinMainAddressIdxFromImportedWatchAccount(this.getPositionInWalletArray())) {
                                throw new Error('addressIdx != this.appWallet.getMinMainAddressIdxFromImportedWatchAccount(this.getPositionInWalletArray())');
                            }
                        }
                    }
                    if (this.mainActiveAddresses[0] != address) {
                        throw new Error('this.mainActiveAddresses[0] != address');
                    }
                    this.mainActiveAddresses.splice(0, 1);
                    delete this.activeAddressesDict[address];
                    if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                        this.appWallet.updateMainAddressStatusFromHDWallet(accountIdx, addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                        this.appWallet.updateMainAddressStatusFromImportedAccount(this.getPositionInWalletArray(), addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    } else {
                        this.appWallet.updateMainAddressStatusFromImportedWatchAccount(this.getPositionInWalletArray(), addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    }
                } else {
                    return;
                }
                if (this.getMainActiveAddressesCount() <= MAX_ACTIVE_MAIN_ADDRESS_TO_HAVE) {
                    return;
                }
            }
        };

        TLAccountObject.prototype.checkToArchiveChangeAddresses = function() {
            if (this.getChangeActiveAddressesCount() <= MAX_ACTIVE_CHANGE_ADDRESS_TO_HAVE) {
                return;
            }

            var activeChangeAddresses = this.getActiveChangeAddresses().slice();
            for (var i = 0; i < activeChangeAddresses.length; i++) {
                var address = activeChangeAddresses[i];
                if (this.getAddressBalance(address).lessOrEqual(TLCoin.zero()) && this.getNumberOfTransactionsForAddress(address) > 0) {
                    var addressIdx = this.address2HDIndexDict[address];
                    var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                    if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                        if (addressIdx != this.changeArchivedAddresses.length) {
                            throw new Error('addressIdx != this.changeArchivedAddresses.length');
                        }
                        this.changeArchivedAddresses.push(address);
                    } else {
                        if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                            if (addressIdx != this.appWallet.getMinChangeAddressIdxFromHDWallet(accountIdx)) {
                                throw new Error('addressIdx != this.appWallet.getMinChangeAddressIdxFromHDWallet(accountIdx)');
                            }
                        } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                            if (addressIdx != this.appWallet.getMinChangeAddressIdxFromImportedAccount(this.getPositionInWalletArray())) {
                                throw new Error('addressIdx != this.appWallet.getMinChangeAddressIdxFromImportedAccount(this.getPositionInWalletArray())');
                            }
                        } else {
                            if (addressIdx != this.appWallet.getMinChangeAddressIdxFromImportedWatchAccount(this.getPositionInWalletArray())) {
                                throw new Error('addressIdx != this.appWallet.getMinChangeAddressIdxFromImportedWatchAccount(this.getPositionInWalletArray())');
                            }
                        }
                    }
                    if (this.changeActiveAddresses[0] != address) {
                        throw new Error('this.changeActiveAddresses[0] != address');
                    }
                    this.changeActiveAddresses.splice(0, 1);
                    delete this.activeAddressesDict[address];
                    if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                        this.appWallet.updateChangeAddressStatusFromHDWallet(accountIdx, addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                        this.appWallet.updateChangeAddressStatusFromImportedAccount(this.getPositionInWalletArray(), addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    } else {
                        this.appWallet.updateChangeAddressStatusFromImportedWatchAccount(this.getPositionInWalletArray(), addressIdx, TLWalletJSONKeys.TLAddressStatus.ARCHIVED);
                    }
                } else {
                    return;
                }
                if (this.getMainActiveAddressesCount() <= MAX_ACTIVE_MAIN_ADDRESS_TO_HAVE) {
                    return;
                }
            }
        };

        TLAccountObject.prototype.processTxArray = function(txArray, shouldResetAccountBalance) {
            var balanceAsOfTxid = TLCoin.zero();
            for (var i = txArray.length-1; i > -1; i--) {
                var tx = txArray[i];
                var txObject = new TLTxObject(this.appDelegate, tx);
                var obj = this.processTx(txObject, true, false, balanceAsOfTxid);
                balanceAsOfTxid = obj.balanceAsOfTxid;
                this.txObjectArray.unshift(txObject);
            }
            if (shouldResetAccountBalance) {
                this.checkToArchiveAddresses();
                this.updateReceivingAddresses();
                this.updateChangeAddresses();
            }
        };

        TLAccountObject.prototype.getPositionInWalletArray = function() {
            return this.positionInWalletArray;
        };

        TLAccountObject.prototype.setPositionInWalletArray = function(idx) {
            this.positionInWalletArray = idx;
        };

        TLAccountObject.prototype.getNewMainAddress = function(expectedAddressIndex) {
            var addressDict;
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                addressDict = this.appWallet.getNewMainAddressFromHDWallet(accountIdx, expectedAddressIndex);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                addressDict = this.appWallet.getNewMainAddressFromImportedAccount(this.positionInWalletArray, expectedAddressIndex);
            } else {
                addressDict = this.appWallet.getNewMainAddressFromImportedWatchAccount(this.positionInWalletArray, expectedAddressIndex);
            }
            var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
            var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
            this.address2HDIndexDict[address] = HDIndex;
            this.address2IsMainAddress[address] = true;
            this.address2BalanceDict[address] = TLCoin.zero();
            this.address2NumberOfTransactions[address] = 0;
            this.mainActiveAddresses.push(address);
            this.activeAddressesDict[address] = true;
            if (this.appDelegate.bitcoinListener) {
                this.appDelegate.bitcoinListener.listenForAddress(address);
            }
            return address;
        };

        TLAccountObject.prototype.getNewChangeAddress = function(expectedAddressIndex) {
            var addressDict;
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                addressDict = this.appWallet.getNewChangeAddressFromHDWallet(accountIdx, expectedAddressIndex);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                addressDict = this.appWallet.getNewChangeAddressFromImportedAccount(this.positionInWalletArray, expectedAddressIndex);
            } else {
                addressDict = this.appWallet.getNewChangeAddressFromImportedWatchAccount(this.positionInWalletArray, expectedAddressIndex);
            }
            var address = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
            var HDIndex = addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX];
            this.address2HDIndexDict[address] = HDIndex;
            this.address2IsMainAddress[address] = false;
            this.address2BalanceDict[address] = TLCoin.zero();
            this.address2NumberOfTransactions[address] = 0;
            this.changeActiveAddresses.push(address);
            this.activeAddressesDict[address] = true;
            if (this.appDelegate.bitcoinListener) {
                this.appDelegate.bitcoinListener.listenForAddress(address);
            }
            return address;
        };

        TLAccountObject.prototype.removeTopMainAddress = function() {
            var removedAddress = '';
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                removedAddress = this.appWallet.removeTopMainAddressFromHDWallet(accountIdx);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                removedAddress = this.appWallet.removeTopMainAddressFromImportedAccount(this.positionInWalletArray);
            } else {
                removedAddress = this.appWallet.removeTopMainAddressFromImportedWatchAccount(this.positionInWalletArray);
            }
            if (this.mainActiveAddresses.length > 0) {
                var address = this.mainActiveAddresses.pop();
                delete this.address2HDIndexDict[address];
                delete this.address2BalanceDict[address];
                delete this.address2NumberOfTransactions[address];
                delete this.activeAddressesDict[address];
                return true;
            } else if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                if (this.mainArchivedAddresses.length > 0) {
                    var address = this.mainArchivedAddresses.pop();
                    delete this.address2HDIndexDict[address];
                    delete this.address2BalanceDict[address];
                    delete this.address2NumberOfTransactions[address];
                    delete this.activeAddressesDict[address];
                }
                return true;
            }
            return false;
        };

        TLAccountObject.prototype.removeTopChangeAddress = function() {
            var removedAddress = '';
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                removedAddress = this.appWallet.removeTopChangeAddressFromHDWallet(accountIdx);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                removedAddress = this.appWallet.removeTopChangeAddressFromImportedAccount(this.positionInWalletArray);
            } else {
                removedAddress = this.appWallet.removeTopChangeAddressFromImportedWatchAccount(this.positionInWalletArray);
            }
            if (this.changeActiveAddresses.length > 0) {
                var address = this.changeActiveAddresses.pop();
                delete this.address2HDIndexDict[address];
                delete this.address2BalanceDict[address];
                delete this.address2NumberOfTransactions[address];
                delete this.activeAddressesDict[address];
                return true;
            } else if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                if (this.changeArchivedAddresses.length > 0) {
                    var address = this.changeArchivedAddresses.pop();
                    delete this.address2HDIndexDict[address];
                    delete this.address2BalanceDict[address];
                    delete this.address2NumberOfTransactions[address];
                    delete this.activeAddressesDict[address];
                }
                return true;
            }
            return false;
        };

        TLAccountObject.prototype.getCurrentChangeAddress = function() {
            for (var i = 0; i < this.changeActiveAddresses.length; i++) {
                var address = this.changeActiveAddresses[i];
                if (this.getNumberOfTransactionsForAddress(address) == 0 && this.getAddressBalance(address).equalTo(TLCoin.zero())) {
                    return address;
                }
            }
            return this.getNewChangeAddress(this.getChangeAddressesCount());
        };

        TLAccountObject.prototype.getActiveMainAddresses = function() {
            return this.mainActiveAddresses;
        };

        TLAccountObject.prototype.getActiveChangeAddresses = function() {
            return this.changeActiveAddresses;
        };

        TLAccountObject.prototype.getMainActiveAddressesCount = function() {
            return this.mainActiveAddresses.length;
        };

        TLAccountObject.prototype.getMainArchivedAddressesCount = function() {
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                return this.mainArchivedAddresses.length;
            } else {
                if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                    var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                    return this.appWallet.getMinMainAddressIdxFromHDWallet(accountIdx);
                } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                    return this.appWallet.getMinMainAddressIdxFromImportedAccount(this.positionInWalletArray);
                } else {
                    return this.appWallet.getMinMainAddressIdxFromImportedWatchAccount(this.positionInWalletArray);
                }
            }
        };

        TLAccountObject.prototype.getMainAddressesCount = function() {
            return this.getMainActiveAddressesCount() + this.getMainArchivedAddressesCount();
        };

        TLAccountObject.prototype.getChangeActiveAddressesCount = function() {
            return this.changeActiveAddresses.length;
        };

        TLAccountObject.prototype.getChangeArchivedAddressesCount = function() {
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                return this.changeArchivedAddresses.length;
            } else {
                if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                    var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                    return this.appWallet.getMinChangeAddressIdxFromHDWallet(accountIdx);
                } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                    return this.appWallet.getMinChangeAddressIdxFromImportedAccount(this.positionInWalletArray);
                } else {
                    return this.appWallet.getMinChangeAddressIdxFromImportedWatchAccount(this.positionInWalletArray);
                }
            }
        };

        TLAccountObject.prototype.getChangeAddressesCount = function() {
            return this.getChangeActiveAddressesCount() + this.getChangeArchivedAddressesCount();
        };

        TLAccountObject.prototype.getMainActiveAddress = function(idx) {
            return this.mainActiveAddresses[idx];
        };

        TLAccountObject.prototype.getChangeActiveAddress = function(idx) {
            return this.changeActiveAddresses[idx];
        };

        TLAccountObject.prototype.getMainArchivedAddress = function(idx) {
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                return this.mainArchivedAddresses[idx];
            } else {
                var HDIndex = idx;
                var address = this.HDIndexToArchivedMainAddress[HDIndex];
                if (address == null) {
                    var extendedPublicKey = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
                    var mainAddressSequence = [TLWalletJSONKeys.TLAddressType.MAIN, idx];
                    address = TLHDWalletWrapper.getAddress(extendedPublicKey, mainAddressSequence, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
                    this.HDIndexToArchivedMainAddress[HDIndex] = address;
                    this.address2HDIndexDict[address] = HDIndex;
                    this.address2IsMainAddress[address] = true;
                }
                return address;
            }
        };

        TLAccountObject.prototype.getChangeArchivedAddress = function(idx) {
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                return this.changeArchivedAddresses[idx];
            } else {
                var HDIndex = idx;
                var address = this.HDIndexToArchivedChangeAddress[HDIndex];
                if (address == null) {
                    var extendedPublicKey = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
                    var changeAddressSequence = [TLWalletJSONKeys.TLAddressType.CHANGE, idx];
                    address = TLHDWalletWrapper.getAddress(extendedPublicKey, changeAddressSequence, TLBitcoinJSWrapper.getNetwork(this.appWallet.isTestnet()));
                    this.HDIndexToArchivedChangeAddress[HDIndex] = address;
                    this.address2HDIndexDict[address] = HDIndex;
                    this.address2IsMainAddress[address] = false;
                }
                return address;
            }
        };


        TLAccountObject.prototype.recursiveRecoverMainAddresses = function(lookAheadOffset, accountAddressIdx, success, failure) {
            var addresses = [];
            var addressToIdxDict = {};
            for (var i = lookAheadOffset; i < lookAheadOffset + GAP_LIMIT; i++) {
                var address = this.getNewMainAddress(i);
                addresses.push(address);
                addressToIdxDict[address] = i;
            }
            var self = this;
            this.appDelegate.blockExplorerAPI.getAddressesInfo(addresses, function(jsonData) {
                if (jsonData == null) {
                    failure();
                    return;
                }
                var addressesArray = jsonData["addresses"];
                if (addressesArray == null) {
                    failure();
                    return;
                }
                var balance = 0;
                for (var i = 0; i < addressesArray.length; i++) {
                    var addressDict = addressesArray[i];
                    var n_tx = addressDict["n_tx"];
                    var address = addressDict["address"];
                    self.address2NumberOfTransactions[address] = n_tx;
                    var addressBalance = addressDict["final_balance"];
                    balance += addressBalance;
                    self.address2BalanceDict[address] = new TLCoin(addressBalance);
                    var HDIdx = addressToIdxDict[address];
                    if (n_tx > 0 && HDIdx > accountAddressIdx) {
                        accountAddressIdx = HDIdx;
                    }
                }
                self.accountBalance = new TLCoin(self.accountBalance.toNumber() + balance);
                if (accountAddressIdx < lookAheadOffset) {
                    success(accountAddressIdx);
                } else {
                    self.recursiveRecoverMainAddresses(lookAheadOffset+GAP_LIMIT, accountAddressIdx, success, failure);
                }
            }, function(response) {
                failure();
            });
        }

        TLAccountObject.prototype.recoverAccountMainAddresses = function(success, failure) {
            var self = this;
            this.recursiveRecoverMainAddresses(0, -1, function(accountAddressIdx) {
                while (self.getMainAddressesCount() > accountAddressIdx + 1) {
                    self.removeTopMainAddress();
                }
                while (self.getMainAddressesCount() < accountAddressIdx + 1 + ACCOUNT_UNUSED_ACTIVE_MAIN_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT) {
                    self.getNewMainAddress(self.getMainAddressesCount());
                }
                success(accountAddressIdx);
            }, function() {
                failure();
            });
        };

        TLAccountObject.prototype.recursiveRecoverChangeAddresses = function(lookAheadOffset, accountAddressIdx, success, failure) {
            var addresses = [];
            var addressToIdxDict = {};
            for (var i = lookAheadOffset; i < lookAheadOffset + GAP_LIMIT; i++) {
                var address = this.getNewChangeAddress(i);
                addresses.push(address);
                addressToIdxDict[address] = i;
            }
            var self = this;
            this.appDelegate.blockExplorerAPI.getAddressesInfo(addresses, function(jsonData) {
                if (jsonData == null) {
                    failure();
                    return;
                }
                var addressesArray = jsonData["addresses"];
                if (addressesArray == null) {
                    failure();
                    return;
                }
                var balance = 0;
                for (var i = 0; i < addressesArray.length; i++) {
                    var addressDict = addressesArray[i];
                    var n_tx = addressDict["n_tx"];
                    var address = addressDict["address"];
                    self.address2NumberOfTransactions[address] = n_tx;
                    var addressBalance = addressDict["final_balance"];
                    balance += addressBalance;
                    self.address2BalanceDict[address] = new TLCoin(addressBalance);
                    var HDIdx = addressToIdxDict[address];
                    if (n_tx > 0 && HDIdx > accountAddressIdx) {
                        accountAddressIdx = HDIdx;
                    }
                }
                self.accountBalance = new TLCoin(self.accountBalance.toNumber() + balance);
                if (accountAddressIdx < lookAheadOffset) {
                    success(accountAddressIdx);
                } else {
                    self.recursiveRecoverChangeAddresses(lookAheadOffset+GAP_LIMIT, accountAddressIdx, success, failure);
                }
            }, function(response) {
                failure();
            });
        };

        TLAccountObject.prototype.recoverAccountChangeAddresses = function(success, failure) {
            var self = this;
            this.recursiveRecoverChangeAddresses(0, -1, function(accountAddressIdx) {
                while (self.getChangeAddressesCount() > accountAddressIdx + 1) {
                    self.removeTopChangeAddress();
                }
                while (self.getChangeAddressesCount() < accountAddressIdx + 1 + ACCOUNT_UNUSED_ACTIVE_MAIN_ADDRESS_AHEAD_OF_LATEST_USED_ONE_MINIMUM_COUNT) {
                    self.getNewChangeAddress(self.getChangeAddressesCount());
                }
                success(accountAddressIdx);
            }, function() {
                failure();
            });
        };

        TLAccountObject.prototype.recoverAccount = function(recoverStealthPayments, success, failure) {
            var self = this;
            this.recoverAccountMainAddresses(function(accountMainAddressMaxIdx) {
                self.recoverAccountChangeAddresses(function(accountChangeAddressMaxIdx) {
                    self.checkToArchiveAddresses();
                    self.updateReceivingAddresses();
                    self.updateChangeAddresses();
                    if (recoverStealthPayments && self.stealthWallet != null) {
                        var compareTxObjects = function(obj1, obj2) {
                            if (obj1.getTxUnixTime() < obj2.getTxUnixTime()) {
                                return 1;
                            } else if (obj1.getTxUnixTime() > obj2.getTxUnixTime()) {
                                return -1;
                            }
                            return 0;
                        }
                        self.fetchNewStealthPayments(recoverStealthPayments, function() {
                            self.txObjectArray.sort(compareTxObjects);
                            self.updateAccountNeedsRecovering(false);
                            success(accountMainAddressMaxIdx + accountChangeAddressMaxIdx);
                        }, function() {
                            self.fetchedAccountData = false;
                            self.txObjectArray.sort(compareTxObjects);
                            self.updateAccountNeedsRecovering(false);
                            success(accountMainAddressMaxIdx + accountChangeAddressMaxIdx);
                        });
                    } else {
                        self.updateAccountNeedsRecovering(false);
                        success(accountMainAddressMaxIdx + accountChangeAddressMaxIdx);
                    }
                }, function() {
                    failure();
                });
            }, function() {
                failure();
            });
        };

        TLAccountObject.prototype.updateAccountNeedsRecovering = function(needsRecovering) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.updateAccountNeedsRecoveringFromHDWallet(accountIdx, needsRecovering);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.updateAccountNeedsRecoveringFromImportedAccount(this.getPositionInWalletArray(), needsRecovering);
            } else {
                this.appWallet.updateAccountNeedsRecoveringFromImportedWatchAccount(this.getPositionInWalletArray(), needsRecovering);
            }
            this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING] = needsRecovering;
        };

        TLAccountObject.prototype.clearAllAddresses = function() {
            this.mainActiveAddresses = [];
            this.mainArchivedAddresses = [];
            this.changeActiveAddresses = [];
            this.changeArchivedAddresses = [];
            this.txidToAccountAmountDict = {};
            this.txidToAccountAmountTypeDict = {};
            this.address2HDIndexDict = {};
            this.address2BalanceDict = {};
            this.address2NumberOfTransactions = {};
            this.activeAddressesDict = {};
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.clearAllAddressesFromHDWallet(accountIdx);
                this.appWallet.clearAllStealthPaymentsFromHDWallet(accountIdx);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.clearAllAddressesFromImportedAccount(this.getPositionInWalletArray());
                this.appWallet.clearAllStealthPaymentsFromImportedAccount(this.getPositionInWalletArray());
            } else {
                this.appWallet.clearAllAddressesFromImportedWatchAccount(this.getPositionInWalletArray());
            }
        };

        TLAccountObject.prototype.needsRecovering = function() {
            return this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING];
        };

        TLAccountObject.prototype.getUnspentArray = function() {
            return this.unspentOutputs;
        };

        TLAccountObject.prototype.getStealthPaymentUnspentOutputsArray = function() {
            return this.stealthPaymentUnspentOutputs;
        };

        TLAccountObject.prototype.getTotalUnspentSum = function() {
            if (this.totalUnspentOutputsSum != null) {
                return this.totalUnspentOutputsSum;
            }
            if (this.unspentOutputs == null) {
                return TLCoin.zero();
            }
            var totalUnspentOutputsSumTemp = 0;
            for (var i = 0; i < this.stealthPaymentUnspentOutputs.length; i++) {
                var unspentOutput = this.stealthPaymentUnspentOutputs[i];
                var amount = unspentOutput["value"];
                totalUnspentOutputsSumTemp += amount;
            }
            for (var i = 0; i < this.unspentOutputs.length; i++) {
                var unspentOutput = this.unspentOutputs[i];
                var amount = unspentOutput["value"];
                totalUnspentOutputsSumTemp += amount;
            }
            this.totalUnspentOutputsSum = new TLCoin(totalUnspentOutputsSumTemp);
            return this.totalUnspentOutputsSum;
        };

        TLAccountObject.prototype.getUnspentOutputs = function(success, failure) {
            var activeAddresses = this.getActiveMainAddresses();
            activeAddresses = activeAddresses.concat(this.getActiveChangeAddresses());
            if (this.stealthWallet != null) {
                activeAddresses = activeAddresses.concat(this.stealthWallet.getUnspentPaymentAddresses());
            }
            this.unspentOutputs = [];
            this.totalUnspentOutputsSum = null;
            this.stealthPaymentUnspentOutputs = [];

            this.unspentOutputsCount = 0;
            this.stealthPaymentUnspentOutputsCount = 0;
            this.haveUpDatedUTXOs = false;
            var self = this;
            this.appDelegate.blockExplorerAPI.getUnspentOutputs(activeAddresses, function(jsonData) {
                if (jsonData == null) {
                    success();
                    return;
                }
                var unspentOutputs = jsonData["unspent_outputs"];
                if (unspentOutputs == null) {
                    success();
                    return;
                }
                for (var i = 0; i < unspentOutputs.length; i++) {
                    var outputScript = unspentOutputs[i]["script"];
                    var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                        TLBitcoinJSWrapper.getNetwork(self.appWallet.isTestnet()));
                    if (self.stealthWallet != null && self.stealthWallet.isPaymentAddress(address) == true) {
                        self.stealthPaymentUnspentOutputs.push(unspentOutputs[i]);
                        self.stealthPaymentUnspentOutputsCount += 1;
                    } else {
                        self.unspentOutputs.push(unspentOutputs[i]);
                        self.unspentOutputsCount += 1;
                    }
                }

                function compare(obj1, obj2) {
                    var confirmations1 = obj1["confirmations"] != null ? obj1["confirmations"] : 0;
                    var confirmations2 = obj2["confirmations"] != null ? obj2["confirmations"] : 0;
                    if (confirmations1 < confirmations2) {
                        return -1;
                    } else if (confirmations1 > confirmations2) {
                        return 1;
                    }
                    return 0;
                }
                self.unspentOutputs.sort(compare);
                self.stealthPaymentUnspentOutputs.sort(compare);
                self.haveUpDatedUTXOs = true;
                success();
            }, function(response) {
                failure(response);
            });
        };

        TLAccountObject.prototype.recursiveGetAndStoreStealthPayments = function(isRestoringAccount, offset, currentLatestTxTime, success, failure) {
            var self = this;

            this.stealthWallet.getAndStoreStealthPayments(isRestoringAccount, offset, function(ret) {
                if (ret == null) {
                    success();
                    return;
                }
                var latestTxTime = ret['latestTxTime'];
                if (latestTxTime > currentLatestTxTime) {
                    currentLatestTxTime = latestTxTime;
                }
                var gotOldestPaymentAddresses = ret['gotOldestPaymentAddresses'];
                var newStealthPaymentAddresses = ret['payments'];
                if (!isRestoringAccount) {
                    if (newStealthPaymentAddresses.length > 0) {
                        self.getAccountDataWithAddresses(newStealthPaymentAddresses, false, function() {
                            if (gotOldestPaymentAddresses) {
                                success();
                                return;
                            }
                            self.recursiveGetAndStoreStealthPayments(isRestoringAccount, offset + TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT, currentLatestTxTime, success, failure);
                        }, function(){
                            failure();
                        });
                    } else {
                        if (gotOldestPaymentAddresses) {
                            success();
                            return;
                        }
                        self.recursiveGetAndStoreStealthPayments(isRestoringAccount, offset + TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT, currentLatestTxTime, success, failure);
                    }
                } else {
                    if (gotOldestPaymentAddresses) {
                        success();
                        return;
                    }
                    self.recursiveGetAndStoreStealthPayments(isRestoringAccount, offset + TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT, currentLatestTxTime, success, failure);
                }
            }, function() {
                failure();
            });
        };

        TLAccountObject.prototype.fetchNewStealthPayments = function(isRestoringAccount, successCallback, failureCallback) {
            var self = this;
            this.stealthWallet.checkToWatchStealthAddress(function() {
                self.recursiveGetAndStoreStealthPayments(isRestoringAccount, 0, 0, function(currentLatestTxTime) {
                    self.setStealthAddressLastTxTime(self.appDelegate.preferences.getStealthExplorerURL(), currentLatestTxTime);
                    if (isRestoringAccount) {
                        self.stealthWallet.setUpStealthPaymentAddresses(true, true, false, function() {
                            successCallback ? successCallback() : null;
                        }, function() {
                            successCallback ? successCallback() : null;
                        });
                    } else {
                        successCallback ? successCallback() : null;
                    }
                }, function() {
                    failureCallback ? failureCallback() : null;
                });
            }, function() {
                failureCallback ? failureCallback() : null;
            });
        };

        TLAccountObject.prototype.resetAccountBalances = function() {
            this.txObjectArray = [];
            this.address2BalanceDict = [];
            this.address2NumberOfTransactions = [];
            this.accountBalance = TLCoin.zero();
            for (var i = 0; i < this.mainActiveAddresses.length; i++) {
                var address = this.mainActiveAddresses[i];
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
            }
            for (var i = 0; i < this.changeActiveAddresses.length; i++) {
                var address = this.mainActiveAddresses[i];
                this.address2BalanceDict[address] = TLCoin.zero();
                this.address2NumberOfTransactions[address] = 0;
            }
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                for (var i = 0; i < this.mainArchivedAddresses.length; i++) {
                    var address = this.mainArchivedAddresses[i];
                    this.address2BalanceDict[address] = TLCoin.zero();
                    this.address2NumberOfTransactions[address] = 0;
                }
                for (var i = 0; i < this.changeArchivedAddresses.length; i++) {
                    var address = this.changeArchivedAddresses[i];
                    this.address2BalanceDict[address] = TLCoin.zero();
                    this.address2NumberOfTransactions[address] = 0;
                }
            }
        };

        TLAccountObject.prototype.setStealthAddressServerStatus = function(serverURL, isWatching) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.setStealthAddressServerStatusHDWallet(accountIdx, serverURL, isWatching);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setStealthAddressServerStatusImportedAccount(this.getPositionInWalletArray(), serverURL, isWatching);
            } else {
                this.appWallet.setStealthAddressServerStatusImportedWatchAccount(this.getPositionInWalletArray(), serverURL, isWatching);
            }
        };

        TLAccountObject.prototype.setStealthAddressLastTxTime = function(privateKey, address, txid, txTime, stealthPaymentStatus) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.setStealthAddressLastTxTimeHDWallet(accountIdx, privateKey, address, txid, txTime, stealthPaymentStatus);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setStealthAddressLastTxTimeImportedAccount(this.getPositionInWalletArray(), privateKey, address, txid, txTime, stealthPaymentStatus);
            } else {
                this.appWallet.setStealthAddressLastTxTimeImportedWatchAccount(this.getPositionInWalletArray(), privateKey, address, txid, txTime, stealthPaymentStatus);
            }
        };

        TLAccountObject.prototype.addStealthAddressPaymentKey = function(privateKey, address, txid, txTime, stealthPaymentStatus) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.addStealthAddressPaymentKeyHDWallet(accountIdx, privateKey, address, txid, txTime, stealthPaymentStatus);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.addStealthAddressPaymentKeyImportedAccount(this.getPositionInWalletArray(), privateKey, address, txid, txTime, stealthPaymentStatus);
            } else {
                this.appWallet.addStealthAddressPaymentKeyImportedWatchAccount(this.getPositionInWalletArray(), privateKey, address, txid, txTime, stealthPaymentStatus);
            }
        };

        TLAccountObject.prototype.setStealthPaymentStatus = function(serverURL, stealthPaymentStatus, lastCheckTime) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX];
                this.appWallet.setStealthPaymentStatusHDWallet(accountIdx, stealthPaymentStatus, lastCheckTime);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setStealthPaymentStatusImportedAccount(this.getPositionInWalletArray(), stealthPaymentStatus, lastCheckTime);
            } else {
                this.appWallet.setStealthPaymentStatusImportedWatchAccount(this.getPositionInWalletArray(), stealthPaymentStatus, lastCheckTime);
            }
        };

        TLAccountObject.prototype.removeOldStealthPayments = function() {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.getAccountIdxNumber();
                this.appWallet.removeOldStealthPaymentsHDWallet(accountIdx);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.removeOldStealthPaymentsImportedAccount(this.getPositionInWalletArray());
            } else {
                this.appWallet.removeOldStealthPaymentsImportedWatchAccount(this.getPositionInWalletArray());
            }
        };

        TLAccountObject.prototype.setStealthPaymentLastCheckTime = function(serverURL, txid, lastCheckTime) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountIdx = this.getAccountIdxNumber();
                this.appWallet.setStealthPaymentLastCheckTimeHDWallet(accountIdx, txid, lastCheckTime);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setStealthPaymentLastCheckTimeImportedAccount(this.getPositionInWalletArray(), txid, lastCheckTime);
            } else {
                this.appWallet.setStealthPaymentLastCheckTimeImportedWatchAccount(this.getPositionInWalletArray(), txid, lastCheckTime);
            }
        };

        TLAccountObject.prototype.getAccountData = function(success, failure) {
            // if account needs recovering dont fetch account data
            if (this.needsRecovering()) {
                return;
            }
            var activeAddresses = this.getActiveMainAddresses();
            activeAddresses = activeAddresses.concat(this.getActiveChangeAddresses());
            if (this.stealthWallet != null) {
                activeAddresses = activeAddresses.concat(this.stealthWallet.getPaymentAddresses());
                this.fetchNewStealthPayments(false);
            }
            this.getAccountDataWithAddresses(activeAddresses, true, success, failure);
        };

        TLAccountObject.prototype.getAccountDataWithAddresses = function(addresses, shouldResetAccountBalance, success, failure) {
            var self = this;
            this.isFetchingTxs = true;
            this.appDelegate.blockExplorerAPI.getAddressesInfo(addresses, function(jsonData) {
                //console.log("getAccountData jsonData " + JSON.stringify(jsonData, null, 2));
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
                if (shouldResetAccountBalance) {
                    self.resetAccountBalances();
                }

                var balance = 0;
                for (var i = 0; i < addressesArray.length; i++) {
                    var addressDict = addressesArray[i];
                    var n_tx = addressDict["n_tx"];
                    var address = addressDict["address"];
                    self.address2NumberOfTransactions[address] = n_tx;
                    var addressBalance = addressDict["final_balance"];
                    balance += addressBalance;
                    self.address2BalanceDict[address] = new TLCoin(addressBalance);
                }
                self.accountBalance = new TLCoin(self.accountBalance.toNumber() + balance);

                self.processTxArray(jsonData["txs"], true);

                self.fetchedAccountData = true;
                self.lastFetchTime = Math.floor(Date.now() / 1000);
                self.subscribeToWebsockets();
                self.isFetchingTxs = false;
                success ? success() : null;
                self.appDelegate.postEvent('wallet', {'type': 'EVENT_FETCHED_ADDRESSES_DATA'});
            }, function() {
                self.isFetchingTxs = false;
                failure ? failure() : null;
            });
        };

        TLAccountObject.prototype.subscribeToWebsockets = function() {
            if (this.listeningToIncomingTransactions == false) {
                this.listeningToIncomingTransactions = true;
                var activeMainAddresses = this.getActiveMainAddresses();
                for (var i = 0; i < activeMainAddresses.length; i++) {
                    var address = activeMainAddresses[i];
                    this.appDelegate.bitcoinListener.listenForAddress(address);
                }
                var activeChangeAddresses = this.getActiveChangeAddresses();
                for (var i = 0; i < activeChangeAddresses.length; i++) {
                    var address = activeChangeAddresses[i];
                    this.appDelegate.bitcoinListener.listenForAddress(address);
                }
            }
            if (this.stealthWallet != null) {
                var stealthPaymentAddresses = this.stealthWallet.getUnspentPaymentAddresses();
                for (var i = 0; i < stealthPaymentAddresses.length; i++) {
                    var address = stealthPaymentAddresses[i];
                    this.appDelegate.bitcoinListener.listenForAddress(address);
                }
                if (this.stealthWallet.isListeningToStealthPayment == false) {
                    var challenge = this.appDelegate.stealthWebSocket.challenge;
                    var addrAndSig = this.stealthWallet.getStealthAddressAndSignatureFromChallenge(challenge);
                    this.appDelegate.stealthWebSocket.sendMessageSubscribeToStealthAddress(addrAndSig.addr, addrAndSig.sig);
                }
            }
        };

        return TLAccountObject;
    });
