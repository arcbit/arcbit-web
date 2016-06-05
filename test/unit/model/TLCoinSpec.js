/*
 * @fileOverview TLCoin tests
 */
'use strict';

define(['model/TLCoin', 'model/TLWalletUtils', 'model/TLCurrencyFormat'],
    function(TLCoin, TLWalletUtils, TLCurrencyFormat) {
//*
        describe('test TLCoin', function() {

            it('test arithmetic', function () {
                var coin = new TLCoin(1000);
                expect(coin.toNumber()).toBe(1000);
                var c1 = coin.add(new TLCoin(1000));
                expect(c1.toNumber()).toBe(2000);
                var c2 = coin.subtract(new TLCoin(1000));
                expect(c2.toNumber()).toBe(0);
                var c3 = coin.multiply(new TLCoin(1000));
                expect(c3.toNumber()).toBe(1000000);
                var c4 = coin.divide(new TLCoin(1000));
                expect(c4.toNumber()).toBe(1);


                var sum = new TLCoin(5500821).add(new TLCoin(500000000));
                expect(sum.toNumber() == 505500821).toBe(true);

                var a = new TLCoin(5500821);
                var b = new TLCoin(500000000);
                a.add(b);
                expect(a.toNumber()).toBe(5500821);
                a = a.add(b);
                expect(a.toNumber()).toBe(505500821);
            });

            it('test inequality', function () {
                expect(new TLCoin(100).less(new TLCoin(1000))).toBe(true);
                expect(new TLCoin(1000).less(new TLCoin(1000))).toBe(false);
                expect(new TLCoin(10000).less(new TLCoin(1000))).toBe(false);

                expect(new TLCoin(100).lessOrEqual(new TLCoin(1000))).toBe(true);
                expect(new TLCoin(1000).lessOrEqual(new TLCoin(1000))).toBe(true);
                expect(new TLCoin(10000).lessOrEqual(new TLCoin(1000))).toBe(false);

                expect(new TLCoin(100).greater(new TLCoin(1000))).toBe(false);
                expect(new TLCoin(1000).greater(new TLCoin(1000))).toBe(false);
                expect(new TLCoin(10000).greater(new TLCoin(1000))).toBe(true);

                expect(new TLCoin(100).greaterOrEqual(new TLCoin(1000))).toBe(false);
                expect(new TLCoin(1000).greaterOrEqual(new TLCoin(1000))).toBe(true);
                expect(new TLCoin(10000).greaterOrEqual(new TLCoin(1000))).toBe(true);


                expect(new TLCoin(100).equalTo(new TLCoin(1000))).toBe(false);
                expect(new TLCoin(1000).equalTo(new TLCoin(1000))).toBe(true);
                expect(new TLCoin(10000).equalTo(new TLCoin(1000))).toBe(false);
            });

            it('test conversion', function () {
                expect(new TLCoin(10000).bigIntegerToBitcoin()).toBe(0.0001);
                expect(new TLCoin(10000).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC)).toBe('0.0001');
                expect(new TLCoin(10000).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.mBTC)).toBe('0.1');
                expect(new TLCoin(10000).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.bits)).toBe('100.00');
                expect(TLCoin.fromString("0.010000", TLCoin.TLBitcoinDenomination.BTC).bigIntegerToBitcoinAmountString(TLCoin.TLBitcoinDenomination.BTC)).toBe('0.01');
            });

            it('test isValidInputTransactionFee', function () {
                var coin = new TLCoin(10000);
                expect(TLWalletUtils.isValidInputTransactionFee(coin)).toBe(true);

                coin = new TLCoin(100001);
                expect(TLWalletUtils.isValidInputTransactionFee(coin)).toBe(true);

                coin = new TLCoin(1000000);
                expect(TLWalletUtils.isValidInputTransactionFee(coin)).toBe(true);

                coin = new TLCoin(1);
                expect(TLWalletUtils.isValidInputTransactionFee(coin)).toBe(false);

                coin = new TLCoin(100000000);
                expect(TLWalletUtils.isValidInputTransactionFee(coin)).toBe(false);
            });

            it('test bitcoinAmountStringToCoin', function () {
                var num;
                num = TLCurrencyFormat.bitcoinAmountStringToCoin("0.0").toNumber();
                expect(num == 0).toBe(true);
                num = TLCurrencyFormat.bitcoinAmountStringToCoin("0").toNumber();
                expect(num == 0).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("0.00000001").toNumber();
                expect(num == 1).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("0.1").toNumber();
                expect(num == 10000000).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin(".99999998").toNumber();
                expect(num == 99999998).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("0.99999999").toNumber();
                expect(num == 99999999).toBe(true);
                num = TLCurrencyFormat.bitcoinAmountStringToCoin(".99999999").toNumber();
                expect(num == 99999999).toBe(true);
                num = TLCurrencyFormat.bitcoinAmountStringToCoin("1.00000000").toNumber();
                expect(num == 100000000).toBe(true);
                num = TLCurrencyFormat.bitcoinAmountStringToCoin("1").toNumber();
                expect(num == 100000000).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("1.00000001").toNumber();
                expect(num == 100000001).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("1.99999998").toNumber();
                expect(num == 199999998).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("1.99999999").toNumber();
                expect(num == 199999999).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("2.0").toNumber();
                expect(num == 200000000).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("2.00000001").toNumber();
                expect(num == 200000001).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("2000.00000001").toNumber();
                expect(num == 200000000001).toBe(true);

                num = TLCurrencyFormat.bitcoinAmountStringToCoin("21000000").toNumber();
                expect(num == 2100000000000000).toBe(true);
            });
        });
//*/
    });
