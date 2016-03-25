'use strict';

define([],
    function() {

        function TLUtils() {
        }

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
