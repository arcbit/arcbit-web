'use strict';

define(['model/TLNetworking'],
    function(TLNetworking) {
        TLStealthExplorerAPI.STEALTH_PAYMENTS_FETCH_COUNT = 50;

        TLStealthExplorerAPI.UNEXPECTED_ERROR = -1000;
        TLStealthExplorerAPI.DATABASE_ERROR = -1001;
        TLStealthExplorerAPI.INVALID_STEALTH_ADDRESS_ERROR = -1002;
        TLStealthExplorerAPI.INVALID_SIGNATURE_ERROR = -1003;
        TLStealthExplorerAPI.INVALID_SCAN_KEY_ERROR = -1004;
        TLStealthExplorerAPI.TX_DECODE_FAILED_ERROR = -1005;
        TLStealthExplorerAPI.INVALID_PARAMETER_ERROR = -1006;
        TLStealthExplorerAPI.SEND_TX_ERROR = -1007;

        TLStealthExplorerAPI.SERVER_ERROR_CODE = 'error_code';
        TLStealthExplorerAPI.SERVER_ERROR_MSG = 'error_msg';

        function TLStealthExplorerAPI(preferences, stealthServerConfig) {
            preferences.resetStealthExplorerAPIURL();
            preferences.resetStealthServerPort();
            this.baseURL = stealthServerConfig.getWebServerProtocol() + "://" + preferences.getStealthExplorerURL()
                + ":" + preferences.getStealthServerPort();
            this.networking = new TLNetworking();
        }

        TLStealthExplorerAPI.prototype.ping = function(success, failure) {
            var endPoint = '/ping';
            var parameters = {};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLStealthExplorerAPI.prototype.getChallenge = function(success, failure) {
            var endPoint = '/challenge';
            var parameters = {};
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLStealthExplorerAPI.prototype.getStealthPayments = function(stealthAddress, signature, offset, success, failure) {
            var endPoint = '/payments';
            var parameters = {
                addr: stealthAddress,
                sig: signature,
                offset: offset
            };
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLStealthExplorerAPI.prototype.watchStealthAddress = function(stealthAddress, scanPriv, signature, success, failure) {
            var endPoint = '/watch';
            var parameters = {
                addr: stealthAddress,
                scan_key: scanPriv,
                sig: signature
            };
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        TLStealthExplorerAPI.prototype.lookupTx = function(stealthAddress, txid, success, failure) {
            var endPoint = '/lookuptx';
            var parameters = {
                addr: stealthAddress,
                txid: txid
            };
            var url = this.baseURL + endPoint;
            this.networking.httpGET(url, parameters, success, failure);
        };

        return TLStealthExplorerAPI;
    });
