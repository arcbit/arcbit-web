/**
 * @fileOverview OfflineSpendCtrl angular controller
 */
'use strict';
define(['./module', 'model/TLHDWalletWrapper', 'model/TLCoin', 'model/TLBitcoinJSWrapper', 'model/TLStealthAddress', 'model/TLCrypto', 'model/TLInsightAPI', 'bip39', 'model/TLWalletUtils'],
    function (controllers, TLHDWalletWrapper, TLCoin, TLBitcoinJSWrapper, TLStealthAddress, TLCrypto, TLInsightAPI, BIP39, TLWalletUtils) {
        controllers.controller('OfflineSpendCtrl', ['$scope', '$routeParams', '$location', '$route', '$window', 'modals', 'sounds', 'notify', '_Filter',
            function($scope, $routeParams, $location, $route, $window, modals, sounds, notify, _) {

                var MAIN_ADDRESS_IDX = 0;
                var CHANGE_ADDRESS_IDX = 1;

                $scope.stepSection = $routeParams.section || 'step1';
                $scope.utxos = null;

                $scope.genAddressesFrom = 'mnemonic';
                $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                $scope.accountIdx = 0;
                $scope.mnemonic = null;
                $scope.xpub = null;
                $scope.xprv = null;
                $scope.minAddrIdx = 0;
                $scope.minChangeAddrIdx = 0;
                $scope.masterHex = null;
                var bip44KeyChain = null;
                var accountObject = null;
                var addressIndexes = null;
                var addressesToGenerate = 5;
                var network = 'bitcoin';
                network = null;

                var insightAPI = new TLInsightAPI("https://insight.bitpay.com/");
                var fetchedUnspentAccountPublicKey = null;

                $scope.showInvalidMnemonic = false;
                $scope.showInvalidAccountPrivateKey = false;
                $scope.showInvalidAccountPublicKey = false;

                $scope.enabledMnemonicInput = true;
                $scope.enabledAccountPrivateKeyInput = false;
                $scope.enabledAccountPublicKeyInput = false;

                var DUST_AMOUNT = 546;
                $scope.accountBalanceNum = TLCoin.zero();
                $scope.accountBalance = '0 BTC';
                $scope.showInvalidSpendingAccountPrivateKey = false;
                $scope.showInvalidSpendingAccountData = false;

                // Don't reload the controller if coming from this tab
                // (only on offline_spend.html template)
                var lastRoute = $route.current;
                if ($route.current.templateUrl.indexOf('offline_spend.html') > 0) {
                    $scope.$on('$locationChangeSuccess', function(event) {
                        if ($route.current.templateUrl.indexOf('offline_spend.html') > 0) {
                            $scope.stepSection = $route.current.pathParams.section || 'step1';
                            // Overwrite the route so the template doesn't reload
                            $route.current = lastRoute;
                        }
                    });
                }

                // Set the step section
                $scope.setStepSection = function(section) {
                    var dest = '/offline_spend';
                    if (section !== 'step1') {
                        dest += '/' + section;
                    }
                    $location.path(dest);
                };

                $scope.setCurrentAddress = function(address) {
                    $scope.currentAddress = address;
                };

                $scope.fetchAccountData = function(xpub, addressIdxes, changeAddressIdxes) {
                    if (xpub == null || !TLHDWalletWrapper.isValidExtendedPublicKey(xpub, TLBitcoinJSWrapper.getNetwork(false))) {
                        notify.error(_("Invalid account public key"));
                        return;
                    }
                    fetchedUnspentAccountPublicKey = null;

                    var keyChain = TLHDWalletWrapper.getKeyChain(xpub, network);
                    var receivingAddress2IndexDict = {};
                    var changeAddress2IndexDict = {};
                    if (addressIdxes != null) {
                        var addressIndexes = addressIdxes.split(',');
                        var mainAddressKeyChain = keyChain.derive(MAIN_ADDRESS_IDX);
                        for (var i = 0; i < addressIndexes.length; i++) {
                            var idx = addressIndexes[i];
                            if (idx.indexOf('-') > 0) {
                                var range = idx.split('-');
                                if (range.length == 2) {
                                    if (! /^[0-9 ]*$/.test(range[0]) || ! /^[0-9 ]*$/.test(range[1])) {
                                        notify.error(_("Invalid receiving address ids"));
                                        return;
                                    }
                                    if (idx == '') {
                                        continue;
                                    }

                                    var minIdxNum = parseInt(range[0]);
                                    var maxIdxNum = parseInt(range[1]);
                                    for (var j = minIdxNum; j <= maxIdxNum; j++) {
                                        var address = mainAddressKeyChain.derive(j).getAddress(network).toString();
                                        receivingAddress2IndexDict[address] = j;
                                    }
                                } else {
                                    notify.error(_("Invalid receiving address ids"));
                                    return;
                                }
                            } else {
                                if (! /^[0-9 ]*$/.test(idx)) {
                                    notify.error(_("Invalid receiving address ids"));
                                    return;
                                }
                                if (idx == '') {
                                    continue;
                                }

                                var idxNum = parseInt(idx);
                                var address = mainAddressKeyChain.derive(idxNum).getAddress(network).toString();
                                receivingAddress2IndexDict[address] = idxNum;
                            }
                        }
                    }
                    if (changeAddressIdxes != null) {
                        var changeAddressIndexes = changeAddressIdxes.split(',');
                        var changeAddressKeyChain = keyChain.derive(CHANGE_ADDRESS_IDX);
                        for (var i = 0; i < changeAddressIndexes.length; i++) {
                            var idx = changeAddressIndexes[i];
                            if (idx.indexOf('-') > 0) {
                                var range = idx.split('-');
                                if (range.length == 2) {
                                    if (! /^[0-9 ]*$/.test(range[0]) || ! /^[0-9 ]*$/.test(range[1])) {
                                        notify.error(_("Invalid change address ids"));
                                        return;
                                    }
                                    if (idx == '') {
                                        continue;
                                    }

                                    var minIdxNum = parseInt(range[0]);
                                    var maxIdxNum = parseInt(range[1]);
                                    for (var j = minIdxNum; j <= maxIdxNum; j++) {
                                        var address = changeAddressKeyChain.derive(j).getAddress(network).toString();
                                        changeAddress2IndexDict[address] = j;
                                    }
                                } else {
                                    notify.error(_("Invalid change address ids"));
                                    return;
                                }
                            } else {
                                if (! /^[0-9 ]*$/.test(idx)) {
                                    notify.error(_("Invalid change address ids"));
                                    return;
                                }
                                if (idx == '') {
                                    continue;
                                }

                                var idxNum = parseInt(idx);
                                var address = changeAddressKeyChain.derive(idxNum).getAddress(network).toString();
                                changeAddress2IndexDict[address] = idxNum;
                            }
                        }
                    }

                    var addresses = Object.keys(receivingAddress2IndexDict).concat(Object.keys(changeAddress2IndexDict));

                    insightAPI.getUnspentOutputs(addresses, function(jsonData) {
                        $scope.accountData = JSON.stringify({
                            'receiving_addresses':receivingAddress2IndexDict,
                            'change_addresses':changeAddress2IndexDict,
                            'unspent_outputs':jsonData['unspent_outputs']
                        }, null, 2);
                        fetchedUnspentAccountPublicKey = xpub;

                        notify.success(_("Success"));
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }

                    }, function(response) {
                        fetchedUnspentAccountPublicKey = null;
                        notify.error(_("Error fetching account data"));
                    });
                };

                function download(filename, text) {
                    var pom = $window.document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                }

                $scope.downloadAccountData = function() {
                    if ($scope.accountData && fetchedUnspentAccountPublicKey) {
                        var xpub = fetchedUnspentAccountPublicKey.substring(0, 24);
                        download(xpub+'-spend-data', $scope.accountData);
                    } else {
                        notify.error(_("Error no account data available. Try fetching data again."));
                    }
                };

                $scope.sendTx = function(txHex) {
                    console.log('txHex: ' + txHex);
                    insightAPI.pushTx(txHex, function() {
                        notify.success(_("Transaction sent"));
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }, function(response) {
                        notify.error(_('Error') + ': ' + response.status + ' ' + response.data);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    });
                };

                $scope.genAddressesFromChanged = function() {
                    if ($scope.genAddressesFrom == 'xprv') {
                        $scope.enabledMnemonicInput = false;
                        $scope.enabledAccountPrivateKeyInput = true;
                        $scope.enabledAccountPublicKeyInput = false;
                    } else if ($scope.genAddressesFrom == 'xpub') {
                        $scope.enabledMnemonicInput = false;
                        $scope.enabledAccountPrivateKeyInput = false;
                        $scope.enabledAccountPublicKeyInput = true;
                        $scope.showPrivateKeys = false;
                    } else {
                        $scope.enabledMnemonicInput = true;
                        $scope.enabledAccountPrivateKeyInput = false;
                        $scope.enabledAccountPublicKeyInput = false;
                    }
                    $scope.mnemonic = null;
                    $scope.xprv = null;
                    $scope.xpub = null;
                    $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    bip44KeyChain = null;
                };

                $scope.accountIDChanged = function(accountIdx) {
                    var accountIdxNum = parseInt(accountIdx);
                    $scope.seedHex = TLHDWalletWrapper.getMasterHex($scope.mnemonic);
                    //$scope.seedHex = ''
                    $scope.xpub = TLHDWalletWrapper.getExtendPubKeyFromMasterHex($scope.seedHex, accountIdxNum);
                    $scope.xprv = TLHDWalletWrapper.getExtendPrivKey($scope.seedHex, accountIdxNum);
                    //$scope.xpub = 'xpub6GSsP4tac3dEj9ELnorsdH9f7hqYUHmZFTTrgCtdAjEMXbTTwsWXHu4KQqhDwxJMi7BLUo15sN79Rkt9ZERmWyLmygbcnj3J7SHMMkrTeDM';
                    //$scope.xprv = 'xprvA3TWyZMgmg4wWf9sgnKsG9CvZg144q3htEYFspV1cPhNeo8KQLCGk6jqZa2m86ChVszgfDfgbWbzq3YuSKPGq4WGX9d5dNe4RFbv19iV5aD';


                };

                $scope.addressIdxChanged = function() {
                    if ($scope.minAddrIdx == null) {
                        //notify.error(_("No Value"));
                        return;
                    }
                    var minAddrIdx = parseInt($scope.minAddrIdx);
                    if (!(minAddrIdx >= 0 && minAddrIdx < 2147483647-5)) {
                        notify.error(_("Invalid receiving address id"));
                        return;
                    }
                    $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    var mainAddressKeyChain = bip44KeyChain.derive(MAIN_ADDRESS_IDX);
                    for (var i = minAddrIdx; i < minAddrIdx + addressesToGenerate; i++) {
                        var keyChain = mainAddressKeyChain.derive(i);
                        var address = keyChain.getAddress(network).toString();
                        var key = null;
                        if (bip44KeyChain.privKey != null) {
                            key = keyChain.privKey.toWIF(network);
                        }
                        $scope.addrs[i-minAddrIdx] = {addr:address, key:key, idx:i};
                    }
                    notify.success(_("New receiving addresses generated"));
                };

                $scope.changeAddressIdxChanged = function() {
                    if (!$scope.showChangeAddresses || $scope.minChangeAddrIdx == null || bip44KeyChain == null) {
                        //notify.error(_("No Value"));
                        return;
                    }

                    var minChangeAddrIdx = parseInt($scope.minChangeAddrIdx);
                    if (!(minChangeAddrIdx >= 0 && minChangeAddrIdx < 2147483647-5)) {
                        notify.error(_("Invalid change address id"));
                        return;
                    }
                    $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    var changeAddressKeyChain = bip44KeyChain.derive(CHANGE_ADDRESS_IDX);
                    for (var i = minChangeAddrIdx; i < minChangeAddrIdx + addressesToGenerate; i++) {
                        var keyChain = changeAddressKeyChain.derive(i);
                        var address = keyChain.getAddress(network).toString();
                        var key = null;
                        if (bip44KeyChain.privKey != null) {
                            key = keyChain.privKey.toWIF(network);
                        }
                        $scope.changeAddrs[i-minChangeAddrIdx] = {addr:address, key:key, idx:i};
                    }
                    notify.success(_("New change addresses generated"));
                };

                $scope.accountIdxChanged = function() {
                    if (!$scope.accountIdx == null) {
                        //notify.error(_("No Value"));
                        return;
                    }

                    var accountIdx = parseInt($scope.accountIdx);
                    if (!(accountIdx >= 0 && accountIdx < 2147483647)) {
                        notify.error(_("Invalid account id"));
                        return;
                    }
                    bip44KeyChain = TLHDWalletWrapper.getBIP44KeyChain($scope.masterHex, accountIdx, network);
                    $scope.xpub = bip44KeyChain.neutered().toBase58();
                    $scope.xprv = bip44KeyChain.toBase58();

                    $scope.addressIdxChanged();
                    $scope.changeAddressIdxChanged();
                    notify.success(_("New account generated"));
                };

                var generateWallet = function(mnemonic) {
                    $scope.masterHex = TLHDWalletWrapper.getMasterHex(mnemonic);
                    $scope.accountIdx = '0';
                    $scope.accountIdxChanged();
                    notify.success(_("New wallet generated"));
                };

                $scope.generateNewWallet = function() {
                    $scope.showInvalidMnemonic = false;
                    bip44KeyChain = null;
                    $scope.mnemonic = TLHDWalletWrapper.generateMnemonicPassphrase();
                    $scope.mnemonic = BIP39.generateMnemonic();
                    generateWallet($scope.mnemonic);

                };

                $scope.mnemonicChanged = function() {
                    bip44KeyChain = null;
                    if (!TLHDWalletWrapper.phraseIsValid($scope.mnemonic)) {
                        $scope.showInvalidMnemonic = true;
                        $scope.xpub = null;
                        $scope.xprv = null;
                        $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                        $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                        return;
                    }
                    $scope.showInvalidMnemonic = false;
                    generateWallet($scope.mnemonic);
                };

                $scope.showKeyChanged = function() {
                    if ($scope.genAddressesFrom == 'xpub') {
                        $scope.showPrivateKeys = false;
                        notify.error(_("Account public keys cannot generate private keys"));
                    }
                };

                $scope.xprvChanged = function() {
                    $scope.mnemonic = null;

                    $scope.xpub = null;
                    $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    bip44KeyChain = null;
                    if (!TLHDWalletWrapper.isValidExtendedPrivateKey($scope.xprv, TLBitcoinJSWrapper.getNetwork(false))) {
                        $scope.showInvalidAccountPrivateKey = true;
                        return;
                    }
                    $scope.showInvalidAccountPrivateKey = false;
                    bip44KeyChain = TLHDWalletWrapper.getKeyChain($scope.xprv, network);
                    $scope.xpub = bip44KeyChain.neutered().toBase58();
                    $scope.addressIdxChanged();
                    $scope.changeAddressIdxChanged();
                };

                $scope.xpubChanged = function() {
                    $scope.mnemonic = null;

                    $scope.xprv = null;
                    $scope.addrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    $scope.changeAddrs = [{addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}, {addr:null, key:null}];
                    $scope.showPrivateKeys = false;
                    bip44KeyChain = null;
                    if (!TLHDWalletWrapper.isValidExtendedPublicKey($scope.xpub, TLBitcoinJSWrapper.getNetwork(false))) {
                        $scope.showInvalidAccountPublicKey = true;
                        return;
                    }
                    $scope.showInvalidAccountPublicKey = false;
                    bip44KeyChain = TLHDWalletWrapper.getKeyChain($scope.xpub, network);
                    $scope.addressIdxChanged();
                    $scope.changeAddressIdxChanged();

                };



                $scope.quicksend = {showFee:false, bitcoinFeeAmount: '0.0001' , fields:[{fiatAmount:null, bitcoinAmount:null, address:null}]};

                $scope.addRecipient = function() {
                    $scope.quicksend.fields.push({fiatAmount:null, bitcoinAmount:null, address:null});
                };

                $scope.removeRecipient = function(idx) {
                    $scope.quicksend.fields.splice(idx, 1);
                };


                $scope.signTx = function() {
                    if (!TLHDWalletWrapper.isValidExtendedPrivateKey($scope.spendingXprv, TLBitcoinJSWrapper.getNetwork(false))) {
                        notify.error(_("Invalid account private key"));
                        $scope.spendingTxHex = null;
                        $scope.spendingTxDetail = null;
                        return;
                    }

                    var address2privateKeys = {};
                    var spendKeyChain = TLHDWalletWrapper.getKeyChain($scope.spendingXprv, network);
                    var mainAddressKeyChain = spendKeyChain.derive(MAIN_ADDRESS_IDX);

                    var accountData;
                    try {
                        accountData = JSON.parse($scope.spendingAccountData);
                    } catch(err) {
                        notify.error(_("Invalid Account Data"));
                        return;
                    }
                    var receivingAddresses = accountData.receiving_addresses;
                    var maxReceivingAddressHDIdx = 0;
                    for (var addr in receivingAddresses) {
                        var idx = receivingAddresses[addr];
                        var keyChain = mainAddressKeyChain.derive(idx);
                        var address = keyChain.getAddress(network).toString();
                        if (address != addr) {
                            notify.error(_("Account private key does not match account data"));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }
                        var key = keyChain.privKey.toWIF(network);
                        address2privateKeys[address] = key;
                        if (idx > maxReceivingAddressHDIdx) {
                            maxReceivingAddressHDIdx = idx;
                        }
                    }

                    var changeAddressKeyChain = spendKeyChain.derive(CHANGE_ADDRESS_IDX);
                    var changeAddresses = accountData.change_addresses;
                    var maxChangeAddressHDIdx = 0;
                    for (var addr in changeAddresses) {
                        var idx = changeAddresses[addr];
                        var keyChain = changeAddressKeyChain.derive(idx);
                        var address = keyChain.getAddress(network).toString();
                        if (address != addr) {
                            notify.error(_("Account private key does not match account data"));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }
                        var key = keyChain.privKey.toWIF(network);
                        address2privateKeys[address] = key;
                        if (idx > maxChangeAddressHDIdx) {
                            maxChangeAddressHDIdx = idx;
                        }
                    }

                    var outputValueSum = TLCoin.zero();
                    var stealthAddressCount = 0;
                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {

                        var bitcoinAmount = $scope.quicksend.fields[i].bitcoinAmount;
                        var address = $scope.quicksend.fields[i].address;
                        if (address != null && TLStealthAddress.isStealthAddress(address, this.isTestnet)) {
                            stealthAddressCount++;
                            if (stealthAddressCount > 1) {
                                notify.warning(_('Only one reusable address recipient per transaction allowed'));
                                return;
                            }
                        }
                        if (bitcoinAmount) {
                            var amount = TLCoin.fromString(bitcoinAmount, TLCoin.TLBitcoinDenomination.BTC);

                            outputValueSum = outputValueSum.add(amount);

                        } else {
                            notify.error(_("Must enter amount greater then zero"));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }
                    }

                    var valueNeeded;
                    if ($scope.quicksend.bitcoinFeeAmount) {
                        var feeAmount = TLCoin.fromString($scope.quicksend.bitcoinFeeAmount, TLCoin.TLBitcoinDenomination.BTC);
                        valueNeeded = outputValueSum.add(feeAmount);
                    } else {
                        valueNeeded = outputValueSum.add(TLCoin.zero());
                    }

                    //*
                    var unspentOutputs = accountData.unspent_outputs;
                    var dustAmount = 0;
                    var valueSelected = TLCoin.zero();
                    var inputsData = [];
                    for (var i = 0; i < unspentOutputs.length; i++) {
                        var unspentOutput = unspentOutputs[i];
                        var amount = unspentOutput["value"];
                        if (amount < DUST_AMOUNT) {
                            dustAmount += amount;
                            continue;
                        }
                        var amountCoin = new TLCoin(amount);
                        valueSelected = valueSelected.add(amountCoin);
                        var outputScript = unspentOutput["script"];
                        var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                            TLBitcoinJSWrapper.getNetwork(this.isTestnet));
                        if (address == null) {
                            console.log("address cannot be decoded. not normal pubkeyhash outputScript: " + outputScript);
                            continue;
                        }

                        if (address2privateKeys[address] == null) {
                            // could be stealth payment address and expect payment address private key
                            notify.error(_("Private key not found for address" + ' ' + address + '. ' + "Make sure you are fetching account data from an ArcBit watch only account."));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }

                        inputsData.push({
                            "tx_hash": unspentOutput["tx_hash"],
                            "txid": unspentOutput["tx_hash_big_endian"],
                            "tx_output_n": unspentOutput["tx_output_n"],
                            "script": outputScript,
                            "addr": address,
                            "amount": amountCoin.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC),
                            "private_key": address2privateKeys[address]
                        });

                        if (valueSelected.greaterOrEqual(valueNeeded)) {
                            break;
                        }
                    }

                    var realToAddresses = [];
                    if (valueSelected.less(valueNeeded)) {
                        if (dustAmount > 0) {
                            var dustCoinAmount = new TLCoin(dustAmount);

                            var amountCanSendString = valueNeeded.subtract(dustCoinAmount).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                            var bitcoinDenomination = ' BTC';
                            notify.error(_("Insufficient Funds. Account contains bitcoin dust. You can only send up to" + ' ' + amountCanSendString + bitcoinDenomination));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }
                        var valueSelectedString = valueSelected.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                        var valueNeededString = valueNeeded.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                        var bitcoinDenomination = ' BTC';
                        notify.error(_("Insufficient Funds"));
                        $scope.spendingTxHex = null;
                        $scope.spendingTxDetail = null;
                        return;
                    }

                    var stealthOutputScripts = null;
                    var outputsData = [];


                    var changeAddress;
                    var changeIndex = null;
                    if (accountData.to_change_address) {
                        changeAddress = accountData.to_change_address.addr;
                        changeIndex = accountData.to_change_address.idx;
                    } else {
                        var changeIdx;
                        if (maxChangeAddressHDIdx > 0) {
                            changeIdx = maxChangeAddressHDIdx+1;
                        } else {
                            changeIdx = maxReceivingAddressHDIdx+1;
                        }
                        keyChain = changeAddressKeyChain.derive(changeIdx);
                        changeAddress = keyChain.getAddress(network).toString();
                        changeIndex = changeIdx;
                    }

                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {
                        var toAddress = $scope.quicksend.fields[i].address;
                        if (!TLBitcoinJSWrapper.isValidAddress($scope.quicksend.fields[i].address, this.isTestnet)) {
                            notify.error(_("Invalid address"));
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
                        }
                        var amount = $scope.quicksend.fields[i].bitcoinAmount;
                        if (!TLStealthAddress.isStealthAddress(toAddress, this.isTestnet)) {
                            realToAddresses.push(toAddress);
                            var amountCoin = TLCoin.fromString(amount, TLCoin.TLBitcoinDenomination.BTC);
                            outputsData.push({
                                "to_address": toAddress,
                                "amount": amountCoin
                            });
                        } else {
                            if (stealthOutputScripts == null) {
                                stealthOutputScripts = [];
                            }
                            var ephemeralPrivateKey = TLStealthAddress.generateEphemeralPrivkey();
                            var stealthDataScriptNonce = TLStealthAddress.generateNonce();
                            var stealthDataScriptAndPaymentAddress = TLStealthAddress.createDataScriptAndPaymentAddressWithNounceAndEphemKey(toAddress,
                                ephemeralPrivateKey, stealthDataScriptNonce, this.isTestnet);
                            stealthOutputScripts.push(stealthDataScriptAndPaymentAddress[0]);
                            var paymentAddress = stealthDataScriptAndPaymentAddress[1];
                            realToAddresses.push(paymentAddress);
                            var amountCoin = TLCoin.fromString(amount, TLCoin.TLBitcoinDenomination.BTC);
                            outputsData.push({
                                "to_address": paymentAddress,
                                "amount": amountCoin
                            });
                        }
                    }
                    var changeAmount = TLCoin.zero();
                    var changeDict = false;
                    if (valueSelected.greater(valueNeeded)) {
                        if (changeAddress != null) {
                            changeAmount = valueSelected.subtract(valueNeeded);
                            outputsData.push({
                                "to_address": changeAddress,
                                "amount": changeAmount
                            });
                            changeDict = {
                                "addr": changeAddress,
                                "amount": changeAmount
                            };
                        }
                    }

                    if (valueNeeded.greater(valueSelected)) {
                        notify.error(_("Send error: Not enough unspent outputs"));
                        $scope.spendingTxHex = null;
                        $scope.spendingTxDetail = null;
                        return;
                    }


                    for (var i = 0; i < outputsData.length; i++) {
                        var outputData = outputsData[i];
                        var outputAmount = outputData["amount"];
                        if (outputAmount <= DUST_AMOUNT) {
                            var dustAmountBitcoins = new TLCoin(DUST_AMOUNT).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                            notify.error(_("Cannot create transactions with outputs less then") + ' ' + dustAmountBitcoins + " bitcoins.");
                            $scope.spendingTxHex = null;
                            $scope.spendingTxDetail = null;
                            return;
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
                        } else if (obj1.time > obj2.time) {
                            return 1;
                        }
                        return 0;
                    }
                    inputsData.sort(compareInputs);
                    var hashes = [];
                    var inputIndexes = [];
                    var inputScripts = [];
                    var privateKeys = [];
                    $scope.spendingTxDetail = _('From') + ':\n';
                    for (var i = 0; i < inputsData.length; i++) {
                        var sortedInput = inputsData[i];
                        hashes.push(sortedInput["txid"]);
                        inputIndexes.push(sortedInput["tx_output_n"]);
                        privateKeys.push(sortedInput["private_key"]);
                        inputScripts.push(sortedInput["script"]);
                        $scope.spendingTxDetail += sortedInput["addr"] + '  ' + sortedInput["amount"] + ' BTC\n';
                    }

                    var isTestnet = this.isTestnet;
                    function compareOutputs(obj1, obj2) {
                        if (obj1["amount"].less(obj2["amount"])) {
                            return -1;
                        } else if (obj1["amount"].greater(obj2["amount"])) {
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
                    $scope.spendingTxDetail += _('To addresses(s)') + ':\n';
                    var hasSetChangeAddr = false; //account for condition where a to output is equivalent to the change output
                    for (var i = 0; i < outputsData.length; i++) {
                        var sortedOutput = outputsData[i];
                        outputAddresses.push(sortedOutput["to_address"]);
                        outputAmounts.push(sortedOutput["amount"].toNumber());
                        var amountStr = sortedOutput["amount"].bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                        if (!hasSetChangeAddr && changeDict != null
                            && sortedOutput["to_address"] == changeDict['addr']
                            && sortedOutput["amount"].equalTo(changeDict['amount'])) {
                            $scope.spendingTxDetail += sortedOutput["to_address"] + '  ' + amountStr + ' BTC ' + _('(Change address, change ID = {0})', changeIndex) + '\n';
                            hasSetChangeAddr = true;
                        } else {
                            $scope.spendingTxDetail += sortedOutput["to_address"] + '  ' + amountStr + ' BTC\n';
                        }
                    }
                    if ($scope.quicksend.bitcoinFeeAmount) {
                        $scope.spendingTxDetail += _('Transaction fee') + ':\n' + $scope.quicksend.bitcoinFeeAmount + ' BTC\n';
                    }

                    var txHexAndTxHash = TLBitcoinJSWrapper.createSignedSerializedTransactionHex(hashes, inputIndexes, inputScripts,
                        outputAddresses, outputAmounts, privateKeys, stealthOutputScripts,  this.isTestnet);
                    console.log("txHexAndTxHash: " + JSON.stringify(txHexAndTxHash));

                    if (txHexAndTxHash != null) {
                        $scope.spendingTxHex = txHexAndTxHash.txHex;
                        notify.success(_("Raw transaction created"));
                    } else {
                        notify.error(_("Error"));
                        $scope.spendingTxHex = null;
                        $scope.spendingTxDetail = null;
                    }
                };

                // Link for angular, we will put some information here
                $scope.importFile = {};

                // Private link to our contents
                var backupFile;

                $scope.spendingXprvChanged = function() {
                    if ($scope.spendingXprv == null || $scope.spendingXprv == '' || TLHDWalletWrapper.isValidExtendedPrivateKey($scope.spendingXprv, TLBitcoinJSWrapper.getNetwork(false))) {
                        $scope.showInvalidSpendingAccountPrivateKey = false;
                    } else {
                        $scope.showInvalidSpendingAccountPrivateKey = true;
                    }
                };

                $scope.computeBalanceFromUTXOs = function() {
                    if ($scope.spendingAccountData == null || $scope.spendingAccountData == '') {
                        $scope.showInvalidSpendingAccountData = false;
                        return;
                    }
                    try {
                        var accountData = JSON.parse($scope.spendingAccountData);
                        var balance = 0;
                        var unspentOutputs = accountData.unspent_outputs;
                        for (var i = 0; i < unspentOutputs.length; i++) {
                            balance += unspentOutputs[i]["value"];
                        }

                        $scope.accountBalanceNum = new TLCoin(balance);
                        $scope.accountBalance = $scope.accountBalanceNum.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC) + ' BTC';
                        $scope.showInvalidSpendingAccountData = false;
                    } catch(err) {
                        $scope.accountBalanceNum = TLCoin.zero();
                        $scope.accountBalance = '0 BTC';
                        $scope.showInvalidSpendingAccountData = true;
                    }
                };


                $scope.useAllFunds = function(field, idx) {
                    var leftBalance = $scope.accountBalanceNum;

                    if ($scope.quicksend.bitcoinFeeAmount) {
                        leftBalance = leftBalance.subtract(TLCoin.fromString($scope.quicksend.bitcoinFeeAmount, TLCoin.TLBitcoinDenomination.BTC));
                    }
                    for (var i = 0; i < $scope.quicksend.fields.length; i++) {
                        if (i == idx) {
                            continue;
                        }
                        var bitcoinAmount = $scope.quicksend.fields[i].bitcoinAmount;
                        if (bitcoinAmount) {
                            leftBalance = leftBalance.subtract(TLCoin.fromString(bitcoinAmount, TLCoin.TLBitcoinDenomination.BTC));
                        }
                    }

                    if (leftBalance.greater(TLCoin.zero()) > 0) {
                        field.bitcoinAmount = leftBalance.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                    } else {
                        field.bitcoinAmount = '0';
                    }
                };

                $scope.getAddressFromQRCode = function(field) {
                    modals.scanQr(function(data) {
                        var pars = TLWalletUtils.parseURI(data);
                        if (!pars || !pars.address) {
                            notify.warning(_('URI not supported'));
                            return;
                        }
                        field.address = pars.address;
                        if (pars.amount != null) {
                            var amountCoin = TLCoin.fromString(pars.amount, TLCoin.TLBitcoinDenomination.BTC);
                            field.bitcoinAmount = amountCoin.bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC);
                        }
                        sounds.play('keygenEnd');
                    });
                };

                /**
                 * Callback for file selection
                 */
                var handleLoadFile = function(data) {
                    var fileDiv = $window.document.getElementById('account-data-file');
                    var file = fileDiv.files[0];
                    if (!file) {
                        return;
                    }
                    $scope.step = 'unlock';
                    $scope.importFile.name = file.name;
                    $scope.importFile.size = (file.size/1024).toFixed(1);
                    var reader = new FileReader();

                    reader.onload = function(data) {
                        backupFile = data.target.result;
                        $scope.fileLoaded = true;

                        $scope.spendingAccountData = backupFile;
                        $scope.computeBalanceFromUTXOs();
                        $scope.$apply();
                    };

                    reader.readAsText(file);
                    $scope.$apply();
                };

                var fileId = $window.document.getElementById('account-data-file');
                if (fileId) {
                    $window.document.getElementById('account-data-file').addEventListener('change', handleLoadFile, false);
                }
            }]);
    });
