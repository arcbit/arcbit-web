'use strict';

define(['model/TLStealthAddress', 'model/TLWalletJSONKeys', 'model/TLNetworking', 'model/TLBitcoinJSWrapper',
        'model/TLStealthExplorerAPI', 'model/TLTxObject', 'model/TLBlockExplorerAPI'],
    function(TLStealthAddress, TLWalletJSONKeys, TLNetworking, TLBitcoinJSWrapper, TLStealthExplorerAPI, TLTxObject, TLBlockExplorerAPI) {

        var MAX_CONSECUTIVE_INVALID_SIGNATURES = 4;
        var PREVIOUS_TX_CONFIRMATIONS_TO_COUNT_AS_SPENT = 12;
        var TIME_TO_WAIT_TO_CHECK_FOR_SPENT_TX = 86400; // 1 day in seconds

        function TLStealthWallet(appDelegate, stealthDict, accountObject, updateStealthPaymentStatuses) {
            this.appDelegate = appDelegate;
            this.needsRefreshing = true;
            this.challenge = '';
            this.unspentPaymentAddress2PaymentTxid = {};
            this.paymentAddress2PrivateKeyDict = {};
            this.paymentTxid2PaymentAddressDict = {};
            this.scanPublicKey = null;
            this.spendPublicKey = null;
            this.hasUpdateStealthPaymentStatuses = false;
            this.isListeningToStealthPayment = false;

            this.stealthWalletDict = stealthDict;
            this.accountObject = accountObject;
        }

        TLStealthWallet.prototype.getStealthAddress = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS];
        };

        TLStealthWallet.prototype.getStealthAddressScanKey = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SCAN_KEY];
        };

        TLStealthWallet.prototype.getStealthAddressSpendKey = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SPEND_KEY];
        };

        TLStealthWallet.prototype.getStealthAddressLastTxTime = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LAST_TX_TIME];
        };

        TLStealthWallet.prototype.getStealthAddressServers = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_SERVERS];
        };

        TLStealthWallet.prototype.paymentTxidExist = function(txid) {
            return this.paymentTxid2PaymentAddressDict[txid] != null;
        };

        TLStealthWallet.prototype.isPaymentAddress = function(address) {
            return this.paymentAddress2PrivateKeyDict[address] != null;
        };

        TLStealthWallet.prototype.getPaymentAddressPrivateKey = function(address) {
            return this.paymentAddress2PrivateKeyDict[address];
        };

        TLStealthWallet.prototype.setPaymentAddressPrivateKey = function(address, privateKey) {
            this.paymentAddress2PrivateKeyDict[address] = privateKey;
        };

        TLStealthWallet.prototype.getStealthAddressPayments = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS];
        };

        TLStealthWallet.prototype.getPaymentAddressForIndex = function(index) {
            var paymentDict = this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS][index];
            return paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
        };

        TLStealthWallet.prototype.getStealthAddressPaymentsCount = function() {
            return this.stealthWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS].length;
        };

        TLStealthWallet.prototype.getPaymentAddresses = function() {
            return Object.keys(this.paymentAddress2PrivateKeyDict);
        };

        TLStealthWallet.prototype.getUnspentPaymentAddresses = function() {
            return Object.keys(this.unspentPaymentAddress2PaymentTxid);
        };

        TLStealthWallet.prototype.getStealthAddressSpendPublicKey = function() {
            if (this.spendPublicKey == null) {
                var publicKeys = TLStealthAddress.getScanPublicKeyAndSpendPublicKey(this.getStealthAddress(), false);
                this.scanPublicKey = publicKeys[0];
                this.spendPublicKey = publicKeys[1];
            }
            return this.spendPublicKey;
        };

        TLStealthWallet.prototype.getStealthAddressScanPublicKey = function() {
            if (this.spendPublicKey == null) {
                var publicKeys = TLStealthAddress.getScanPublicKeyAndSpendPublicKey(this.getStealthAddress(), false);
                this.scanPublicKey = publicKeys[0];
                this.spendPublicKey = publicKeys[1];
            }
            return this.scanPublicKey;
        };

        TLStealthWallet.prototype.setUpStealthPaymentAddresses = function(updateStealthPaymentStatuses, isSetup, async, success, failure) {
            if (isSetup) {
                this.accountObject.removeOldStealthPayments();
            }
            var paymentsArray = this.getStealthAddressPayments();
            if (isSetup) {
                this.unspentPaymentAddress2PaymentTxid = {};
                this.paymentAddress2PrivateKeyDict = {};
                this.paymentTxid2PaymentAddressDict = {};
            }
            var possiblyClaimedTxidArray = [];
            var possiblyClaimedAddressArray = [];
            var possiblyClaimedTxTimeArray = [];
            var nowTime = Math.floor(Date.now() / 1000);
            for (var i = 0; i < paymentsArray.length; i++) {
                var paymentDict = paymentsArray[i];

                var address = paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
                var txid = paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TXID];
                var privateKey = paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY];
                if (isSetup) {
                    this.paymentTxid2PaymentAddressDict[txid] = address;
                    this.paymentAddress2PrivateKeyDict[address] = privateKey;
                }

                var stealthPaymentStatus = paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS];

                if (isSetup) {
                    if (stealthPaymentStatus == TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT) {
                        this.unspentPaymentAddress2PaymentTxid[address] = txid
                    }
                }

                // dont check to remove last STEALTH_PAYMENTS_FETCH_COUNT payment addresses
                if (i >= paymentsArray.length - TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT) {
                    continue;
                }

                if (stealthPaymentStatus == TLWalletJSONKeys.TLStealthPaymentStatus.CLAIMED || stealthPaymentStatus == TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT) {
                    var lastCheckTime = paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHECK_TIME];
                    if ((nowTime - lastCheckTime) > TIME_TO_WAIT_TO_CHECK_FOR_SPENT_TX) {
                        possiblyClaimedTxidArray.push(txid);
                        possiblyClaimedAddressArray.push(address);
                        possiblyClaimedTxTimeArray.push(lastCheckTime);
                    }
                }
            }
            if (updateStealthPaymentStatuses) {
                this.hasUpdateStealthPaymentStatuses = true;
                if (async) {
                    this.addOrSetStealthPaymentsWithStatus(possiblyClaimedTxidArray, possiblyClaimedAddressArray, possiblyClaimedTxTimeArray, false);
                } else {
                    this.addOrSetStealthPaymentsWithStatus(possiblyClaimedTxidArray, possiblyClaimedAddressArray, possiblyClaimedTxTimeArray, false, function() {
                        success ? success() : null;
                    }, function() {
                        failure ? failure() : null;
                    });
                }
            }
        };

        TLStealthWallet.prototype.updateStealthPaymentStatusesAsync = function() {
            this.setUpStealthPaymentAddresses(true, false, true);
        };

        TLStealthWallet.prototype.getPrivateKeyForAddress = function(expectedAddress, script) {
            var scanKey = this.getStealthAddressScanKey();
            var spendKey = this.getStealthAddressSpendKey();
            var secret = TLStealthAddress.getPaymentAddressPrivateKeySecretFromScript(script, scanKey, spendKey);
            if (secret != null) {
                var outputAddress = TLBitcoinJSWrapper.getAddressFromSecret(secret);
                if (outputAddress == expectedAddress) {
                    return TLBitcoinJSWrapper.privateKeyFromSecret(secret);
                }
            }
            return null;
        };

        TLStealthWallet.prototype.isCurrentServerWatching = function() {
            var currentServerURL =  this.appDelegate.preferences.getStealthExplorerURL();
            var stealthAddressServersDict =  this.getStealthAddressServers();
            var stealthServerDict = stealthAddressServersDict[currentServerURL];
            if (stealthServerDict != null) {
                return stealthServerDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING];
            } else {
                this.accountObject.setStealthAddressServerStatus(currentServerURL, false);
                var serverAttributes = {};
                serverAttributes[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING] = false;
                stealthAddressServersDict[currentServerURL] = serverAttributes;
                return false;
            }
        };

        TLStealthWallet.prototype.checkIfHaveStealthPayments = function(successCallback, failureCallback) {
            var stealthAddress = this.getStealthAddress();
            var scanKey = this.getStealthAddressScanKey();
            var spendKey = this.getStealthAddressSpendKey();
            var scanPublicKey = this.getStealthAddressScanPublicKey();
            var self = this;
            this.watchStealthAddress(stealthAddress, scanKey, spendKey, scanPublicKey, 0, function(success) {
                if (success) {
                    self.getStealthPayments(stealthAddress, scanKey, spendKey, scanPublicKey, 0, 0, function(gotOldestPaymentAddressesAndPayments) {
                        if (gotOldestPaymentAddressesAndPayments != null &&
                            (gotOldestPaymentAddressesAndPayments['payments'] != null && gotOldestPaymentAddressesAndPayments['payments'].length > 0)) {
                            successCallback(true);
                        } else {
                            successCallback(false);
                        }
                    }, function() {
                        failureCallback(false);
                    });
                } else {
                    failureCallback(false);
                }
            }, function() {
                failureCallback(false);
            });
        };

        TLStealthWallet.prototype.checkToWatchStealthAddress = function(successCallback, failureCallback) {
            var stealthAddress = this.getStealthAddress();
            if (this.isCurrentServerWatching() != true) {
                var scanKey = this.getStealthAddressScanKey();
                var spendKey = this.getStealthAddressSpendKey();
                var scanPublicKey = this.getStealthAddressScanPublicKey();
                var self = this;
                this.watchStealthAddress(stealthAddress, scanKey, spendKey, scanPublicKey, 0, function(success) {
                    if (success) {
                        var stealthAddressServersDict = self.getStealthAddressServers();
                        var currentServerURL =  self.appDelegate.preferences.getStealthExplorerURL();
                        stealthAddressServersDict[currentServerURL][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING] = true;
                        self.accountObject.setStealthAddressServerStatus(currentServerURL, true);
                    }
                    successCallback();
                }, function() {
                    failureCallback();
                });
            } else {
                successCallback();
            }
        };

        TLStealthWallet.prototype.getStealthAddressAndSignatureFromChallenge = function(challenge) {
            var privKey = this.getStealthAddressScanKey();
            var signature = TLBitcoinJSWrapper.getSignature(privKey, challenge);
            var stealthAddress = this.getStealthAddress();
            return {addr:stealthAddress, sig:signature};
        };

        TLStealthWallet.prototype.getChallengeAndSign = function(stealthAddress, privKey, pubKey, success, failure) {
            if (this.needsRefreshing) {
                var self = this;
                this.appDelegate.stealthExplorerAPI.getChallenge(function(jsonData) {
                    if (jsonData[TLStealthExplorerAPI.SERVER_ERROR_CODE] != null) {
                        success(null);
                    } else {
                        self.challenge = jsonData['challenge'];
                        self.needsRefreshing = false;
                        var sig = TLBitcoinJSWrapper.getSignature(privKey, self.challenge);
                        success(sig);
                    }
                }, function (response) {
                    failure(response);
                });
            } else {
                var sig = TLBitcoinJSWrapper.getSignature(privKey, this.challenge);
                success(sig);
            }
        };

        TLStealthWallet.prototype.addOrSetStealthPaymentsWithStatus = function(txidArray, addressArray, txTimeArray, isAddingPayments, success, failure) {
            if (txidArray.length == 0) {
                success ? success() : null;
                return;
            }

            var self = this;
            function handleFetchedUTXOs(jsonData) {
                var txid2hasUnspentOutputs = {};
                for (var i = 0; i < txidArray.length; i++) {
                    txid2hasUnspentOutputs[txidArray[i]] = false;
                }
                if (jsonData != null) {
                    var unspentOutputs = jsonData["unspent_outputs"];
                    if (unspentOutputs != null) {
                        for (var i = 0; i < unspentOutputs.length; i++) {
                            txid2hasUnspentOutputs[unspentOutputs[i]["tx_hash_big_endian"]] = true;
                        }
                    }
                }

                var nowTime = new Date().getTime() / 1000;
                let processedTxCount = 0;
                let txidArrayLength = txidArray.length;
                for (var i = 0; i < txidArray.length; i++) {
                    let txid = txidArray[i];
                    let paymentAddress = addressArray[i];
                    let txTime = txTimeArray[i];
                    if (txid2hasUnspentOutputs[txid] == false) {
                        self.appDelegate.blockExplorerAPI.getTx(txid, function(jsonData) {
                            if (jsonData == null) {
                                if (++processedTxCount == txidArrayLength) success ? success() : null;
                                return;
                            }
                            var stealthDataScriptAndOutputAddresses = TLStealthWallet.getStealthDataScriptAndOutputAddresses(jsonData);
                            if (stealthDataScriptAndOutputAddresses == null || stealthDataScriptAndOutputAddresses['stealthDataScript'] == null) {
                                if (++processedTxCount == txidArrayLength) success ? success() : null;
                                return;
                            }
                            if (stealthDataScriptAndOutputAddresses['outputAddresses'].indexOf(paymentAddress) != -1) {
                                var txObject = new TLTxObject(self.appDelegate, jsonData);

                                //Note: this confirmation count is not the confirmations for the tx that spent the stealth payment
                                var confirmations = txObject.getConfirmations();

                                if (confirmations >= PREVIOUS_TX_CONFIRMATIONS_TO_COUNT_AS_SPENT) {
                                    if (isAddingPayments) {
                                        var privateKey = self.generateAndAddStealthAddressPaymentKey(stealthDataScriptAndOutputAddresses['stealthDataScript'], paymentAddress,
                                            txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.SPENT);
                                        if (privateKey) {
                                            self.setPaymentAddressPrivateKey(paymentAddress, privateKey);
                                        } else {
                                            console.log("no privateKey for " + paymentAddress);
                                        }
                                    } else {
                                        self.accountObject.setStealthPaymentStatus(txid, TLWalletJSONKeys.TLStealthPaymentStatus.SPENT, nowTime);
                                    }
                                } else {
                                    if (isAddingPayments) {
                                        var privateKey = self.generateAndAddStealthAddressPaymentKey(stealthDataScriptAndOutputAddresses['stealthDataScript'], paymentAddress,
                                            txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.CLAIMED);
                                        if (privateKey) {
                                            self.setPaymentAddressPrivateKey(paymentAddress, privateKey);
                                        } else {
                                            console.log("no privateKey for " + paymentAddress);
                                        }
                                    } else {
                                        self.accountObject.setStealthPaymentStatus(txid, TLWalletJSONKeys.TLStealthPaymentStatus.CLAIMED, nowTime);
                                    }
                                }
                            }
                            if (++processedTxCount == txidArrayLength) success ? success() : null;
                        }, function() {
                            if (++processedTxCount == txidArrayLength) failure ? failure() : null;
                        });
                    } else {
                        self.appDelegate.blockExplorerAPI.getTx(txid, function(jsonData) {
                            if (jsonData == null) {
                                if (++processedTxCount == txidArrayLength) success ? success() : null;
                                return;
                            }
                            var stealthDataScriptAndOutputAddresses = TLStealthWallet.getStealthDataScriptAndOutputAddresses(jsonData);
                            if (stealthDataScriptAndOutputAddresses == null || stealthDataScriptAndOutputAddresses['stealthDataScript'] == null) {
                                if (++processedTxCount == txidArrayLength) success ? success() : null;
                                return;
                            }
                            if (stealthDataScriptAndOutputAddresses['outputAddresses'].indexOf(paymentAddress) != -1) {
                                if (isAddingPayments) {
                                    var privateKey = self.generateAndAddStealthAddressPaymentKey(stealthDataScriptAndOutputAddresses['stealthDataScript'], paymentAddress,
                                        txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT);
                                    if (privateKey) {
                                        self.setPaymentAddressPrivateKey(paymentAddress, privateKey);
                                    } else {
                                        console.log("no privateKey for " + paymentAddress);
                                    }
                                } else {
                                    self.accountObject.setStealthPaymentStatus(txid, TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT, nowTime);
                                }

                            }
                            if (++processedTxCount == txidArrayLength) success ? success() : null;
                        }, function() {
                            if (++processedTxCount == txidArrayLength) failure ? failure() : null;
                        });
                    }
                }
            }

            this.appDelegate.blockExplorerAPI.getUnspentOutputs(addressArray, function(jsonData) {
                handleFetchedUTXOs(jsonData);
            }, function () {
                // blockchain.info api give 500 error if no utxos for given addresses
                if (self.appDelegate.blockExplorerAPI.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                    handleFetchedUTXOs({"unspent_outputs":[]});
                } else {
                    failure ? failure() : null;
                }
            });

        };

        TLStealthWallet.prototype.getAndStoreStealthPayments = function(isRestoringAccount, offset, success, failure) {
            var stealthAddress = this.getStealthAddress();
            var scanKey = this.getStealthAddressScanKey();
            var spendKey = this.getStealthAddressSpendKey();
            var scanPublicKey = this.getStealthAddressScanPublicKey();
            var self = this;
            this.getStealthPayments(stealthAddress, scanKey, spendKey, scanPublicKey, offset, 0, function(ret) {
                if (ret == null) {
                    success(null);
                    return;
                }
                var gotOldestPaymentAddresses = ret['gotOldestPaymentAddresses'];
                var latestTxTime = ret['latestTxTime'];
                var payments = ret['payments'];
                if (payments == null) {
                    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:[]});
                    return;
                }
                var txidArray = [];
                var addressArray = [];
                var txTimeArray = [];
                for (var i = payments.length-1; i >= 0; i--) {
                    var payment = payments[i];
                    var txid = payment["txid"];
                    if (self.paymentTxidExist(txid) == true) {
                        continue;
                    }
                    var addr = payment["addr"];
                    txidArray.push(txid);
                    addressArray.push(addr);
                    txTimeArray.push(payment["time"]);
                }
                if (txidArray.length == 0) {
                    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:[]});
                    return;
                }

                // must check if txids exist and are stealth payments that belong to this account before storing it
                //if (isRestoringAccount) {
                //    // if is isRestoringAccount add OrSetStealthPaymentsWithStatus is called at end
                //    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:addressArray});
                //} else {
                //cant use cuz cant amke it synchronos, hacked it with processedTxCount, works cuz is single threaded
                self.addOrSetStealthPaymentsWithStatus(txidArray, addressArray, txTimeArray, true, function() {
                    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:addressArray});
                }, function() {
                    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:addressArray});
                });
                //    success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:addressArray});
                //}
            }, function() {
                failure();
            });
        };

        TLStealthWallet.getStealthDataScriptAndOutputAddresses = function(jsonTxData) {
            var outsArray = jsonTxData["out"];
            if (outsArray != null) {
                var outputAddresses = [];
                var stealthDataScript = null;
                for (var i = 0; i < outsArray.length; i++) {
                    var output = outsArray[i];
                    var addr = output["addr"];
                    if (addr != null) {
                        outputAddresses.push(addr);
                    } else {
                        var script = output["script"];
                        if (script != null && script.length== 80) {
                            stealthDataScript = script;
                        }
                    }
                }
                return {stealthDataScript:stealthDataScript, outputAddresses:outputAddresses};
            }
            return null;
        };

        TLStealthWallet.prototype.generateAndAddStealthAddressPaymentKey = function(stealthAddressDataScript,
                                                                                    expectedAddress, txid, txTime, stealthPaymentStatus) {
            if (this.paymentTxidExist(txid) == true) {
                return null;
            }
            var privateKey = this.getPrivateKeyForAddress(expectedAddress, stealthAddressDataScript);
            if (privateKey != null) {
                this.unspentPaymentAddress2PaymentTxid[expectedAddress] = txid;
                this.paymentTxid2PaymentAddressDict[txid] = expectedAddress;
                this.setPaymentAddressPrivateKey(expectedAddress, privateKey);

                this.accountObject.addStealthAddressPaymentKey(privateKey, expectedAddress, txid, txTime, stealthPaymentStatus);
                return privateKey;
            } else {
                return null;
            }
        };

        TLStealthWallet.prototype.addStealthAddressPaymentKey = function(privateKey, paymentAddress, txid, txTime) {
            this.unspentPaymentAddress2PaymentTxid[paymentAddress] = txid;
            this.paymentTxid2PaymentAddressDict[txid] = paymentAddress;
            this.setPaymentAddressPrivateKey(paymentAddress, privateKey);
            this.accountObject.addStealthAddressPaymentKey(privateKey, paymentAddress, txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT);
            return true;
        };

        TLStealthWallet.prototype.getStealthPayments = function(stealthAddress, scanPriv, spendPriv, scanPublicKey, offset,
                                                                consecutiveInvalidSignatures, success, failure) {
            var self = this;
            this.getChallengeAndSign(stealthAddress, scanPriv, scanPublicKey, function(signature) {
                if (signature == null) {
                    failure();
                } else {
                    self.appDelegate.stealthExplorerAPI.getStealthPayments(stealthAddress, signature, offset, function(jsonData) {

                        var errorCode = jsonData[TLStealthExplorerAPI.SERVER_ERROR_CODE];
                        if (errorCode != null && errorCode == TLStealthExplorerAPI.INVALID_SIGNATURE_ERROR) {
                            self.needsRefreshing = true;
                            self.getChallengeAndSign(stealthAddress, scanPriv, scanPublicKey, function(signature) {
                                if (signature == null) {
                                    failure();
                                    return;
                                }
                                consecutiveInvalidSignatures += 1;
                                if (consecutiveInvalidSignatures > MAX_CONSECUTIVE_INVALID_SIGNATURES) {
                                    failure();
                                } else {
                                    self.getStealthPayments(stealthAddress, scanPriv, spendPriv, scanPublicKey, offset,
                                        consecutiveInvalidSignatures, success, failure);
                                }
                            }, function() {
                                failure();
                            });
                            //*/
                        } else {
                            var stealthPayments = jsonData['payments'];
                            if (stealthPayments.length == 0) {
                                success({gotOldestPaymentAddresses:true, latestTxTime:0, payments:stealthPayments});
                            } else {
                                var gotOldestPaymentAddresses = false;
                                var txTimeLowerBound = self.getStealthAddressLastTxTime();
                                var olderTxTime = stealthPayments[stealthPayments.length-1]["time"];
                                if (olderTxTime < txTimeLowerBound || stealthPayments.length < TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT) {
                                    gotOldestPaymentAddresses = true;
                                }
                                var latestTxTime = stealthPayments[0]["time"];
                                success({gotOldestPaymentAddresses:gotOldestPaymentAddresses, latestTxTime:latestTxTime, payments:stealthPayments});
                            }
                        }
                    }, function() {
                        failure();
                    });
                }
            }, function() {
                failure();
            });
        };

        TLStealthWallet.prototype.watchStealthAddress = function(stealthAddress, scanPriv, spendPriv, scanPublicKey, consecutiveInvalidSignatures, success, failure) {
            var self = this;
            this.getChallengeAndSign(stealthAddress, scanPriv, scanPublicKey, function(signature) {
                if (signature == null) {
                    failure();
                } else {
                    self.appDelegate.stealthExplorerAPI.watchStealthAddress(stealthAddress, scanPriv, signature, function(jsonData) {
                        var errorCode = jsonData[TLStealthExplorerAPI.SERVER_ERROR_CODE];
                        if (errorCode != null && errorCode == TLStealthExplorerAPI.INVALID_SIGNATURE_ERROR) {
                            self.needsRefreshing = true;
                            self.getChallengeAndSign(stealthAddress, scanPriv, scanPublicKey, function(signature) {
                                if (signature == null) {
                                    failure();
                                    return;
                                }
                                consecutiveInvalidSignatures += 1;
                                if (consecutiveInvalidSignatures > MAX_CONSECUTIVE_INVALID_SIGNATURES) {
                                    failure();
                                } else {
                                    self.watchStealthAddress(stealthAddress, scanPriv, spendPriv, scanPublicKey, success, failure, consecutiveInvalidSignatures);
                                }
                            }, function() {
                                failure();
                            });
                        } else {
                            if (jsonData['success']) {
                                success(jsonData['success']);
                                return;
                            }
                            failure();
                        }
                    }, function() {
                        failure();
                    });
                }
            }, function() {
                failure();
            });
        };

        return TLStealthWallet;
    });
