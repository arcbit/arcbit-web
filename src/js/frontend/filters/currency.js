'use strict';

define(['./module', 'arcbit', 'model/TLWalletUtils'], function (filters, ArcBit, TLWalletUtils) {

  filters.filter('formatProperCurrency', function() {
    return function(input, amountType, hideSymbol) {
      var currencyFormat = ArcBit.getIdentity().appDelegate.currencyFormat;
      if (amountType !== TLWalletUtils.TLAccountTxType.SEND) {
        return currencyFormat.getProperAmount(input, hideSymbol);
      } else {
        return '-' + currencyFormat.getProperAmount(input, hideSymbol);
      }
    };
  });

  filters.filter('formatProperBitcoin', function() {
    return function(input, hideSymbol) {
      var currencyFormat = ArcBit.getIdentity().appDelegate.currencyFormat;
      if (currencyFormat) {
        return currencyFormat.coinToProperBitcoinAmountStringWithSymbol(input, hideSymbol);
      } else {
        return null;
      }
    };
  });

  filters.filter('formatProperFiat', function() {
    return function(input, hideSymbol) {
      var currencyFormat = ArcBit.getIdentity().appDelegate.currencyFormat;
      if (currencyFormat) {
        return currencyFormat.coinToProperLocalCurrencyAmountStringWithSymbol(input, hideSymbol);
      } else {
        return null;
      }
    };
  });
});
