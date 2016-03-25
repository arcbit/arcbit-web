'use strict';

define(['model/TLNetworking', 'model/TLCoin'],
    function(TLNetworking, TLCoin) {
        function TLExchangeRate() {
            this.networking = new TLNetworking();
            this.exchangeRateDict = {};
        }

        TLExchangeRate.prototype.getExchangeRate = function(currency) {
            if (this.exchangeRateDict == null || this.exchangeRateDict[currency] == null) {
                return 0;
            } else {
                return this.exchangeRateDict[currency]["rate"];
            }
        };

        TLExchangeRate.prototype.getExchangeRates = function(success, failure) {
            var self = this;
            this.networking.httpGET('https://bitpay.com/api/rates', null, function(jsonData) {
                for(var i = 0; i < jsonData.length; i++) {
                    var dict = jsonData[i];
                    self.exchangeRateDict[dict["code"]] = dict;
                }
                success();
            }, function(response) {
                failure(response);
            });
        };

        TLExchangeRate.prototype.fiatAmountFromBitcoin = function(currency, bitcoinAmount) {
            var exchangeRate = this.getExchangeRate(currency);
            return bitcoinAmount.bigIntegerToBitcoin() * exchangeRate;
        };

        TLExchangeRate.prototype.bitcoinAmountFromFiat = function(currency, fiatAmount) {
            var exchangeRate = this.getExchangeRate(currency);
            var bitcoinAmount = (parseFloat(fiatAmount)/exchangeRate).toString();
            return TLCoin.fromString(bitcoinAmount, TLCoin.TLBitcoinDenomination.BTC);
        };

        TLExchangeRate.prototype.fiatAmountStringFromBitcoin = function(currency, bitcoinAmount) {
            return this.fiatAmountFromBitcoin(currency, bitcoinAmount).toFixed(2).toString();
        };

        return TLExchangeRate;
    });
