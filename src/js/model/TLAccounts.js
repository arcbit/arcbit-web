'use strict';

define(['model/TLWalletUtils'],
    function(TLWalletUtils) {

        function TLAccounts(appWallet, accountsArray, accountType) {
            this.appWallet = appWallet;
            this.accountType = accountType;
            this.accountsDict = {};
            this.accountsArray = [];
            this.archivedAccountsArray = [];

            for (var i = 0; i < accountsArray.length; i++) {
                var accountObject = accountsArray[i];
                if (accountObject.isArchived()) {
                    this.archivedAccountsArray.push(accountObject);
                } else {
                    this.accountsArray.push(accountObject);
                }

                accountObject.setPositionInWalletArray(i);
                this.accountsDict[i] = accountObject;
            }
        }

        TLAccounts.prototype.addAccountWithExtendedKey = function(extendedPrivateKey, defaultName) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                throw new Error("accountType == TLAccountType.HD_WALLET");
            }
            var accountObject;
            if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                accountObject = this.appWallet.addImportedAccount(extendedPrivateKey);
            } else {
                accountObject = this.appWallet.addWatchOnlyAccount(extendedPrivateKey);
            }
            this.accountsArray.push(accountObject);
            var positionInWalletArray = this.getNumberOfAccounts()+this.getNumberOfArchivedAccounts()-1;
            accountObject.setPositionInWalletArray(positionInWalletArray);
            this.accountsDict[accountObject.getPositionInWalletArray()] = accountObject;
            this.renameAccount(positionInWalletArray, defaultName);
            return accountObject;
        };

        TLAccounts.prototype.addAccount = function(accountObject) {
            if (this.accountType != TLWalletUtils.TLAccountType.HD_WALLET) {
                throw new Error("accountType != TLAccountType.HD_WALLET");
            }
            if (this.accountsDict[accountObject.getAccountIdxNumber()] != null) {
                throw new Error("this.accountsDict[accountObject.getAccountIdxNumber()] != null)");
            }
            this.accountsDict[accountObject.getAccountIdxNumber()] = accountObject;
            this.accountsArray.push(accountObject);

            return true;
        };

        TLAccounts.prototype.renameAccount = function(accountIdx, accountName) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                var accountObject = this.getAccountObjectForAccountIdxNumber(accountIdx);
                accountObject.renameAccount(accountName);
                return this.appWallet.renameAccount(accountObject.getAccountIdxNumber(), accountName);
            } else {
                var accountObject = this.getAccountObjectForAccountIdxNumber(accountIdx);
                accountObject.renameAccount(accountName);
                if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                    return this.appWallet.setImportedAccountName(accountName, accountIdx);
                } else {
                    return this.appWallet.setWatchOnlyAccountName(accountName, accountIdx);
                }
            }
        };

        //in this context accountIdx is not the accountID, accountIdx is simply the order in which i want to display the accounts, neccessary cuz accounts can be deleted and such,
        TLAccounts.prototype.getAccountObjectForIdx = function(idx) {
            return this.accountsArray[idx];
        };

        TLAccounts.prototype.getArchivedAccountObjectForIdx = function(idx) {
            return this.archivedAccountsArray[idx];
        };

        TLAccounts.prototype.getIdxForAccountObject = function(accountObject) {
            return this.accountsArray.indexOf(accountObject);
        };

        TLAccounts.prototype.getIdxForArchivedAccountObject = function(accountObject) {
            return this.archivedAccountsArray.indexOf(accountObject);
        };

        TLAccounts.prototype.getNumberOfAccounts = function() {
            return this.accountsArray.length;
        };

        TLAccounts.prototype.getNumberOfArchivedAccounts = function() {
            return this.archivedAccountsArray.length;
        };

        TLAccounts.prototype.getAccountObjectForAccountIdxNumber = function(accountIdxNumber) {
            return this.accountsDict[accountIdxNumber];
        };

        TLAccounts.prototype.archiveAccount = function(positionInWalletArray) {
            this.setArchiveAccount(positionInWalletArray, true);
            var toMoveAccountObject = this.accountsDict[positionInWalletArray];
            this.accountsArray.splice(this.accountsArray.indexOf(toMoveAccountObject), 1);
            for (var i = 0; i < this.archivedAccountsArray.length; i++) {
                var accountObject = this.archivedAccountsArray[i];
                if (accountObject.getPositionInWalletArray() > toMoveAccountObject.getPositionInWalletArray()) {
                    this.archivedAccountsArray.splice(i, 0, toMoveAccountObject);
                    return;
                }
            }
            this.archivedAccountsArray.push(toMoveAccountObject);
        };

        TLAccounts.prototype.unarchiveAccount = function(positionInWalletArray) {
            this.setArchiveAccount(positionInWalletArray, false);
            var toMoveAccountObject = this.accountsDict[positionInWalletArray];
            this.archivedAccountsArray.splice(this.archivedAccountsArray.indexOf(toMoveAccountObject), 1);
            for (var i = 0; i < this.accountsArray.length; i++) {
                var accountObject = this.accountsArray[i];
                if (accountObject.getPositionInWalletArray() > toMoveAccountObject.getPositionInWalletArray()) {
                    this.accountsArray.splice(i, 0, toMoveAccountObject);
                    return;
                }
            }
            this.accountsArray.push(toMoveAccountObject);
        };

        TLAccounts.prototype.setArchiveAccount = function(accountIdxNumber, enabled) {
            var accountObject = this.getAccountObjectForAccountIdxNumber(accountIdxNumber);
            accountObject.archiveAccount(enabled);
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                this.appWallet.archiveAccountHDWallet(accountIdxNumber, enabled);
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.archiveAccountImportedAccount(accountIdxNumber, enabled);
            } else {
                this.appWallet.archiveAccountImportedWatchAccount(accountIdxNumber, enabled);
            }
        };

        TLAccounts.prototype.getAccountWithAccountName = function(accountName) {
            for (var key in this.accountsDict.length) {
                var accountObject = this.accountsDict[key];
                if (accountObject.getAccountName() == accountName) {
                    return accountObject
                }
            }
            return null;
        };

        TLAccounts.prototype.accountNameExist = function(accountName) {
            return this.getAccountWithAccountName(accountName) == null ? false : true;
        };

        TLAccounts.prototype.createNewAccount = function(accountName, accountType, preloadStartingAddresses) {
            var accountObject = this.appWallet.createNewAccount(accountName, accountType, preloadStartingAddresses);
            accountObject.updateAccountNeedsRecovering(false);
            this.addAccount(accountObject);
            return accountObject;
        };

        TLAccounts.prototype.popTopAccount = function() {
            if (this.accountsArray.length <= 0) {
                return false;
            }
            var accountObject = this.accountsArray.pop();
            delete this.accountsDict[accountObject.getAccountIdxNumber()];
            this.appWallet.removeTopAccount();
            return true;
        };

        TLAccounts.prototype.deleteAccount = function(idx) {
            if (this.accountType == TLWalletUtils.TLAccountType.HD_WALLET) {
                throw new Error("accountType == TLAccountType.HD_WALLET");
            }
            var accountObject = this.archivedAccountsArray[idx];
            this.archivedAccountsArray.splice(idx, 1);
            if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.deleteImportedAccount(accountObject.getPositionInWalletArray());
            } else if (this.accountType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                this.appWallet.deleteWatchOnlyAccount(accountObject.getPositionInWalletArray());
            }
            delete this.accountsDict[accountObject.getPositionInWalletArray()];
            var tmpDict = {};
            for (var key in this.accountsDict) {
                var ao = this.accountsDict[key];
                tmpDict[key] = ao;
            }
            for (var key in tmpDict) {
                var ao = this.accountsDict[key];
                if (ao.getPositionInWalletArray() > accountObject.getPositionInWalletArray()) {
                    ao.setPositionInWalletArray(ao.getPositionInWalletArray()-1);
                    this.accountsDict[ao.getPositionInWalletArray()] = ao;
                }
            }
            if (accountObject.getPositionInWalletArray() < Object.keys(this.accountsDict).length - 1) {
                delete this.accountsDict[Object.keys(this.accountsDict).length-1];
            }
        };

        return TLAccounts;
    });
