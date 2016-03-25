/**
 * Defines the main routes in the application.
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */
'use strict';

define(['frontend/app'], function (app) {
  'use strict';
  return app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/contact/:contactId', {templateUrl: 'partials/contact.html', controller: 'ContactsCtrl'});
    $routeProvider.when('/contact/:section/:contactId', {templateUrl: 'partials/contact.html', controller: 'ContactsCtrl'});
    $routeProvider.when('/tools', {templateUrl: 'partials/tools.html', controller: 'ToolsCtrl'});
    $routeProvider.when('/wallet', {templateUrl: 'partials/wallet.html', controller: 'HistoryCtrl'});
    $routeProvider.when('/wallet/:section', {templateUrl: 'partials/wallet.html', controller: 'HistoryCtrl'});
    $routeProvider.when('/wallet/:section/:pocketId', {templateUrl: 'partials/wallet.html', controller: 'HistoryCtrl'});
    $routeProvider.when('/wallet/:section/:pocketType/:pocketId', {templateUrl: 'partials/wallet.html', controller: 'HistoryCtrl'});
    $routeProvider.when('/contacts', {templateUrl: 'partials/contacts.html', controller: 'ContactsCtrl'});
    $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: 'WalletSettingsCtrl'});
    $routeProvider.when('/identities', {templateUrl: 'partials/identities.html', controller: 'IdentitiesCtrl'});
    $routeProvider.when('/new_wallet', {templateUrl: 'partials/new_wallet.html', controller: 'NewWalletCtrl'});
    $routeProvider.when('/popup', {templateUrl: 'partials/popup.html', controller: 'PopupCtrl'});
    $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'loginCtrl'});
    $routeProvider.when('/offline_spend', {templateUrl: 'partials/offline_spend.html', controller: 'OfflineSpendCtrl'});
    $routeProvider.when('/offline_spend/:section', {templateUrl: 'partials/offline_spend.html', controller: 'OfflineSpendCtrl'});
    $routeProvider.otherwise({redirectTo: '/wallet'});
  }]);
});
