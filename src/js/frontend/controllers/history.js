/**
 * @fileOverview HistoryCtrl angular controller
 */
'use strict';

define(['./module', 'arcbit', 'frontend/port', 'model/TLWalletUtils'],
    function (controllers, ArcBit, Port, TLWalletUtils) {
        controllers.controller('HistoryCtrl', ['$scope', '$window', 'sounds', '$history', '$tabs', '$location', '$routeParams', '$route', 'modals', 'notify', '_Filter',
            function($scope, $window, sounds, $history, $tabs, $location, $routeParams, $route, modals, notify, _) {

                // Scope variables
                $scope.pocket = $history.getCurrentPocket();
                $scope.selectedPocket = $history.selectedPocket;

                // pages
                $scope.nPages = 0;
                $scope.page = 0;
                var limit = 10;

                $tabs.updateTabs();

                $scope.showTxInWeb = function(txid) {
                    var identity = ArcBit.getIdentity();
                    var idx = identity.appDelegate.preferences.getSelectedBlockExplorerURLIdx();
                    var api = identity.appDelegate.preferences.getSelectedBlockExplorerAPI();
                    $window.open(identity.appDelegate.preferences.getSelectedBlockExplorerURL(api, idx)+"tx/"+txid, '_blank');
                };

                $scope.deleteTag = function(hash) {
                    var identity = ArcBit.getIdentity();
                    identity.appDelegate.appWallet.deleteTransactionTag(hash);
                    $scope.currentRow.description = null;
                };

                $scope.setPage = function(page, updatePage) {
                    if (page >= $scope.nPages) {
                        page = $scope.nPages-1;
                    }
                    if (page < 0) {
                        page = 0;
                    }
                    if (updatePage) {
                        $scope.page = page;
                    }
                    $scope.historyRows = $scope.allHistoryRows.slice($scope.page*limit, ($scope.page*limit) + limit);
                };

                var setHistoryRowsHDAccount = function(accountObject) {
                    var identity = ArcBit.getIdentity();
                    for(var i = 0; i < accountObject.getTxObjectCount(); i++) {
                        var txObject = accountObject.getTxObject(i);
                        var hash = txObject.getHash();
                        var description = identity.appDelegate.appWallet.getTransactionTag(hash);
                        var amountType = accountObject.getAccountAmountChangeTypeForTx(hash);

                        if (amountType == TLWalletUtils.TLAccountTxType.SEND) {
                            var outputAddressToValueArray = txObject.getOutputAddressToValueArray();
                            for (var j = 0; j < outputAddressToValueArray.length; j++) {
                                var dict = outputAddressToValueArray[j];
                                var address = dict["addr"];
                                if (address != null) {
                                    if (accountObject.isAddressPartOfAccount(address)) {
                                        address = address;
                                    } else {
                                        address = address;
                                        break;
                                    }
                                }
                            }
                        } else if (amountType == TLWalletUtils.TLAccountTxType.RECEIVE) {
                            var inputAddressToValueArray = txObject.getInputAddressToValueArray();
                            for (var j = 0; j < inputAddressToValueArray.length; j++) {
                                var dict = inputAddressToValueArray[j];
                                var address = dict["addr"];
                                if (address != null) {
                                    if (accountObject.isAddressPartOfAccount(address)) {
                                        address = address;
                                    } else {
                                        address = address;
                                        break;
                                    }
                                }
                            }
                        } else {
                            address = _("Intra account transfer");
                        }

                        var amountString = accountObject.getAccountAmountChangeForTx(hash);

                        var timeText;
                        var conf = txObject.getConfirmations();
                        if (conf == 0 || conf == Number.MAX_SAFE_INTEGER) {
                            timeText = _('Unconfirmed');
                        } else if (conf > 6) {
                            timeText = txObject.getTime();
                        } else if (conf == 1) {
                            timeText = _('1 confirmation');
                        } else {
                            timeText = _('{0} confirmations', conf);
                        }

                        $scope.allHistoryRows.push({
                            hash: hash,
                            timeText: timeText,
                            amount: amountString,
                            balanceAsOfTx: accountObject.getBalanceAsOfTx(hash),
                            amountType: amountType,
                            address: address,
                            description: description
                        });
                    }
                }

                var setHistoryRowsAddress = function(importedAddress) {
                    var identity = ArcBit.getIdentity();
                    for(var i = 0; i < importedAddress.getTxObjectCount(); i++) {
                        var txObject = importedAddress.getTxObject(i);
                        var hash = txObject.getHash();
                        var description = identity.appDelegate.appWallet.getTransactionTag(hash);
                        var amountType = importedAddress.getAccountAmountChangeTypeForTx(hash);

                        if (amountType == TLWalletUtils.TLAccountTxType.SEND) {
                            if (description == null || description == "") {
                                var outputAddressToValueArray = txObject.getOutputAddressToValueArray();
                                for (var j = 0; j < outputAddressToValueArray.length; j++) {
                                    var dict = outputAddressToValueArray[j];
                                    var address = dict["addr"];
                                    if (address != null) {
                                        if (address == importedAddress.getAddress()) {
                                            address = address;
                                        } else {
                                            address = address;
                                            break;
                                        }
                                    }
                                }
                            }
                        } else if (amountType == TLWalletUtils.TLAccountTxType.RECEIVE) {
                            var inputAddressToValueArray = txObject.getInputAddressToValueArray();
                            for (var j = 0; j < inputAddressToValueArray.length; j++) {
                                var dict = inputAddressToValueArray[j];
                                var address = dict["addr"];
                                if (address != null) {
                                    if (address == importedAddress.getAddress()) {
                                        address = address;
                                    } else {
                                        address = address;
                                        break;
                                    }
                                }
                            }
                        } else {
                            address = "Intra account transfer";
                        }

                        var amountString = importedAddress.getAccountAmountChangeForTx(hash);

                        var timeText;
                        var conf = txObject.getConfirmations();
                        if (conf == 0 || conf == Number.MAX_SAFE_INTEGER) {
                            timeText = _('Unconfirmed');
                        } else if (conf > 6) {
                            timeText = txObject.getTime();
                        } else if (conf == 1) {
                            timeText = _('1 confirmation');
                        } else {
                            timeText = _('{0} confirmations', conf);
                        }

                        $scope.allHistoryRows.push({
                            hash: hash,
                            timeText: timeText,
                            amount: amountString,
                            balanceAsOfTx: importedAddress.getBalanceAsOfTx(hash),
                            amountType: amountType,
                            address: address,
                            description: description,
                        });
                    }
                }

                var setHistoryRows = function(updatePage) {
                    $scope.allHistoryRows = [];
                    var identity = ArcBit.getIdentity();
                    if ($history.currentSelectedAccount == null || !identity.isLocalWalletDataReady()) { return; }
                    var accountIdx = $history.currentSelectedAccount.idx;

                    $scope.displayingLocalCurrency = identity.appDelegate.preferences.isDisplayLocalCurrency();

                    if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                        var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(accountIdx);
                        setHistoryRowsHDAccount(accountObject);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(accountIdx);
                        setHistoryRowsHDAccount(accountObject);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(accountIdx);
                        setHistoryRowsHDAccount(accountObject);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                        var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(accountIdx);
                        setHistoryRowsAddress(importedAddress);
                    } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                        var importedWatchAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(accountIdx);
                        setHistoryRowsAddress(importedWatchAddress);
                    } else {
                        return;
                    }

                    $scope.nPages = Math.ceil($scope.allHistoryRows.length/limit);
                    $scope.setPage(0, updatePage);
                }

                setHistoryRows(true);

                //$tabs.loadRoute($routeParams.section, $routeParams.pocketType, $routeParams.pocketId);
                // condition because might be logged out and currentSelectedAccount not set yet
                $tabs.loadRoute($routeParams.section, $routeParams.pocketType, $history.currentSelectedAccount ? $history.currentSelectedAccount.idx : 0);

                // Link tabs from service
                $scope.tabs = $tabs;

                var checkChanges = function(type, idx, force) {

                    //TODO idx can be undefined, will not be when i remove all accounts tab

                    var newSelectedAccount = {
                        account_type: type!= undefined ? type : 'hd', // 'hd', 'ihd' etc
                        idx: idx != undefined ? idx : 0
                    };

                    $history.currentSelectedAccount = newSelectedAccount;
                    var changed = $history.setCurrentPocket(type, idx, force);
                    if (changed) {
                        $scope.pocket = $history.getCurrentPocket();
                        setHistoryRows(true);
                        $scope.selectedPocket = $history.selectedPocket;
                        $tabs.updateTabs();
                        // If the rename form is open we need to change the default shown there
                        if ($scope.forms.pocketName) {
                            $scope.forms.pocketName = $scope.pocket.name;
                        }


                        if (!identity.isLocalWalletDataReady()) { return; }
                        if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                            var accountObject = identity.appDelegate.accounts.getAccountObjectForAccountIdxNumber(idx);
                            $scope.pocket.accountName = accountObject.getAccountName();
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                            var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(idx);
                            $scope.pocket.accountName = accountObject.getAccountName();
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                            var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(idx);
                            $scope.pocket.accountName = accountObject.getAccountName();
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                            var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(idx);
                            $scope.pocket.accountName = importedAddress.getLabel();
                        } else if ($tabs.pocketType == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                            var importedWatchAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(idx);
                            $scope.pocket.accountName = importedWatchAddress.getLabel();
                        }

                        identity.appDelegate.preferences.setCurrentSelectedAccount(newSelectedAccount);
                        $history.fetchSelectedAccountBalance();
                    }
                };

                // Don't reload the controller if coming from this tab
                var lastRoute = $route.current;
                $scope.$on('$locationChangeSuccess', function(event) {

                    if ($route.current.templateUrl && $route.current.templateUrl.indexOf('wallet.html') > 0) {
                        var params = $route.current.pathParams;
                        var pocketId = params.pocketId;
                        $tabs.loadRoute(params.section, params.pocketType, pocketId, function() {
                            checkChanges(params.pocketType, pocketId?parseInt(pocketId):undefined);
                        });
                        // Overwrite the route so the template doesn't reload
                        $route.current = lastRoute;
                    }
                });

                /**
                 * Identity Loading
                 */
                var identityLoaded = function(identity) {
                    // set main address on the general section
                    identity = identity || ArcBit.getIdentity();
                    if ($history.previousIdentity != identity.name) {
                        // prevents loading the first time...
                        //if ($history.previousIdentity) {
                        var pocketId = $routeParams.pocketId;

                        checkChanges($routeParams.pocketType, pocketId?parseInt(pocketId):undefined, true);

                        // Update tabs
                        $scope.tabs.updateTabs();
                        //}

                        $history.previousIdentity = identity.name;
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                }

                var identity = ArcBit.getIdentity();
                if (identity) {
                    identityLoaded(identity);
                }

                /**
                 * Wallet port
                 */
                Port.connectNg('wallet', $scope, function(data) {
                    if (data.type == 'ready') {
                        identityLoaded();
                    }
                    else if (data.type == 'rename') {
                        $history.previousIdentity = data.newName;
                    } else if (data.type == 'EVENT_FETCHED_ADDRESSES_DATA') {
                        $history.calculateBalance();
                        setHistoryRows(true);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else if (data.type == 'EVENT_MODEL_UPDATED_NEW_UNCONFIRMED_TRANSACTION') {
                        $history.calculateBalance();
                        setHistoryRows(true);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                        sounds.play('keygenEnd');
                    } else if (data.type == 'EVENT_MODEL_UPDATED_NEW_BLOCK') {
                        setHistoryRows(true);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    } else if (data.type == 'EVENT_RECEIVE_PAYMENT') {
                        notify.success(data.receivedTo + " " + _('received') + " " + data.receivedAmount);
                        if (!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                });

                var setTitleAccount = function() {
                    $scope.subViewTitle = null;
                    $history.setBalanceView();
                };

                var setTitleNewAccount = function(title) {
                    $history.pocket.accountName = null;
                    $history.pocket.bitcoinBalance = null;
                    $history.pocket.fiatBalance = null;
                    $scope.subViewTitle = title;
                };
                /**
                 * Select an hd pocket
                 */
                $scope.selectPocket = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.HD_WALLET, rowIndex);
                    setTitleAccount();
                };

                $scope.selectImportedAccount = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT, rowIndex);
                    setTitleAccount();
                };

                $scope.selectImportedWatchAccount = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT, rowIndex);
                    setTitleAccount();
                };

                $scope.selectImportedAddress = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS, rowIndex);
                    setTitleAccount();
                };

                $scope.selectImportedWatchAddress = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS, rowIndex);
                    setTitleAccount();
                };


                $scope.selectArchivedAccount = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET, rowIndex);
                    setTitleAccount();
                };

                $scope.selectArchivedImportedAccount = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT, rowIndex);
                    setTitleAccount();
                };

                $scope.selectArchivedImportedWatchAccount = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT, rowIndex);
                    setTitleAccount();
                };

                $scope.selectArchivedImportedAddress = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS, rowIndex);
                    setTitleAccount();
                };

                $scope.selectArchivedImportedWatchAddress = function(pocketName, rowIndex) {
                    $scope.selectedPocket = false;
                    $tabs.open(TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS, rowIndex);
                    setTitleAccount();
                };

                /**
                 * Start creating a new pocket
                 */
                $scope.newPocket = function() {
                    setTitleNewAccount(_('New Account'));
                    $scope.selectedPocket = 'newPocket';
                };

                $scope.newImportedAccount = function() {
                    setTitleNewAccount(_('New Imported Account'));
                    $scope.selectedPocket = 'newImportedAccount';
                };

                $scope.newImportedWatchAccount = function() {
                    setTitleNewAccount(_('New Imported Watch Account'));
                    $scope.selectedPocket = 'newImportedWatchAccount';
                };

                $scope.newImportedAddress = function() {
                    setTitleNewAccount(_('New Imported Address'));
                    $scope.selectedPocket = 'newImportedAddress';
                };

                $scope.newImportedWatchAddress = function() {
                    setTitleNewAccount(_('New Imported Watch Address'));
                    $scope.selectedPocket = 'newImportedWatchAddress';
                };

                /**
                 * Row dropdown selector
                 */
                $scope.setCurrentRow = function(row, editForm) {
                    $scope.currentRow = row;
                    $scope.rowEdit  = {label: row.label};
                    $scope.currentForm = editForm;
                };
                $scope.saveRowLabel = function() {
                    var identity = ArcBit.getIdentity();
                    if ($scope.rowEdit.description == null || $scope.rowEdit.description == '') {
                        identity.appDelegate.appWallet.deleteTransactionTag($scope.currentRow.hash);
                        $scope.currentRow.description = null;
                    } else {
                        $scope.currentRow.description = $scope.rowEdit.description;
                        identity.appDelegate.appWallet.setTransactionTag($scope.currentRow.hash, $scope.rowEdit.description);
                    }
                };

            }]);
    });
