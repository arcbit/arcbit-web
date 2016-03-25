'use strict';

define(['model/TLBitcoinJSWrapper', 'model/TLUtils'],
    function(TLBitcoinJSWrapper, TLUtils) {

        function TLTxObject(appDelegate, dict) {
            this.appDelegate = appDelegate;
            this.txDict = dict;
            this.inputAddressToValueArray = null;
            this.outputAddressToValueArray = null;
            this.addresses = null;
            this.txid = null;
            this.buildTxObject(this.txDict);
        }

        TLTxObject.prototype.buildTxObject = function(tx) {
            var blockHeightString = tx["block_height"];
            var blockHeight = 0;
            if (blockHeightString != null) {
                blockHeight = Number(blockHeightString);
            }
            var timeString = tx["time"];
            var time = 0;
            if (timeString != null) {
                time = Number(timeString);
            }

            this.inputAddressToValueArray = [];
            var inputsArray = tx["inputs"];
            if (inputsArray != null) {
                for (var i = 0; i < inputsArray.length; i++) {
                    var input = inputsArray[i];
                    var prevOut = input["prev_out"];
                    if (prevOut != null) {
                        var addr = prevOut["addr"];

                        var inp = {};
                        if (addr != null) {
                            inp["addr"] = addr;
                            inp["value"] = prevOut["value"];
                        }
                        this.inputAddressToValueArray.push(inp);
                    }
                }
            }

            this.outputAddressToValueArray = [];
            var outsArray = tx["out"];
            if (outsArray != null) {
                for (var i = 0; i < outsArray.length; i++) {
                    var output = outsArray[i];
                    var addr = output["addr"];

                    var outt = {};
                    if (addr != null) {
                        outt["addr"] = addr;
                        outt["value"] = output["value"];
                    }
                    outt["script"] = output["script"];
                    this.outputAddressToValueArray.push(outt);
                }
            }
        };

        TLTxObject.prototype.getAddresses = function() {
            if (this.addresses != null) {
                return c.addresses;
            }
            this.addresses = [];
            for (var i = 0; i < this.inputAddressToValueArray.length; i++) {
                var address = this.inputAddressToValueArray[i]["addr"];
                if (address != null) {
                    this.addresses.push(address);
                }
            }
            for (var i = 0; i < this.outputAddressToValueArray.length; i++) {
                var address = this.outputAddressToValueArray[i]["addr"];
                if (address != null) {
                    this.addresses.push(address);
                }
            }
            return this.addresses;
        };

        TLTxObject.prototype.getInputAddressToValueArray = function() {
            return this.inputAddressToValueArray;
        };

        TLTxObject.prototype.getInputAddressArray = function() {
            var addresses = [];
            for (var i = 0; i < this.inputAddressToValueArray.length; i++) {
                var address = this.inputAddressToValueArray[i]["addr"];
                if (address != null) {
                    addresses.push(address);
                }
            }
            return addresses;
        };

        TLTxObject.prototype.getOutputAddressArray = function() {
            var addresses = [];
            for (var i = 0; i < this.outputAddressToValueArray.length; i++) {
                var address = this.outputAddressToValueArray[i]["addr"];
                if (address != null) {
                    addresses.push(address);
                }
            }
            return addresses;
        };

        TLTxObject.prototype.getPossibleStealthDataScripts = function() {
            var possibleStealthDataScripts = [];
            for (var i = 0; i < this.outputAddressToValueArray.length; i++) {
                var script = this.outputAddressToValueArray[i]["script"];
                if (script.length == 80) {
                    possibleStealthDataScripts.push(script);
                }
            }
            return possibleStealthDataScripts;
        };

        TLTxObject.prototype.getOutputAddressToValueArray = function() {
            return this.outputAddressToValueArray;
        };

        TLTxObject.prototype.getHash = function() {
            return this.txDict["hash"];
        };

        TLTxObject.prototype.getTxid = function() {
            if (this.txid == null) {
                this.txid = TLBitcoinJSWrapper.reverseHexString(this.txDict["hash"]);
            }
            return this.txid;
        };

        TLTxObject.prototype.getTxUnixTime = function() {
            var timeNumber = this.txDict["time"];
            if (timeNumber != null) {
                return timeNumber;
            }
            return Number.MAX_SAFE_INTEGER;
        };

        TLTxObject.prototype.getTime = function() {
            var interval = this.getTxUnixTime();

            //TODO: specific to insight api, later dont use confirmations but block_height for all apis
            if (this.txDict["confirmations"] != null && interval <= 0) {
                return "";
            }

            var newDate = new Date();
            newDate.setTime(interval*1000);
            return newDate.toLocaleString().replace(/:\d{2}\s/,' ');
        };

        TLTxObject.prototype.getConfirmations = function() {
            if (this.txDict["confirmations"] != null) {
                return this.txDict["confirmations"];
            }
            if (this.txDict["block_height"] != null && this.txDict["block_height"] > 0) {
                return this.appDelegate.blockchainStatus.getBlockHeight() - this.txDict["block_height"] + 1;
            }
            return 0;
        };

        return TLTxObject;
    });
