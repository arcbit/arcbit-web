'use strict';

define(['model/TLBitcoinJSWrapper', 'model/TLCoin'],
    function(TLBitcoinJSWrapper, TLCoin) {

        TLWalletUtils.MIN_FEE_AMOUNT = 10000;
        TLWalletUtils.MAX_FEE_AMOUNT = 1000000;

        TLWalletUtils.SHOULD_SAVE_ARCHIVED_ADDRESSES_IN_JSON = false;
        TLWalletUtils.ENABLE_STEALTH_ADDRESS = false;
        TLWalletUtils.ALLOW_MANUAL_SCAN_FOR_STEALTH_PAYMENT = true;

        TLWalletUtils.TLSelectedAccountType = {
            HD_WALLET : 'hd',
            IMPORTED_ACCOUNT : 'ihd',
            IMPORTED_WATCH_ACCOUNT : 'iwhd',
            IMPORTED_ADDRESS : 'ikey',
            IMPORTED_WATCH_ADDRESS : 'iaddr',
            ARCHIVED_HD_WALLET : 'ahd',
            ARCHIVED_IMPORTED_ACCOUNT : 'aihd',
            ARCHIVED_IMPORTED_WATCH_ACCOUNT : 'aiwhd',
            ARCHIVED_IMPORTED_ADDRESS : 'aikey',
            ARCHIVED_IMPORTED_WATCH_ADDRESS : 'aiaddr'
        };

        TLWalletUtils.TLAccountType = {
            UNKNOWN : 0,
            HD_WALLET : 1,
            IMPORTED : 2,
            IMPORTED_WATCH : 3
        };

        TLWalletUtils.TLAccountTxType = {
            SEND : 0,
            RECEIVE : 1,
            MOVE_BETWEEN_WALLET : 2
        };

        function TLWalletUtils() {
        }

        TLWalletUtils.DEFAULT_FEE_AMOUNT = function() {
            return 10000;
        };

        TLWalletUtils.isValidInputTransactionFee = function(amount) {
            var maxFeeAmount = new TLCoin(TLWalletUtils.MAX_FEE_AMOUNT);
            var minFeeAmount = new TLCoin(TLWalletUtils.MIN_FEE_AMOUNT);
            if (amount.greater(maxFeeAmount) || amount.less(minFeeAmount)) {
                return false;
            }
            return true;
        };

        TLWalletUtils.parseURI = function(uri) {
            uri = decodeURIComponent(uri);
            var pars = {};
            var req; // BIP-0021
            pars.address = uri.replace('bitcoin:', '').split('?')[0];
            if (uri.split('?')[1]) {
                uri.split('?')[1].split('&').forEach(function(parsed) {
                    if(parsed) {
                        pars[parsed.split('=')[0]] = parsed.split('=')[1];
                        if (parsed.split('=')[0].indexOf('req-') == 0) {
                            req = true;
                        }
                    }
                });
            }
            return !req ? pars : null;
        };

        return TLWalletUtils;
    });
