/**
 * @fileOverview HistoryProvider angular provider
 */
'use strict';

define(['./module', 'arcbit', 'frontend/port', 'model/TLCoin', 'model/TLWalletUtils'],
    function (providers, ArcBit, Port, TLCoin, TLWalletUtils) {
        providers.factory('$history', ['$rootScope', function($rootScope) {

            /**
             * History provider class
             */
            function HistoryProvider($scope) {
                this.pocket = {index: undefined, type: 'init'};
                this.addrFilter = 'activeMain';
                this.FETCH_AGAIN_TIME = 900000; // 15 mins

                this.pocket.bitcoinBalance = null;
                this.pocket.fiatBalance = null;
                this.pocket._bitcoinBalance = null;
                this.pocket._fiatBalance = null;
                this.initHistoryProvider();
            }

            HistoryProvider.prototype.initHistoryProvider = function() {
                var identity = ArcBit.getIdentity();

                if (identity == null || !identity.isLocalWalletDataReady()) { return; }
                this.currentSelectedAccount = identity.appDelegate.preferences.getCurrentSelectedAccount();
                if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET ||
                    this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT ||
                    this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT ||
                    this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS ||
                    this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                    this.currentSelectedAccount.account_type = TLWalletUtils.TLSelectedAccountType.HD_WALLET;
                    this.currentSelectedAccount.idx = 0;
                }

                if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                    var accountObject = identity.appDelegate.accounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    if (!importedAddress) return;
                    this.pocket.accountName = importedAddress.getLabel();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    if (!importedAddress) return;
                    this.pocket.accountName = importedAddress.getLabel();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET) {
                    var accountObject = identity.appDelegate.accounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedAccounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                    if (!accountObject) return;
                    this.pocket.accountName = accountObject.getAccountName();
                    this.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                    this.pocket.hasTmpKey = null;
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedAddresses.getArchivedAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    if (!importedAddress) return;
                    this.pocket.accountName = importedAddress.getLabel();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedWatchAddresses.getArchivedAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    if (!importedAddress) return;
                    this.pocket.accountName = importedAddress.getLabel();
                    this.pocket.hasTmpAccountKey = null;
                    this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                }
                this.pocket._accountName = this.pocket.accountName;
            };

            HistoryProvider.prototype.fetchSelectedAccountBalance = function(fetchAgain) {
                var identity = ArcBit.getIdentity();
                if (identity == null || !identity.isLocalWalletDataReady() || !identity.appDelegate.blockExplorerAPI) { return; }
                if (!this.currentSelectedAccount) {
                    this.currentSelectedAccount = identity.appDelegate.preferences.getCurrentSelectedAccount();
                }
                var accountObject;
                if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                    accountObject = identity.appDelegate.accounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                    accountObject = identity.appDelegate.importedAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                    accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                }

                var nowTime = Math.floor(Date.now() / 1000);
                if (accountObject) {
                    if ((accountObject.hasFetchedAccountData() && nowTime - accountObject.lastFetchTime < this.FETCH_AGAIN_TIME && !fetchAgain)
                        || accountObject.isFetchingTxs) {
                        return;
                    }

                    identity.appDelegate.postEvent('wallet', {'type': 'EVENT_FETCHING_BALANCE'});
                    accountObject.getAccountData(function() {
                        identity.appDelegate.postEvent('wallet', {'type': 'EVENT_FINISH_FETCHING_BALANCE'});
                    }, function() {
                        identity.appDelegate.postEvent('wallet', {'type': 'ERROR_FETCHING_BALANCE'});
                    });
                    return;
                }

                var importedAddress;
                if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                    importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                    importedAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                }
                if (importedAddress) {
                    if ((importedAddress.hasFetchedAccountData() && nowTime - importedAddress.lastFetchTime < this.FETCH_AGAIN_TIME && !fetchAgain)
                        || importedAddress.isFetchingTxs) {
                        return;
                    }
                    identity.appDelegate.postEvent('wallet', {'type': 'EVENT_FETCHING_BALANCE'});
                    importedAddress.getSingleAddressData(function() {
                        identity.appDelegate.postEvent('wallet', {'type': 'EVENT_FINISH_FETCHING_BALANCE'});
                    }, function() {
                        identity.appDelegate.postEvent('wallet', {'type': 'ERROR_FETCHING_BALANCE'});
                    });
                }
            };

            HistoryProvider.prototype.getSelectedAccountBalance = function() {
                var identity = ArcBit.getIdentity();
                if (!identity.isLocalWalletDataReady()) { return; }
                if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.HD_WALLET) {
                    var accountObject = identity.appDelegate.accounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    return accountObject.getBalance();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    return accountObject.getBalance();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT) {
                    var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForAccountIdxNumber(this.currentSelectedAccount.idx);
                    return accountObject.getBalance();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    return importedAddress.getBalance();
                } else if (this.currentSelectedAccount.account_type == TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS) {
                    var importedAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                    return importedAddress.getBalance();
                }
                return null;
            };

            HistoryProvider.prototype.setBalanceView = function() {
                this.pocket.accountName = this.pocket._accountName;
                this.pocket.bitcoinBalance = this.pocket._bitcoinBalance;
                this.pocket.fiatBalance = this.pocket._fiatBalance;
            };

            HistoryProvider.prototype.calculateBalance = function() {
                var balance = this.getSelectedAccountBalance();
                this.pocket.bitcoinBalance = balance;
                this.pocket.fiatBalance = balance;
                this.pocket._bitcoinBalance = balance;
                this.pocket._fiatBalance = balance;
            };

            HistoryProvider.prototype.getCurrentPocket = function() {
                return this.pocket;
            };

            HistoryProvider.prototype.setCurrentPocket = function(type, idx, force) {
                if (type === this.pocket.type && idx === this.pocket.lastIndex && !force) {
                    return false;
                }

                var identity = ArcBit.getIdentity();
                if (!identity.isLocalWalletDataReady()) { return; }

                var self = this;
                var setTmpTitleVars = function() {
                    self.pocket._accountName = self.pocket.accountName;
                    self.pocket._bitcoinBalance = self.pocket.bitcoinBalance;
                    self.pocket._fiatBalance = self.pocket.fiatBalance;
                };
                switch(type) {
                    case TLWalletUtils.TLSelectedAccountType.HD_WALLET:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.HD_WALLET + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.accounts.getAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = accountObject.getExtendedPrivKey();
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        if (accountObject.stealthWallet) this.pocket.mainAddress = accountObject.stealthWallet.getStealthAddress();
                        this.pocket.bitcoinBalance = accountObject.getBalance();
                        this.pocket.fiatBalance = accountObject.getBalance();
                        setTmpTitleVars();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.IMPORTED_ACCOUNT + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.importedAccounts.getAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = accountObject.getExtendedPrivKey();
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        if (accountObject.stealthWallet) this.pocket.mainAddress = accountObject.stealthWallet.getStealthAddress();
                        this.pocket.bitcoinBalance = accountObject.getBalance();
                        this.pocket.fiatBalance = accountObject.getBalance();
                        setTmpTitleVars();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ACCOUNT + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.importedWatchAccounts.getAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = null;
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        this.pocket.mainAddress = null;
                        this.pocket.bitcoinBalance = accountObject.getBalance();
                        this.pocket.fiatBalance = accountObject.getBalance();
                        this.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                        setTmpTitleVars();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.IMPORTED_ADDRESS + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var importedAddress = identity.appDelegate.importedAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = importedAddress.getLabel();
                        this.pocket.xprv = null;
                        this.pocket.xpub = null;
                        this.pocket.key = importedAddress.getEitherPrivateKeyOrEncryptedPrivateKey();
                        this.pocket.addr = importedAddress.getAddress();
                        this.pocket.mainAddress = importedAddress.getAddress();
                        this.pocket.bitcoinBalance = importedAddress.getBalance();
                        this.pocket.fiatBalance = importedAddress.getBalance();
                        this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.IMPORTED_WATCH_ADDRESS + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var importedAddress = identity.appDelegate.importedWatchAddresses.getAddressObjectAtIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = importedAddress.getLabel();
                        this.pocket.xprv = null;
                        this.pocket.xpub = null;
                        this.pocket.key = null;
                        this.pocket.addr = importedAddress.getAddress();
                        this.pocket.mainAddress = importedAddress.getAddress();
                        this.pocket.bitcoinBalance = importedAddress.getBalance();
                        this.pocket.fiatBalance = importedAddress.getBalance();
                        this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                        setTmpTitleVars();
                        break;

                    case TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.ARCHIVED_HD_WALLET + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.accounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = accountObject.getExtendedPrivKey();
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        if (accountObject.stealthWallet) this.pocket.mainAddress = accountObject.stealthWallet.getStealthAddress();
                        this.pocket.bitcoinBalance = null;
                        this.pocket.fiatBalance = null;
                        break;
                    case TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ACCOUNT + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.importedAccounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = accountObject.getExtendedPrivKey();
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        if (accountObject.stealthWallet) this.pocket.mainAddress = accountObject.stealthWallet.getStealthAddress();
                        this.pocket.bitcoinBalance = null;
                        this.pocket.fiatBalance = null;
                        setTmpTitleVars();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ACCOUNT + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var accountObject = identity.appDelegate.importedWatchAccounts.getArchivedAccountObjectForIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = accountObject.getAccountName();
                        this.pocket.xprv = null;
                        this.pocket.xpub = accountObject.getExtendedPubKey();
                        this.pocket.key = null;
                        this.pocket.addr = null;
                        this.pocket.mainAddress = null;
                        this.pocket.bitcoinBalance = null;
                        this.pocket.fiatBalance = null;
                        this.pocket.hasTmpAccountKey = accountObject.hasSetExtendedPrivateKeyInMemory();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_ADDRESS + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var importedAddress = identity.appDelegate.importedAddresses.getArchivedAddressObjectAtIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = importedAddress.getLabel();
                        this.pocket.xprv = null;
                        this.pocket.xpub = null;
                        this.pocket.mainAddress = importedAddress.getAddress();
                        this.pocket.key = importedAddress.getEitherPrivateKeyOrEncryptedPrivateKey();
                        this.pocket.addr = importedAddress.getAddress();
                        this.pocket.bitcoinBalance = null;
                        this.pocket.fiatBalance = null;
                        this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                        setTmpTitleVars();
                        break;
                    case TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS:
                        this.selectedPocket = TLWalletUtils.TLSelectedAccountType.ARCHIVED_IMPORTED_WATCH_ADDRESS + ':' + idx;
                        this.pocket.lastIndex = idx;
                        this.pocket.index = idx;
                        this.pocket.type = type;
                        var importedAddress = identity.appDelegate.importedWatchAddresses.getArchivedAddressObjectAtIdx(this.currentSelectedAccount.idx);
                        this.pocket.accountName = importedAddress.getLabel();
                        this.pocket.xprv = null;
                        this.pocket.xpub = null;
                        this.pocket.mainAddress = importedAddress.getAddress();
                        this.pocket.key = null;
                        this.pocket.addr = importedAddress.getAddress();
                        this.pocket.bitcoinBalance = null;
                        this.pocket.fiatBalance = null;
                        this.pocket.hasTmpKey = importedAddress.hasSetPrivateKeyInMemory();
                        setTmpTitleVars();
                        break;
                }
                return true;
            };

            HistoryProvider.prototype.setAddressFilter = function(name) {
                this.addrFilter = name;
                return name;
            };

            return new HistoryProvider($rootScope.$new());
        }]);
    });
