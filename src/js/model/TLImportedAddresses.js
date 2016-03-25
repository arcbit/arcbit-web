'use strict';

define(['angular', 'model/TLCoin', 'model/TLWalletJSONKeys', 'model/TLBitcoinJSWrapper', 'model/TLWalletUtils', 'model/TLImportedAddress'],
    function(angular, TLCoin, TLWalletJSONKeys, TLBitcoinJSWrapper, TLWalletUtils, TLImportedAddress) {

        function TLImportedAddresses(appDelegate, importedAddresses, accountAddressType) {
            this.appDelegate = appDelegate;
            this.appWallet = appDelegate.appWallet;
            this.importedAddresses = [];
            this.archivedImportedAddresses = [];
            this.addressToIdxDict = {};
            this.addressToPositionInWalletArrayDict = {};
            this.accountAddressType = accountAddressType;
            for (var i = 0; i < importedAddresses.length; i++) {
                var importedAddressObject = importedAddresses[i];
                if (importedAddressObject.isArchived()) {
                    this.archivedImportedAddresses.push(importedAddressObject);
                } else {
                    var indexes = this.addressToIdxDict[importedAddressObject.getAddress()];
                    if (indexes == null) {
                        indexes = [];
                        this.addressToIdxDict[importedAddressObject.getAddress()] = indexes;
                    }
                    indexes.push(this.importedAddresses.length);
                    this.importedAddresses.push(importedAddressObject);
                }

                importedAddressObject.setPositionInWalletArray(i);
                this.addressToPositionInWalletArrayDict[importedAddressObject.getPositionInWalletArray()] = importedAddressObject;
            }
        }

        TLImportedAddresses.prototype.getAddressObjectAtIdx = function(idx) {
            return this.importedAddresses[idx];
        };

        TLImportedAddresses.prototype.getArchivedAddressObjectAtIdx = function(idx) {
            return this.archivedImportedAddresses[idx];
        };

        TLImportedAddresses.prototype.getIdxForAddressObject = function(addressObject) {
            return this.importedAddresses.indexOf(addressObject);
        };

        TLImportedAddresses.prototype.getIdxForArchivedAddressObject = function(addressObject) {
            return this.archivedImportedAddresses.indexOf(addressObject);
        };

        TLImportedAddresses.prototype.getCount = function() {
            return this.importedAddresses.length;
        };

        TLImportedAddresses.prototype.getArchivedCount = function() {
            return this.archivedImportedAddresses.length;
        };

        TLImportedAddresses.prototype.checkToGetAndSetAddressesData = function(fetchDataAgain, success, failure) {
            var addresses = new Set();
            for (var i = 0; i < this.importedAddresses; i++) {
                var importedAddressObject = this.importedAddresses[i];
                if (!importedAddressObject.hasFetchedAccountData() || fetchDataAgain) {
                    var address = importedAddressObject.getAddress();
                    addresses.add(address);
                }
            }
            if (addresses.length == 0) {
                success();
                return;
            }
            var self = this;
            this.appDelegate.blockExplorerAPI.getAddressesInfo(Array.from(addresses), function(jsonData) {
                //console.log("checkToGetAndSetAddressesData jsonData " + JSON.stringify(jsonData, null, 2));
                if (jsonData == null) {
                    success ? success() : null;
                    return;
                }
                var txArray = jsonData["txs"];
                if (txArray == null) {
                    success ? success() : null;
                    return;
                }
                var addressesArray = jsonData["addresses"];
                if (addressesArray == null) {
                    success ? success() : null;
                    return;
                }
                for (var i = 0; i < addressesArray.length; i++) {
                    var addressDict = addressesArray[i];
                    var address = addressDict["address"];

                    var indexes = self.addressToIdxDict[address];
                    for (var i = 0; i <indexes.length; i++) {
                        var importedAddressObject = self.importedAddresses[[indexes[i]]];
                        importedAddressObject.balance = new TLCoin(addressDict["final_balance"]);
                        importedAddressObject.processTxArray(txArray, false);
                        importedAddressObject.setHasFetchedAccountData(true, Math.floor(Date.now() / 1000));
                    }
                }

                self.appDelegate.postEvent('wallet', {'type': 'EVENT_FETCHED_ADDRESSES_DATA'});
                success ? success() : null;
            }, function(response) {
                failure ? failure() : null;
            });
        };

        TLImportedAddresses.prototype.addImportedPrivateKey = function(privateKey, encryptedPrivateKey) {
            var importedPrivateKeyDict = this.appWallet.addImportedPrivateKey(privateKey, encryptedPrivateKey);
            var importedAddressObject = new TLImportedAddress(this.appDelegate, importedPrivateKeyDict);
            this.importedAddresses.push(importedAddressObject);
            importedAddressObject.setPositionInWalletArray(this.importedAddresses.length - 1);
            this.addressToPositionInWalletArrayDict[importedAddressObject.getPositionInWalletArray()] = importedAddressObject;
            var address = TLBitcoinJSWrapper.getAddress(privateKey, this.appWallet.isTestnet());
            var indexes = this.addressToIdxDict[address];
            if (indexes == null) {
                indexes = [];
                this.addressToIdxDict[importedAddressObject.getAddress()] = indexes;
            }
            indexes.push(this.importedAddresses.length-1);
            this.setLabel(importedAddressObject.getDefaultAddressLabel(), this.importedAddresses.length-1);
            return importedAddressObject;
        };

        TLImportedAddresses.prototype.addImportedWatchAddress = function(address) {
            var importedDict = this.appWallet.addWatchOnlyAddress(address);
            var importedAddressObject = new TLImportedAddress(this.appDelegate, importedDict);
            this.importedAddresses.push(importedAddressObject);
            importedAddressObject.setPositionInWalletArray(this.importedAddresses.length - 1);
            this.addressToPositionInWalletArrayDict[importedAddressObject.getPositionInWalletArray()] = importedAddressObject;
            var indexes = this.addressToIdxDict[address];
            if (indexes == null) {
                indexes = [];
                this.addressToIdxDict[address] = indexes;
            }
            indexes.push(this.importedAddresses.length-1);
            this.setLabel(importedAddressObject.getDefaultAddressLabel(), this.importedAddresses.length-1);
            return importedAddressObject;
        };

        TLImportedAddresses.prototype.setLabel = function(label, positionInWalletArray) {
            var importedAddressObject = this.addressToPositionInWalletArrayDict[positionInWalletArray];
            importedAddressObject.setLabel(label);
            if (this.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setImportedPrivateKeyLabel(label, positionInWalletArray);
            } else if (self.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                this.appWallet.setWatchOnlyAddressLabel(label, positionInWalletArray);
            }
            return true;
        };

        TLImportedAddresses.prototype.archiveAddress = function(positionInWalletArray) {
            this.setArchived(positionInWalletArray, true);
            var toMoveAddressObject = this.addressToPositionInWalletArrayDict[positionInWalletArray];
            var indexes = this.addressToIdxDict[toMoveAddressObject.getAddress()];
            if (indexes == null) {
                indexes = [];
                this.addressToIdxDict[toMoveAddressObject.getAddress()] = indexes;
            }
            var toMoveIndex = this.importedAddresses.indexOf(toMoveAddressObject);
            for (var key in this.addressToIdxDict) {
                var indexes = angular.copy(this.addressToIdxDict[key]);
                for (var i = 0; i < indexes.length; i++) {
                    var idx = indexes[i];
                    if (idx > toMoveIndex) {
                        var indexes = this.addressToIdxDict[key];
                        indexes.splice(indexes.indexOf(idx), 1);
                        indexes.push(idx-1);
                    }
                }
            }
            indexes.splice(this.importedAddresses.indexOf(toMoveIndex), 1);
            this.importedAddresses.splice(this.importedAddresses.indexOf(toMoveAddressObject), 1);
            for (var i = 0; i < this.archivedImportedAddresses.length; i++) {
                var importedAddressObject = this.archivedImportedAddresses[i];
                if (importedAddressObject.getPositionInWalletArray() > toMoveAddressObject.getPositionInWalletArray()) {
                    this.archivedImportedAddresses.splice(i, 0, toMoveAddressObject);
                    return;
                }
            }
            this.archivedImportedAddresses.push(toMoveAddressObject);
        };

        TLImportedAddresses.prototype.unarchiveAddress = function(positionInWalletArray) {
            this.setArchived(positionInWalletArray, false);
            var toMoveAddressObject = this.addressToPositionInWalletArrayDict[positionInWalletArray];
            this.archivedImportedAddresses.splice(this.archivedImportedAddresses.indexOf(toMoveAddressObject), 1);

            for (var i = 0; i < this.importedAddresses.length; i++) {
                var importedAddressObject = this.importedAddresses[i];
                if (importedAddressObject.getPositionInWalletArray() > toMoveAddressObject.getPositionInWalletArray()) {
                    this.importedAddresses.splice(i, 0, toMoveAddressObject);
                    var indexes = this.addressToIdxDict[toMoveAddressObject.getAddress()];
                    if (indexes == null) {
                        indexes = [i];
                        this.addressToIdxDict[toMoveAddressObject.getAddress()] = indexes;
                    }
                    for (var key in this.addressToIdxDict) {
                        var indexes = angular.copy(this.addressToIdxDict[key]);
                        for (var i = 0; i < indexes.length; i++) {
                            var idx = indexes[i];
                            if (idx > i) {
                                var indexes = this.addressToIdxDict[key];
                                indexes.splice(indexes.indexOf(idx), 1);
                                indexes.push(idx-1);
                            }
                        }
                    }
                    return;
                }
            }
            this.importedAddresses.push(toMoveAddressObject);
        };

        TLImportedAddresses.prototype.setArchived = function(positionInWalletArray, archive) {
            var importedAddressObject = this.addressToPositionInWalletArrayDict[positionInWalletArray];
            importedAddressObject.setArchived(archive);
            if (this.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.setImportedPrivateKeyArchive(archive, positionInWalletArray);
            } else if (self.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                this.appWallet.setWatchOnlyAddressArchive(archive, positionInWalletArray);
            }
            return true;
        };

        TLImportedAddresses.prototype.deleteAddress = function(idx) {
            var importedAddressObject = this.archivedImportedAddresses[idx];
            this.archivedImportedAddresses.splice(idx, 1);
            if (this.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED) {
                this.appWallet.deleteImportedPrivateKey(importedAddressObject.getPositionInWalletArray());
            } else if (self.accountAddressType == TLWalletUtils.TLAccountType.IMPORTED_WATCH) {
                this.appWallet.deleteImportedWatchAddress(importedAddressObject.getPositionInWalletArray());
            }
            delete this.addressToPositionInWalletArrayDict[importedAddressObject.getPositionInWalletArray()];
            var tmpDict = angular.copy(this.addressToPositionInWalletArrayDict);
            for (var key in tmpDict) {
                var ia = this.addressToPositionInWalletArrayDict[key];
                if (ia.getPositionInWalletArray() > importedAddressObject.getPositionInWalletArray()) {
                    ia.setPositionInWalletArray(ia.getPositionInWalletArray()-1);
                    this.addressToPositionInWalletArrayDict[ia.getPositionInWalletArray()] = ia;
                }
            }
            if (importedAddressObject.getPositionInWalletArray() < this.addressToPositionInWalletArrayDict.length - 1) {
                delete this.addressToPositionInWalletArrayDict[this.addressToPositionInWalletArrayDict.length-1];
            }
            return true;
        };

        TLImportedAddresses.prototype.hasFetchedAddressesData = function() {
            for (var i = 0; i < this.importedAddresses.length; i++) {
                var importedAddressObject = this.importedAddresses[i];
                if (!importedAddressObject.hasFetchedAccountData()) {
                    return false
                }
            }
            return true;
        };

        return TLImportedAddresses;
    });
