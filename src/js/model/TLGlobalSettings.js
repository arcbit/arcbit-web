'use strict';

define([], function() {

    TLGlobalSettings.ARCBIT_SETTINGS_NS = 'ab:settings';
    var PREFERENCE_FIAT_DISPLAY = "fiat_display";
    var PREFERENCE_LANGUAGE = "language";
    var PREFERENCE_ALWAYS_ENCRYPT = "always_encrypt";
    var PREFERENCE = "prefs";
    var PREFERENCE_INSTALL_DATE = "install_date";
    var PREFERENCE_APP_VERSION = "app_version";
    var PREFERENCE_CURRENT_IDENTITY = "current_identity"; // need this cuz when close chrome with tab still open and relaunch app, need to know last wallet used, otherwise, identity is set from popup

    function TLGlobalSettings() {
        this.settings = {prefs:{fiat_display: 'USD', language: 'en_US'}};
        //this.settings = {fiat_display: 'EUR', language: 'es_ES'};
    }

    TLGlobalSettings.prototype.getInstallDate = function() {
        return this.settings[PREFERENCE_INSTALL_DATE];
    };

    TLGlobalSettings.prototype.setInstallDate = function() {
        this.settings[PREFERENCE_INSTALL_DATE] = Math.floor(Date.now() / 1000);
    };

    TLGlobalSettings.prototype.getAppVersion = function() {
        return this.settings[PREFERENCE_APP_VERSION];
    };

    TLGlobalSettings.prototype.setAppVersion = function(version) {
        this.settings[PREFERENCE_APP_VERSION] = version;
    };

    TLGlobalSettings.prototype.getCurrency = function() {
        return this.settings[PREFERENCE][PREFERENCE_FIAT_DISPLAY];
    };

    TLGlobalSettings.prototype.setCurrentIdentityName = function(value, callback) {
        this.settings[PREFERENCE_CURRENT_IDENTITY] = value;
        this.save(callback);
    };

    TLGlobalSettings.prototype.getCurrentIdentityName = function() {
        return this.settings[PREFERENCE_CURRENT_IDENTITY];
    };

    TLGlobalSettings.prototype.setCurrency = function(value, callback) {
        this.settings[PREFERENCE][PREFERENCE_FIAT_DISPLAY] = value;
        this.save(callback);
    };

    TLGlobalSettings.prototype.getLanguage = function() {
        return this.settings[PREFERENCE][PREFERENCE_LANGUAGE];
    };

    TLGlobalSettings.prototype.setLanguage = function(value, callback) {
        this.settings[PREFERENCE][PREFERENCE_LANGUAGE] = value;
        this.save(callback);
    };

    TLGlobalSettings.prototype.getAlwaysEncrypt = function() {
        return this.settings[PREFERENCE][PREFERENCE_ALWAYS_ENCRYPT];
    };

    TLGlobalSettings.prototype.setAlwaysEncrypt = function(value, callback) {
        this.settings[PREFERENCE][PREFERENCE_ALWAYS_ENCRYPT] = value;
        this.save(callback);
    };

    TLGlobalSettings.prototype.save = function(callback) {
        chrome.storage.local.set({'ab:settings':this.settings});
        var self = this;
        chrome.storage.local.get(TLGlobalSettings.ARCBIT_SETTINGS_NS, function(obj) {
            if (obj[TLGlobalSettings.ARCBIT_SETTINGS_NS]) {
                self.settings = obj[TLGlobalSettings.ARCBIT_SETTINGS_NS];
            }
            callback ? callback() : null;
        });
    };

    TLGlobalSettings.prototype.loadGlobalSettings = function(callback) {
        var self = this;
        chrome.storage.local.get(TLGlobalSettings.ARCBIT_SETTINGS_NS, function(obj) {
            if (obj[TLGlobalSettings.ARCBIT_SETTINGS_NS]) {
                self.settings = obj[TLGlobalSettings.ARCBIT_SETTINGS_NS];
            }
            callback ? callback() : null;
        });
    };

    return TLGlobalSettings;
});
