'use strict';

define(['model/TLBlockchainAPI', 'model/TLInsightAPI'],
    function(TLBlockchainAPI, TLInsightAPI) {
        TLBlockExplorerAPI.TLBlockExplorer = {
            BLOCKCHAIN : 'blockchain.info',
            INSIGHT : 'insight',
            BLOCKR: 'blockr'
        };

        function TLBlockExplorerAPI(preferences) {
            var blockExplorerAPI =preferences.getSelectedBlockExplorerAPI();
            var blockExplorerURL = preferences.getSelectedBlockExplorerURL(blockExplorerAPI, preferences.getSelectedBlockExplorerURLIdx());
            this.setUpAPI(preferences.getSelectedBlockExplorerAPI(), blockExplorerURL);
        }

        TLBlockExplorerAPI.prototype.setUpAPI = function(blockExplorerAPI, blockExplorerURL) {
            this.blockExplorerAPI = blockExplorerAPI;
            this.blockExplorerURL = blockExplorerURL;
            if (blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                this.blockchainAPI = new TLBlockchainAPI(blockExplorerURL);
                //needed for push tx api for stealth addresses
                this.insightAPI = new TLInsightAPI("https://insight.bitpay.com/");
            } else if (blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.INSIGHT) {
                this.insightAPI = new TLInsightAPI(blockExplorerURL);
            }
        };

        TLBlockExplorerAPI.prototype.getBlockHeight = function(success, failure) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                return this.blockchainAPI.getBlockHeight(function(height) {
                    success({'height': height})
                }, failure);
            } else {
                //Insight does not have a good way to get block height
            }
        };

        TLBlockExplorerAPI.prototype.getAddressesInfo = function(addressArray, success, failure) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                return this.blockchainAPI.getAddressesInfo(addressArray, success, failure);
            } else {
                return this.insightAPI.getAddressesInfo(addressArray, 0, [], success, failure);
            }
        };

        TLBlockExplorerAPI.prototype.getUnspentOutputs = function(addressArray, success, failure) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                return this.blockchainAPI.getUnspentOutputs(addressArray, success, failure);
            } else {
                return this.insightAPI.getUnspentOutputs(addressArray, success, failure);
            }
        };

        TLBlockExplorerAPI.prototype.getTx = function(txHash, success, failure) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                return this.blockchainAPI.getTx(txHash, success, failure);
            } else {
                return this.insightAPI.getTx(txHash, function (jsonData) {
                    var transformedTx = TLInsightAPI.insightTxToBlockchainTx(jsonData);
                    success(transformedTx);
                }, failure);
            }
        };

        TLBlockExplorerAPI.prototype.pushTx = function(txHex, success, failure) {
            if (this.blockExplorerAPI == TLBlockExplorerAPI.TLBlockExplorer.BLOCKCHAIN) {
                return this.blockchainAPI.pushTx(txHex, success, failure);
            } else {
                return this.insightAPI.pushTx(txHex, success, failure);
            }
        };

        return TLBlockExplorerAPI;
    });
