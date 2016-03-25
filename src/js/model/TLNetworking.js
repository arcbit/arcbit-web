'use strict';

define(['angular'],
    function(angular) {
        TLNetworking.HTTP_ERROR_CODE = 'HTTPErrorCode';
        TLNetworking.HTTP_ERROR_MSG = 'HTTPErrorMsg';
        var $http = angular.injector(['ng']).get('$http');
        function TLNetworking() {
        }

        TLNetworking.prototype.httpGET = function(url, data, success, failure) {
            //console.log("httpGET url " + url);
            //console.log("httpGET data " + JSON.stringify(data));
            $http.get(url, {params:data}).
            then(function(response) {
                //console.log("httpGET " + JSON.stringify(response));
                success(response['data']);
            }, function(response) {
                //console.log("httpGET Error: " + JSON.stringify(response));
                failure(response);
            });
        };

        TLNetworking.prototype.httpPOST = function(url, data, success, failure) {
            //console.log("httpPOST url " + url);
            //console.log("httpPOST data " + JSON.stringify(data));
            $http({url:url, params:data, method:'POST'}).
            then(function(response) {
                //console.log("httpPOST " + JSON.stringify(response));
                success(response['data']);
            }, function(response) {
                //console.log("httpPOST Error: " + JSON.stringify(response));
                failure(response);
            });
        };

        TLNetworking.prototype.httpPOST2 = function(url, data, success, failure) {
            //console.log("httpPOST url " + url);
            //console.log("httpPOST data " + JSON.stringify(data));
            $http.post(url, data).
            then(function(response) {
                //console.log("httpPOST " + JSON.stringify(response));
                success(response['data']);
            }, function(response) {
                //console.log("httpPOST Error: " + JSON.stringify(response));
                failure(response);
            });
        };

        return TLNetworking;
    });
