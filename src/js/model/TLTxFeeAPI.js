'use strict';

define(['model/TLNetworking'],
    function(TLNetworking) {
        TLTxFeeAPI.TLDynamicFeeSetting = {
            FASTEST_FEE : 'fastestFee',
            HALF_HOUR_FEE : 'halfHourFee',
            HOUR_FEE: 'hourFee'
        };

        function TLTxFeeAPI(preferences) {
            this.preferences = preferences;
            this.networking = new TLNetworking();
            this.cachedDynamicFees = null;
            this.cachedDynamicFeesTime = null;
            this.isFetchingTxFees = false;
        }

        TLTxFeeAPI.prototype.getCachedDynamicFee = function() {
            if (this.cachedDynamicFees != null) {
                var dynamicFeeSetting = this.preferences.getDynamicFeeSetting();
                if (dynamicFeeSetting == TLTxFeeAPI.TLDynamicFeeSetting.FASTEST_FEE) {
                    console.log('FastestFee');
                    return this.cachedDynamicFees[TLTxFeeAPI.TLDynamicFeeSetting.FASTEST_FEE];
                } else if (dynamicFeeSetting == TLTxFeeAPI.TLDynamicFeeSetting.HALF_HOUR_FEE) {
                    console.log('HalfHourFee');
                    return this.cachedDynamicFees[TLTxFeeAPI.TLDynamicFeeSetting.HALF_HOUR_FEE];
                } else if (dynamicFeeSetting == TLTxFeeAPI.TLDynamicFeeSetting.HOUR_FEE) {
                    console.log('HourFee');
                    return this.cachedDynamicFees[TLTxFeeAPI.TLDynamicFeeSetting.HOUR_FEE];
                }
            }
            return null;
        };

        TLTxFeeAPI.prototype.haveUpdatedCachedDynamicFees = function() {
            var nowUnixTime = new Date().getTime()/1000;
            if (this.cachedDynamicFeesTime == null || nowUnixTime - this.cachedDynamicFeesTime > 600.0) { // 600.0 = 10 minutes
                return false;
            }
            return true;
        };

        TLTxFeeAPI.prototype.getDynamicTxFee = function(success, failure) {
            if (this.isFetchingTxFees) {
                return;
            }
            this.isFetchingTxFees = true;
            var self = this;
            this.networking.httpGET('https://bitcoinfees.21.co/api/v1/fees/recommended', null, function (jsonData) {
                if (jsonData != null) {
                    self.cachedDynamicFeesTime = new Date().getTime()/1000;
                    self.cachedDynamicFees = jsonData;
                } else {
                    self.cachedDynamicFees = null;
                }
                self.isFetchingTxFees = false;
                success(jsonData);
            }, function (response) {
                self.cachedDynamicFees = null;
                this.isFetchingTxFees = false;
                failure(response);
            });
        };

        return TLTxFeeAPI;
    });
