'use strict';

define(['bitcoinjs-lib'],
    function(Bitcoin) {


        TLCoin.TLBitcoinDenomination = {
            BTC : 'BTC',
            mBTC : 'mBTC',
            bits : 'bits'
        };

        function TLCoin(satoshis) {
            this.coin = new Bitcoin.BigInteger(satoshis.toString());
        }

        TLCoin.fromString = function(bitcoinAmount, bitcoinDenomination) {
            try {
                var tmp;
                bitcoinAmount = bitcoinAmount.substring(0, bitcoinAmount.indexOf('.')+9);
                if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.BTC) {
                    var i = bitcoinAmount.indexOf(".");
                    if (i == -1) tmp = bitcoinAmount+'0'.repeat(8);
                    else tmp = bitcoinAmount.replace('.', '')+'0'.repeat(8-(bitcoinAmount.length-1-i));
                } else if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.mBTC) {
                    var i = bitcoinAmount.indexOf(".");
                    if (i == -1) tmp = bitcoinAmount+'0'.repeat(5);
                    else tmp = bitcoinAmount.replace('.', '')+'0'.repeat(5-(bitcoinAmount.length-1-i));
                } else if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.bits) {
                    var i = bitcoinAmount.indexOf(".");
                    if (i == -1) tmp = bitcoinAmount+'0'.repeat(2);
                    else tmp = bitcoinAmount.replace('.', '')+'0'.repeat(2-(bitcoinAmount.length-1-i));
                } else {
                    throw new Error("Invalid bitcoin denomination")
                }
                return new TLCoin(tmp);
            } catch(err) {
                return TLCoin.zero();
            }
        };

        TLCoin.zero = function() {
            return new TLCoin(Bitcoin.BigInteger.ZERO);
        };

        TLCoin.one = function() {
            return new TLCoin(Bitcoin.BigInteger.ONE);
        };

        TLCoin.negativeOne = function() {
            return new TLCoin(Bitcoin.BigInteger.valueOf(-1));
        };

        TLCoin.prototype.getBTCNumber = function() {
            return this.coin;
        };

        TLCoin.prototype.add = function(coin) {
            return new TLCoin(this.coin.add(coin.coin));
        };

        TLCoin.prototype.subtract = function(coin) {
            return new TLCoin(this.coin.subtract(coin.coin));
        };

        TLCoin.prototype.multiply = function(coin) {
            return new TLCoin(this.coin.multiply(coin.coin));
        };

        TLCoin.prototype.divide = function(coin) {
            return new TLCoin(this.coin.divide(coin.coin));
        };


        TLCoin.prototype.toNumber = function() {
            //var tmp = this.coin.copy();
            //var ret = this.coin.add(Bitcoin.BigInteger.ZERO);
            //this.coin = tmp;
            //return ret;

            //return this.coin.add(Bitcoin.BigInteger.ZERO);
            // WARNING: need to do parseInt because for some reason toNumber returns a string?
            // like when i process tx adba50f6c1a34949c1937b5cef6809beff3068000936cdc7107f08074016abdd in insightTxToBlockchainTx
            return parseInt(this.coin.add(Bitcoin.BigInteger.ZERO));
        };


        TLCoin.prototype.bigIntegerToBitcoinAmountString = function(bitcoinDenomination) {
            if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.BTC) {
                // http://stackoverflow.com/questions/1015402/chop-unused-decimals-with-javascript
                return this.bigIntegerToBitcoin().toFixed(8).replace(/(\.[0-9]*?)0+$/, "$1").replace(/\.$/, "").toString();
            } else if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.mBTC) {
                return this.bigIntegerToMilliBit().toFixed(5).replace(/(\.[0-9]*?)0+$/, "$1").replace(/\.$/, "").toString();
            } else {
                return this.bigIntegerToBits().toFixed(2).toString();
            }
        };

        TLCoin.prototype.toString = function() {
            return this.coin.toString();
        };

        TLCoin.prototype.bigIntegerToBits = function() {
            return this.coin.add(Bitcoin.BigInteger.ZERO)*0.01;
        };

        TLCoin.prototype.bigIntegerToMilliBit = function() {
            return this.coin.add(Bitcoin.BigInteger.ZERO)*0.00001;
        };

        TLCoin.prototype.bigIntegerToBitcoin = function() {
            return this.coin.add(Bitcoin.BigInteger.ZERO)*0.00000001;
        };

        TLCoin.prototype.less = function(coin) {
            return this.coin.compareTo(coin.coin) < 0;
        };

        TLCoin.prototype.lessOrEqual = function(coin) {
            return this.coin.compareTo(coin.coin) <= 0;
        };

        TLCoin.prototype.greater = function(coin) {
            return this.coin.compareTo(coin.coin) > 0;
        };

        TLCoin.prototype.greaterOrEqual = function(coin) {
            return this.coin.compareTo(coin.coin) >= 0;
        };

        TLCoin.prototype.equalTo = function(coin) {
            return this.coin.compareTo(coin.coin) == 0;
        };

        return TLCoin;
    });
