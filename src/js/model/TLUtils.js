'use strict';

define([],
    function() {

        function TLUtils() {
        }

        TLUtils.getBrowserLanguage = function() {
            var uiLanguage = chrome.i18n.getUILanguage();
            console.log("uiLanguage: " + uiLanguage);
            if (uiLanguage == "en") {
                return "en_US";
            } else if (uiLanguage == "zh-CN") {
                return "zh_CN";
            } else if (uiLanguage == "zh-TW") {
                return "tw_CN";
            } else if (uiLanguage == "es") {
                return "es_ES";
            } else if (uiLanguage == "ru") {
                return "ru_RU";
            } else if (uiLanguage == "de") {
                return "de_DE";
            }
            return "en_US";
        };

        TLUtils.defaultAppName = function() {
            return "ArcBit";
        };

        TLUtils.dictionaryToJSONString = function(prettyPrint, dict) {
            if (!prettyPrint) {
                return JSON.stringify(dict);

            } else {
                return JSON.stringify(dict, null, 2);
            }
        };

        TLUtils.JSONStringToDictionary = function(jsonString) {
            return JSON.parse(jsonString);
        };

        TLUtils.dateToString = function(d) {
            function padStr(i) {
                return (i < 10) ? "0" + i : "" + i;
            }
            function isToday(i) {
                var today = new Date();
                return ((today.getFullYear()==d.getFullYear())&&(today.getMonth()==d.getMonth())&&(today.getDate()==d.getDate()));
            }

            if (isToday(d)) {
                return 'Today ' + padStr(d.getHours()) + ':' + padStr(d.getMinutes()) + ':' + padStr(d.getSeconds());
            } else {
                return padStr(d.getFullYear()) + '-' + padStr(1 + d.getMonth()) + '-' + padStr(d.getDate()) + ' ' + padStr(d.getHours()) + ':' + padStr(d.getMinutes()) + ':' + padStr(d.getSeconds());
            }
        };

        return TLUtils;
    });
