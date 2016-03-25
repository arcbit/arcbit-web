'use strict';

define(['model/TLWalletJSONKeys', 'model/TLHDWalletWrapper', 'model/TLWalletUtils', 'model/TLCoin',
        'model/TLBitcoinJSWrapper', 'model/TLAccountObject', 'model/TLImportedAddress', 'model/TLStealthExplorerAPI'],
    function(TLWalletJSONKeys, TLHDWalletWrapper, TLWalletUtils, TLCoin, TLBitcoinJSWrapper, TLAccountObject,
             TLImportedAddress, TLStealthExplorerAPI) {

        function TLWallet(appDelegate, walletName) {
            this.appDelegate = appDelegate;
            this.walletName = walletName;
            this.currentHDWalletIdx = 0;
        }

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.createStealthAddressDict = function (extendKey, isPrivateExtendedKey, isTestnet) {
            if (isPrivateExtendedKey != true) {
                throw new Error("Cant generate stealth address scan key from xpub key");
            }

            var stealthAddressDict = {};
            var stealthAddressObject = TLHDWalletWrapper.getStealthAddress(extendKey, isTestnet);
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS] = stealthAddressObject['stealthAddress'];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SCAN_KEY] = stealthAddressObject['scanPriv'];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESS_SPEND_KEY] = stealthAddressObject['spendPriv'];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_SERVERS] = {};
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS] = [];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LAST_TX_TIME] = 0;
            return stealthAddressDict;
        };

        TLWallet.prototype.createAccountDictWithPreload = function (accountName, extendedKey, isPrivateExtendedKey,
                                                                    accountIdx, preloadStartingAddresses, isTestnet) {
            var account = {};
            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = accountName;
            account[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_IDX] = accountIdx;
            if (isPrivateExtendedKey) {
                var extendedPublickey = TLHDWalletWrapper.getExtendPubKey(extendedKey, isTestnet);
                account[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY] = extendedPublickey;
                account[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PRIVATE_KEY] = extendedKey;
                var stealthAddressesArray = [];
                var stealthAddressDict = this.createStealthAddressDict(extendedKey, isPrivateExtendedKey, isTestnet);
                stealthAddressesArray.push(stealthAddressDict);

                account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES] = stealthAddressesArray;
            } else {
                account[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY] = extendedKey;
            }

            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            account[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING] = true;

            var mainAddressesArray = [];
            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES] = mainAddressesArray;
            var changeAddressesArray = [];
            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES] = changeAddressesArray;

            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX] = 0;
            account[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX] = 0;

            if (!preloadStartingAddresses) {
                return account;
            }

            //create initial receiving address
            for (var i = 0; i < TLAccountObject.MAX_ACCOUNT_WAIT_TO_RECEIVE_ADDRESS; i++) {
                var mainAddressDict = {};
                var mainAddressIdx = i;
                var mainAddressSequence = [TLWalletJSONKeys.TLAddressType.MAIN, mainAddressIdx];

                var extendedPublicKey = account[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
                var address = TLHDWalletWrapper.getAddress(extendedPublicKey, mainAddressSequence, TLBitcoinJSWrapper.getNetwork(isTestnet));
                mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
                mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
                mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX] = i;

                mainAddressesArray.push(mainAddressDict);
            }

            var changeAddressDict = {};
            var changeAddressIdx = 0;
            var changeAddressSequence = [TLWalletJSONKeys.TLAddressType.CHANGE, changeAddressIdx];
            var address = TLHDWalletWrapper.getAddress(extendedPublicKey, changeAddressSequence, TLBitcoinJSWrapper.getNetwork(isTestnet));
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX] = 0;

            changeAddressesArray.push(changeAddressDict);

            return account;
        };

        TLWallet.prototype.getAccountDict = function (accountIdx) {
            var accountsArray = this.getAccountsArray();
            return accountsArray[accountIdx];
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.clearAllAddressesFromHDWallet = function (accountIdx) {
            var accountDict = this.getAccountDict(accountIdx);
            var mainAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES] = mainAddressesArray;
            var changeAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES] = changeAddressesArray;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX] = 0;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX] = 0;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.clearAllAddressesFromImportedAccount = function (idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            var mainAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES] = mainAddressesArray;
            var changeAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES] = changeAddressesArray;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX] = 0;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX] = 0;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.clearAllAddressesFromImportedWatchAccount = function (idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            var mainAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES] = mainAddressesArray;
            var changeAddressesArray = [];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES] = changeAddressesArray;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX] = 0;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX] = 0;
            this.appDelegate.saveWalletPayloadDelay();
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.updateAccountNeedsRecoveringFromHDWallet = function (accountIdx, accountNeedsRecovering) {
            var accountDict = this.getAccountDict(accountIdx);
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING] = accountNeedsRecovering;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.updateAccountNeedsRecoveringFromImportedAccount = function (idx, accountNeedsRecovering) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING] = accountNeedsRecovering;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.updateAccountNeedsRecoveringFromImportedWatchAccount = function (idx, accountNeedsRecovering) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_ACCOUNT_NEEDS_RECOVERING] = accountNeedsRecovering;
            this.appDelegate.saveWalletPayloadDelay();
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.updateMainAddressStatusFromHDWallet = function (accountIdx, addressIdx, addressStatus) {
            var accountDict = this.getAccountDict(accountIdx);
            this.updateMainAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateMainAddressStatusFromImportedAccount = function (idx, addressIdx, addressStatus) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.updateMainAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateMainAddressStatusFromImportedWatchAccount = function (idx, addressIdx, addressStatus) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.updateMainAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateMainAddressStatus = function (accountDict, addressIdx, addressStatus) {
            var minMainAddressIdx = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX];
            if (addressIdx != minMainAddressIdx) {
                throw new Error("addressIdx != minMainAddressIdx");
            }

            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX] = minMainAddressIdx + 1;
            var mainAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES];

            if (addressStatus == TLWalletJSONKeys.TLAddressStatus.ARCHIVED && !TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                mainAddressesArray.splice(0, 1);
            } else {
                var mainAddressDict = mainAddressesArray[addressIdx];
                mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = addressStatus;

            }
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.updateChangeAddressStatusFromHDWallet = function (accountIdx, addressIdx, addressStatus) {
            var accountDict = this.getAccountDict(accountIdx);
            this.updateChangeAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateChangeAddressStatusFromImportedAccount = function (idx, addressIdx, addressStatus) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.updateChangeAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateChangeAddressStatusFromImportedWatchAccount = function (idx, addressIdx, addressStatus) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.updateChangeAddressStatus(accountDict, addressIdx, addressStatus);
        };

        TLWallet.prototype.updateChangeAddressStatus = function (accountDict, addressIdx, addressStatus) {
            var minChangeAddressIdx = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX];
            if (addressIdx != minChangeAddressIdx) {
                throw new Error("addressIdx != minChangeAddressIdx");
            }
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX] = minChangeAddressIdx + 1;

            var changeAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES];

            if (addressStatus == TLWalletJSONKeys.TLAddressStatus.ARCHIVED && !TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                changeAddressesArray.splice(0, 1);
            } else {
                var changeAddressDict = changeAddressesArray[addressIdx];
                changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = addressStatus;

            }
            this.appDelegate.saveWalletPayloadDelay();
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.getMinMainAddressIdxFromHDWallet = function (accountIdx) {
            var accountDict = this.getAccountDict(accountIdx);
            return this.getMinMainAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinMainAddressIdxFromImportedAccount = function (idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.getMinMainAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinMainAddressIdxFromImportedWatchAccount = function (idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.getMinMainAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinMainAddressIdx = function (accountDict) {
            return accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX];
        };

        TLWallet.prototype.getMinChangeAddressIdxFromHDWallet = function (accountIdx) {
            var accountDict = this.getAccountDict(accountIdx);
            return this.getMinChangeAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinChangeAddressIdxFromImportedAccount = function (idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.getMinChangeAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinChangeAddressIdxFromImportedWatchAccount = function (idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.getMinChangeAddressIdx(accountDict);
        };

        TLWallet.prototype.getMinChangeAddressIdx = function (accountDict) {
            return accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX];
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.getNewMainAddressFromHDWallet = function (accountIdx, expectedAddressIndex) {
            var accountDict = this.getAccountDict(accountIdx);
            return this.getNewMainAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewMainAddressFromImportedAccount = function (idx, expectedAddressIndex) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.getNewMainAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewMainAddressFromImportedWatchAccount = function (idx, expectedAddressIndex) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.getNewMainAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewMainAddress = function (accountDict, expectedAddressIndex) {
            var mainAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES];
            var mainAddressIdx;
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                if (expectedAddressIndex != mainAddressesArray.length) {
                    throw new Error("expectedAddressIndex != mainAddressesArray.length");
                }
                mainAddressIdx = mainAddressesArray.length;
            } else {
                var minMainAddressIdx = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_MAIN_ADDRESS_IDX];
                //console.log("getNewMainAddress " + expectedAddressIndex + ' ' + mainAddressesArray.length + ' ' + minMainAddressIdx);
                if (expectedAddressIndex != mainAddressesArray.length + minMainAddressIdx) {
                    throw new Error("expectedAddressIndex != mainAddressesArray.length + minMainAddressIdx");
                }
                mainAddressIdx = expectedAddressIndex;
            }

            if (mainAddressIdx >= Number.MAX_SAFE_INTEGER) {
                throw "Universe ended" + "reached max hdwallet index";
            }

            var mainAddressSequence = [TLWalletJSONKeys.TLAddressType.MAIN, mainAddressIdx];
            var mainAddressDict = {};

            var extendedPublicKey = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
            var address = TLHDWalletWrapper.getAddress(extendedPublicKey, mainAddressSequence, TLBitcoinJSWrapper.getNetwork(this.isTestnet()));
            mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX] = mainAddressIdx;

            mainAddressesArray.push(mainAddressDict);
            this.appDelegate.saveWalletPayloadDelay();
            return mainAddressDict;
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.getNewChangeAddressFromHDWallet = function (accountIdx, expectedAddressIndex) {
            var accountDict = this.getAccountDict(accountIdx);
            return this.getNewChangeAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewChangeAddressFromImportedAccount = function (idx, expectedAddressIndex) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.getNewChangeAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewChangeAddressFromImportedWatchAccount = function (idx, expectedAddressIndex) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.getNewChangeAddress(accountDict, expectedAddressIndex);
        };

        TLWallet.prototype.getNewChangeAddress = function (accountDict, expectedAddressIndex) {
            var changeAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES];
            var changeAddressIdx;
            if (TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON) {
                if (expectedAddressIndex != changeAddressesArray.length) {
                    throw new Error("expectedAddressIndex != changeAddressesArray.length");
                }
                changeAddressIdx = changeAddressesArray.length;
            } else {
                var minChangeAddressIdx = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MIN_CHANGE_ADDRESS_IDX];
                //console.log("getNewChangeAddress " + expectedAddressIndex + ' ' + changeAddressesArray.length + ' ' + minChangeAddressIdx);
                if (expectedAddressIndex != changeAddressesArray.length + minChangeAddressIdx) {
                    throw new Error("expectedAddressIndex != changeAddressesArray.length + minChangeAddressIdx");
                }
                changeAddressIdx = expectedAddressIndex;
            }

            if (changeAddressIdx >= Number.MAX_SAFE_INTEGER) {
                throw "Universe ended" + "reached max hdwallet index";
            }

            var changeAddressSequence = [TLWalletJSONKeys.TLAddressType.CHANGE, changeAddressIdx];
            var changeAddressDict = {};

            var extendedPublicKey = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_EXTENDED_PUBLIC_KEY];
            var address = TLHDWalletWrapper.getAddress(extendedPublicKey, changeAddressSequence, TLBitcoinJSWrapper.getNetwork(this.isTestnet()));
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_INDEX] = changeAddressIdx;

            changeAddressesArray.push(changeAddressDict);
            this.appDelegate.saveWalletPayloadDelay();
            return changeAddressDict;
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.removeTopMainAddressFromHDWallet = function (idx) {
            var accountDict = this.getAccountDict(idx);
            return this.removeTopMainAddress(accountDict);
        };

        TLWallet.prototype.removeTopMainAddressFromImportedAccount = function (idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.removeTopMainAddress(accountDict);
        };

        TLWallet.prototype.removeTopMainAddressFromImportedWatchAccount = function (idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.removeTopMainAddress(accountDict);
        };

        TLWallet.prototype.removeTopMainAddress = function (accountDict) {
            var mainAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAIN_ADDRESSES];
            if (mainAddressesArray.length > 0) {
                var mainAddressDict = mainAddressesArray.pop();
                this.appDelegate.saveWalletPayloadDelay();
                return mainAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
            }

            return null;
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.removeTopChangeAddressFromHDWallet = function (idx) {
            var accountDict = this.getAccountDict(idx);
            return this.removeTopChangeAddress(accountDict);
        };

        TLWallet.prototype.removeTopChangeAddressFromImportedAccount = function (idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            return this.removeTopChangeAddress(accountDict);
        };

        TLWallet.prototype.removeTopChangeAddressFromImportedWatchAccount = function (idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            return this.removeTopChangeAddress(accountDict);
        };

        TLWallet.prototype.removeTopChangeAddress = function (accountDict) {
            var changeAddressesArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHANGE_ADDRESSES];
            if (changeAddressesArray.length > 0) {
                var changeAddressDict = changeAddressesArray.pop();
                this.appDelegate.saveWalletPayloadDelay();
                return changeAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS];
            }

            return null;
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.archiveAccountHDWallet = function (accountIdx, enabled) {
            var accountsArray = this.getAccountsArray();
            if (accountsArray.length == 0) {
                throw new Error("accountsArray.length == 0");
            }
            var accountDict = accountsArray[accountIdx];
            var status = enabled ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.archiveAccountImportedAccount = function (idx, enabled) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            var status = enabled ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.archiveAccountImportedWatchAccount = function (idx, enabled) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            var status = enabled ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
            this.appDelegate.saveWalletPayloadDelay();
        };

        //----------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.getAccountsArray = function () {
            var hdWalletDict = this.getHDWallet();
            var accountsArray = hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ACCOUNTS];
            return accountsArray;
        };

        TLWallet.prototype.removeTopAccount = function () {
            var accountsArray = this.getAccountsArray();
            if (accountsArray.length > 0) {
                accountsArray.pop();
                var hdWalletDict = this.getHDWallet();
                var maxAccountIDCreated = hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED];
                hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED] = maxAccountIDCreated - 1;
                this.appDelegate.saveWalletPayloadDelay();
                return true;
            }

            return false;
        };

        TLWallet.prototype.createNewAccount = function (accountName, accountType, preloadStartingAddresses) {
            if (this.masterHex == null) {
                throw new Error("this.masterHex == null");
            }

            var hdWalletDict = this.getHDWallet();
            var accountsArray = this.getAccountsArray();
            var maxAccountIDCreated = hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED];
            var extendPrivKey = TLHDWalletWrapper.getExtendPrivKey(this.masterHex, maxAccountIDCreated, TLBitcoinJSWrapper.getNetwork(this.isTestnet()));
            var accountDict = this.createAccountDictWithPreload(accountName, extendPrivKey, true, maxAccountIDCreated,
                preloadStartingAddresses, this.isTestnet());
            accountsArray.push(accountDict);
            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED] = maxAccountIDCreated + 1;
            this.appDelegate.saveWalletPayloadDelay();

            if (this.getCurrentAccountID == null) {
                this.setCurrentAccountID('0');
            }
            return new TLAccountObject(this.appDelegate, this, accountDict, TLWalletUtils.TLAccountType.HD_WALLET);
        };

        TLWallet.prototype.createWallet = function (passPhrase, masterHex, walletName) {
            var createdWalletDict = {};

            var hdWalletDict = {};
            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = walletName;
            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MASTER_HEX] = masterHex;
            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSPHRASE] = passPhrase;

            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MAX_ACCOUNTS_CREATED] = 0;

            var accountsArray = [];
            hdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ACCOUNTS] = accountsArray;
            var hdWalletsArray = [];
            hdWalletsArray.push(hdWalletDict);
            createdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_HDWALLETS] = hdWalletsArray;

            var importedKeysDict = {};

            var importedAccountsArray = [];
            var watchOnlyAccountsArray = [];
            var importedPrivateKeysArray = [];
            var watchOnlyAddressesArray = [];
            importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS] = importedAccountsArray;
            importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS] = watchOnlyAccountsArray;
            importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS] = importedPrivateKeysArray;
            importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES] = watchOnlyAddressesArray;

            createdWalletDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTS] = importedKeysDict;

            return createdWalletDict;
        };

        TLWallet.prototype.getImportedKeysDict = function () {
            var hdWallet = this.getCurrentWallet();
            return hdWallet[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTS];
        };

        TLWallet.prototype.getImportedAccountAtIndex = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();
            var importedAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS];
            return importedAccountsArray[idx];
        };

        TLWallet.prototype.getImportedWatchOnlyAccountAtIndex = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();
            var watchOnlyAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS];
            return watchOnlyAccountsArray[idx];
        };

        //------------------------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.addImportedAccount = function (extendedPrivateKey) {
            var importedKeysDict = this.getImportedKeysDict();
            var importedAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS];

            var accountIdx = importedAccountsArray.length;
            var accountDict = this.createAccountDictWithPreload('', extendedPrivateKey, true, accountIdx, false, this.isTestnet());
            //var accountDict = this.createAccountDictWithPreload('', extendedPrivateKey, true, accountIdx, true, this.isTestnet()); //DEBUG

            importedAccountsArray.push(accountDict);
            this.appDelegate.saveWalletPayloadDelay();
            return new TLAccountObject(this.appDelegate, this, accountDict, TLWalletUtils.TLAccountType.IMPORTED);
        };

        TLWallet.prototype.deleteImportedAccount = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var importedAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS];
            importedAccountsArray.splice(idx, 1);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setImportedAccountName = function (name, idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = name;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.getImportedAccountArray = function () {
            var importedKeysDict = this.getImportedKeysDict();

            var accountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_ACCOUNTS];
            var accountObjectArray = [];
            for (var i = 0; i < accountsArray.length; i++) {
                var accountObject = new TLAccountObject(this.appDelegate, this, accountsArray[i], TLWalletUtils.TLAccountType.IMPORTED);
                accountObjectArray.push(accountObject);
            }

            return accountObjectArray;
        };

        TLWallet.prototype.addWatchOnlyAccount = function (extendedPublicKey) {
            var importedKeysDict = this.getImportedKeysDict();
            var watchOnlyAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS];

            var accountIdx = watchOnlyAccountsArray.length;
            var watchOnlyAccountDict = this.createAccountDictWithPreload('', extendedPublicKey, false, accountIdx, false, this.isTestnet());
            //var watchOnlyAccountDict = this.createAccountDictWithPreload('', extendedPublicKey, false, accountIdx, true, this.isTestnet()); //DEBUG

            watchOnlyAccountsArray.push(watchOnlyAccountDict);
            this.appDelegate.saveWalletPayloadDelay();
            return new TLAccountObject(this.appDelegate, this, watchOnlyAccountDict, TLWalletUtils.TLAccountType.IMPORTED_WATCH);
        };

        TLWallet.prototype.deleteWatchOnlyAccount = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var watchOnlyAccountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS];
            watchOnlyAccountsArray.splice(idx, 1);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setWatchOnlyAccountName = function (name, idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = name;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.getWatchOnlyAccountArray = function () {
            var importedKeysDict = this.getImportedKeysDict();

            var accountsArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ACCOUNTS];
            var accountObjectArray = [];
            for (var i = 0; i < accountsArray.length; i++) {
                var accountObject = new TLAccountObject(this.appDelegate, this, accountsArray[i], TLWalletUtils.TLAccountType.IMPORTED_WATCH);
                accountObjectArray.push(accountObject);
            }

            return accountObjectArray;
        };

        TLWallet.prototype.addImportedPrivateKey = function (privateKey, encryptedPrivateKey) {
            var importedKeysDict = this.getImportedKeysDict();
            var importedPrivateKeyArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS];
            var importedPrivateKey = {};
            if (encryptedPrivateKey == null) {
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY] = privateKey;
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = TLBitcoinJSWrapper.getAddress(privateKey,
                    TLBitcoinJSWrapper.getNetwork(this.isTestnet()));
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = '';
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            } else {
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY] = encryptedPrivateKey;
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = TLBitcoinJSWrapper.getAddress(privateKey,
                    TLBitcoinJSWrapper.getNetwork(this.isTestnet()));
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = '';
                importedPrivateKey[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            }

            importedPrivateKeyArray.push(importedPrivateKey);
            this.appDelegate.saveWalletPayloadDelay();
            return importedPrivateKey;
        };

        TLWallet.prototype.deleteImportedPrivateKey = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var importedPrivateKeyArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS];
            importedPrivateKeyArray.splice(idx, 1);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setImportedPrivateKeyLabel = function (label, idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var importedPrivateKeyArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS];
            var privateKeyDict = importedPrivateKeyArray[idx];
            privateKeyDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = label;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setImportedPrivateKeyArchive = function (archive, idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var importedPrivateKeyArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS];
            var privateKeyDict = importedPrivateKeyArray[idx];
            var status = archive ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            privateKeyDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
            this.appDelegate.saveWalletPayloadDelay();
        };


        TLWallet.prototype.getImportedPrivateKeyArray = function () {
            var importedKeysDict = this.getImportedKeysDict();

            var importedAddresses = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_IMPORTED_PRIVATE_KEYS];
            var importedAddressesObjectArray = [];
            for (var i = 0; i < importedAddresses.length; i++) {
                var importedAddressObject = new TLImportedAddress(this.appDelegate, importedAddresses[i]);
                importedAddressesObjectArray.push(importedAddressObject);
            }

            return importedAddressesObjectArray;
        };

        TLWallet.prototype.addWatchOnlyAddress = function (address) {
            var importedKeysDict = this.getImportedKeysDict();
            var watchOnlyAddressArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES];
            var watchOnlyAddress = {};
            watchOnlyAddress[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            watchOnlyAddress[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = '';
            watchOnlyAddress[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = TLWalletJSONKeys.TLAddressStatus.ACTIVE;

            watchOnlyAddressArray.push(watchOnlyAddress);
            this.appDelegate.saveWalletPayloadDelay();
            return watchOnlyAddress;
        };

        TLWallet.prototype.deleteImportedWatchAddress = function (idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var watchOnlyAddressArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES];
            watchOnlyAddressArray.splice(idx, 1);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setWatchOnlyAddressLabel = function (label, idx) {
            var importedKeysDict = this.getImportedKeysDict();

            var watchOnlyAddressArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES];
            var addressDict = watchOnlyAddressArray[idx];
            addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = label;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setWatchOnlyAddressArchive = function (archive, idx) {
            var importedKeysDict = this.getImportedKeysDict();
            var watchOnlyAddressArray = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES];
            var addressDict = watchOnlyAddressArray[idx];
            var status = archive ? TLWalletJSONKeys.TLAddressStatus.ARCHIVED : TLWalletJSONKeys.TLAddressStatus.ACTIVE;
            addressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = status;
            this.appDelegate.saveWalletPayloadDelay();
        };


        TLWallet.prototype.getWatchOnlyAddressArray = function () {
            var importedKeysDict = this.getImportedKeysDict();

            var importedAddresses = importedKeysDict[TLWalletJSONKeys.WALLET_PAYLOAD_WATCH_ONLY_ADDRESSES];
            var importedAddressesObjectArray = [];
            for (var i = 0; i < importedAddresses.length; i++) {
                var importedAddressObject = new TLImportedAddress(this.appDelegate, importedAddresses[i]);
                importedAddressesObjectArray.push(importedAddressObject);
            }

            return importedAddressesObjectArray;
        };

        //------------------------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------------------------
        //------------------------------------------------------------------------------------------------------------------------------------------------

        TLWallet.prototype.getAddressBook = function () {
            return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK];
        };

        TLWallet.prototype.addAddressBookEntry = function (address, label) {
            var addressBookArray = this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK];
            var dict = {};
            dict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            dict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = label;
            addressBookArray.push(dict);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.editAddressBookEntry = function (index, label) {
            var addressBookArray = this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK];
            addressBookArray[index][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LABEL] = label;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.deleteAddressBookEntry = function (idx) {
            var addressBookArray = this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK];
            addressBookArray.splice(idx, 1);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setTransactionTag = function (txid, tag) {
            var transactionLabelDict = this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TRANSACTION_TAGS];
            transactionLabelDict[txid] = tag;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.deleteTransactionTag = function (txid) {
            var transactionLabelDict = this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TRANSACTION_TAGS];
            delete transactionLabelDict[txid];
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.getTransactionTag = function (txid) {
            return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TRANSACTION_TAGS][txid];
        };

        TLWallet.prototype.isTestnet = function() {
            return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_IS_TESTNET];
        };

        TLWallet.prototype.createNewWallet = function (passPhrase, masterHex, walletName, isTestnet) {
            if (isTestnet == null) {
                throw new Error("isTestnet == null");
            }
            var walletsArray = this.getWallets();
            var walletDict = this.createWallet(passPhrase, masterHex, walletName);
            walletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_IS_TESTNET] = isTestnet;
            walletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS_BOOK] = [];
            walletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TRANSACTION_TAGS] = {};
            walletDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PREFERENCES] = {};
            walletsArray.push(walletDict);
        };

        TLWallet.prototype.createInitialWalletPayload = function(passPhrase, masterHex, isTestnet) {
            this.passPhrase = passPhrase;
            this.masterHex = masterHex;
            this.rootDict = {};
            var walletsArray = [];
            this.rootDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_VERSION] = TLWalletJSONKeys.WALLET_PAYLOAD_VERSION;
            var payload = {};
            this.rootDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD] = payload;
            payload[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WALLETS] = walletsArray;
            this.createNewWallet(passPhrase, masterHex, "default", isTestnet);
            this.appDelegate.saveWalletPayloadDelay();
            return JSON.stringify(this.rootDict);
        };

        TLWallet.prototype.loadWalletPayload = function(walletPayload) {
            this.rootDict = walletPayload;
            this.passPhrase = this.getHDWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PASSPHRASE];
            this.masterHex = this.getHDWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_MASTER_HEX];;
        };

        TLWallet.prototype.setLoginPassword = function (loginPassword) {
            var wallet = this.getCurrentWallet();
            wallet[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LOGIN_PASSWORD] = loginPassword;
        };

        //TLWallet.prototype.getLoginPassword = function () {
        //    return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LOGIN_PASSWORD];
        //};

        TLWallet.prototype.getPassPhrase = function() {
            return this.passPhrase;
        };

        TLWallet.prototype.getMasterHex = function() {
            return this.masterHex;
        };

        TLWallet.prototype.getWalletsJson = function() {
            return this.rootDict;
        };

        TLWallet.prototype.getWallets = function() {
            return this.rootDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYLOAD][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WALLETS];
        };

        TLWallet.prototype.getFirstWallet = function() {
            return this.getWallets()[0];
        };

        TLWallet.prototype.getCurrentWallet = function() {
            return this.getFirstWallet();
        };

        TLWallet.prototype.getHDWallet = function() {
            return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_HDWALLETS][0];
        };

        TLWallet.prototype.getCurrentAccountID = function() {
            var hdWallet = this.getHDWallet();
            return hdWallet[TLWalletJSONKeys.WALLET_PAYLOAD_CURRENT_ACCOUNT_ID];
        };

        TLWallet.prototype.setCurrentAccountID = function(accountID) {
            var hdWallet = this.getHDWallet();
            hdWallet[TLWalletJSONKeys.WALLET_PAYLOAD_CURRENT_ACCOUNT_ID] = accountID;
        };

        TLWallet.prototype.renameAccount = function(accountIdxNumber, accountName) {
            var accountsArray = this.getAccountsArray();
            var accountDict = accountsArray[accountIdxNumber];
            accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_NAME] = accountName;
            this.appDelegate.saveWalletPayloadDelay();
        };


        TLWallet.prototype.getAccountObjectArray = function() {
            var accountsArray = this.getAccountsArray();

            var accountObjectArray = [];
            for (var i = 0; i < accountsArray.length; i++) {
                var accountObject = new TLAccountObject(this.appDelegate, this, accountsArray[i], TLWalletUtils.TLAccountType.HD_WALLET);

                accountObjectArray.push(accountObject);
            }

            return accountObjectArray;
        };

        TLWallet.prototype.getAccountObjectForIdx = function(accountIdx) {
            var accountsArray = this.getAccountsArray();
            var accountDict = accountsArray(accountIdx);
            return new TLAccountObject(this.appDelegate, this, accountDict, TLWalletUtils.TLAccountType.HD_WALLET);
        };

        //------------------------------------------------------------------------------------------------------------------------------------------------
        // TLWallet+Stealth

        TLWallet.prototype.setStealthAddressServerStatus = function(accountDict, serverURL, isWatching) {
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var stealthAddressServersDict = stealthAddressArray[0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_SERVERS];
            if (stealthAddressServersDict[serverURL] != null) {
                var stealthServerDict = stealthAddressServersDict[serverURL];
                stealthServerDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING] = isWatching;
            } else {
                var serverAttributes = {};
                serverAttributes[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_WATCHING] = isWatching;
                stealthAddressServersDict[serverURL] = serverAttributes;
            }
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setStealthAddressServerStatusHDWallet = function(accountIdx, serverURL, isWatching) {
            var accountDict = this.getAccountDict(accountIdx);
            this.setStealthAddressServerStatus(accountDict, serverURL, isWatching);
        };

        TLWallet.prototype.setStealthAddressServerStatusImportedAccount = function(idx, serverURL, isWatching) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.setStealthAddressServerStatus(accountDict, serverURL, isWatching);
        };

        TLWallet.prototype.setStealthAddressServerStatusImportedWatchAccount = function(idx, serverURL, isWatching) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.setStealthAddressServerStatus(accountDict, serverURL, isWatching);
        };

        TLWallet.prototype.setStealthAddressLastTxTime = function(accountDict, serverURL, lastTxTime) {
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var stealthAddressDict = stealthAddressArray[0];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_LAST_TX_TIME] = lastTxTime;
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setStealthAddressLastTxTimeHDWallet = function(accountIdx, serverURL, lastTxTime) {
            var accountDict = this.getAccountDict(accountIdx);
            this.setStealthAddressLastTxTime(accountDict, serverURL, lastTxTime);
        };

        TLWallet.prototype.setStealthAddressLastTxTimeImportedAccount = function(idx, serverURL, lastTxTime) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.setStealthAddressLastTxTime(accountDict, serverURL, lastTxTime);
        };

        TLWallet.prototype.setStealthAddressLastTxTimeImportedWatchAccount = function(idx, serverURL, lastTxTime) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.setStealthAddressLastTxTime(accountDict, serverURL, lastTxTime);
        };

        TLWallet.prototype.addStealthAddressPaymentKey = function(accountDict, privateKey, address, txid, txTime, stealthPaymentStatus) {
            var paymentDict = {};
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_KEY] = privateKey;
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_ADDRESS] = address;
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TXID] = txid;
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TIME] = txTime;
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHECK_TIME] = 0;
            paymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = stealthPaymentStatus;
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var stealthAddressPaymentsArray = stealthAddressArray[0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS];
            var indexToInsert = stealthAddressPaymentsArray.length - 1;
            for (; indexToInsert >= 0; indexToInsert--) {
                var currentStealthAddressPaymentDict = stealthAddressPaymentsArray[indexToInsert];
                if (currentStealthAddressPaymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TIME] < txTime) {
                    break;
                }
            }
            stealthAddressPaymentsArray.splice(indexToInsert+1, 0, paymentDict);
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.addStealthAddressPaymentKeyHDWallet = function(accountIdx, privateKey, address, txid, txTime, stealthPaymentStatus) {
            var accountDict = this.getAccountDict(accountIdx);
            this.addStealthAddressPaymentKey(accountDict, privateKey, address, txid, txTime, stealthPaymentStatus);
        };

        TLWallet.prototype.addStealthAddressPaymentKeyImportedAccount = function(idx, privateKey, address, txid, txTime, stealthPaymentStatus) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.addStealthAddressPaymentKey(accountDict, privateKey, address, txid, txTime, stealthPaymentStatus);
        };

        TLWallet.prototype.addStealthAddressPaymentKeyImportedWatchAccount = function(idx, privateKey, address, txid, txTime, stealthPaymentStatus) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.addStealthAddressPaymentKey(accountDict, privateKey, address, txid, txTime, stealthPaymentStatus);
        };

        TLWallet.prototype.setStealthPaymentLastCheckTime = function(accountDict, txid, lastTxTime) {
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var paymentsArray = stealthAddressArray[0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS];
            for (var i = 0; i < paymentsArray.length; i++) {
                var payment = paymentsArray[i];
                if (payment[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TXID] == txid) {
                    payment[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHECK_TIME] = lastCheckTime;
                    break;
                }
            }
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setStealthPaymentLastCheckTimeHDWallet = function(accountIdx, txid, lastTxTime) {
            var accountDict = this.getAccountDict(accountIdx);
            this.setStealthPaymentLastCheckTime(accountDict, txid, lastTxTime);
        };

        TLWallet.prototype.setStealthPaymentLastCheckTimeImportedAccount = function(idx, txid, lastTxTime) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.setStealthPaymentLastCheckTime(accountDict, txid, lastTxTime);
        };

        TLWallet.prototype.setStealthPaymentLastCheckTimeImportedWatchAccount = function(idx, txid, lastTxTime) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(accountIdx);
            this.setStealthPaymentLastCheckTime(accountDict, txid, lastTxTime);
        };

        TLWallet.prototype.setStealthPaymentStatus = function(accountDict, txid, stealthPaymentStatus, lastCheckTime) {
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var paymentsArray = stealthAddressArray[0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS];
            for (var i = 0; i < paymentsArray.length; i++) {
                var payment = paymentsArray[i];
                if (payment[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_TXID] == txid) {
                    payment[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] = stealthPaymentStatus;
                    payment[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_CHECK_TIME] = lastCheckTime;
                    break;
                }
            }
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.setStealthPaymentStatusHDWallet = function(accountIdx, txid, stealthPaymentStatus, lastCheckTime) {
            var accountDict = this.getAccountDict(accountIdx);
            this.setStealthPaymentStatus(accountDict, txid, stealthPaymentStatus, lastCheckTime);
        };

        TLWallet.prototype.setStealthPaymentStatusImportedAccount = function(idx, txid, stealthPaymentStatus, lastCheckTime) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.setStealthPaymentStatus(accountDict, txid, stealthPaymentStatus, lastCheckTime);
        };

        TLWallet.prototype.setStealthPaymentStatusImportedWatchAccount = function(idx, txid, stealthPaymentStatus, lastCheckTime) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.setStealthPaymentStatus(accountDict, txid, stealthPaymentStatus, lastCheckTime);
        };

        TLWallet.prototype.removeOldStealthPayments = function(accountDict) {
            //*
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var stealthAddressPaymentsArray = stealthAddressArray[0][TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS];
            var startCount = stealthAddressPaymentsArray.length;
            var stealthAddressPaymentsArrayCount = stealthAddressPaymentsArray.length;
            while (stealthAddressPaymentsArray.length > TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT) {
                var stealthAddressPaymentDict = stealthAddressPaymentsArray[0];
                if (stealthAddressPaymentDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STATUS] == TLWalletJSONKeys.TLStealthPaymentStatus.SPENT) {
                    stealthAddressPaymentsArray.splice(0, 1);
                    stealthAddressPaymentsArrayCount--;
                } else {
                    break;
                }
            }
            if (startCount != stealthAddressPaymentsArrayCount) {
                this.appDelegate.saveWalletPayloadDelay();
            }
            //*/
        };

        TLWallet.prototype.removeOldStealthPaymentsHDWallet = function(accountIdx) {
            var accountDict = this.getAccountDict(accountIdx);
            this.removeOldStealthPayments(accountDict);
        };

        TLWallet.prototype.removeOldStealthPaymentsImportedAccount = function(idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.removeOldStealthPayments(accountDict);
        };

        TLWallet.prototype.removeOldStealthPaymentsImportedWatchAccount = function(idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.removeOldStealthPayments(accountDict);
        };

        TLWallet.prototype.clearAllStealthPayments = function(accountDict) {
            var stealthAddressArray = accountDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_STEALTH_ADDRESSES];
            var stealthAddressDict = stealthAddressArray[0];
            stealthAddressDict[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PAYMENTS] = [];
            this.appDelegate.saveWalletPayloadDelay();
        };

        TLWallet.prototype.clearAllStealthPaymentsFromHDWallet = function(accountIdx) {
            var accountDict = this.getAccountDict(accountIdx);
            this.clearAllStealthPayments(accountDict);
        };

        TLWallet.prototype.clearAllStealthPaymentsFromImportedAccount = function(idx) {
            var accountDict = this.getImportedAccountAtIndex(idx);
            this.clearAllStealthPayments(accountDict);
        };

        TLWallet.prototype.clearAllStealthPaymentsFromImportedWatchAccount = function(idx) {
            var accountDict = this.getImportedWatchOnlyAccountAtIndex(idx);
            this.clearAllStealthPayments(accountDict);
        };

        TLWallet.prototype.setPreferencesDict = function(preferencesDict) {
            this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PREFERENCES] = preferencesDict;
        };

        TLWallet.prototype.getPreferencesDict = function() {
            return this.getCurrentWallet()[TLWalletJSONKeys.WALLET_PAYLOAD_KEY_PREFERENCES];
        };

        return TLWallet;
    });
