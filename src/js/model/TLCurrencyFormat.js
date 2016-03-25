'use strict';

define(['model/TLBitcoinJSWrapper', 'model/TLCoin'],
    function(TLBitcoinJSWrapper, TLCoin) {
        TLCurrencyFormat.fiatCurrenciesList = [
            {
                "symbol": "AU$",
                "name": "Australian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AUD",
                "name_plural": "Australian dollars"
            },
            {
                "symbol": "R$",
                "name": "Brazilian Real",
                "symbol_native": "R$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BRL",
                "name_plural": "Brazilian reals"
            },
            {
                "symbol": "CA$",
                "name": "Canadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CAD",
                "name_plural": "Canadian dollars"
            },
            {
                "symbol": "CHF",
                "name": "Swiss Franc",
                "symbol_native": "CHF",
                "decimal_digits": 2,
                "rounding": 0.05,
                "code": "CHF",
                "name_plural": "Swiss francs"
            },
            {
                "symbol": "CLP",
                "name": "Chilean Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CLP",
                "name_plural": "Chilean pesos"
            },
            {
                "symbol": "CN¥",
                "name": "Chinese Yuan",
                "symbol_native": "CN¥",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CNY",
                "name_plural": "Chinese yuan"
            },
            {
                "symbol": "DKK",
                "name": "Danish Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DKK",
                "name_plural": "Danish kroner"
            },
            {
                "symbol": "\u20AC",
                "name": "Euro",
                "symbol_native": "\u20AC",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EUR",
                "name_plural": "euros"
            },
            {
                "symbol": "£",
                "name": "British Pound Sterling",
                "symbol_native": "£",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GBP",
                "name_plural": "British pounds sterling"
            },
            {
                "symbol": "HK$",
                "name": "Hong Kong Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HKD",
                "name_plural": "Hong Kong dollars"
            },
            {
                "symbol": "ISK",
                "name": "Icelandic Króna",
                "symbol_native": "kr",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ISK",
                "name_plural": "Icelandic krónur"
            },
            {
                "symbol": "¥",
                "name": "Japanese Yen",
                "symbol_native": "￥",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "JPY",
                "name_plural": "Japanese yen"
            },
            {
                "symbol": "\u20A9",
                "name": "South Korean Won",
                "symbol_native": "\u20A9",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "KRW",
                "name_plural": "South Korean won"
            },
            {
                "symbol": "NZ$",
                "name": "New Zealand Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NZD",
                "name_plural": "New Zealand dollars"
            },
            {
                "symbol": "PLN",
                "name": "Polish Zloty",
                "symbol_native": "zł",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PLN",
                "name_plural": "Polish zlotys"
            },
            {
                "symbol": "RUB",
                "name": "Russian Ruble",
                "symbol_native": "руб.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "RUB",
                "name_plural": "Russian rubles"
            },
            {
                "symbol": "SEK",
                "name": "Swedish Krona",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SEK",
                "name_plural": "Swedish kronor"
            },
            {
                "symbol": "SGD",
                "name": "Singapore Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SGD",
                "name_plural": "Singapore dollars"
            },
            {
                "symbol": "฿",
                "name": "Thai Baht",
                "symbol_native": "฿",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "THB",
                "name_plural": "Thai baht"
            },
            {
                "symbol": "NT$",
                "name": "New Taiwan Dollar",
                "symbol_native": "NT$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TWD",
                "name_plural": "New Taiwan dollars"
            },
            {
                "symbol": "$",
                "name": "US Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "USD",
                "name_plural": "US dollars"
            },
            {
                "symbol": "AED",
                "name": "United Arab Emirates Dirham",
                "symbol_native": "د.إ.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AED",
                "name_plural": "UAE dirhams"
            },
            {
                "symbol": "AFN",
                "name": "Afghan Afghani",
                "symbol_native": "؋",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "AFN",
                "name_plural": "Afghan Afghanis"
            },
            {
                "symbol": "ALL",
                "name": "Albanian Lek",
                "symbol_native": "Lek",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ALL",
                "name_plural": "Albanian lekë"
            },
            {
                "symbol": "AMD",
                "name": "Armenian Dram",
                "symbol_native": "դր.",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "AMD",
                "name_plural": "Armenian drams"
            },
            {
                "symbol": "ANG",
                "name": "Netherlands Antillean Guilder",
                "symbol_native": "ANG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ANG",
                "name_plural": "Netherlands Antillean Guilder"
            },
            {
                "symbol": "AOA",
                "name": "Angolan Kwanza",
                "symbol_native": "Kz",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AOA",
                "name_plural": "Angolan kwanzas"
            },
            {
                "symbol": "ARS",
                "name": "Argentine Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ARS",
                "name_plural": "Argentine pesos"
            },
            {
                "symbol": "AWG",
                "name": "Aruban Florin",
                "symbol_native": "Afl.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AWG",
                "name_plural": "Aruban florin"
            },
            {
                "symbol": "AZN",
                "name": "Azerbaijani Manat",
                "symbol_native": "ман.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AZN",
                "name_plural": "Azerbaijani manats"
            },
            {
                "symbol": "BAM",
                "name": "Bosnia-Herzegovina Convertible Mark",
                "symbol_native": "KM",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BAM",
                "name_plural": "Bosnia-Herzegovina convertible marks"
            },
            {
                "symbol": "BBD",
                "name": "Barbadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BBD",
                "name_plural": "Barbadian dollars"
            },
            {
                "symbol": "BDT",
                "name": "Bangladeshi Taka",
                "symbol_native": "৳",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BDT",
                "name_plural": "Bangladeshi takas"
            },
            {
                "symbol": "BGN",
                "name": "Bulgarian Lev",
                "symbol_native": "лв.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BGN",
                "name_plural": "Bulgarian leva"
            },
            {
                "symbol": "BHD",
                "name": "Bahraini Dinar",
                "symbol_native": "د.ب.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "BHD",
                "name_plural": "Bahraini dinars"
            },
            {
                "symbol": "BIF",
                "name": "Burundian Franc",
                "symbol_native": "FBu",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "BIF",
                "name_plural": "Burundian francs"
            },
            {
                "symbol": "BMD",
                "name": "Bermudan Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BMD",
                "name_plural": "Bermudan dollars"
            },
            {
                "symbol": "BND",
                "name": "Brunei Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BND",
                "name_plural": "Brunei dollars"
            },
            {
                "symbol": "BOB",
                "name": "Bolivian Boliviano",
                "symbol_native": "Bs",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BOB",
                "name_plural": "Bolivian bolivianos"
            },
            {
                "symbol": "BSD",
                "name": "Bahamian Dollar",
                "symbol_native": "BSD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BSD",
                "name_plural": "Bahamian Dollars"
            },
            {
                "symbol": "BTN",
                "name": "Bhutanese Ngultrum",
                "symbol_native": "BTN",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BTN",
                "name_plural": "Bhutanese Ngultrum"
            },
            {
                "symbol": "BWP",
                "name": "Botswanan Pula",
                "symbol_native": "P",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BWP",
                "name_plural": "Botswanan pulas"
            },
            {
                "symbol": "BYR",
                "name": "Belarusian Ruble",
                "symbol_native": "BYR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "BYR",
                "name_plural": "Belarusian rubles"
            },
            {
                "symbol": "BZD",
                "name": "Belize Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BZD",
                "name_plural": "Belize dollars"
            },
            {
                "symbol": "CDF",
                "name": "Congolese Franc",
                "symbol_native": "FrCD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CDF",
                "name_plural": "Congolese francs"
            },
            {
                "symbol": "CLF",
                "name": "Chilean Unit of Account (UF)",
                "symbol_native": "CLF",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CLF",
                "name_plural": "Chilean Unit of Account (UF)"
            },
            {
                "symbol": "COP",
                "name": "Colombian Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "COP",
                "name_plural": "Colombian pesos"
            },
            {
                "symbol": "CRC",
                "name": "Costa Rican Colón",
                "symbol_native": "\u20A1",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CRC",
                "name_plural": "Costa Rican colóns"
            },
            {
                "symbol": "CVE",
                "name": "Cape Verdean Escudo",
                "symbol_native": "CVE",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CVE",
                "name_plural": "Cape Verdean escudos"
            },
            {
                "symbol": "CZK",
                "name": "Czech Republic Koruna",
                "symbol_native": "Kč",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CZK",
                "name_plural": "Czech Republic korunas"
            },
            {
                "symbol": "DJF",
                "name": "Djiboutian Franc",
                "symbol_native": "Fdj",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "DJF",
                "name_plural": "Djiboutian francs"
            },
            {
                "symbol": "DOP",
                "name": "Dominican Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DOP",
                "name_plural": "Dominican pesos"
            },
            {
                "symbol": "DZD",
                "name": "Algerian Dinar",
                "symbol_native": "د.ج.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DZD",
                "name_plural": "Algerian dinars"
            },
            {
                "symbol": "EEK",
                "name": "Estonian Kroon",
                "symbol_native": "EEK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EEK",
                "name_plural": "Estonian Kroon"
            },
            {
                "symbol": "EGP",
                "name": "Egyptian Pound",
                "symbol_native": "ج.م.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EGP",
                "name_plural": "Egyptian pounds"
            },
            {
                "symbol": "ERN",
                "name": "Eritrean Nakfa",
                "symbol_native": "Nfk",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ERN",
                "name_plural": "Eritrean nakfas"
            },
            {
                "symbol": "ETB",
                "name": "Ethiopian Birr",
                "symbol_native": "ብር",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ETB",
                "name_plural": "Ethiopian birrs"
            },
            {
                "symbol": "FJD",
                "name": "Fijian Dollar",
                "symbol_native": "FJD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "FJD",
                "name_plural": "Fijian Dollars"
            },
            {
                "symbol": "FKP",
                "name": "Falkland Islands Pound",
                "symbol_native": "FKP",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "FKP",
                "name_plural": "Falkland Islands Pounds"
            },
            {
                "symbol": "GEL",
                "name": "Georgian Lari",
                "symbol_native": "GEL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GEL",
                "name_plural": "Georgian laris"
            },
            {
                "symbol": "GHS",
                "name": "Ghanaian Cedi",
                "symbol_native": "GHS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GHS",
                "name_plural": "Ghanaian cedis"
            },
            {
                "symbol": "GIP",
                "name": "Gibraltar Pound",
                "symbol_native": "GIP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GIP",
                "name_plural": "Gibraltar Pound"
            },
            {
                "symbol": "GMD",
                "name": "Gambian Dalasi",
                "symbol_native": "GMD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GMD",
                "name_plural": "Gambian Dalasi"
            },
            {
                "symbol": "GNF",
                "name": "Guinean Franc",
                "symbol_native": "FG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GNF",
                "name_plural": "Guinean francs"
            },
            {
                "symbol": "GTQ",
                "name": "Guatemalan Quetzal",
                "symbol_native": "Q",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GTQ",
                "name_plural": "Guatemalan quetzals"
            },
            {
                "symbol": "GYD",
                "name": "Guyanaese Dollar",
                "symbol_native": "GYD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GYD",
                "name_plural": "Guyanaese dollars"
            },
            {
                "symbol": "HNL",
                "name": "Honduran Lempira",
                "symbol_native": "L",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HNL",
                "name_plural": "Honduran lempiras"
            },
            {
                "symbol": "HRK",
                "name": "Croatian Kuna",
                "symbol_native": "kn",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HRK",
                "name_plural": "Croatian kunas"
            },
            {
                "symbol": "HTG",
                "name": "Haitian Gourde",
                "symbol_native": "HTG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "HTG",
                "name_plural": "Haitian Gourde"
            },
            {
                "symbol": "HUF",
                "name": "Hungarian Forint",
                "symbol_native": "Ft",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "HUF",
                "name_plural": "Hungarian forints"
            },
            {
                "symbol": "IDR",
                "name": "Indonesian Rupiah",
                "symbol_native": "Rp",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IDR",
                "name_plural": "Indonesian rupiahs"
            },
            {
                "symbol": "\u20AA",
                "name": "Israeli New Sheqel",
                "symbol_native": "\u20AA",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ILS",
                "name_plural": "Israeli new sheqels"
            },
            {
                "symbol": "\u20B9",
                "name": "Indian Rupee",
                "symbol_native": "\u20B9",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "INR",
                "name_plural": "Indian rupees"
            },
            {
                "symbol": "IQD",
                "name": "Iraqi Dinar",
                "symbol_native": "د.ع.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IQD",
                "name_plural": "Iraqi dinars"
            },
            {
                "symbol": "IRR",
                "name": "Iranian Rial",
                "symbol_native": "﷼",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IRR",
                "name_plural": "Iranian rials"
            },
            {
                "symbol": "JEP",
                "name": "Jersey Pound",
                "symbol_native": "JEP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "JEP",
                "name_plural": "Jersey Pound"
            },
            {
                "symbol": "JMD",
                "name": "Jamaican Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "JMD",
                "name_plural": "Jamaican dollars"
            },
            {
                "symbol": "JOD",
                "name": "Jordanian Dinar",
                "symbol_native": "د.أ.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "JOD",
                "name_plural": "Jordanian dinars"
            },
            {
                "symbol": "KES",
                "name": "Kenyan Shilling",
                "symbol_native": "Ksh",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KES",
                "name_plural": "Kenyan shillings"
            },
            {
                "symbol": "KGS",
                "name": "Kyrgystani Som",
                "symbol_native": "KGS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KGS",
                "name_plural": "Kyrgystani Som"
            },
            {
                "symbol": "KHR",
                "name": "Cambodian Riel",
                "symbol_native": "៛",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KHR",
                "name_plural": "Cambodian riels"
            },
            {
                "symbol": "KMF",
                "name": "Comorian Franc",
                "symbol_native": "CF",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "KMF",
                "name_plural": "Comorian francs"
            },
            {
                "symbol": "KWD",
                "name": "Kuwaiti Dinar",
                "symbol_native": "د.ك.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "KWD",
                "name_plural": "Kuwaiti dinars"
            },
            {
                "symbol": "KYD",
                "name": "Cayman Islands Dollar",
                "symbol_native": "KYD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KYD",
                "name_plural": "Cayman Islands Dollars"
            },
            {
                "symbol": "KZT",
                "name": "Kazakhstani Tenge",
                "symbol_native": "\u20B8",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KZT",
                "name_plural": "Kazakhstani tenges"
            },
            {
                "symbol": "LAK",
                "name": "Laotian Kip",
                "symbol_native": "LAK",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "LAK",
                "name_plural": "Laotian Kip"
            },
            {
                "symbol": "LBP",
                "name": "Lebanese Pound",
                "symbol_native": "ل.ل.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "LBP",
                "name_plural": "Lebanese pounds"
            },
            {
                "symbol": "LKR",
                "name": "Sri Lankan Rupee",
                "symbol_native": "රු.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LKR",
                "name_plural": "Sri Lankan rupees"
            },
            {
                "symbol": "LRD",
                "name": "Liberian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LRD",
                "name_plural": "Liberian dollars"
            },
            {
                "symbol": "LSL",
                "name": "Lesotho Loti",
                "symbol_native": "LSL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LSL",
                "name_plural": "Lesotho Loti"
            },
            {
                "symbol": "LTL",
                "name": "Lithuanian Litas",
                "symbol_native": "Lt",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LTL",
                "name_plural": "Lithuanian litai"
            },
            {
                "symbol": "LVL",
                "name": "Latvian Lats",
                "symbol_native": "Ls",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LVL",
                "name_plural": "Latvian lati"
            },
            {
                "symbol": "LYD",
                "name": "Libyan Dinar",
                "symbol_native": "د.ل.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "LYD",
                "name_plural": "Libyan dinars"
            },
            {
                "symbol": "MAD",
                "name": "Moroccan Dirham",
                "symbol_native": "د.م.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MAD",
                "name_plural": "Moroccan dirhams"
            },
            {
                "symbol": "MDL",
                "name": "Moldovan Leu",
                "symbol_native": "MDL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MDL",
                "name_plural": "Moldovan lei"
            },
            {
                "symbol": "MGA",
                "name": "Malagasy Ariary",
                "symbol_native": "MGA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MGA",
                "name_plural": "Malagasy Ariaries"
            },
            {
                "symbol": "MKD",
                "name": "Macedonian Denar",
                "symbol_native": "MKD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MKD",
                "name_plural": "Macedonian denari"
            },
            {
                "symbol": "MMK",
                "name": "Myanma Kyat",
                "symbol_native": "K",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MMK",
                "name_plural": "Myanma kyats"
            },
            {
                "symbol": "MNT",
                "name": "Mongolian Tugrik",
                "symbol_native": "MNT",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MNT",
                "name_plural": "Mongolian Tugrik"
            },
            {
                "symbol": "MOP",
                "name": "Macanese Pataca",
                "symbol_native": "MOP",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MOP",
                "name_plural": "Macanese patacas"
            },
            {
                "symbol": "MRO",
                "name": "Mauritanian Ouguiya",
                "symbol_native": "MRO",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MRO",
                "name_plural": "Mauritanian Ouguiya"
            },
            {
                "symbol": "MUR",
                "name": "Mauritian Rupee",
                "symbol_native": "MUR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MUR",
                "name_plural": "Mauritian rupees"
            },
            {
                "symbol": "MVR",
                "name": "Maldivian Rufiyaa",
                "symbol_native": "MVR",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MVR",
                "name_plural": "Maldivian Rufiyaa"
            },
            {
                "symbol": "MWK",
                "name": "Malawian Kwacha",
                "symbol_native": "MWK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MWK",
                "name_plural": "Malawian Kwacha"
            },
            {
                "symbol": "MX$",
                "name": "Mexican Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MXN",
                "name_plural": "Mexican pesos"
            },
            {
                "symbol": "MYR",
                "name": "Malaysian Ringgit",
                "symbol_native": "RM",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MYR",
                "name_plural": "Malaysian ringgits"
            },
            {
                "symbol": "MZN",
                "name": "Mozambican Metical",
                "symbol_native": "MTn",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MZN",
                "name_plural": "Mozambican meticals"
            },
            {
                "symbol": "NAD",
                "name": "Namibian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NAD",
                "name_plural": "Namibian dollars"
            },
            {
                "symbol": "NGN",
                "name": "Nigerian Naira",
                "symbol_native": "\u20A6",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NGN",
                "name_plural": "Nigerian nairas"
            },
            {
                "symbol": "NIO",
                "name": "Nicaraguan Córdoba",
                "symbol_native": "C$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NIO",
                "name_plural": "Nicaraguan córdobas"
            },
            {
                "symbol": "NOK",
                "name": "Norwegian Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NOK",
                "name_plural": "Norwegian kroner"
            },
            {
                "symbol": "NPR",
                "name": "Nepalese Rupee",
                "symbol_native": "नेरू",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NPR",
                "name_plural": "Nepalese rupees"
            },
            {
                "symbol": "OMR",
                "name": "Omani Rial",
                "symbol_native": "ر.ع.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "OMR",
                "name_plural": "Omani rials"
            },
            {
                "symbol": "PAB",
                "name": "Panamanian Balboa",
                "symbol_native": "B\/.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PAB",
                "name_plural": "Panamanian balboas"
            },
            {
                "symbol": "PEN",
                "name": "Peruvian Nuevo Sol",
                "symbol_native": "S\/.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PEN",
                "name_plural": "Peruvian nuevos soles"
            },
            {
                "symbol": "PGK",
                "name": "Papua New Guinean Kina",
                "symbol_native": "PGK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PGK",
                "name_plural": "Papua New Guinean Kina"
            },
            {
                "symbol": "PHP",
                "name": "Philippine Peso",
                "symbol_native": "\u20B1",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PHP",
                "name_plural": "Philippine pesos"
            },
            {
                "symbol": "PKR",
                "name": "Pakistani Rupee",
                "symbol_native": "\u20A8",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "PKR",
                "name_plural": "Pakistani rupees"
            },
            {
                "symbol": "PYG",
                "name": "Paraguayan Guarani",
                "symbol_native": "\u20B2",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "PYG",
                "name_plural": "Paraguayan guaranis"
            },
            {
                "symbol": "QAR",
                "name": "Qatari Rial",
                "symbol_native": "ر.ق.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "QAR",
                "name_plural": "Qatari rials"
            },
            {
                "symbol": "RON",
                "name": "Romanian Leu",
                "symbol_native": "RON",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "RON",
                "name_plural": "Romanian lei"
            },
            {
                "symbol": "RSD",
                "name": "Serbian Dinar",
                "symbol_native": "дин.",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "RSD",
                "name_plural": "Serbian dinars"
            },
            {
                "symbol": "RWF",
                "name": "Rwandan Franc",
                "symbol_native": "FR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "RWF",
                "name_plural": "Rwandan francs"
            },
            {
                "symbol": "SAR",
                "name": "Saudi Riyal",
                "symbol_native": "ر.س.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SAR",
                "name_plural": "Saudi riyals"
            },
            {
                "symbol": "SBD",
                "name": "Solomon Islands Dollar",
                "symbol_native": "SBD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SBD",
                "name_plural": "Solomon Islands Dollar"
            },
            {
                "symbol": "SCR",
                "name": "Seychellois Rupee",
                "symbol_native": "SCR",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SCR",
                "name_plural": "Seychellois Rupee"
            },
            {
                "symbol": "SDG",
                "name": "Sudanese Pound",
                "symbol_native": "SDG",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SDG",
                "name_plural": "Sudanese pounds"
            },
            {
                "symbol": "SHP",
                "name": "Saint Helena Pound",
                "symbol_native": "SHP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SHP",
                "name_plural": "Saint Helena Pounds"
            },
            {
                "symbol": "SLL",
                "name": "Sierra Leonean Leone",
                "symbol_native": "SLL",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SLL",
                "name_plural": "Sierra Leonean Leone"
            },
            {
                "symbol": "SOS",
                "name": "Somali Shilling",
                "symbol_native": "SOS",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SOS",
                "name_plural": "Somali shillings"
            },
            {
                "symbol": "SRD",
                "name": "Surinamese Dollar",
                "symbol_native": "SRD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SRD",
                "name_plural": "Surinamese Dollars"
            },
            {
                "symbol": "STD",
                "name": "São Tomé and Príncipe Dobra",
                "symbol_native": "Db",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "STD",
                "name_plural": "São Tomé and Príncipe dobras"
            },
            {
                "symbol": "SVC",
                "name": "Salvadoran Col\u00c3\u00b3n",
                "symbol_native": "SVC",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SVC",
                "name_plural": "Salvadoran Col\u00c3\u00b3n"
            },
            {
                "symbol": "SYP",
                "name": "Syrian Pound",
                "symbol_native": "ل.س.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SYP",
                "name_plural": "Syrian pounds"
            },
            {
                "symbol": "SZL",
                "name": "Swazi Lilangeni",
                "symbol_native": "SZL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SZL",
                "name_plural": "Swazi Lilangeni"
            },
            {
                "symbol": "TJS",
                "name": "Tajikistani Somoni",
                "symbol_native": "TJS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TJS",
                "name_plural": "Tajikistani Somoni"
            },
            {
                "symbol": "TMT",
                "name": "Turkmenistani Manat",
                "symbol_native": "TMT",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TMT",
                "name_plural": "Turkmenistani Manat"
            },
            {
                "symbol": "TND",
                "name": "Tunisian Dinar",
                "symbol_native": "د.ت.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "TND",
                "name_plural": "Tunisian dinars"
            },
            {
                "symbol": "TOP",
                "name": "Tongan Paʻanga",
                "symbol_native": "T$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TOP",
                "name_plural": "Tongan paʻanga"
            },
            {
                "symbol": "TRY",
                "name": "Turkish Lira",
                "symbol_native": "TL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TRY",
                "name_plural": "Turkish Lira"
            },
            {
                "symbol": "TTD",
                "name": "Trinidad and Tobago Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TTD",
                "name_plural": "Trinidad and Tobago dollars"
            },
            {
                "symbol": "TZS",
                "name": "Tanzanian Shilling",
                "symbol_native": "TSh",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "TZS",
                "name_plural": "Tanzanian shillings"
            },
            {
                "symbol": "UAH",
                "name": "Ukrainian Hryvnia",
                "symbol_native": "\u20B4",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "UAH",
                "name_plural": "Ukrainian hryvnias"
            },
            {
                "symbol": "UGX",
                "name": "Ugandan Shilling",
                "symbol_native": "USh",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "UGX",
                "name_plural": "Ugandan shillings"
            },
            {
                "symbol": "UYU",
                "name": "Uruguayan Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "UYU",
                "name_plural": "Uruguayan pesos"
            },
            {
                "symbol": "UZS",
                "name": "Uzbekistan Som",
                "symbol_native": "UZS",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "UZS",
                "name_plural": "Uzbekistan som"
            },
            {
                "symbol": "VEF",
                "name": "Venezuelan Bolívar",
                "symbol_native": "Bs.F.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "VEF",
                "name_plural": "Venezuelan bolívars"
            },
            {
                "symbol": "\u20AB",
                "name": "Vietnamese Dong",
                "symbol_native": "\u20AB",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "VND",
                "name_plural": "Vietnamese dong"
            },
            {
                "symbol": "VUV",
                "name": "Vanuatu Vatu",
                "symbol_native": "VUV",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "VUV",
                "name_plural": "Vanuatu Vatu"
            },
            {
                "symbol": "WST",
                "name": "Samoan Tala",
                "symbol_native": "WST",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "WST",
                "name_plural": "Samoan Tala"
            },
            {
                "symbol": "FCFA",
                "name": "CFA Franc BEAC",
                "symbol_native": "FCFA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAF",
                "name_plural": "CFA francs BEAC"
            },
            {
                "symbol": "XAG",
                "name": "Silver (troy ounce)",
                "symbol_native": "XAG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAG",
                "name_plural": "Silver (troy ounces)"
            },
            {
                "symbol": "XAU",
                "name": "Gold (troy ounce)",
                "symbol_native": "XAU",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAU",
                "name_plural": "Gold (troy ounces)"
            },
            {
                "symbol": "XCD",
                "name": "East Caribbean Dollar",
                "symbol_native": "XCD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XCD",
                "name_plural": "CEast Caribbean Dollars"
            },
            {
                "symbol": "CFA",
                "name": "CFA Franc BCEAO",
                "symbol_native": "CFA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XOF",
                "name_plural": "CFA francs BCEAO"
            },
            {
                "symbol": "XPF",
                "name": "CFP Franc",
                "symbol_native": "CFP Franc",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XPF",
                "name_plural": "CFP Francs"
            },
            {
                "symbol": "YER",
                "name": "Yemeni Rial",
                "symbol_native": "ر.ي.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "YER",
                "name_plural": "Yemeni rials"
            },
            {
                "symbol": "ZAR",
                "name": "South African Rand",
                "symbol_native": "R",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ZAR",
                "name_plural": "South African rand"
            },
            {
                "symbol": "ZMW",
                "name": "Zambian Kwacha",
                "symbol_native": "ZK",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ZMW",
                "name_plural": "Zambian kwachas"
            },
            {
                "symbol": "ZWL",
                "name": "Zimbabwean Dollar",
                "symbol_native": "ZWL",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ZWL",
                "name_plural": "Zimbabwean Dollars"
            }
        ];

        TLCurrencyFormat.fiatCurrencies = {
            "AUD": {
                "symbol": "AU$",
                "name": "Australian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AUD",
                "name_plural": "Australian dollars"
            },
            "BRL": {
                "symbol": "R$",
                "name": "Brazilian Real",
                "symbol_native": "R$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BRL",
                "name_plural": "Brazilian reals"
            },
            "CAD": {
                "symbol": "CA$",
                "name": "Canadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CAD",
                "name_plural": "Canadian dollars"
            },
            "CHF": {
                "symbol": "CHF",
                "name": "Swiss Franc",
                "symbol_native": "CHF",
                "decimal_digits": 2,
                "rounding": 0.05,
                "code": "CHF",
                "name_plural": "Swiss francs"
            },
            "CLP": {
                "symbol": "CLP",
                "name": "Chilean Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CLP",
                "name_plural": "Chilean pesos"
            },
            "CNY": {
                "symbol": "CN¥",
                "name": "Chinese Yuan",
                "symbol_native": "CN¥",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CNY",
                "name_plural": "Chinese yuan"
            },
            "DKK": {
                "symbol": "DKK",
                "name": "Danish Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DKK",
                "name_plural": "Danish kroner"
            },
            "EUR": {
                "symbol": "\u20AC",
                "name": "Euro",
                "symbol_native": "\u20AC",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EUR",
                "name_plural": "euros"
            },
            "GBP": {
                "symbol": "£",
                "name": "British Pound Sterling",
                "symbol_native": "£",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GBP",
                "name_plural": "British pounds sterling"
            },
            "HKD": {
                "symbol": "HK$",
                "name": "Hong Kong Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HKD",
                "name_plural": "Hong Kong dollars"
            },
            "ISK": {
                "symbol": "ISK",
                "name": "Icelandic Króna",
                "symbol_native": "kr",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ISK",
                "name_plural": "Icelandic krónur"
            },
            "JPY": {
                "symbol": "¥",
                "name": "Japanese Yen",
                "symbol_native": "￥",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "JPY",
                "name_plural": "Japanese yen"
            },
            "KRW": {
                "symbol": "\u20A9",
                "name": "South Korean Won",
                "symbol_native": "\u20A9",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "KRW",
                "name_plural": "South Korean won"
            },
            "NZD": {
                "symbol": "NZ$",
                "name": "New Zealand Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NZD",
                "name_plural": "New Zealand dollars"
            },
            "PLN": {
                "symbol": "PLN",
                "name": "Polish Zloty",
                "symbol_native": "zł",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PLN",
                "name_plural": "Polish zlotys"
            },
            "RUB": {
                "symbol": "RUB",
                "name": "Russian Ruble",
                "symbol_native": "руб.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "RUB",
                "name_plural": "Russian rubles"
            },
            "SEK": {
                "symbol": "SEK",
                "name": "Swedish Krona",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SEK",
                "name_plural": "Swedish kronor"
            },
            "SGD": {
                "symbol": "SGD",
                "name": "Singapore Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SGD",
                "name_plural": "Singapore dollars"
            },
            "THB": {
                "symbol": "฿",
                "name": "Thai Baht",
                "symbol_native": "฿",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "THB",
                "name_plural": "Thai baht"
            },
            "TWD": {
                "symbol": "NT$",
                "name": "New Taiwan Dollar",
                "symbol_native": "NT$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TWD",
                "name_plural": "New Taiwan dollars"
            },
            "USD": {
                "symbol": "$",
                "name": "US Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "USD",
                "name_plural": "US dollars"
            },
            "AED": {
                "symbol": "AED",
                "name": "United Arab Emirates Dirham",
                "symbol_native": "د.إ.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AED",
                "name_plural": "UAE dirhams"
            },
            "AFN": {
                "symbol": "AFN",
                "name": "Afghan Afghani",
                "symbol_native": "؋",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "AFN",
                "name_plural": "Afghan Afghanis"
            },
            "ALL": {
                "symbol": "ALL",
                "name": "Albanian Lek",
                "symbol_native": "Lek",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ALL",
                "name_plural": "Albanian lekë"
            },
            "AMD": {
                "symbol": "AMD",
                "name": "Armenian Dram",
                "symbol_native": "դր.",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "AMD",
                "name_plural": "Armenian drams"
            },
            "ANG": {
                "symbol": "ANG",
                "name": "Netherlands Antillean Guilder",
                "symbol_native": "ANG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ANG",
                "name_plural": "Netherlands Antillean Guilder"
            },
            "AOA": {
                "symbol": "AOA",
                "name": "Angolan Kwanza",
                "symbol_native": "Kz",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AOA",
                "name_plural": "Angolan kwanzas"
            },
            "ARS": {
                "symbol": "ARS",
                "name": "Argentine Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ARS",
                "name_plural": "Argentine pesos"
            },
            "AWG": {
                "symbol": "AWG",
                "name": "Aruban Florin",
                "symbol_native": "Afl.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AWG",
                "name_plural": "Aruban florin"
            },
            "AZN": {
                "symbol": "AZN",
                "name": "Azerbaijani Manat",
                "symbol_native": "ман.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "AZN",
                "name_plural": "Azerbaijani manats"
            },
            "BAM": {
                "symbol": "BAM",
                "name": "Bosnia-Herzegovina Convertible Mark",
                "symbol_native": "KM",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BAM",
                "name_plural": "Bosnia-Herzegovina convertible marks"
            },
            "BBD": {
                "symbol": "BBD",
                "name": "Barbadian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BBD",
                "name_plural": "Barbadian dollars"
            },
            "BDT": {
                "symbol": "BDT",
                "name": "Bangladeshi Taka",
                "symbol_native": "৳",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BDT",
                "name_plural": "Bangladeshi takas"
            },
            "BGN": {
                "symbol": "BGN",
                "name": "Bulgarian Lev",
                "symbol_native": "лв.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BGN",
                "name_plural": "Bulgarian leva"
            },
            "BHD": {
                "symbol": "BHD",
                "name": "Bahraini Dinar",
                "symbol_native": "د.ب.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "BHD",
                "name_plural": "Bahraini dinars"
            },
            "BIF": {
                "symbol": "BIF",
                "name": "Burundian Franc",
                "symbol_native": "FBu",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "BIF",
                "name_plural": "Burundian francs"
            },
            "BMD": {
                "symbol": "BMD",
                "name": "Bermudan Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BMD",
                "name_plural": "Bermudan dollars"
            },
            "BND": {
                "symbol": "BND",
                "name": "Brunei Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BND",
                "name_plural": "Brunei dollars"
            },
            "BOB": {
                "symbol": "BOB",
                "name": "Bolivian Boliviano",
                "symbol_native": "Bs",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BOB",
                "name_plural": "Bolivian bolivianos"
            },
            "BSD": {
                "symbol": "BSD",
                "name": "Bahamian Dollar",
                "symbol_native": "BSD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BSD",
                "name_plural": "Bahamian Dollars"
            },
            "BTN": {
                "symbol": "BTN",
                "name": "Bhutanese Ngultrum",
                "symbol_native": "BTN",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BTN",
                "name_plural": "Bhutanese Ngultrum"
            },
            "BWP": {
                "symbol": "BWP",
                "name": "Botswanan Pula",
                "symbol_native": "P",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BWP",
                "name_plural": "Botswanan pulas"
            },
            "BYR": {
                "symbol": "BYR",
                "name": "Belarusian Ruble",
                "symbol_native": "BYR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "BYR",
                "name_plural": "Belarusian rubles"
            },
            "BZD": {
                "symbol": "BZD",
                "name": "Belize Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "BZD",
                "name_plural": "Belize dollars"
            },
            "CDF": {
                "symbol": "CDF",
                "name": "Congolese Franc",
                "symbol_native": "FrCD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CDF",
                "name_plural": "Congolese francs"
            },
            "CLF": {
                "symbol": "CLF",
                "name": "Chilean Unit of Account (UF)",
                "symbol_native": "CLF",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CLF",
                "name_plural": "Chilean Unit of Account (UF)"
            },
            "COP": {
                "symbol": "COP",
                "name": "Colombian Peso",
                "symbol_native": "$",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "COP",
                "name_plural": "Colombian pesos"
            },
            "CRC": {
                "symbol": "CRC",
                "name": "Costa Rican Colón",
                "symbol_native": "\u20A1",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "CRC",
                "name_plural": "Costa Rican colóns"
            },
            "CVE": {
                "symbol": "CVE",
                "name": "Cape Verdean Escudo",
                "symbol_native": "CVE",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CVE",
                "name_plural": "Cape Verdean escudos"
            },
            "CZK": {
                "symbol": "CZK",
                "name": "Czech Republic Koruna",
                "symbol_native": "Kč",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "CZK",
                "name_plural": "Czech Republic korunas"
            },
            "DJF": {
                "symbol": "DJF",
                "name": "Djiboutian Franc",
                "symbol_native": "Fdj",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "DJF",
                "name_plural": "Djiboutian francs"
            },
            "DOP": {
                "symbol": "DOP",
                "name": "Dominican Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DOP",
                "name_plural": "Dominican pesos"
            },
            "DZD": {
                "symbol": "DZD",
                "name": "Algerian Dinar",
                "symbol_native": "د.ج.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "DZD",
                "name_plural": "Algerian dinars"
            },
            "EEK": {
                "symbol": "EEK",
                "name": "Estonian Kroon",
                "symbol_native": "EEK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EEK",
                "name_plural": "Estonian Kroon"
            },
            "EGP": {
                "symbol": "EGP",
                "name": "Egyptian Pound",
                "symbol_native": "ج.م.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "EGP",
                "name_plural": "Egyptian pounds"
            },
            "ERN": {
                "symbol": "ERN",
                "name": "Eritrean Nakfa",
                "symbol_native": "Nfk",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ERN",
                "name_plural": "Eritrean nakfas"
            },
            "ETB": {
                "symbol": "ETB",
                "name": "Ethiopian Birr",
                "symbol_native": "ብር",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ETB",
                "name_plural": "Ethiopian birrs"
            },
            "FJD": {
                "symbol": "FJD",
                "name": "Fijian Dollar",
                "symbol_native": "FJD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "FJD",
                "name_plural": "Fijian Dollars"
            },
            "FKP": {
                "symbol": "FKP",
                "name": "Falkland Islands Pound",
                "symbol_native": "FKP",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "FKP",
                "name_plural": "Falkland Islands Pounds"
            },
            "GEL": {
                "symbol": "GEL",
                "name": "Georgian Lari",
                "symbol_native": "GEL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GEL",
                "name_plural": "Georgian laris"
            },
            "GHS": {
                "symbol": "GHS",
                "name": "Ghanaian Cedi",
                "symbol_native": "GHS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GHS",
                "name_plural": "Ghanaian cedis"
            },
            "GIP": {
                "symbol": "GIP",
                "name": "Gibraltar Pound",
                "symbol_native": "GIP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GIP",
                "name_plural": "Gibraltar Pound"
            },
            "GMD": {
                "symbol": "GMD",
                "name": "Gambian Dalasi",
                "symbol_native": "GMD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GMD",
                "name_plural": "Gambian Dalasi"
            },
            "GNF": {
                "symbol": "GNF",
                "name": "Guinean Franc",
                "symbol_native": "FG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GNF",
                "name_plural": "Guinean francs"
            },
            "GTQ": {
                "symbol": "GTQ",
                "name": "Guatemalan Quetzal",
                "symbol_native": "Q",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "GTQ",
                "name_plural": "Guatemalan quetzals"
            },
            "GYD": {
                "symbol": "GYD",
                "name": "Guyanaese Dollar",
                "symbol_native": "GYD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "GYD",
                "name_plural": "Guyanaese dollars"
            },
            "HNL": {
                "symbol": "HNL",
                "name": "Honduran Lempira",
                "symbol_native": "L",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HNL",
                "name_plural": "Honduran lempiras"
            },
            "HRK": {
                "symbol": "HRK",
                "name": "Croatian Kuna",
                "symbol_native": "kn",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "HRK",
                "name_plural": "Croatian kunas"
            },
            "HTG": {
                "symbol": "HTG",
                "name": "Haitian Gourde",
                "symbol_native": "HTG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "HTG",
                "name_plural": "Haitian Gourde"
            },
            "HUF": {
                "symbol": "HUF",
                "name": "Hungarian Forint",
                "symbol_native": "Ft",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "HUF",
                "name_plural": "Hungarian forints"
            },
            "IDR": {
                "symbol": "IDR",
                "name": "Indonesian Rupiah",
                "symbol_native": "Rp",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IDR",
                "name_plural": "Indonesian rupiahs"
            },
            "ILS": {
                "symbol": "\u20AA",
                "name": "Israeli New Sheqel",
                "symbol_native": "\u20AA",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ILS",
                "name_plural": "Israeli new sheqels"
            },
            "INR": {
                "symbol": "\u20B9",
                "name": "Indian Rupee",
                "symbol_native": "\u20B9",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "INR",
                "name_plural": "Indian rupees"
            },
            "IQD": {
                "symbol": "IQD",
                "name": "Iraqi Dinar",
                "symbol_native": "د.ع.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IQD",
                "name_plural": "Iraqi dinars"
            },
            "IRR": {
                "symbol": "IRR",
                "name": "Iranian Rial",
                "symbol_native": "﷼",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "IRR",
                "name_plural": "Iranian rials"
            },
            "JEP": {
                "symbol": "JEP",
                "name": "Jersey Pound",
                "symbol_native": "JEP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "JEP",
                "name_plural": "Jersey Pound"
            },
            "JMD": {
                "symbol": "JMD",
                "name": "Jamaican Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "JMD",
                "name_plural": "Jamaican dollars"
            },
            "JOD": {
                "symbol": "JOD",
                "name": "Jordanian Dinar",
                "symbol_native": "د.أ.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "JOD",
                "name_plural": "Jordanian dinars"
            },
            "KES": {
                "symbol": "KES",
                "name": "Kenyan Shilling",
                "symbol_native": "Ksh",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KES",
                "name_plural": "Kenyan shillings"
            },
            "KGS": {
                "symbol": "KGS",
                "name": "Kyrgystani Som",
                "symbol_native": "KGS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KGS",
                "name_plural": "Kyrgystani Som"
            },
            "KHR": {
                "symbol": "KHR",
                "name": "Cambodian Riel",
                "symbol_native": "៛",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KHR",
                "name_plural": "Cambodian riels"
            },
            "KMF": {
                "symbol": "KMF",
                "name": "Comorian Franc",
                "symbol_native": "CF",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "KMF",
                "name_plural": "Comorian francs"
            },
            "KWD": {
                "symbol": "KWD",
                "name": "Kuwaiti Dinar",
                "symbol_native": "د.ك.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "KWD",
                "name_plural": "Kuwaiti dinars"
            },
            "KYD": {
                "symbol": "KYD",
                "name": "Cayman Islands Dollar",
                "symbol_native": "KYD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KYD",
                "name_plural": "Cayman Islands Dollars"
            },
            "KZT": {
                "symbol": "KZT",
                "name": "Kazakhstani Tenge",
                "symbol_native": "\u20B8",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "KZT",
                "name_plural": "Kazakhstani tenges"
            },
            "LAK": {
                "symbol": "LAK",
                "name": "Laotian Kip",
                "symbol_native": "LAK",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "LAK",
                "name_plural": "Laotian Kip"
            },
            "LBP": {
                "symbol": "LBP",
                "name": "Lebanese Pound",
                "symbol_native": "ل.ل.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "LBP",
                "name_plural": "Lebanese pounds"
            },
            "LKR": {
                "symbol": "LKR",
                "name": "Sri Lankan Rupee",
                "symbol_native": "රු.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LKR",
                "name_plural": "Sri Lankan rupees"
            },
            "LRD": {
                "symbol": "LRD",
                "name": "Liberian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LRD",
                "name_plural": "Liberian dollars"
            },
            "LSL": {
                "symbol": "LSL",
                "name": "Lesotho Loti",
                "symbol_native": "LSL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LSL",
                "name_plural": "Lesotho Loti"
            },
            "LTL": {
                "symbol": "LTL",
                "name": "Lithuanian Litas",
                "symbol_native": "Lt",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LTL",
                "name_plural": "Lithuanian litai"
            },
            "LVL": {
                "symbol": "LVL",
                "name": "Latvian Lats",
                "symbol_native": "Ls",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "LVL",
                "name_plural": "Latvian lati"
            },
            "LYD": {
                "symbol": "LYD",
                "name": "Libyan Dinar",
                "symbol_native": "د.ل.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "LYD",
                "name_plural": "Libyan dinars"
            },
            "MAD": {
                "symbol": "MAD",
                "name": "Moroccan Dirham",
                "symbol_native": "د.م.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MAD",
                "name_plural": "Moroccan dirhams"
            },
            "MDL": {
                "symbol": "MDL",
                "name": "Moldovan Leu",
                "symbol_native": "MDL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MDL",
                "name_plural": "Moldovan lei"
            },
            "MGA": {
                "symbol": "MGA",
                "name": "Malagasy Ariary",
                "symbol_native": "MGA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MGA",
                "name_plural": "Malagasy Ariaries"
            },
            "MKD": {
                "symbol": "MKD",
                "name": "Macedonian Denar",
                "symbol_native": "MKD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MKD",
                "name_plural": "Macedonian denari"
            },
            "MMK": {
                "symbol": "MMK",
                "name": "Myanma Kyat",
                "symbol_native": "K",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MMK",
                "name_plural": "Myanma kyats"
            },
            "MNT": {
                "symbol": "MNT",
                "name": "Mongolian Tugrik",
                "symbol_native": "MNT",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MNT",
                "name_plural": "Mongolian Tugrik"
            },
            "MOP": {
                "symbol": "MOP",
                "name": "Macanese Pataca",
                "symbol_native": "MOP",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MOP",
                "name_plural": "Macanese patacas"
            },
            "MRO": {
                "symbol": "MRO",
                "name": "Mauritanian Ouguiya",
                "symbol_native": "MRO",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MRO",
                "name_plural": "Mauritanian Ouguiya"
            },
            "MUR": {
                "symbol": "MUR",
                "name": "Mauritian Rupee",
                "symbol_native": "MUR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "MUR",
                "name_plural": "Mauritian rupees"
            },
            "MVR": {
                "symbol": "MVR",
                "name": "Maldivian Rufiyaa",
                "symbol_native": "MVR",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MVR",
                "name_plural": "Maldivian Rufiyaa"
            },
            "MWK": {
                "symbol": "MWK",
                "name": "Malawian Kwacha",
                "symbol_native": "MWK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MWK",
                "name_plural": "Malawian Kwacha"
            },
            "MXN": {
                "symbol": "MX$",
                "name": "Mexican Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MXN",
                "name_plural": "Mexican pesos"
            },
            "MYR": {
                "symbol": "MYR",
                "name": "Malaysian Ringgit",
                "symbol_native": "RM",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MYR",
                "name_plural": "Malaysian ringgits"
            },
            "MZN": {
                "symbol": "MZN",
                "name": "Mozambican Metical",
                "symbol_native": "MTn",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "MZN",
                "name_plural": "Mozambican meticals"
            },
            "NAD": {
                "symbol": "NAD",
                "name": "Namibian Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NAD",
                "name_plural": "Namibian dollars"
            },
            "NGN": {
                "symbol": "NGN",
                "name": "Nigerian Naira",
                "symbol_native": "\u20A6",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NGN",
                "name_plural": "Nigerian nairas"
            },
            "NIO": {
                "symbol": "NIO",
                "name": "Nicaraguan Córdoba",
                "symbol_native": "C$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NIO",
                "name_plural": "Nicaraguan córdobas"
            },
            "NOK": {
                "symbol": "NOK",
                "name": "Norwegian Krone",
                "symbol_native": "kr",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NOK",
                "name_plural": "Norwegian kroner"
            },
            "NPR": {
                "symbol": "NPR",
                "name": "Nepalese Rupee",
                "symbol_native": "नेरू",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "NPR",
                "name_plural": "Nepalese rupees"
            },
            "OMR": {
                "symbol": "OMR",
                "name": "Omani Rial",
                "symbol_native": "ر.ع.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "OMR",
                "name_plural": "Omani rials"
            },
            "PAB": {
                "symbol": "PAB",
                "name": "Panamanian Balboa",
                "symbol_native": "B\/.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PAB",
                "name_plural": "Panamanian balboas"
            },
            "PEN": {
                "symbol": "PEN",
                "name": "Peruvian Nuevo Sol",
                "symbol_native": "S\/.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PEN",
                "name_plural": "Peruvian nuevos soles"
            },
            "PGK": {
                "symbol": "PGK",
                "name": "Papua New Guinean Kina",
                "symbol_native": "PGK",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PGK",
                "name_plural": "Papua New Guinean Kina"
            },
            "PHP": {
                "symbol": "PHP",
                "name": "Philippine Peso",
                "symbol_native": "\u20B1",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "PHP",
                "name_plural": "Philippine pesos"
            },
            "PKR": {
                "symbol": "PKR",
                "name": "Pakistani Rupee",
                "symbol_native": "\u20A8",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "PKR",
                "name_plural": "Pakistani rupees"
            },
            "PYG": {
                "symbol": "PYG",
                "name": "Paraguayan Guarani",
                "symbol_native": "\u20B2",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "PYG",
                "name_plural": "Paraguayan guaranis"
            },
            "QAR": {
                "symbol": "QAR",
                "name": "Qatari Rial",
                "symbol_native": "ر.ق.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "QAR",
                "name_plural": "Qatari rials"
            },
            "RON": {
                "symbol": "RON",
                "name": "Romanian Leu",
                "symbol_native": "RON",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "RON",
                "name_plural": "Romanian lei"
            },
            "RSD": {
                "symbol": "RSD",
                "name": "Serbian Dinar",
                "symbol_native": "дин.",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "RSD",
                "name_plural": "Serbian dinars"
            },
            "RWF": {
                "symbol": "RWF",
                "name": "Rwandan Franc",
                "symbol_native": "FR",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "RWF",
                "name_plural": "Rwandan francs"
            },
            "SAR": {
                "symbol": "SAR",
                "name": "Saudi Riyal",
                "symbol_native": "ر.س.\u200F",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SAR",
                "name_plural": "Saudi riyals"
            },
            "SBD": {
                "symbol": "SBD",
                "name": "Solomon Islands Dollar",
                "symbol_native": "SBD",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SBD",
                "name_plural": "Solomon Islands Dollar"
            },
            "SCR": {
                "symbol": "SCR",
                "name": "Seychellois Rupee",
                "symbol_native": "SCR",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SCR",
                "name_plural": "Seychellois Rupee"
            },
            "SDG": {
                "symbol": "SDG",
                "name": "Sudanese Pound",
                "symbol_native": "SDG",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SDG",
                "name_plural": "Sudanese pounds"
            },
            "SHP": {
                "symbol": "SHP",
                "name": "Saint Helena Pound",
                "symbol_native": "SHP",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SHP",
                "name_plural": "Saint Helena Pounds"
            },
            "SLL": {
                "symbol": "SLL",
                "name": "Sierra Leonean Leone",
                "symbol_native": "SLL",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SLL",
                "name_plural": "Sierra Leonean Leone"
            },
            "SOS": {
                "symbol": "SOS",
                "name": "Somali Shilling",
                "symbol_native": "SOS",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SOS",
                "name_plural": "Somali shillings"
            },
            "SRD": {
                "symbol": "SRD",
                "name": "Surinamese Dollar",
                "symbol_native": "SRD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SRD",
                "name_plural": "Surinamese Dollars"
            },
            "STD": {
                "symbol": "STD",
                "name": "São Tomé and Príncipe Dobra",
                "symbol_native": "Db",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "STD",
                "name_plural": "São Tomé and Príncipe dobras"
            },
            "SVC": {
                "symbol": "SVC",
                "name": "Salvadoran Col\u00c3\u00b3n",
                "symbol_native": "SVC",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SVC",
                "name_plural": "Salvadoran Col\u00c3\u00b3n"
            },
            "SYP": {
                "symbol": "SYP",
                "name": "Syrian Pound",
                "symbol_native": "ل.س.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "SYP",
                "name_plural": "Syrian pounds"
            },
            "SZL": {
                "symbol": "SZL",
                "name": "Swazi Lilangeni",
                "symbol_native": "SZL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "SZL",
                "name_plural": "Swazi Lilangeni"
            },
            "TJS": {
                "symbol": "TJS",
                "name": "Tajikistani Somoni",
                "symbol_native": "TJS",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TJS",
                "name_plural": "Tajikistani Somoni"
            },
            "TMT": {
                "symbol": "TMT",
                "name": "Turkmenistani Manat",
                "symbol_native": "TMT",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TMT",
                "name_plural": "Turkmenistani Manat"
            },
            "TND": {
                "symbol": "TND",
                "name": "Tunisian Dinar",
                "symbol_native": "د.ت.\u200F",
                "decimal_digits": 3,
                "rounding": 0.0,
                "code": "TND",
                "name_plural": "Tunisian dinars"
            },
            "TOP": {
                "symbol": "TOP",
                "name": "Tongan Paʻanga",
                "symbol_native": "T$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TOP",
                "name_plural": "Tongan paʻanga"
            },
            "TRY": {
                "symbol": "TRY",
                "name": "Turkish Lira",
                "symbol_native": "TL",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TRY",
                "name_plural": "Turkish Lira"
            },
            "TTD": {
                "symbol": "TTD",
                "name": "Trinidad and Tobago Dollar",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "TTD",
                "name_plural": "Trinidad and Tobago dollars"
            },
            "TZS": {
                "symbol": "TZS",
                "name": "Tanzanian Shilling",
                "symbol_native": "TSh",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "TZS",
                "name_plural": "Tanzanian shillings"
            },
            "UAH": {
                "symbol": "UAH",
                "name": "Ukrainian Hryvnia",
                "symbol_native": "\u20B4",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "UAH",
                "name_plural": "Ukrainian hryvnias"
            },
            "UGX": {
                "symbol": "UGX",
                "name": "Ugandan Shilling",
                "symbol_native": "USh",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "UGX",
                "name_plural": "Ugandan shillings"
            },
            "UYU": {
                "symbol": "UYU",
                "name": "Uruguayan Peso",
                "symbol_native": "$",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "UYU",
                "name_plural": "Uruguayan pesos"
            },
            "UZS": {
                "symbol": "UZS",
                "name": "Uzbekistan Som",
                "symbol_native": "UZS",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "UZS",
                "name_plural": "Uzbekistan som"
            },
            "VEF": {
                "symbol": "VEF",
                "name": "Venezuelan Bolívar",
                "symbol_native": "Bs.F.",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "VEF",
                "name_plural": "Venezuelan bolívars"
            },
            "VND": {
                "symbol": "\u20AB",
                "name": "Vietnamese Dong",
                "symbol_native": "\u20AB",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "VND",
                "name_plural": "Vietnamese dong"
            },
            "VUV": {
                "symbol": "VUV",
                "name": "Vanuatu Vatu",
                "symbol_native": "VUV",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "VUV",
                "name_plural": "Vanuatu Vatu"
            },
            "WST": {
                "symbol": "WST",
                "name": "Samoan Tala",
                "symbol_native": "WST",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "WST",
                "name_plural": "Samoan Tala"
            },
            "XAF": {
                "symbol": "FCFA",
                "name": "CFA Franc BEAC",
                "symbol_native": "FCFA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAF",
                "name_plural": "CFA francs BEAC"
            },
            "XAG": {
                "symbol": "XAG",
                "name": "Silver (troy ounce)",
                "symbol_native": "XAG",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAG",
                "name_plural": "Silver (troy ounces)"
            },
            "XAU": {
                "symbol": "XAU",
                "name": "Gold (troy ounce)",
                "symbol_native": "XAU",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XAU",
                "name_plural": "Gold (troy ounces)"
            },
            "XCD": {
                "symbol": "XCD",
                "name": "East Caribbean Dollar",
                "symbol_native": "XCD",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XCD",
                "name_plural": "CEast Caribbean Dollars"
            },
            "XOF": {
                "symbol": "CFA",
                "name": "CFA Franc BCEAO",
                "symbol_native": "CFA",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XOF",
                "name_plural": "CFA francs BCEAO"
            },
            "XPF": {
                "symbol": "XPF",
                "name": "CFP Franc",
                "symbol_native": "CFP Franc",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "XPF",
                "name_plural": "CFP Francs"
            },
            "YER": {
                "symbol": "YER",
                "name": "Yemeni Rial",
                "symbol_native": "ر.ي.\u200F",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "YER",
                "name_plural": "Yemeni rials"
            },
            "ZAR": {
                "symbol": "ZAR",
                "name": "South African Rand",
                "symbol_native": "R",
                "decimal_digits": 2,
                "rounding": 0.0,
                "code": "ZAR",
                "name_plural": "South African rand"
            },
            "ZMW": {
                "symbol": "ZMW",
                "name": "Zambian Kwacha",
                "symbol_native": "ZK",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ZMW",
                "name_plural": "Zambian kwachas"
            },
            "ZWL": {
                "symbol": "ZWL",
                "name": "Zimbabwean Dollar",
                "symbol_native": "ZWL",
                "decimal_digits": 0,
                "rounding": 0.0,
                "code": "ZWL",
                "name_plural": "Zimbabwean Dollars"
            }
        };

        var symbol = {
            'BTC': '฿',
            'mBTC': 'm฿',
            'bits': 'bits'
        }
        var units = {
            'BTC': 8,
            'mBTC': 5,
            'bits': 2
        }

        function TLCurrencyFormat(exchangeRate, preferences) {
            this.exchangeRate = exchangeRate;
            this.preferences = preferences;
        }

        TLCurrencyFormat.bitcoinAmountStringToCoin = function(amount, locale) {
            return this.amountStringToCoin(amount, TLCoin.TLBitcoinDenomination.BTC, locale);
        };

        TLCurrencyFormat.prototype.properBitcoinAmountStringToCoin = function(amount, locale) {
            return TLCurrencyFormat.amountStringToCoin(amount, this.preferences.getBitcoinDenomination(), locale);
        };

        TLCurrencyFormat.amountStringToCoin = function(amount, bitcoinDenomination, locale) {
            if (amount.length != 0 && amount.match("[0-9.]*")) {
                return TLCoin.fromString(amount, bitcoinDenomination);
            } else {
                return TLCoin.zero();
            }
        };

        TLCurrencyFormat.prototype.getBitcoinDisplay = function() {
            var bitcoinDenomination = this.preferences.getBitcoinDenomination();
            if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.BTC) {
                return symbol['BTC'];
            } else if (bitcoinDenomination == TLCoin.TLBitcoinDenomination.mBTC) {
                return symbol['mBTC'];
            } else {
                return symbol['bits'];
            }
        };

        TLCurrencyFormat.prototype.getProperLocalCurrencySymbol = function() {
            return TLCurrencyFormat.fiatCurrencies[this.preferences.getCurrency()]['symbol_native'];
        };

        TLCurrencyFormat.prototype.coinToProperLocalCurrencyAmountStringWithSymbol = function(amount, hideSymbol) {
            if (this.exchangeRate != null) {
                var currency = this.preferences.getCurrency();
                if (!hideSymbol) {
                    return this.exchangeRate.fiatAmountStringFromBitcoin(currency, amount) + ' ' + this.getProperLocalCurrencySymbol();
                } else {
                    return this.exchangeRate.fiatAmountStringFromBitcoin(currency, amount);
                }
            }
            if (!hideSymbol) {
                return '0 ' + this.getProperLocalCurrencySymbol();
            } else {
                return '0';
            }
        };

        TLCurrencyFormat.prototype.coinToProperBitcoinAmountStringWithSymbol = function(amount, hideSymbol) {
            if (!hideSymbol) {
                return this.coinToProperBitcoinAmountString(amount) + ' ' +this.getBitcoinDisplay();
            } else {
                return this.coinToProperBitcoinAmountString(amount);
            }
        };

        TLCurrencyFormat.prototype.coinToProperBitcoinAmountString = function(amount) {
            return amount.bigIntegerToBitcoinAmountString(this.preferences.getBitcoinDenomination());
        };

        TLCurrencyFormat.prototype.getProperAmount = function(amount, hideSymbol) {
            if (this.preferences.isDisplayLocalCurrency()) {
                return this.coinToProperLocalCurrencyAmountStringWithSymbol(amount, hideSymbol);
            } else {
                return this.coinToProperBitcoinAmountStringWithSymbol(amount, hideSymbol);
            }
        };

        TLCurrencyFormat.prototype.properBitcoinStringToFiatString = function(amount) {
            if (amount != null && amount.match("[0-9.]*")) {
                var amountCoin = this.properBitcoinAmountStringToCoin(amount);
                return this.coinToProperLocalCurrencyAmountStringWithSymbol(amountCoin, true);
            } else {
                return null;
            }
        };

        TLCurrencyFormat.prototype.fiatStringToProperBitcoinString = function(amount) {
            if (amount != null && amount.match("[0-9.]*")) {
                var amountCoin = this.exchangeRate.bitcoinAmountFromFiat(this.preferences.getCurrency(), amount);
                return this.coinToProperBitcoinAmountString(amountCoin, true);
            } else {
                return null;
            }
        };

        return TLCurrencyFormat;
    });
