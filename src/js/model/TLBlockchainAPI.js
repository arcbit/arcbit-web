'use strict';

define(['model/TLNetworking'],
    function(TLNetworking) {

        function TLBlockchainAPI(baseURL) {
            this.baseURL = baseURL;
            this.networking = new TLNetworking();
        }

        TLBlockchainAPI.prototype.getBlockHeight = function(success, failure) {
            var endPoint = 'q/getblockcount';
            var parameters = {};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, function (jsonData) {
                success(jsonData);
            }, function (response) {
                failure(response);
            });
        };

        TLBlockchainAPI.prototype.getTx = function(txHash, success, failure) {
            var endPoint = 'tx/' + txHash;
            var parameters = {'format': 'json'};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLBlockchainAPI.prototype.pushTx = function(txHex, success, failure) {
            var endPoint = 'pushtx';
            var parameters = {
                'format': 'plain',
                'tx': txHex
            };
            var url = this.baseURL + endPoint;
            this.networking.httpPOST(url, parameters, success, failure);
        };

        TLBlockchainAPI.prototype.getUnspentOutputs = function(addressArray, success, failure) {
            var endPoint = 'unspent';
            var parameters = {'active': addressArray.join('|')};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLBlockchainAPI.prototype.getAddressesInfo = function(addressArray, success, failure) {
            var endPoint = 'multiaddr';
            var parameters = {'active': addressArray.join('|')};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        return TLBlockchainAPI;
    });
