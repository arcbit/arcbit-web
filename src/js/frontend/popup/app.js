/**
 * Minimal file for the popup
 */
'use strict';

define([
    'angular',
    'available_languages',
    'angular-animate',
    'mm.foundation',
    'angular-translate',
    'angular-translate-loader-static-file',
    'frontend/popup/controller',
    'frontend/popup/providers',
    'frontend/controllers/ngmodal',
    'frontend/filters/currency',
    'frontend/filters/i18n',
    'frontend/providers/sounds',
    'frontend/providers/modals',
    'frontend/directives/identicon'
], function (angular, AvailableLanguages) {
    var app = angular.module('ArcBit', [
        'mm.foundation',
        'ngAnimate',
        'pascalprecht.translate',
        'ArcBit.controllers',
        'ArcBit.filters',
        'ArcBit.providers',
        'ArcBit.directives'
    ]);
    // angular-translate configuration.
    app.config(function($translateProvider) {
        $translateProvider.useStaticFilesLoader({
            prefix: '../i18n/',
            suffix: '.json'
        });
        $translateProvider.preferredLanguage(AvailableLanguages.preferedLanguage());
    });
    app.config(function($animateProvider) {
        $animateProvider.classNameFilter(/^(?:(?!ng-animate-disabled).)*$/);
    });
    // In case we need to initialize something after the application is created.
    app.initialize = function() {
    };
    angular.bootstrap(document, ['ArcBit']);
    return app;
});
