/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
'use strict';

define([
    'require',
    'angular',
    'available_languages',
    'angular-route',
    'angular-animate',
    'angular-socket-io',
    'mm.foundation',
    'angular-xeditable',
    'angular-translate',
    'angular-translate-loader-static-file',
    'ngProgress',
    'toaster',
    'angularSpinner',
    'frontend/controllers/index',
    'frontend/directives/index',
    'frontend/filters/index',
    'frontend/providers/index'
], function (requirejs, angular, AvailableLanguages) {
    var app = angular.module('ArcBit', [
        'btford.socket-io',
        'ngRoute', 'mm.foundation', 'xeditable', 'pascalprecht.translate',
        'ngProgress', 'ngAnimate', 'toaster', 'angularSpinner',
        'ArcBit.controllers',
        'ArcBit.directives',
        'ArcBit.filters',
        'ArcBit.providers'
    ]);
    requirejs(['domReady!'], function (document) {
        // * NOTE: the ng-app attribute should not be on the index.html when using ng.bootstrap
        angular.bootstrap(document, ['ArcBit']);
    });
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
    return app;
});
