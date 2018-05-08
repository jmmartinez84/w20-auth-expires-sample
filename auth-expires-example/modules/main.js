define([
    'require',
    '{angular}/angular',
    '{w20-core}/modules/env',
    '{w20-core}/modules/notifications'
], function (require, angular) {
        'use strict';
    var main = angular.module('MainModule', ['w20CoreEnv', 'w20CoreNotifications']);

    main.directive('testDir', ['AuthExpires', function (authExpires) {
        return function (scope, element) {
            var el = element[0];
    
            el.addEventListener(
                'mousemove',
                function () {
                    authExpires.reset();
                },
                false
            );
        }
    }]);
    main.run(['$window', 'EventService','AuthExpires','$log', function($window, eventService, authExpires, $log) {

        
        eventService.on('w20.security.authenticated', function () {
            authExpires.start();
        });
    } ]);
    main.service("AuthExpires", ['$timeout', 'AuthenticationService','NotificationService', '$log', function($timeout, authenticationService, notificationService, $log){
        var timer = null;
        var start = function(){
            timer = $timeout(function(){
                if (authenticationService.subjectAuthenticated()) {
                    notificationService.notify("Your session has expired due to inactivity");
                    authenticationService.deauthenticate();
                    stop();
                }
            },10*1000);
            $log.info("start to count");
        };
        var reset = function(){
            if(timer.$$state.status !== 2){
                $timeout.cancel(timer);
                start();
                $log.info("reset count");
            }
            
        };
        var stop =function(){
            $timeout.cancel(timer);
        }
        return{
            "start":start,
            "reset":reset
        }
    }]);
    return {
        angularModules : [ 'MainModule' ]
    };
});