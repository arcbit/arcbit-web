'use strict';

define(['model/TLStealthAddress', 'model/TLStealthExplorerAPI'],
    function(TLStealthAddress, TLStealthExplorerAPI) {

        function TLPushTxAPI(appDelegate, isTestnet) {
            this.appDelegate = appDelegate;
            this.isTestnet = isTestnet;
        }

        TLPushTxAPI.prototype.sendTx = function(txHex, txHash, possibleStealthAddress, success, failure) {
            console.log("sendTx: txHash " + txHash);
            console.log("sendTx: txHex " + txHex);
            if (!TLStealthAddress.isStealthAddress(possibleStealthAddress, this.isTestnet)) {
                this.appDelegate.blockExplorerAPI.pushTx(txHex, success, failure);
            } else {
                var self = this;
                this.appDelegate.blockExplorerAPI.insightAPI.pushTx(txHex, function(jsonData) {
                    var txid = jsonData["txid"];
                    if (txid == null) {
                        failure({status:'500', data:'No txid returned'});
                        return;
                    }
                    self.appDelegate.stealthExplorerAPI.lookupTx(possibleStealthAddress, txid, function(jsonData) {
                        var errorCode = jsonData[TLStealthExplorerAPI.SERVER_ERROR_CODE];
                        if (errorCode != null && errorCode == TLStealthExplorerAPI.INVALID_SIGNATURE_ERROR) {
                            failure({status:errorCode, data:jsonData[TLStealthExplorerAPI.SERVER_ERROR_MSG]});
                        } else {
                            success({txid:txid});
                        }
                    }, function(response) {
                        failure(response);
                    });

                }, function(response) {
                    failure(response);
                });
            }
        };

        return TLPushTxAPI;
    });
