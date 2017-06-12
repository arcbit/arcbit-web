'use strict';

define(function() {
    var lang = [
        {"name": "English (US)", "code": "en_US"},
        {"name": "简体中文", "code": "zh_CN"},
        {"name": "繁体中文", "code": "tw_CN"},
        {"name": "Español", "code": "es_ES"},
        {"name": "русский", "code": "ru_RU"},
        {"name": "Deutsche", "code": "de_DE"}
    ];
    
    var fallbacks = {
        "en": "en_US",
        "zh": "zh_CN",
        "tw": "tw_CN",
        "es": "es_ES",
        "ru": "ru_RU",
        "de": "de_DE"
    };
    
    Object.defineProperty(lang, 'preferedLanguage', {
        value: function(preferedLanguages) {
            preferedLanguages = preferedLanguages || navigator.languages;
            preferedLanguages = preferedLanguages.join('|').replace(/-/g, '_').split('|');
            
            var availableLanguages = lang.map(function(l) {
                return l.code;
            });
            for (var key in fallbacks) {
                availableLanguages.push(key);
            };
            
            // Intersection between available and prefered languages
            var intersection = preferedLanguages.map(function(i) {
                return availableLanguages.indexOf(i) >= 0 ? fallbacks[i] || i : null;
            });
            // Suppress null values in array
            intersection = intersection.filter(function(i) {
                return i;
            });
            
            return intersection[0];
        }
    });
    return lang;
});
