'use strict';

define(['model/TLCoin', 'model/TLBitcoinJSWrapper', 'model/TLWalletUtils', 'model/TLStealthAddress', 'model/TLCrypto'],
    function(TLCoin, TLBitcoinJSWrapper, TLWalletUtils, TLStealthAddress, TLCrypto) {
        var DUST_AMOUNT = 546;

        function TLSpaghettiGodSend(appDelegate, isTestnet) {
            this.appDelegate = appDelegate;
            this.isTestnet = isTestnet;
            this.accountObject = null;
            this.addressObject = null;
        }

        TLSpaghettiGodSend.prototype.clearFromAccountAndAddress = function() {
            this.addressObject = null;
            this.accountObject = null;
        };

        TLSpaghettiGodSend.prototype.getSelectedSendObject = function() {
            if (this.addressObject) {
                return this.addressObject;
            }
            return this.addressObject;
        };

        TLSpaghettiGodSend.prototype.setOnlyFromAccount = function(accountObject) {
            this.addressObject = null;
            this.accountObject = accountObject;
        };

        TLSpaghettiGodSend.prototype.getStealthAddress = function() {
            if (this.accountObject && this.accountObject.stealthWallet) {
                return this.accountObject.stealthWallet.getStealthAddress();
            }
            return null;
        };

        TLSpaghettiGodSend.prototype.setOnlyFromAddress = function(addressObject) {
            this.addressObject = addressObject;
            this.accountObject = null;
        };

        TLSpaghettiGodSend.prototype.needWatchOnlyAccountPrivateKey = function( ) {
            if (this.accountObject) {
                return this.accountObject.isWatchOnly() && !this.accountObject.hasSetExtendedPrivateKeyInMemory();
            }
            return false;
        };

        TLSpaghettiGodSend.prototype.needWatchOnlyAddressPrivateKey = function() {
            if (this.addressObject) {
                return this.addressObject.isWatchOnly() && !this.addressObject.hasSetPrivateKeyInMemory();
            }
            return false;
        };

        TLSpaghettiGodSend.prototype.needEncryptedPrivateKeyPassword = function() {
            if (this.addressObject) {
                if (this.addressObject.isWatchOnly()) {
                    return TLBitcoinJSWrapper.isBIP38EncryptedKey(this.addressObject.privateKey);
                } else {
                    return this.addressObject.isPrivateKeyEncrypted() && !this.addressObject.hasSetPrivateKeyInMemory();
                }
            }
            return false;
        };

        TLSpaghettiGodSend.prototype.getEncryptedPrivateKey = function() {
            if (this.addressObject) {
                if (this.addressObject.isPrivateKeyEncrypted() == false) {
                    return null;
                }
                return this.addressObject.getEncryptedPrivateKey();
            }
            return null;
        };

        TLSpaghettiGodSend.prototype.getCurrentFromBalance = function() {
            if (this.accountObject) {
                return this.accountObject.getBalance();
            } else {
                return this.addressObject.getBalance();
            }
        };

        TLSpaghettiGodSend.prototype.createSignedSerializedTransactionHex = function(toAddressesAndAmounts, feeAmount,
                                                                                     error) {
            return this.createSignedSerializedTransactionHexWithStealthData(toAddressesAndAmounts, feeAmount, null, null, error);
        };

        TLSpaghettiGodSend.prototype.getCurrentFromUnspentOutputsSum = function() {
            if (this.accountObject) {
                return this.accountObject.getTotalUnspentSum();
            } else if (this.addressObject) {
                return this.addressObject.getUnspentSum();
            }
            return TLCoin.zero();
        };

        TLSpaghettiGodSend.prototype.getAndSetUnspentOutputs = function(successCallback, errorCallback) {
            if (this.accountObject) {
                var amount = this.accountObject.getBalance();
                if (amount.greater(TLCoin.zero())) {
                    this.accountObject.getUnspentOutputs(successCallback, errorCallback);
                }
            } else if (this.addressObject) {
                var amount = this.addressObject.getBalance()
                if (amount.greater(TLCoin.zero())) {
                    var self = this;
                    this.addressObject.appDelegate.blockExplorerAPI.getUnspentOutputs([this.addressObject.getAddress()], function(jsonData) {
                        if (jsonData != null) {
                            self.addressObject.setUnspentOutputs(jsonData["unspent_outputs"]);
                        }
                        successCallback();
                    }, function() {
                        errorCallback();
                    });
                }
            }
        }

        TLSpaghettiGodSend.prototype.createSignedSerializedTransactionHexWithStealthData = function(toAddressesAndAmounts, feeAmount,
                                                                                                    nonce, ephemeralPrivateKeyHex, error) {
            var inputsData = [];
            var outputsData = [];
            var outputValueSum = TLCoin.zero();
            for (var i = 0; i < toAddressesAndAmounts.length; i++) {
                var amount = toAddressesAndAmounts[i]["amount"];
                outputValueSum = outputValueSum.add(amount);
            }
            var valueNeeded = outputValueSum.add(feeAmount);
            var valueSelected = TLCoin.zero();

            var changeAddress = null;
            var dustAmount = 0;
            if (this.addressObject != null) {
                if (changeAddress == null) {
                    changeAddress = this.addressObject.getAddress();
                }
                var unspentOutputs = this.addressObject.getUnspentArray();
                for (var j = 0; j < unspentOutputs.length; j++) {
                    var unspentOutput = unspentOutputs[j];
                    var amount = unspentOutput["value"];
                    if (amount < DUST_AMOUNT) {
                        dustAmount += amount;
                        continue;
                    }
                    valueSelected = valueSelected.add(new TLCoin(amount));
                    var outputScript = unspentOutput["script"];
                    var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                        TLBitcoinJSWrapper.getNetwork(this.isTestnet));
                    if (address == null) {
                        console.log("address cannot be decoded. not normal pubkeyhash outputScript: " + outputScript);
                        continue;
                    }
                    if (address != changeAddress) {
                        throw new Error("! address == changeAddress");
                    }
                    inputsData.push({
                        "tx_hash": unspentOutput["tx_hash"],
                        "txid": unspentOutput["tx_hash_big_endian"],
                        "tx_output_n": unspentOutput["tx_output_n"],
                        "script": outputScript,
                        "private_key": this.addressObject.getPrivateKey()
                    });
                    if (valueSelected.greaterOrEqual(valueNeeded)) {
                        break;
                    }
                }
            }
            if (valueSelected.less(valueNeeded)) {
                changeAddress = null;
                if (this.accountObject != null) {
                    if (changeAddress == null) {
                        changeAddress = this.accountObject.getCurrentChangeAddress();
                        var stealthPaymentUnspentOutputs = [];
                        if (this.accountObject.stealthWallet != null) {
                            stealthPaymentUnspentOutputs = this.accountObject.getStealthPaymentUnspentOutputsArray();
                        }
                        var unspentOutputsUsingCount = 0;
                        for (var j = 0; j < stealthPaymentUnspentOutputs.length; j++) {
                            var unspentOutput = stealthPaymentUnspentOutputs[j];
                            var amount = unspentOutput["value"];
                            if (amount < DUST_AMOUNT) {
                                dustAmount += amount;
                                continue;
                            }
                            valueSelected = valueSelected.add(new TLCoin(amount));
                            var outputScript = unspentOutput["script"];
                            var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                                TLBitcoinJSWrapper.getNetwork(this.isTestnet));
                            if (address == null) {
                                console.log("address cannot be decoded. not normal pubkeyhash outputScript: " + outputScript);
                                continue;
                            }
                            inputsData.push({
                                "tx_hash": unspentOutput["tx_hash"],
                                "txid": unspentOutput["tx_hash_big_endian"],
                                "tx_output_n": unspentOutput["tx_output_n"],
                                "script": outputScript,
                                "private_key": this.accountObject.stealthWallet.getPaymentAddressPrivateKey(address)
                            });
                            if (valueSelected.greaterOrEqual(valueNeeded) && unspentOutputsUsingCount > 12) {
                                break;
                            }
                        }

                        var unspentOutputs = this.accountObject.getUnspentArray();
                        for (var j = 0; j < unspentOutputs.length; j++) {
                            var unspentOutput = unspentOutputs[j];
                            var amount = unspentOutput["value"];
                            if (amount < DUST_AMOUNT) {
                                dustAmount += amount;
                                continue;
                            }
                            valueSelected = valueSelected.add(new TLCoin(amount));
                            var outputScript = unspentOutput["script"];
                            var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                                TLBitcoinJSWrapper.getNetwork(this.isTestnet));
                            if (address == null) {
                                console.log("address cannot be decoded. not normal pubkeyhash outputScript: " + outputScript);
                                continue;
                            }

                            inputsData.push({
                                "tx_hash": unspentOutput["tx_hash"],
                                "txid": unspentOutput["tx_hash_big_endian"],
                                "tx_output_n": unspentOutput["tx_output_n"],
                                "script": outputScript,
                                "private_key": this.accountObject.getAccountPrivateKey(address)
                            });

                            if (valueSelected.greaterOrEqual(valueNeeded)) {
                                break;
                            }
                        }
                    }
                }
            }
            var realToAddresses = [];
            if (valueSelected.less(valueNeeded)) {
                if (dustAmount > 0) {
                    var dustCoinAmount = new TLCoin(dustAmount);

                    var amountCanSendString = this.appDelegate.currencyFormat.coinToProperBitcoinAmountString(valueNeeded.subtract(dustCoinAmount));
                    var bitcoinDenomination = this.appDelegate.currencyFormat.getBitcoinDisplay();
                    error("Insufficient Funds. Account contains bitcoin dust. You can only send up to " + amountCanSendString + bitcoinDenomination + " for now.");
                    return [null, realToAddresses];
                }
                var valueSelectedString = this.appDelegate.currencyFormat.coinToProperBitcoinAmountString(valueSelected);
                var valueNeededString = this.appDelegate.currencyFormat.coinToProperBitcoinAmountString(valueNeeded);
                var bitcoinDenomination = this.appDelegate.currencyFormat.getBitcoinDisplay();
                error("Insufficient Funds. Account balance is " + valueSelectedString + bitcoinDenomination +" when " +
                    valueNeededString + bitcoinDenomination + " is required.");
                return [null, realToAddresses];
            }

            var stealthOutputScripts = null;
            for (var i = 0; i < toAddressesAndAmounts.length; i++) {
                var toAddress = toAddressesAndAmounts[i]["address"];
                var amount = toAddressesAndAmounts[i]["amount"];
                if (!TLStealthAddress.isStealthAddress(toAddress, this.isTestnet)) {
                    realToAddresses.push(toAddress);
                    outputsData.push({
                        "to_address": toAddress,
                        "amount": amount.toNumber()
                    });
                } else {
                    if (stealthOutputScripts == null) {
                        stealthOutputScripts = [];
                    }
                    var ephemeralPrivateKey = ephemeralPrivateKeyHex != null ? ephemeralPrivateKeyHex : TLStealthAddress.generateEphemeralPrivkey();
                    var stealthDataScriptNonce = nonce != null ? nonce : TLStealthAddress.generateNonce();
                    var stealthDataScriptAndPaymentAddress = TLStealthAddress.createDataScriptAndPaymentAddressWithNounceAndEphemKey(toAddress,
                        ephemeralPrivateKey, stealthDataScriptNonce, this.isTestnet);
                    stealthOutputScripts.push(stealthDataScriptAndPaymentAddress[0]);
                    var paymentAddress = stealthDataScriptAndPaymentAddress[1];
                    realToAddresses.push(paymentAddress);
                    outputsData.push({
                        "to_address": paymentAddress,
                        "amount": amount.toNumber()
                    });
                }
            }
            var changeAmount = TLCoin.zero();
            if (valueSelected.greater(valueNeeded)) {
                if (changeAddress != null) {
                    changeAmount = valueSelected.subtract(valueNeeded);
                    outputsData.push({
                        "to_address": changeAddress,
                        "amount": changeAmount.toNumber()
                    });
                }
            }

            if (valueNeeded.greater(valueSelected)) {
                throw new Error("Send Error: not enough unspent outputs");
            }

            for (var i = 0; i < outputsData.length; i++) {
                var outputData = outputsData[i];
                var outputAmount = outputData["amount"];
                if (outputAmount <= DUST_AMOUNT) {
                    var dustAmountBitcoins = new TLCoin(DUST_AMOUNT).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                    error( "Cannot create transactions with outputs less then " + dustAmountBitcoins + " bitcoins.");
                    return [null, realToAddresses];
                }
            }


            function compareInputs(obj1, obj2) {
                var firstTxid = TLCrypto.hexStringToData(obj1["txid"]);
                var secondTxid = TLCrypto.hexStringToData(obj2["txid"]);
                for (var i = 0; i < firstTxid.length; i++) {
                    if (firstTxid[i] < secondTxid[i]) {
                        return -1;
                    } else if (firstTxid[i] > secondTxid[i]) {
                        return 1;
                    }
                }

                if (obj1.tx_output_n < obj2.tx_output_n) {
                    return -1;
                } else if (obj1.tx_output_n > obj2.tx_output_n) {
                    return 1;
                }
                return 0;
            }
            inputsData.sort(compareInputs);
            var hashes = [];
            var inputIndexes = [];
            var inputScripts = [];
            var privateKeys = [];
            for (var i = 0; i < inputsData.length; i++) {
                var sortedInput = inputsData[i];
                hashes.push(sortedInput["txid"]);
                inputIndexes.push(sortedInput["tx_output_n"]);
                privateKeys.push(sortedInput["private_key"]);
                inputScripts.push(sortedInput["script"]);
            }

            var isTestnet = this.isTestnet;
            function compareOutputs(obj1, obj2) {
                if (obj1["amount"] < obj2["amount"]) {
                    return -1;
                } else if (obj1["amount"] > obj2["amount"]) {
                    return 1;
                }

                var firstScript = TLBitcoinJSWrapper.getStandardPubKeyHashScriptFromAddress(obj1["to_address"], isTestnet);
                var secondScript = TLBitcoinJSWrapper.getStandardPubKeyHashScriptFromAddress(obj2["to_address"], isTestnet);

                var firstScriptData = TLCrypto.hexStringToData(firstScript);
                var secondScriptData = TLCrypto.hexStringToData(secondScript);
                for (var i = 0; i < firstScriptData.length; i++) {
                    if (firstScriptData[i] < secondScriptData[i]) {
                        return -1;
                    } else if (firstScriptData[i] > secondScriptData[i]) {
                        return 1;
                    }
                }
                return 0;
            }
            outputsData.sort(compareOutputs);
            var outputAmounts = [];
            var outputAddresses = [];
            for (var i = 0; i < outputsData.length; i++) {
                var sortedOutput = outputsData[i];
                outputAddresses.push(sortedOutput["to_address"]);
                outputAmounts.push(Number(sortedOutput["amount"]));
            }

            var txHexAndTxHash = TLBitcoinJSWrapper.createSignedSerializedTransactionHex(hashes, inputIndexes, inputScripts,
                outputAddresses, outputAmounts, privateKeys,
                stealthOutputScripts,  this.isTestnet);
            if (txHexAndTxHash != null) {
                return [txHexAndTxHash, realToAddresses];
            }
            error("Encountered error creating transaction. Please try again.");
            return [null, realToAddresses];
        };

        return TLSpaghettiGodSend;
    });
