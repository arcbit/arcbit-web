'use strict';

define(function() {
    var lang = [
        {"name": "English (US)", "code": "en_US"},
        {"name": "Chinese (Simplified)", "code": "zh_CN"},
        {"name": "Chinese (Traditional)", "code": "tw_CN"},
        {"name": "Español (España)", "code": "es_ES"}
    ];
    
    var fallbacks = {
        "en": "en_US",
        "tw": "zh_CN",
        "zh": "tw_CN",
        "es": "es_ES"
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
