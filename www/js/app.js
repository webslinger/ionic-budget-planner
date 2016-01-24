// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var billTrack = angular.module('starter', ['ui.router', 'ionic']);

billTrack.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if(window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});

billTrack.constant('projectedMonths', 3);

billTrack.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('home', {
            url: "/",
            templateUrl: "partials/main-app.html",
            controller: 'budgetCtrl'
        })
        .state('bills', {
            url: "/manage/bills",
            templateUrl: "partials/manage-outgoing.html",
            controller: 'billCtrl'
        })
        .state('income', {
            url: "/manage/income",
            templateUrl: "partials/manage-incoming.html",
            controller: 'incomeCtrl'
        })
        .state('banked', {
            url: "/manage/funds",
            templateUrl: "partials/manage-funds.html",
            controller: 'fundCtrl'
        })
        .state('settings', {
            url: "/settings",
            templateUrl: "partials/settings.html",
            controller: 'settingsCtrl'
        });
});