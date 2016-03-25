/**
 * @fileOverview AccountActionCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'sjcl', 'model/TLWalletUtils', 'model/TLCrypto',
        'model/TLBitcoinJSWrapper', 'model/TLWalletJSONKeys', 'model/TLStealthAddress', 'model/TLStealthWallet', 'model/TLTxObject'],
    function (controllers, ArcBit, sjcl, TLWalletUtils, TLCrypto, TLBitcoinJSWrapper, TLWalletJSONKeys,
              TLStealthAddress, TLStealthWallet, TLTxObject) {
        controllers.controller('AccountActionCtrl', ['$scope', 'modals', '$window', 'notify', '$history', '$location', '$tabs', '_Filter',
            function($scope, modals, $window, notify, $history, $location, $tabs, _) {

                $scope.clearAccountPrivateKey = function(pocket) {
                    var type = pocket.type;
                    var idx = pocket.index;
                    pocket.hasTmpAccountKey = null;
                    notify.success(_('Account private key cleared from memory'));
                    var identity = ArcBit.getIdentity();
                    if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(idx);
                        accountObject.clearExtendedPrivateKeyFromMemory();
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(idx);
                        accountObject.clearExtendedPrivateKeyFromMemory();
                    }
                };

                $scope.clearPrivateKey = function(pocket) {
                    var type = pocket.type;
                    var idx = pocket.index;
                    pocket.hasTmpKey = null;
                    notify.success(_('Private key cleared from memory'));
                    var identity = ArcBit.getIdentity();
                    if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(idx);
                        importedAddressObject.clearPrivateKeyFromMemory();
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(idx);
                        importedAddressObject.clearPrivateKeyFromMemory();
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedAddresses.getArchivedAddressObjectAtIdx(idx);
                        importedAddressObject.clearPrivateKeyFromMemory();
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getArchivedAddressObjectAtIdx(idx);
                        importedAddressObject.clearPrivateKeyFromMemory();
                    }
                };

                $scope.toggleArchiveAccount = function(pocket) {
                    var identity = ArcBit.getIdentity();
                    var idx = pocket.index;
                    var type = pocket.type;
                    type = $tabs.pocketType;
                    idx = $tabs.pocketId;

                    if (type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(idx);
                        if (idx == 0) {
                            notify.warning(_('Cannot archive default account'));
                            return;
                        }
                        identity.appDelegate.accounts.archiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.accounts.getIdxForArchivedAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {

                        var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);

                        identity.appDelegate.importedAccounts.archiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedAccounts.getIdxForArchivedAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {

                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(idx);
                        identity.appDelegate.importedWatchAccounts.archiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedWatchAccounts.getIdxForArchivedAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {

                        var importedAddressObject = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.importedAddresses.archiveAddress(importedAddressObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedAddresses.getIdxForArchivedAddressObject(importedAddressObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {

                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.importedWatchAddresses.archiveAddress(importedAddressObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedWatchAddresses.getIdxForArchivedAddressObject(importedAddressObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET) {

                        var accountObject = identity.appDelegate.accounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.accounts.unarchiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.accounts.getIdxForAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.HD_WALLET, movedIdx);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT) {

                        var accountObject = identity.appDelegate.importedAccounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.importedAccounts.unarchiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedAccounts.getIdxForAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {

                        var accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.importedWatchAccounts.unarchiveAccount(accountObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedWatchAccounts.getIdxForAccountObject(accountObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS) {

                        var importedAddressObject = identity.appDelegate.importedAddresses.getArchivedAddressObjectAtIdx(idx);
                        identity.appDelegate.importedAddresses.unarchiveAddress(importedAddressObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedAddresses.getIdxForAddressObject(importedAddressObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS, movedIdx);

                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getArchivedAddressObjectAtIdx(idx);
                        identity.appDelegate.importedWatchAddresses.unarchiveAddress(importedAddressObject.getPositionInWalletArray());
                        var movedIdx = identity.appDelegate.importedWatchAddresses.getIdxForAddressObject(importedAddressObject);
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS, movedIdx);
                    }

                };

                $scope.deleteAccount = function(pocket) {
                    modals.promptForOKCancel(_("Are you sure you want to delete this account?"), null, _("Yes"), null, function() {
                        var idx = $tabs.pocketId;
                        var type = $tabs.pocketType;
                        var identity = ArcBit.getIdentity();
                        if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT) {
                            identity.appDelegate.importedAccounts.deleteAccount(idx);
                        } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                            identity.appDelegate.importedWatchAccounts.deleteAccount(idx);
                        } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS) {
                            identity.appDelegate.importedAddresses.deleteAddress(idx);
                        } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                            identity.appDelegate.importedWatchAddresses.deleteAddress(idx);
                        }
                        $tabs.open(TLWalletUtils.TLSelectedAccountType.HD_WALLET, 0);
                    });
                };

                $scope.renamePocket = function(pocket) {
                    $scope.forms.pocketName = pocket.accountName;
                    $scope.renamingPocket = true;
                };

                $scope.finalizeRenamePocket = function(pocket, name) {

                    $scope.forms.pocketName = '';
                    $scope.renamingPocket = false;
                    var idx = $tabs.pocketId;
                    var type = $tabs.pocketType;
                    var identity = ArcBit.getIdentity();

                    if (type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(idx);
                        identity.appDelegate.accounts.renameAccount(accountObject.getPositionInWalletArray(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);
                        identity.appDelegate.importedAccounts.renameAccount(accountObject.getPositionInWalletArray(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(idx);
                        identity.appDelegate.importedWatchAccounts.renameAccount(accountObject.getPositionInWalletArray(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.importedAddresses.setLabel(name, importedAddressObject.getPositionInWalletArray());
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(idx);
                        identity.appDelegate.importedWatchAddresses.setLabel(name, importedAddressObject.getPositionInWalletArray());
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET) {
                        var accountObject = identity.appDelegate.accounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.accounts.renameAccount(accountObject.getAccountIdxNumber(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedAccounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.importedAccounts.renameAccount(accountObject.getPositionInWalletArray(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(idx);
                        identity.appDelegate.importedWatchAccounts.renameAccount(accountObject.getPositionInWalletArray(), name);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedAddresses.getArchivedAddressObjectAtIdx(idx);
                        identity.appDelegate.importedAddresses.setLabel(name, importedAddressObject.getPositionInWalletArray());
                    } else if (type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                        var importedAddressObject = identity.appDelegate.importedWatchAddresses.getArchivedAddressObjectAtIdx(idx);
                        identity.appDelegate.importedWatchAddresses.setLabel(name, importedAddressObject.getPositionInWalletArray());
                    }

                    var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(idx);
                    $scope.pocket.accountName = name;
                };

                function download(filename, text) {
                    var pom = $window.document.createElement('a');
                    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    pom.setAttribute('download', filename);
                    pom.click();
                }

                $scope.fetchUnspentOutputs = function() {
                    var idx = $tabs.pocketId;
                    var type = $tabs.pocketType;
                    var identity = ArcBit.getIdentity();
                    var accountObject;
                    if (type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(idx);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);
                    } else {
                        return;
                    }
                    accountObject.getUnspentOutputs(function() {
                        var unspentOutputs = accountObject.unspentOutputs;
                        var changeAddr = accountObject.getCurrentChangeAddress();
                        var spendData = {
                            'receiving_addresses':{},
                            'change_addresses':{},
                            'to_change_address': {
                                'addr': changeAddr,
                                'idx':accountObject.getAddressHDIndex(changeAddr)
                            },
                            'unspent_outputs':unspentOutputs
                        };
                        for (var i = 0; i < unspentOutputs.length; i++) {
                            var unspentOutput = unspentOutputs[i];
                            var outputScript = unspentOutput["script"];
                            var address = TLBitcoinJSWrapper.getAddressFromOutputScript(outputScript,
                                TLBitcoinJSWrapper.getNetwork(identity.appDelegate.isTestnet));
                            if (accountObject.address2IsMainAddress[address]) {
                                if (accountObject.address2HDIndexDict[address] != null) {
                                    spendData['receiving_addresses'][address] = accountObject.address2HDIndexDict[address];
                                }
                            } else {
                                if (accountObject.address2HDIndexDict[address] != null) {
                                    spendData['change_addresses'][address] = accountObject.address2HDIndexDict[address];
                                }
                            }
                        }
                        var spendDataStr = JSON.stringify(spendData, null, 2);
                        modals.promptForTextArea(_('Unspent Outputs'), _("Copy or download the data below and go to ArcBit's brain wallet tool with this data."), spendDataStr, _('Download'), function(){
                            var accountName = accountObject.getAccountName();
                            download(accountName+'-spend-data', spendDataStr);
                        });
                        if (!$scope.$$phase) $scope.$apply();
                    }, function(){
                        notify.error(_("Error fetching unspent outputs"));
                    });
                };

                $scope.scanForForwardPayment = function() {
                    $scope.forms.txid = '';
                    $scope.enteringPaymentTxid = true;
                };

                $scope.finalizeScanForForwardPayment = function(pocket, txid) {
                    $scope.forms.txid = '';
                    $scope.enteringPaymentTxid = false;
                    var idx = $tabs.pocketId;
                    var type = $tabs.pocketType;
                    var accountObject;
                    var identity = ArcBit.getIdentity();
                    if (type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(idx);
                    } else if (type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);
                    } else {
                        return;
                    }
                    if (accountObject.stealthWallet == null) {
                        notify.error(_("Internal Error: Account does not have stealth wallet"));
                        return;
                    }
                    if (accountObject.stealthWallet.paymentTxidExist(txid)) {
                        notify.error(_("Transaction already accounted for"));
                        return;
                    }

                    try {
                        TLCrypto.hexStringToData(txid);
                    } catch(err) {
                        notify.error('' + err);
                        return;
                    }

                    if (txid.length != 64) {
                        notify.error(_("Invalid transaction ID"));
                        return;
                    }

                    identity.appDelegate.blockExplorerAPI.getTx(txid, function(jsonData) {
                        if (jsonData == null) {
                            notify.error(_("Transaction does not exist"));
                            return;
                        }
                        var stealthDataScriptAndOutputAddresses = TLStealthWallet.getStealthDataScriptAndOutputAddresses(jsonData);
                        if (stealthDataScriptAndOutputAddresses == null || stealthDataScriptAndOutputAddresses['stealthDataScript'] == null) {
                            notify.success(_("Transaction is not a reusable address transaction"));
                            return;
                        }

                        var scanPriv = accountObject.stealthWallet.getStealthAddressScanKey();
                        var spendPriv = accountObject.stealthWallet.getStealthAddressSpendKey();
                        var stealthDataScript = stealthDataScriptAndOutputAddresses['stealthDataScript'];

                        var secret = TLStealthAddress.getPaymentAddressPrivateKeySecretFromScript(stealthDataScript, scanPriv, spendPriv);
                        if (secret) {
                            var paymentAddress = TLBitcoinJSWrapper.getAddressFromSecret(secret, identity.appDelegate.appWallet.isTestnet());
                            if (stealthDataScriptAndOutputAddresses['outputAddresses'].indexOf(paymentAddress) != -1) {
                                identity.appDelegate.blockExplorerAPI.getUnspentOutputs([paymentAddress], function(jsonData2) {
                                    var unspentOutputs = jsonData2["unspent_outputs"];
                                    if (unspentOutputs != null && unspentOutputs.length > 0) {
                                        var privateKey = TLBitcoinJSWrapper.privateKeyFromSecret(secret, identity.appDelegate.appWallet.isTestnet());
                                        var txObject = new TLTxObject(identity.appDelegate, jsonData);
                                        var txTime = txObject.getTxUnixTime();
                                        accountObject.stealthWallet.addStealthAddressPaymentKey(privateKey, paymentAddress,
                                            txid, txTime, TLWalletJSONKeys.TLStealthPaymentStatus.UNSPENT);
                                        notify.success(_("Funds imported"));
                                        if (!$scope.$$phase) $scope.$apply();

                                        accountObject.getAccountData(function() {
                                        }, function() {
                                        });
                                    } else {
                                        notify.success(_("Funds have been claimed already"));
                                        if (!$scope.$$phase) $scope.$apply();
                                    }
                                }, function() {
                                    notify.success(_("Funds have been claimed already"));
                                    if (!$scope.$$phase) $scope.$apply();
                                });
                            } else {
                                notify.error(_("Transaction does not belong to this account"));
                                if (!$scope.$$phase) $scope.$apply();
                            }
                        } else {
                            notify.error(_("Transaction does not belong to this account"));
                            if (!$scope.$$phase) $scope.$apply();
                        }
                    }, function() {
                        notify.error(_("Error fetching transaction"));
                        if (!$scope.$$phase) $scope.$apply();
                    });
                };
            }]);
    });
