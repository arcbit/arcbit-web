'use strict';

define(['./module', 'frontend/port', 'arcbit', 'bitcoinjs-lib', 'model/TLStealthAddress', 'model/TLBlockExplorerAPI',
        'model/TLCoin', 'model/TLWalletUtils', 'model/TLHDWalletWrapper', 'model/TLBitcoinJSWrapper', 'model/TLTxFeeAPI'],
    function (controllers, Port, ArcBit, Bitcoin, TLStealthAddress, TLBlockExplorerAPI, TLCoin,
              TLWalletUtils, TLHDWalletWrapper, TLBitcoinJSWrapper, TLTxFeeAPI) {
        controllers.controller('WalletSendCtrl', ['$scope', '$window', 'notify', 'modals', '$animate', '$timeout', '$history', '$tabs', 'sounds', '_Filter',
            function($scope, $window, notify, modals, $animate, $timeout, $history, $tabs, sounds, _) {

                $scope.quicksend = {showFee:false, fields:[]};

                var identity = ArcBit.getIdentity();
                var transactionHex = null;
                var transactionHash = null;
                var toStealthAddress = null;
                var toAddressesAndAmount = null;

                // If shouldUpdateFieldWithRestOfFunds is true then parameter field and FieldIdx will exist otherwise is null. This is not very clean, should fixup
                var checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField = function(successCallback, failureCallback) {
                    setFromPocket();
                    if (identity.appDelegate.preferences.enabledDynamicFee()) {
                        if (!identity.appDelegate.godSend.haveUpDatedUTXOs()) {
                            identity.appDelegate.godSend.getAndSetUnspentOutputs(function() {
                               checkToFetchDynamicFeesAndUpdateFeeAmountField(successCallback, failureCallback);
                            }, function() {
                                //notify.error(_("TLDisplayStrings.ERROR_FETCHING_UNSPENT_OUTPUTS_TRY_AGAIN_LATER_STRING"));
                                failureCallback ? failureCallback() : null;
                            });
                        } else {
                            checkToFetchDynamicFeesAndUpdateFeeAmountField(successCallback, failureCallback);
                        }
                    } else {
                        updateFeeAmountField(false, successCallback, failureCallback);
                    }
                };

                var checkToFetchDynamicFeesAndUpdateFeeAmountField = function(successCallback, failureCallback) {
                    if (!identity.appDelegate.txFeeAPI.haveUpdatedCachedDynamicFees()) {
                        identity.appDelegate.txFeeAPI.getDynamicTxFee(function(jsonData) {
                            updateFeeAmountField(true, successCallback, failureCallback)
                        }, function() {
                            //notify.error(_("TLDisplayStrings.UNABLE_TO_QUERY_DYNAMIC_FEES_STRING"));
                            updateFeeAmountField(false, successCallback, failureCallback)
                        });
                    } else {
                        updateFeeAmountField(true, successCallback, failureCallback)
                    }
                };

                var updateFeeAmountField = function(useDynamicFees, successCallback, failureCallback) {
                    var fee;
                    if (useDynamicFees) {
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
                        }

                        var dynamicFeeSatoshis = identity.appDelegate.txFeeAPI.getCachedDynamicFee()
                        if (dynamicFeeSatoshis != null) {
                            var txSizeBytes;
                            if (accountObject) {
                                var inputCount = accountObject.stealthPaymentUnspentOutputsCount + accountObject.unspentOutputsCount;
                                txSizeBytes = identity.appDelegate.godSend.getEstimatedTxSize(inputCount, $scope.quicksend.fields.length);
                            } else if (addressObject) {
                                txSizeBytes = identity.appDelegate.godSend.getEstimatedTxSize(addressObject.unspentOutputsCount, $scope.quicksend.fields.length);
                            } else {
                                return; //should not happen
                            }
                            fee = new TLCoin(txSizeBytes*dynamicFeeSatoshis);
                        } else {
                            fee = new TLCoin(identity.appDelegate.preferences.getTransactionFee());
                        }
                    } else {
                        fee = new TLCoin(identity.appDelegate.preferences.getTransactionFee());
                    }
                    $scope.quicksend.bitcoinFeeAmount = identity.appDelegate.currencyFormat.coinToProperBitcoinAmountString(fee);
                    $scope.updateFiatFeeAmount();
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    successCallback ? successCallback() : null;
                };

                var preFetchUTXOsAndDynamicFees = function(useDynamicFees) {
                    if (identity.appDelegate.preferences.enabledDynamicFee()) {
                        if (!identity.appDelegate.txFeeAPI.haveUpdatedCachedDynamicFees()) {
                            identity.appDelegate.txFeeAPI.getDynamicTxFee(function(jsonData) {
                            }, function() {
                            });
                        }
                        if (!identity.appDelegate.godSend.haveUpDatedUTXOs()) {
                            identity.appDelegate.godSend.getAndSetUnspentOutputs(function() {
                            }, function() {
                            });
                        }
                    }
                };

                $scope.saveToAddress = function(address, idx) {
                    identity.appDelegate.sendFormsData[idx].address = address;
                };
                $scope.updateFiatAmount = function(field, idx) {
                    field.fiatAmount = identity.appDelegate.currencyFormat.properBitcoinStringToFiatString(field.bitcoinAmount);
                    identity.appDelegate.sendFormsData[idx].amount = field.bitcoinAmount;
                    preFetchUTXOsAndDynamicFees();
                };
                $scope.updateBitcoinAmount = function(field, idx) {
                    field.bitcoinAmount = identity.appDelegate.currencyFormat.fiatStringToProperBitcoinString(field.fiatAmount);
                    identity.appDelegate.sendFormsData[idx].amount = field.bitcoinAmount;
                    preFetchUTXOsAndDynamicFees();
                };
                $scope.updateFiatFeeAmount = function() {
                    $scope.quicksend.fiatFeeAmount = identity.appDelegate.currencyFormat.properBitcoinStringToFiatString($scope.quicksend.bitcoinFeeAmount);
                };
                $scope.updateBitcoinFeeAmount = function() {
                    $scope.quicksend.bitcoinFeeAmount = identity.appDelegate.currencyFormat.fiatStringToProperBitcoinString($scope.quicksend.fiatFeeAmount);
                };

                if (identity.appDelegate.preferences) {
                    var preferences = identity.appDelegate.preferences;
                    $scope.quicksend.bitcoinCode = preferences.getBitcoinDenomination();
                    $scope.quicksend.fiatCode = preferences.getCurrency();
                    $scope.quicksend.bitcoinFeeAmount = identity.appDelegate.currencyFormat.coinToProperBitcoinAmountString(
                        new TLCoin(preferences.getTransactionFee()));
                    $scope.updateFiatFeeAmount();
                    for (var i = 0; i < identity.appDelegate.sendFormsData.length; i++) {
                        var sendFormData = identity.appDelegate.sendFormsData[i];
                        var field = {fiatAmount:null, bitcoinAmount:sendFormData.amount, address:sendFormData.address};
                        $scope.quicksend.fields.push(field);
                        $scope.updateFiatAmount(field, i);
                    }
                }

                $scope.addRecipient = function() {
                    $scope.quicksend.fields.push({fiatAmount:null, bitcoinAmount:null, address:null});
                    identity.appDelegate.sendFormsData.push({address: null, amount: null});
                    checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField();
                };

                $scope.removeRecipient = function(idx) {
                    $scope.quicksend.fields.splice(idx, 1);
                    identity.appDelegate.sendFormsData.splice(idx, 1);
                    checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField();
                };

                $scope.removeAllRecipient = function() {
                    $scope.quicksend.fields = [{fiatAmount:null, bitcoinAmount:null, address:null}];
                    identity.appDelegate.sendFormsData = [{address: null, amount: null}];
                };

                var updateFieldWithRestOfFunds = function(field, idx) {
                    var leftBalance = $history.getSelectedAccountBalance();
                    var currencyFormat = identity.appDelegate.currencyFormat;

                    if ($scope.quicksend.bitcoinFeeAmount) {
                        var feeAmount = identity.appDelegate.currencyFormat.properBitcoinAmountStringToCoin($scope.quicksend.bitcoinFeeAmount);
                        leftBalance = leftBalance.subtract(feeAmount);
                    }

                    for (var i = 0; i < identity.appDelegate.sendFormsData.length; i++) {
                        if (i == idx) {
                            continue;
                        }
                        var sendFormData = identity.appDelegate.sendFormsData[i];
                        if (sendFormData.amount) {
                            var amount = currencyFormat.properBitcoinAmountStringToCoin(sendFormData.amount);
                            leftBalance = leftBalance.subtract(amount);
                        }
                    }

                    if (leftBalance.greater(TLCoin.zero())) {
                        var bitcoinAmount = currencyFormat.coinToProperBitcoinAmountString(leftBalance);
                        field.bitcoinAmount = bitcoinAmount;
                        identity.appDelegate.sendFormsData[idx].amount = bitcoinAmount;
                    } else {
                        field.bitcoinAmount = '0';
                        identity.appDelegate.sendFormsData[idx].amount = '0';
                    }
                    $scope.updateFiatAmount(field, idx);
                };

                $scope.useAllFunds = function(field, idx) {
                    checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField(function() {
                        updateFieldWithRestOfFunds(field, idx);
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }, function() {
                        updateFieldWithRestOfFunds(field, idx);
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                };

                $scope.pickContact = function(field, idx) {
                    modals.open('pick-contact', {type: 'address'}, function(addr) {
                        field.address = addr;
                        identity.appDelegate.sendFormsData[idx].address = addr;
                    });
                };

                $scope.clickedShowFee = function() {
                    $scope.quicksend.showFee =! $scope.quicksend.showFee;
                    checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField();
                };

                $scope.getAddressFromQRCode = function(field, idx) {
                    modals.scanQr(function(data) {
                        var pars = TLWalletUtils.parseURI(data);
                        if (!pars || !pars.address) {
                            notify.warning(_('URI not supported'));
                            return;
                        }
                        field.address = pars.address;
                        if (pars.amount != null) {
                            var amountCoin = TLCoin.fromString(pars.amount, TLCoin.TLBitcoinDenomination.BTC);
                            field.bitcoinAmount = identity.appDelegate.currencyFormat.coinToProperBitcoinAmountString(amountCoin);
                            $scope.updateFiatAmount(field, idx);
                        }
                        identity.appDelegate.sendFormsData[idx].address = pars.address;
                        sounds.play('keygenEnd');
                    });
                };

                var setFromPocket = function() {
                    var identity = ArcBit.getIdentity();
                    var accountType = $tabs.pocketType;
                    var idx = $tabs.pocketId;
                    if (accountType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        var accountObject = identity.appDelegate.accounts.getAccountObjectForAccountIdxNumber(idx);
                        identity.appDelegate.godSend.setOnlyFromAccount(accountObject);
                    } else if (accountType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForAccountIdxNumber(idx);
                        identity.appDelegate.godSend.setOnlyFromAccount(accountObject);
                    } else if (accountType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForAccountIdxNumber(idx);
                        identity.appDelegate.godSend.setOnlyFromAccount(accountObject);
                    } else if (accountType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                        var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.godSend.setOnlyFromAddress(importedAddress);
                    } else if (accountType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                        var importedAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.godSend.setOnlyFromAddress(importedAddress);
                    }
                };

                var createAndSetTxHex = function(tos, totalInputtedAmount, feeAmount, successCallback, errorCallback) {
                    identity.appDelegate.godSend.getAndSetUnspentOutputs(function() {
                        var unspentOutputsSum = identity.appDelegate.godSend.getCurrentFromUnspentOutputsSum();
                        var currencyFormat = identity.appDelegate.currencyFormat;
                        if (unspentOutputsSum.less(totalInputtedAmount)) {
                            // can only happen if unspentOutputsSum is for some reason less then the balance computed from the transactions, which it shouldn't
                            var unspentOutputsSumString = currencyFormat.coinToProperBitcoinAmountStringWithSymbol(unspentOutputsSum);
                            notify.warning(_("Insufficient Funds. Account only has a balance of") + ' ' + unspentOutputsSumString);
                            return;
                        }
                        var isSelfStealthPayment = false;
                        toAddressesAndAmount = [];
                        for (var i = 0; i < tos.length; i++) {
                            var amount = currencyFormat.properBitcoinAmountStringToCoin(tos[i].bitcoinAmount);
                            toAddressesAndAmount.push({address:tos[i].address, amount:amount});
                            if (tos[i].address == identity.appDelegate.godSend.getStealthAddress()) {
                                isSelfStealthPayment = true;
                            }
                        }

                        var ret = identity.appDelegate.godSend.createSignedSerializedTransactionHex(toAddressesAndAmount, feeAmount, function(errorString) {
                            notify.warning(errorString);
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                        console.log("txHexAndTxHash " + JSON.stringify(ret));

                        var txHexAndTxHash = ret[0];
                        var realToAddress = ret[1];
                        if (txHexAndTxHash == null) {
                            return;
                        }
                        transactionHex = txHexAndTxHash["txHex"];
                        if (transactionHex == null) {
                            return;
                        }
                        transactionHash = txHexAndTxHash["txHash"];

                        if (isSelfStealthPayment) {
                            identity.appDelegate.pendingSelfStealthPaymentTxid = transactionHash;
                        } else {
                            identity.appDelegate.pendingSelfStealthPaymentTxid = null;
                        }

                        for (var i = 0; i < realToAddress.length; i++) {
                            identity.appDelegate.bitcoinListener.listenForAddress(realToAddress[i]);
                        }

                        successCallback ? successCallback() : null;
                    }, function() {
                        notify.warning(_("Fund does not exist"));
                        errorCallback ? errorCallback() : null;
                    });
                };

                var pushTx = function() {
                    $animate.enabled(false);
                    modals.showSpinner('');
                    $timeout(function() {
                        identity.appDelegate.pushTxAPI.sendTx(transactionHex, transactionHash, toStealthAddress, function(jsonData) {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            $scope.removeAllRecipient();
                            notify.success(_("Payment sent"));
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }

                            for (var i = 0; i < toAddressesAndAmount.length; i++) {
                                var label = identity.appDelegate.appWallet.getLabelForAddress(toAddressesAndAmount[i]['address']);
                                if (label != null) {
                                    identity.appDelegate.appWallet.setTransactionTag(transactionHash, label);
                                    break;
                                }
                            }

                            transactionHex = transactionHash = toStealthAddress = null;
                            $timeout(function(){
                                if (modals.spinnerShowing) {
                                    $history.fetchSelectedAccountBalance(true);
                                    modals.cancel();
                                    if(!$scope.$$phase) {
                                        $scope.$apply();
                                    }
                                }
                            }, 13000, false);
                        }, function(response) {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            notify.error(_('Error') + ': ' + response.status + ' ' + response.data);
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                            transactionHex = transactionHash = toStealthAddress = null;;
                        });
                    }, 30, false);
                };

                var showFinalPromptReviewTx = function() {
                    var haveInvalidAddress = false;
                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {
                        if ($scope.quicksend.fields[i].address == null
                            || !TLBitcoinJSWrapper.isValidAddress($scope.quicksend.fields[i].address, identity.appDelegate.appWallet.isTestnet())) {
                            haveInvalidAddress = true;
                            break;
                        }
                    }
                    if (haveInvalidAddress) {
                        notify.warning(_('Invalid address'));
                        return;
                    }
                    var feeAmount = identity.appDelegate.currencyFormat.properBitcoinAmountStringToCoin($scope.quicksend.bitcoinFeeAmount);
                    if (feeAmount == null) {
                        notify.warning(_('Missing fee amount'));
                        return;
                    }

                    var currencyFormat = identity.appDelegate.currencyFormat;
                    var haveInvalidAmount = false;
                    var totalInputtedAmount = TLCoin.zero();
                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {
                        if ($scope.quicksend.fields[i].bitcoinAmount == null) {
                            haveInvalidAmount = true;
                            break;
                        } else {
                            var amount = currencyFormat.properBitcoinAmountStringToCoin($scope.quicksend.fields[i].bitcoinAmount);
                            totalInputtedAmount.add(amount);
                            if (amount.equalTo(TLCoin.zero())) {
                                haveInvalidAmount = true;
                                break;
                            }
                        }
                    }
                    if (haveInvalidAmount) {
                        notify.warning(_('Must enter amount greater then zero'));
                        return;
                    }

                    var amountNeeded = totalInputtedAmount.add(feeAmount);
                    var sendFromBalance = $history.getSelectedAccountBalance();
                    if (amountNeeded.greater(sendFromBalance)) {
                        //var msg = " You have " + currencyFormat.coinToProperBitcoinAmountString(sendFromBalance) + " " +
                        //    currencyFormat.getBitcoinDisplay() + ", but " + currencyFormat.coinToProperBitcoinAmountString(amountNeeded) +
                        //    " " + currencyFormat.getBitcoinDisplay() + " is needed.";
                        //notify.warning(_('Insufficient Balance') +': ' + msg);
                        notify.warning(_('Insufficient Funds'));
                        return;
                    }

                    var bitcoinCode = preferences.getBitcoinDenomination();
                    var currency = preferences.getCurrency();
                    var tos = $scope.quicksend.fields;
                    var feeAmountDisplay = currencyFormat.coinToProperBitcoinAmountString(feeAmount);

                    $timeout(function() {
                        createAndSetTxHex(tos, totalInputtedAmount, feeAmount);
                    }, 150, false);
                    modals.paymentReview(tos, bitcoinCode, currency, feeAmountDisplay, preferences.enabledAdvancedMode(), function() {
                        if (transactionHex == null || transactionHash == null) {
                            createAndSetTxHex(tos, totalInputtedAmount, feeAmount, function() {
                                pushTx();
                            });
                            return;
                        } else {
                            pushTx();
                        }
                    }, function(reason, vars) {
                        if (reason == 'dont_dismiss') {
                            if (transactionHex == null) {
                                vars.txHex = _('Transaction Hex Loading...');
                                createAndSetTxHex(tos, totalInputtedAmount, feeAmount, function() {
                                    vars.txHex = transactionHex;
                                    if (!$scope.$$phase) {
                                        $scope.$apply();
                                    }
                                });
                            } else {
                                vars.txHex = transactionHex;
                            }
                        } else {
                            transactionHex = null;
                            transactionHash = null;
                        }
                    });
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                };

                var handleTemporaryImportPrivateKey = function(privKey) {
                    if (!TLBitcoinJSWrapper.isBIP38EncryptedKey(privKey) && !TLBitcoinJSWrapper.isValidPrivateKey(privKey)) {
                        notify.error(_('Invalid Private Key'));
                    } else {
                        var success = identity.appDelegate.godSend.addressObject.setPrivateKeyInMemory(privKey);
                        if (success) {
                            $history.pocket.hasTmpKey = identity.appDelegate.godSend.addressObject.hasSetPrivateKeyInMemory();
                            notify.success(_('Imported'));
                        } else {
                            notify.error(_('Private key does not match address'));
                            identity.appDelegate.godSend.addressObject.clearPrivateKeyFromMemory();
                        }
                    }
                };
                var handleIsBIP38EncryptedKey = function(inputtedKey, password) {
                    var identity = ArcBit.getIdentity();

                    $animate.enabled(false);
                    modals.showSpinner(_('Decrypting Private Key'));
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                    $timeout(function() {
                        TLBitcoinJSWrapper.privateKeyFromEncryptedPrivateKey(inputtedKey, password, function(decryptedKey) {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            notify.success(_("Private key decrypted"));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                            handleTemporaryImportPrivateKey(decryptedKey);
                        }, function() {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            notify.error(_("Incorrect password"));
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }, function (errorStr) {
                            $animate.enabled(identity.appDelegate.preferences.getAnimation());
                            modals.cancel();
                            if (errorStr == 'Invalid Private Key') {
                                notify.error(_('Invalid Private Key'));
                            } else {
                                notify.error(errorStr);
                            }
                            if(!$scope.$$phase) {
                                $scope.$apply();
                            }
                        });
                    }, 30, false);
                }

                var showPromptReviewTx = function() {
                    var accountIdx = $tabs.pocketId;
                    var identity = ArcBit.getIdentity();
                    if (identity.appDelegate.godSend.needWatchOnlyAccountPrivateKey()) {
                        modals.promptForInput(_("Account private key missing"), _("Do you want to temporary import your account private key? Alternatively you can authorize this transaction offline by using ArcBit's brain wallet tool."), "xprv...", function(input) {
                            if (!TLHDWalletWrapper.isValidExtendedPrivateKey(input, TLBitcoinJSWrapper.getNetwork(identity.appDelegate.appWallet.isTestnet()))) {
                                notify.warning(_('Invalid account private key'));
                                showPromptReviewTx();
                            } else {
                                var success = identity.appDelegate.godSend.accountObject.setExtendedPrivateKeyInMemory(input);
                                if (!success) {
                                    notify.warning(_('Account private key does not match imported account public key'));
                                    showPromptReviewTx();
                                } else {
                                    $history.pocket.hasTmpAccountKey = identity.appDelegate.godSend.accountObject.hasSetExtendedPrivateKeyInMemory();
                                    notify.success(_('Imported'));
                                }
                            }
                        });
                    } else if (identity.appDelegate.godSend.needWatchOnlyAddressPrivateKey()) {
                        modals.promptForInput(_("Private key missing"), _("Do you want to temporary import your private key?"), _("Input private key..."), function(privKey) {
                            handleTemporaryImportPrivateKey(privKey);
                        });
                    } else if (identity.appDelegate.godSend.needEncryptedPrivateKeyPassword()) {

                        modals.password(_("Private key is encrypted"), function(password) {
                            var encryptedPrivateKey = identity.appDelegate.godSend.addressObject.getEncryptedPrivateKey();
                            handleIsBIP38EncryptedKey(encryptedPrivateKey, password);
                        });
                    } else {
                        showFinalPromptReviewTx();
                    }
                };

                $scope.reviewPayment = function() {
//var receivedAmount = ArcBit.getIdentity().appDelegate.currencyFormat.getProperAmount(new TLCoin(1234));//DEBUG
//identity.appDelegate.postEvent('gui', {'type': 'new_tx', 'receivedAmount': receivedAmount, 'receivedTo': 'fake_addr'}); //DEBUG

                    setFromPocket();
                    transactionHex = null;
                    transactionHash = null;
                    if ($scope.quicksend.bitcoinFeeAmount == null) {
                        notify.warning(_('Missing fee amount'));
                        return;
                    }

                    var isTestnet = identity.appDelegate.appWallet.isTestnet();
                    var stealthAddressCount = 0;
                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {
                        if ($scope.quicksend.fields[i].address != null && TLStealthAddress.isStealthAddress($scope.quicksend.fields[i].address, isTestnet)) {
                            if (!TLWalletUtils.ENABLE_STEALTH_ADDRESS) {
                                notify.error(_('Reusable address payments are disabled until further notice.'));
                                return;
                            }
                            toStealthAddress = $scope.quicksend.fields[i].address;
                            stealthAddressCount++;
                        }
                    }
                    if (stealthAddressCount > 1) {
                        notify.warning(_('Only one reusable address recipient per transaction allowed'));
                        return;
                    }

                    if (stealthAddressCount > 0 && preferences.enabledShowStealthPaymentNote()) {
                        modals.promptForOK(_('Note'), _('You are making a payment to a reusable address. Make sure that the receiver can see the payment made to them. (All ArcBit reusable addresses are compatible with other ArcBit wallet)'), null, function() {
                            preferences.setEnabledShowStealthPaymentNote(false);
                        });
                        return;
                    }

                    if (stealthAddressCount > 0 && preferences.enabledShowStealthPaymentDelay() &&
                        preferences.getSelectedBlockExplorerAPI() == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                        modals.promptForOK(_("Warning"), _('Sending payment to a reusable address might take longer to show up then a normal transaction with the blockchain.info API. You might have to wait until at least 1 confirmation for the transaction to show up. This is due to the limitations of the blockchain.info API. For reusable address payments to show up faster, configure your app to use the Insight API in advance settings.'), null, function() {
                            preferences.setEnabledShowStealthPaymentDelay(false);
                        });
                        return;
                    }
                    // if fee amount is displayed, that value overrides all other settings on review payment
                    if ($scope.quicksend.showFee) {
                        showPromptReviewTx();
                    } else {
                        checkToFetchUTXOsAndDynamicFeesAndUpdateFeeAmountField(function() {
                           showPromptReviewTx();
                        }, function() {
                           showPromptReviewTx();
                        });
                    }
                };

                Port.connectNg('wallet', $scope, function(data) {
                    if (data.type == 'bitcoinuri') {
                        var pars = TLWalletUtils.parseURI(data.url);
                        if (!pars || !pars.address) {
                            notify.warning(_('URI not supported'));
                            return;
                        }
                        if ($scope.quicksend.fields.length >= 1) {
                            $scope.quicksend.fields[0].address = pars.address;
                            $scope.saveToAddress(pars.address, 0);
                            if (pars.amount != null) {
                                var amountCoin = TLCoin.fromString(pars.amount, TLCoin.TLBitcoinDenomination.BTC);
                                $scope.quicksend.fields[0].bitcoinAmount = identity.appDelegate.currencyFormat.coinToProperBitcoinAmountString(amountCoin);
                                $scope.updateFiatAmount($scope.quicksend.fields[0], 0);
                            }
                            if (!$scope.$$phase) {
                                $scope.$apply();
                            }
                        }
                    } else if (data.type == 'EVENT_MODEL_UPDATED_NEW_UNCONFIRMED_TRANSACTION') {
                        if (modals.spinnerShowing) {
                            modals.cancel();
                        }
                    }
                });
            }]);
    });
